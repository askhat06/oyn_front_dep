import { useContext, useState, useEffect } from "react";
import { AuthContext, PhotoshootsContext } from "../../App";
import { Link } from "react-router-dom";

import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice";

function PhItem({ photoshoot }) {
  const user = useSelector((state) => state.user.user)

  const dispatch = useDispatch()

  const { users } = useContext(AuthContext);
  const { photoshoots, setPhotoshoots } = useContext(PhotoshootsContext);

  const author = users.find(user => user.id === photoshoot.authorId);

  const [date, setDate] = useState("");
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  useEffect(() => {
    async function checkIfUserBooked() {
      const res = await fetch(`http://localhost:3001/cart-photoshoots?userId=${user.id}`);
      const data = await res.json();
      if (data.length > 0) {
        setAlreadyBooked(true);
      }
    }

    if (user?.id) {
      checkIfUserBooked();
    }
  }, [user]);


  async function bookPhotoshoot() {
    if (!date) {
      toast.error("Please select date and time.");
      return;
    }

    if (Number(user.balance) < Number(photoshoot.price)) {
      toast.error("Insufficient funds on balance.");
      return;
    }

    const authorRes = await fetch(`http://localhost:3001/users/${photoshoot.authorId}`);
    const actualAuthor = await authorRes.json();

    if (!actualAuthor) {
      toast.error("Author not found. Cannot book photoshoot.");
      return;
    }

    const newBalance = user.balance - photoshoot.price;
    const updatedSales = (Number(actualAuthor.sales) || 0) + photoshoot.price;

    await fetch(`http://localhost:3001/cart-photoshoots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        photoshootId: photoshoot.id,
        dateTime: new Date(date).toISOString(),
      }),
    });

    await fetch(`http://localhost:3001/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance: newBalance }),
    });

    await fetch(`http://localhost:3001/users/${actualAuthor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sales: updatedSales }),
    });

    const updatedUser = { ...user, balance: newBalance };
    dispatch(setUser(updatedUser));
    localStorage.setItem("user", JSON.stringify(updatedUser));

    toast.success("Photoshoot successfully booked!");
  }


  async function DeletePhotoshoot(id) {
    const response = await fetch(`http://localhost:3001/photoshoots/${id}`, {
      method: "DELETE"
    })

    if (response.ok) {
      setPhotoshoots(photoshoots.filter(gall => gall.id !== id));
      toast.success("Photoshoot deleted")
    } else {
      toast.error("Ошибка")
    }
  }

  return (
    <div className="photoshoot-card">
      <img
        src={`/img/IndexPage/${photoshoot.imageUrl}`}
        alt={photoshoot.title}
        className="photoshoot-img"
      />
      <div className="photoshoot-info">
        <h2>{photoshoot.title}</h2>
        <p>{photoshoot.description}</p>
        <b>PRICE: {photoshoot.price} KZT</b>
        <p>professor:
          <Link to={`/profile/professor/${author.id}`}>
            <b>
              {author ? author.username : "Unknown"}
            </b>
          </Link>
        </p>
      </div>
      <div className="photoshoot-date">
        <div>
          <label htmlFor="schedule-select">
            Select date and time:
          </label>
          <select
            id="schedule-select"
            value={date}
            onChange={e => setDate(e.target.value)}
          >
            <option value="">— SELECT —</option>
            <option value="2025-05-01T10:00:00">May 1, 2025, 10:00 AM</option>
            <option value="2025-05-02T14:00:00">May 2, 2025, 2:00 PM</option>
            <option value="2025-05-03T18:00:00">May 3, 2025, 6:00 PM</option>
          </select>
        </div>
      </div>
      {user && user.role === "user" && (
        <button
          className="photoshoot-btn"
          onClick={bookPhotoshoot}
          disabled={alreadyBooked}
          style={alreadyBooked ? { backgroundColor: "#aaa", cursor: "not-allowed" } : {}}
        >
          {alreadyBooked ? "Already Booked" : "Book Now"}
        </button>
      )}

      {user && user.role === "professor" && user.id === photoshoot.authorId && (
        <button className="photoshoot-btn"><Link to={`/edit-photoshoot/${photoshoot.id}`}>EDIT PHOTOSHOOT</Link></button>
      )}
      {user && user.role === "admin" && (
        <button className="delete-btn" onClick={() => DeletePhotoshoot(photoshoot.id)}>DELETE PHOTOSHOOT</button>
      )}
    </div>
  );
}

export default PhItem;
