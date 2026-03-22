import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';



import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { apiFetch } from "../lib/api";

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function LoginSubmit(e) {
        e.preventDefault();

        try {
            const data = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            const token = data.token || data.accessToken || data.jwt;
            
            if (token) {
                localStorage.setItem("token", token);
                
                // Fetch user data
                const user = await apiFetch("/api/auth/me");
                dispatch(setUser(user));
                toast.success("You have successfully logged in");
                navigate("/");
            } else {
                toast.error("Invalid token response");
            }
        } catch (error) {
            if (error.status === 401) {
                toast.error("Invalid credentials");
            } else if (error.status === 429) {
                toast.error("Too many login attempts. Please wait.");
            } else {
                toast.error(error.message || "Server connection failed");
            }
        }
    }

    return (
        <>
            <div className="login-page">
                <div className="login-box">
                    <form onSubmit={LoginSubmit}>
                        <div className="login-container">
                            <h2>Login</h2>
                            <div className="input-box">
                                <input
                                    type="email"
                                    value={email}
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label>Email</label>
                            </div>
                            <div className="input-box">
                                <input
                                    type="password"
                                    value={password}
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label>Password</label>
                            </div>
                            <div className="login-btn">
                                <button type="submit">Login</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;
