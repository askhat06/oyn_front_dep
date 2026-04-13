import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GalleryContext, PhotoshootsContext } from "../../App";

import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice";

function UserProfile() {
    const user = useSelector((state) => state.user.user)
    const dispatch = useDispatch()

    const { id } = useParams();
    const navigate = useNavigate();

    const { gallery } = useContext(GalleryContext);
    const { photoshoots } = useContext(PhotoshootsContext);

    const [profile, setProfile] = useState(null);
    const [photoPurchases, setPhotoPurchases] = useState([]);
    const [shootPurchases, setShootPurchases] = useState([]);
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            const res = await fetch(`http://localhost:3001/users/${id}`);
            if (res.ok) {
                setProfile(await res.json());
            }
        }

        async function fetchPhotoCart() {
            const res = await fetch("http://localhost:3001/cart-photos");
            if (res.ok) {
                const data = await res.json();
                setPhotoPurchases(data.filter(item => item.userId === id));
            }
        }

        async function fetchShootCart() {
            const res = await fetch("http://localhost:3001/cart-photoshoots");
            if (res.ok) {
                const data = await res.json();
                setShootPurchases(data.filter(item => item.userId === id));
            }
        }

        fetchProfile();
        fetchPhotoCart();
        fetchShootCart();
    }, [id]);

    async function DeleteItem(itemId) {
        const res = await fetch(`http://localhost:3001/cart-photos/${itemId}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setPhotoPurchases(p => p.filter(x => x.id !== itemId));
            toast.success("Фото удалено")
        } else {
            alert("Ошибка удаления фотографии");
        }
    }

    async function deleteShoot(itemId) {
        const purchase = shootPurchases.find(p => p.id === itemId);
        const shoot = photoshoots.find(s => s.id === purchase?.photoshootId);

        const refund = shoot.price;
        const newBalance = profile.balance + refund;

        await fetch(`http://localhost:3001/users/${profile.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ balance: newBalance }),
        });

        await fetch(`http://localhost:3001/cart-photoshoots/${itemId}`, {
            method: "DELETE",
        });

        setProfile(prev => ({ ...prev, balance: newBalance }));

        const updatedUser = { ...user, balance: newBalance };
        dispatch(setUser(updatedUser))
        localStorage.setItem("user", JSON.stringify(updatedUser))

        setShootPurchases(s => s.filter(x => x.id !== itemId));
        toast.success(`Фотосессия удалена, ${refund} KZT возвращено на баланс`);
    }

    function handleEdit() {
        navigate("/edit");
    }

    async function UpdatePhoto() {
        if (!avatar) return;

        const formData = new FormData();
        formData.append("image", avatar);

        const uploadRes = await fetch("http://localhost:4000/upload", {
            method: "POST",
            body: formData,
        });

        const { filename } = await uploadRes.json();

        const patchRes = await fetch(`http://localhost:3001/users/${profile.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatarUrl: filename }),
        });

        if (patchRes.ok) {
            setProfile(prev => ({ ...prev, avatarUrl: filename }))

            const updatedUser = { ...user, avatarUrl: filename };
            dispatch(setUser(updatedUser))
            localStorage.setItem("user", JSON.stringify(updatedUser))

            setAvatar(null);
            toast.success("Аватар обновлён!");
        } else {
            alert("Ошибка при обновлении профиля");
        }
    }

    return (
        <>
            <div className="theme-dark">
                {profile && (
                    <section className="home" id="home">
                        <div className="home-img">
                            <img
                                src={
                                    profile.avatarUrl
                                        ? `/img/IndexPage/${profile.avatarUrl}`
                                        : "/img/IndexPage/default-avatar.jpg"
                                }
                                className="profile-avatar"
                                alt="Avatar"
                            />
                        </div>

                        <div className="home-container">
                            <h1>USER PROFILE:</h1>
                            <div className="home-content">
                                <h2 className="profile-username">
                                    NAME: {profile.username}
                                </h2>
                                <p><strong>Email:</strong> {profile.email}</p>
                                <p><strong>Role:</strong> {profile.role}</p>
                                {user && user.id === profile.id && (
                                    <div>
                                        <p><strong>Balance:</strong> {profile.balance} KZT</p>
                                        <button className="edit-btn"><Link to={`/refill-balance/${profile.id}`}>Refil Balance</Link></button>
                                    </div>
                                )}
                                <br /><br />
                                {user && user.id === profile.id && (
                                    <div>
                                        <p>Update Photo</p>
                                        <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
                                        <br /><br />
                                        <button className="edit-btn" disabled={!avatar} onClick={UpdatePhoto}>Update Photo</button>
                                    </div>
                                )}
                                <br /><br />
                                {user && user.id === profile.id && (
                                    <div>
                                        <p>Change password:</p>
                                        <button className="profile-btn" onClick={handleEdit} >
                                            Change
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </section>
                )}

                {photoPurchases.length > 0 ? (
                    <div className="profile-gallery">
                        <h3>Saved Photos:</h3>
                        <div className="profile-list">
                            {photoPurchases.map(purchase => {
                                const photo = gallery.find(g => g.id === purchase.photoId);
                                if (!photo) return null;
                                return (
                                    <div className="profile-card" key={purchase.id}>
                                        <img
                                            src={`/img/IndexPage/${photo.imageUrl}`}
                                            alt={photo.title}
                                            className="gallery-img"
                                        />
                                        <div className="profile-info">
                                            <h3>{photo.title}</h3>
                                        </div>
                                        <button
                                            className="profile-btn"
                                            onClick={() => DeleteItem(purchase.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="profile-p">This user has not purchased any photos yet.</p>
                )}

                {shootPurchases.length > 0 ? (
                    <div className="profile-gallery">
                        <h3>Purchased Photoshoots:</h3>
                        <div className="profile-list">
                            {shootPurchases.map(purchase => {
                                const shoot = photoshoots.find(s => s.id === purchase.photoshootId);
                                if (!shoot) return null;
                                const dateObj = new Date(purchase.dateTime);
                                const formattedDate = dateObj.toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                });
                                const formattedTime = dateObj.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });

                                return (
                                    <div className="profile-card" key={purchase.id}>
                                        <img
                                            src={`/img/IndexPage/${shoot.imageUrl}`}
                                            alt={shoot.title}
                                            className="gallery-img"
                                        />
                                        <div className="profile-info">
                                            <h3>{shoot.title}</h3>
                                            <p>Price: {shoot.price} KZT</p>
                                            <h5>DATE: {formattedDate} {formattedTime}</h5>
                                        </div>
                                        <button
                                            className="profile-btn"
                                            onClick={() => deleteShoot(purchase.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="profile-p">This user has not purchased any photoshoots yet.</p>
                )}

                <button className="back-btn" onClick={() => navigate("/")}>
                    Back
                </button>
            </div>

        </>
    );
}

export default UserProfile;
