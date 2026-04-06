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
                        <Link to="/gallery">Gallery</Link>
                        <Link to="/photoshoots">Photoshoots</Link>
                        <Link to="/company">Company</Link>
                    </div>

                </div>
            </footer>
        </>
    )
}

export default Footer;