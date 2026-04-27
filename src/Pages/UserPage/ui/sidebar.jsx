function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function resolveAvatarSrc(avatarUrl) {
    if (!avatarUrl) return null;
    return avatarUrl.startsWith("http") ? avatarUrl : `/img/IndexPage/${avatarUrl}`;
}

const STUDENT_MENU = [
    { id: "courses",      label: "My Courses",   icon: "▤" },
    { id: "certificates", label: "Certificates", icon: "✦" },
    { id: "settings",     label: "Settings",     icon: "✱" },
];

const TEACHER_MENU = [
    { id: "courses",  label: "Manage Courses", icon: "▤" },
    { id: "settings", label: "Settings",       icon: "✱" },
];

function Sidebar({ profile, activeTab, setActiveTab, isTeacher }) {
    const menu = isTeacher ? TEACHER_MENU : STUDENT_MENU;
    const displayName = profile.fullName || profile.username || "User";
    const avatarSrc = resolveAvatarSrc(profile.avatarUrl);

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">OYAN</div>

            <div className="sidebar-profile">
                <div className="avatar-wrapper">
                    {avatarSrc ? (
                        <img src={avatarSrc} alt="avatar" className="avatar" />
                    ) : (
                        <div className="avatar-initials">{getInitials(displayName)}</div>
                    )}
                </div>

                <p className="sidebar-name">{displayName}</p>
                <p className="sidebar-location">
                    {profile.location || "No location set"}
                </p>
                {isTeacher && <span className="sidebar-role-badge">Teacher</span>}

                <button className="sidebar-edit-btn" onClick={() => setActiveTab("settings")}>
                    Edit Profile
                </button>
            </div>

            <nav className="sidebar-nav">
                {menu.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-nav-item${activeTab === item.id ? " active" : ""}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className="sidebar-nav-icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <span>© 2026 OYAN</span>
            </div>
        </aside>
    );
}

export default Sidebar;
