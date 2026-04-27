import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiFetch } from "../../../lib/api";
import { setUser } from "../../../redux/userSlice";

const ROLE_LABELS = {
    student: "Student",
    professor: "Teacher",
    company: "Company",
    admin: "Admin",
};

function Settings({ onSaved }) {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);

    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [location, setLocation] = useState(user?.location || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!user) return null;

    const roleLabel = ROLE_LABELS[user.role] ?? user.role;

    function handleCancel() {
        setEditing(false);
        setFullName(user?.fullName || "");
        setLocation(user?.location || "");
        setAvatarUrl(user?.avatarUrl || "");
        setError(null);
        setSuccess(false);
    }

    async function handleSave() {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const updated = await apiFetch("/api/auth/me", {
                method: "PUT",
                body: JSON.stringify({ fullName, location, avatarUrl }),
            });
            dispatch(setUser(updated));
            if (onSaved) onSaved(updated);
            setSuccess(true);
            setEditing(false);
        } catch (e) {
            setError("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="lms-panel">
            <h2>Account Settings</h2>
            <p className="lms-subtitle">Your account information</p>

            <div className="settings-fields">
                <div className="settings-field">
                    <label>FULL NAME</label>
                    {editing ? (
                        <div className="lms-field" style={{ margin: 0 }}>
                            <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                            />
                        </div>
                    ) : (
                        <p>{user.fullName || "—"}</p>
                    )}
                </div>

                <div className="settings-field">
                    <label>LOCATION</label>
                    {editing ? (
                        <div className="lms-field" style={{ margin: 0 }}>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Almaty, Kazakhstan"
                            />
                        </div>
                    ) : (
                        <p>{user.location || "—"}</p>
                    )}
                </div>

                <div className="settings-field">
                    <label>AVATAR URL</label>
                    {editing ? (
                        <div className="lms-field" style={{ margin: 0 }}>
                            <input
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="avatar"
                                    style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                                />
                            ) : (
                                <p>—</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="settings-field">
                    <label>EMAIL</label>
                    <p>{user.email || "—"}</p>
                </div>

                <div className="settings-field">
                    <label>ROLE</label>
                    <p>{roleLabel}</p>
                </div>
            </div>

            {error && <p style={{ color: "#ef4444", marginTop: 16, fontSize: 14 }}>{error}</p>}
            {success && <p style={{ color: "#22c55e", marginTop: 16, fontSize: 14 }}>Saved successfully.</p>}

            <div className="lms-form-actions" style={{ marginTop: 24 }}>
                {!editing ? (
                    <button className="lms-btn-primary" onClick={() => setEditing(true)}>
                        Edit Profile
                    </button>
                ) : (
                    <>
                        <button className="lms-btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                            className="lms-btn-ghost"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Settings;
