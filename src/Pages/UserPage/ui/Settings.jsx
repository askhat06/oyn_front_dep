import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiFetch } from "../../../lib/api";
import { setUser } from "../../../redux/userSlice";

const ROLE_LABELS = {
    student: "Student",
    professor: "Teacher",
    company: "Company",
    admin: "Admin",
};

function Settings() {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [location, setLocation] = useState(user?.location || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    if (!user) return null;

    const roleLabel = ROLE_LABELS[user.role] ?? user.role;

    const handleSave = async () => {
        setLoading(true);
        setError("");
        setSuccess(false);
        try {
            const updated = await apiFetch("/api/auth/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, location, avatarUrl }),
            });
            dispatch(setUser({
                ...user,
                fullName: updated.fullName || fullName,
                location: updated.location || location,
                avatarUrl: updated.avatarUrl || avatarUrl,
            }));
            setSuccess(true);
            setEditing(false);
        } catch (e) {
            setError("Failed to save. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: "100%" };

    return (
        <div className="lms-panel">
            <h2>Account Settings</h2>
            <p className="lms-subtitle">Your account information</p>

            <div className="settings-fields">
                <div className="settings-field">
                    <label>Full Name</label>
                    {editing ? (
                        <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
                    ) : (
                        <p>{user.fullName || "—"}</p>
                    )}
                </div>

                <div className="settings-field">
                    <label>Location</label>
                    {editing ? (
                        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Almaty, Kazakhstan" style={inputStyle} />
                    ) : (
                        <p>{user.location || "—"}</p>
                    )}
                </div>

                <div className="settings-field">
                    <label>Avatar URL</label>
                    {editing ? (
                        <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="avatar" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                            ) : (
                                <p>—</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="settings-field">
                    <label>Email</label>
                    <p>{user.email || "—"}</p>
                </div>

                <div className="settings-field">
                    <label>Role</label>
                    <p>{roleLabel}</p>
                </div>
            </div>

            {success && <p style={{ color: "green", marginTop: 12 }}>Saved successfully!</p>}
            {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

            <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
                {!editing ? (
                    <button className="edit-btn" onClick={() => setEditing(true)}>
                        Edit Profile
                    </button>
                ) : (
                    <>
                        <button className="edit-btn" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => {
                            setEditing(false);
                            setFullName(user?.fullName || "");
                            setLocation(user?.location || "");
                            setAvatarUrl(user?.avatarUrl || "");
                        }} style={{ padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Settings;