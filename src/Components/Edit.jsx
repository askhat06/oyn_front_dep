import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import bcrypt from "bcryptjs"

import { useSelector } from "react-redux";

function EditProfile() {
    const user = useSelector((state) => state.user.user)
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        setEmail(user.email || "");
    }, [user]);

    async function handleUpdate() {
        const response = await fetch(`http://localhost:3000/users/${user.id}`);
        const data = await response.json();

        const isSame = await bcrypt.compare(password, data.password);
        if (isSame) {
            toast.error("Enter new password!")
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = {
            password: hashedPassword
        };

        const responseUpdate = await fetch(`http://localhost:3000/users/${user.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedUser),
        });

        if (responseUpdate.ok) {
            toast.success("Profile updated successfully.");
            navigate(`/profile/${user.role}/${user.id}`);
        } else {
            toast.error("Ошибка")
        }
    }

    return (
        <div>
            <div className="edit-container">
                {/* <div className="center-wrapper"> */}
                <h1>Edit Profile</h1>
                <div className="edit-form">

                    <input
                        type="email"
                        name="email"
                        value={email}
                        placeholder="Email"
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="New Password (optional)"
                        onChange={(e) => setPassword(e.target.value)}
                    />


                    <button className="edit-btn" onClick={handleUpdate}>Save Changes</button>
                </div>
                {/* </div> */}
            </div>
        </div>
    );
}

export default EditProfile;
