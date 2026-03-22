import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';



import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function LoginSubmit(e) {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:7777/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                toast.error("Invalid credentials");
                return;
            }

            const data = await response.json();
            const token = data.token || data.accessToken || data.jwt;
            
            if (token) {
                localStorage.setItem("token", token);
                
                // Fetch user data
                const meResponse = await fetch("http://localhost:7777/api/auth/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (meResponse.ok) {
                    const user = await meResponse.json();
                    dispatch(setUser(user));
                    toast.success("You have successfully logged in");
                    navigate("/");
                } else {
                    toast.error("Failed to fetch user profile");
                }
            } else {
                toast.error("Invalid token response");
            }
        } catch (error) {
            toast.error("Server connection failed");
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
