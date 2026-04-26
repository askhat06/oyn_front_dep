import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { apiFetch } from "../lib/api";
import "./Auth.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email) { toast.error("Please enter your email."); return; }
        setLoading(true);
        try {
            await apiFetch("/api/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email }),
            });
            setSent(true);
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
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
                    <h1 className="auth-tagline">Forgot your password?</h1>
                    <p className="auth-sub">No worries — we'll send you a reset link right away.</p>
                </div>

                <div className="auth-right">
                    <div className="auth-form-box">
                        {sent ? (
                            <>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                                <h2 className="auth-title">Check your inbox</h2>
                                <p style={{ color: "#64748b", marginBottom: 8 }}>
                                    We sent a reset link to
                                </p>
                                <p style={{ fontWeight: 600, color: "#1e293b", marginBottom: 32 }}>{email}</p>
                                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}>
                                    The link expires in 1 hour. Check your spam folder if you don't see it.
                                </p>
                                <button className="auth-submit-btn" onClick={() => navigate("/login")}>
                                    Back to Login →
                                </button>
                            </>
                        ) : (
                            <>
                                <h2 className="auth-title">Reset password</h2>
                                <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>

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

                                <button className="auth-submit-btn" onClick={handleSubmit} disabled={loading}>
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>

                                <p className="auth-bottom-text">
                                    Remember your password?{" "}
                                    <span className="auth-link" onClick={() => navigate("/login")}>
                                        Sign in
                                    </span>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;