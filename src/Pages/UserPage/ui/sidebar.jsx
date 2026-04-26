function Sidebar({ profile, activeTab, setActiveTab, isTeacher }) {
    const studentMenu = [
        { id: "courses", label: "My Courses" },
        { id: "certificates", label: "Certificates" },
        { id: "settings", label: "Settings" },
    ];

    const teacherMenu = [
        { id: "courses", label: "Manage Courses" },
        { id: "settings", label: "Settings" },
    ];

    const menu = isTeacher ? teacherMenu : studentMenu;

    return (
        <div className="sidebar">
            <img
    src={
        profile.avatarUrl
            ? profile.avatarUrl.startsWith("http")
                ? profile.avatarUrl
                : `/img/IndexPage/${profile.avatarUrl}`
            : "/img/IndexPage/default-avatar.jpg"
    }
    alt="avatar"
    className="avatar"
/>

            <h3>{profile.fullName || profile.username}</h3>
<p className="location">{profile.location || "No location set"}</p>            {isTeacher && <span className="lms-role-badge">Professor</span>}

<button className="edit-btn" onClick={() => setActiveTab("settings")}>Edit Profile</button>
            <div className="menu">
                {menu.map(item => (
                    <button
                        key={item.id}
                        className={activeTab === item.id ? "active" : ""}
                        onClick={() => setActiveTab(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Sidebar;
