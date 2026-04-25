import { useState } from "react";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import AdminPendingQueue from "./AdminPendingQueue";
import AdminAllCourses from "./AdminAllCourses";

const TABS = [
    { id: "pending", label: "Pending Review", icon: "⏳" },
    { id: "all", label: "All Courses", icon: "📚" },
];

function AdminPage() {
    const [tab, setTab] = useState("pending");

    return (
        <>
            <Header />
            <div className="lms-root">
                <div className="lms-header">
                    <div className="lms-header-title">
                        <span className="lms-header-icon">🛡️</span>
                        <span>Admin — Course Moderation</span>
                    </div>
                </div>

                <div className="lms-tabs">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            className={`lms-tab ${tab === t.id ? "active" : ""}`}
                            onClick={() => setTab(t.id)}
                        >
                            <span>{t.icon}</span> {t.label}
                        </button>
                    ))}
                </div>

                <div className="lms-content">
                    {tab === "pending" && <AdminPendingQueue />}
                    {tab === "all" && <AdminAllCourses />}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default AdminPage;
