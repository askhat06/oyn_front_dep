import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { apiFetch } from "../lib/api";
import "./Auth.css";

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
        setLoading(true);
        try {
            const data = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });
            const token = data.token || data.accessToken || data.jwt;
            if (token) {
                localStorage.setItem("token", token);
                const user = await apiFetch("/api/auth/me");
                dispatch(setUser(user));
                toast.success("Welcome back!");
                navigate("/");
            } else {
                toast.error("Unexpected server response. Please try again.");
            }
        } catch (error) {
            if (error.status === 403) toast.error("Your email hasn't been verified. Please check your inbox.");
            else if (error.status === 401) toast.error("Incorrect email or password.");
            else if (error.status === 429) toast.error("Too many login attempts. Please wait a moment.");
            else toast.error(error.message || "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <ToastContainer />
            <div className="auth-page">
                <div className="auth-left">
                    <div className="auth-brand">OYAN</div>
                    <h1 className="auth-tagline">Learn. Grow.<br />Succeed.</h1>
                    <p className="auth-sub">Join thousands of students and teachers on the best e-learning platform.</p>
                </div>

                <div className="auth-right">
                    <div className="auth-form-box">
                        <h2 className="auth-title">Welcome back</h2>
                        <p className="auth-subtitle">Sign in to your account</p>

                        <div className="auth-field">
                            <label className="auth-label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="auth-input"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <div className="auth-field-header">
                                <label className="auth-label">Password</label>
                                <span className="auth-forgot-link" onClick={() => navigate("/forgot-password")}>
                                    Forgot password?
                                </span>
                            </div>
                            <div className="auth-input-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="auth-input"
                                    required
                                />
                                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button className="auth-submit-btn" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                        <p className="auth-bottom-text">
                            Don't have an account?{" "}
                            <Link to="/registration" className="auth-link">Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;