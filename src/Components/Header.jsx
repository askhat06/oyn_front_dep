import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle"; 
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../redux/userSlice";

function Header() {
    const user = useSelector((state) => state.user.user)
    const dispatch = useDispatch()

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
                        <Link to="/photoshoots">My Courses</Link>
                        <Link to="/company">About Platform</Link>
                    </div>
                    
                    <ThemeToggle />

                    {user ?

                        (<div className="navbar-buttons">
                            <Link to={`/profile/${user.role}/${user.id}`}>
                                {user.role === "company" ? user.companyName : user.username}
                            </Link>
                            <button className="navbar-logout" onClick={() => dispatch(clearUser())}>Logout</button>
                        </div>) :

                        (<div className="navbar-buttons">
                            <Link to="/registration">REG</Link>
                            <Link to="/login">LOGIN</Link>
                        </div>)
                    }



                </nav>
            </header>

            <hr />
        </>
    )
}

export default Header;