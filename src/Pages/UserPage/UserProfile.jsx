import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
import { apiFetch } from "../../lib/api";

function UserProfile() {
    const user = useSelector((state) => state.user.user);
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        apiFetch(`/api/users/${id}`)
            .then(data => setProfile(data))
            .catch(() => toast.error("Failed to load profile"));
    }, [id]);

    if (!profile) return <p style={{ padding: "2rem" }}>Loading...</p>;

    return (
        <div className="theme-dark">
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
                    <h1>USER PROFILE</h1>
                    <div className="home-content">
                        <h2 className="profile-username">
                            {profile.username}
                        </h2>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Role:</strong> {profile.role}</p>

                        {user && user.id === profile.id && (
                            <>
                                <p><strong>Balance:</strong> {profile.balance} KZT</p>
                                <button className="edit-btn">
                                    <Link to={`/refill-balance/${profile.id}`}>Refill Balance</Link>
                                </button>
                                <br /><br />
                                <p>Change password:</p>
                                <button className="profile-btn" onClick={() => navigate("/edit")}>
                                    Change
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <button className="back-btn" onClick={() => navigate("/")}>
                Back
            </button>
        </div>
    );
}

export default UserProfile;
