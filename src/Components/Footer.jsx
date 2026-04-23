import { Link } from "react-router-dom";

function Footer() {
    return (
        <>
            <footer>
                <hr />

                <div className="footer-container">

                    <div className="footer-logo">
                        <Link to="/">OYAN</Link>
                        &copy; Created by 
                    </div>

                    <div className="footer-links">
                        <Link to="/">Home</Link>
                        <Link to="/courses">Courses Catalog</Link>
                        <Link to="/company">About Platform</Link>
                    </div>

                </div>
            </footer>
        </>
    )
}

export default Footer;