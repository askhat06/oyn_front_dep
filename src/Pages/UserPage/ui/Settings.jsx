import { useSelector } from "react-redux";

const ROLE_LABELS = {
    student: "Student",
    professor: "Teacher",
    company: "Company",
    admin: "Admin",
};

function Settings() {
    const user = useSelector((state) => state.user.user);
    if (!user) return null;

    const roleLabel = ROLE_LABELS[user.role] ?? user.role;

    return (
        <div className="lms-panel">
            <h2>Account Settings</h2>
            <p className="lms-subtitle">Your account information</p>

            <div className="settings-fields">
                <div className="settings-field">
                    <label>Full Name</label>
                    <p>{user.fullName || user.username || "—"}</p>
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

            <p style={{ marginTop: 24, color: "#9ca3af", fontSize: 13 }}>
                Profile editing coming soon.
            </p>
        </div>
    );
}

export default Settings;
