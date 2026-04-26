import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { apiFetch } from "../lib/api";
import "./Auth.css";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
        if (password !== confirm) { toast.error("Passwords do not match."); return; }
        if (!token) { toast.error("Invalid reset link."); return; }

        setLoading(true);
        try {
            await apiFetch("/api/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({ token, newPassword: password }),
            });
            setDone(true);
        } catch (error) {
            if (error.status === 400) {
                toast.error("Reset link is invalid or expired. Please request a new one.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
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
                    <h1 className="auth-tagline">Reset your password.</h1>
                    <p className="auth-sub">Choose a strong password to keep your account secure.</p>
                </div>

                <div className="auth-right">
                    <div className="auth-form-box">
                        {done ? (
                            <>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                                <h2 className="auth-title">Password updated!</h2>
                                <p style={{ color: "#64748b", marginBottom: 32 }}>
                                    Your password has been reset successfully.
                                </p>
                                <button className="auth-submit-btn" onClick={() => navigate("/login")}>
                                    Go to Login →
                                </button>
                            </>
                        ) : (
                            <>
                                <h2 className="auth-title">New password</h2>
                                <p className="auth-subtitle">Enter your new password below</p>

                                <div className="auth-field">
                                    <label className="auth-label">New Password</label>
                                    <div className="auth-input-wrap">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min. 8 characters"
                                            className="auth-input"
                                            required
                                        />
                                        <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        placeholder="Repeat password"
                                        className="auth-input"
                                        required
                                    />
                                </div>

                                <button className="auth-submit-btn" onClick={handleSubmit} disabled={loading}>
                                    {loading ? "Saving..." : "Reset Password"}
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

export default ResetPassword;