import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle"; 
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../redux/userSlice";

const ROLE_LABELS = {
    company: "Company",
    professor: "Teacher",
    student: "Student",
};

function Header() {
    const user = useSelector((state) => state.user.user)
    const dispatch = useDispatch()

    const profileRole = user?.role?.toLowerCase() ?? "";
    const displayName = user
        ? (user.role === "company" ? user.companyName : user.username)
        : null;

    const avatarSrc = user?.avatarUrl
        ? `/img/IndexPage/${user.avatarUrl}`
        : null;

    return (
        <>
            <header>
                <nav className="navbar-container">

                    <div className="navbar-logo">
                        <Link to="/">OYAN</Link>
                    </div>

                    <div className="navbar-links">
                        <Link to="/">Home</Link>
                        <Link to="/courses">Courses Catalog</Link>
                        <Link to="/about">About Platform</Link>
                    </div>
                    
                    <ThemeToggle />

                    {user ? (
                        <div className="navbar-buttons">
                            <Link
                                to={`/profile/${profileRole}/${user.id}`}
                                className="navbar-profile-btn"
                                title={`${displayName} (${ROLE_LABELS[profileRole] ?? profileRole})`}
                            >
                                {avatarSrc ? (
                                    <img
                                        src={avatarSrc}
                                        alt="avatar"
                                        className="navbar-avatar"
                                        onError={(e) => { e.target.style.display = "none"; }}
                                    />
                                ) : (
                                    <span className="navbar-profile-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="8" r="4"/>
                                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                                        </svg>
                                    </span>
                                )}
                                <span className="navbar-profile-name">{displayName}</span>
                                <span className="navbar-role-badge">{ROLE_LABELS[profileRole] ?? profileRole}</span>
                            </Link>
                            <button
                                className="navbar-logout"
                                onClick={() => dispatch(clearUser())}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="navbar-buttons">
                            <Link to="/registration" className="navbar-reg-btn">Sign Up</Link>
                            <Link to="/login" className="navbar-login-btn">Login</Link>
                        </div>
                    )}

                </nav>
            </header>

            <hr />
        </>
    )
}

export default Header;