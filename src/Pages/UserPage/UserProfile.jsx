import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiFetch } from "../../lib/api";
import "./UserPage.css";
import Sidebar from "./ui/sidebar";
import TeacherDashboard from "./ui/TeacherDashboard";
import Certificates from "./ui/certificates";
import Settings from "./ui/Settings";

function UserProfile() {
    const user = useSelector((state) => state.user.user);

    const [profile, setProfile] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [progressMap, setProgressMap] = useState({});
    const [activeTab, setActiveTab] = useState("courses");

    useEffect(() => {
        apiFetch("/api/auth/me").then(setProfile).catch(() => {});

        if (user?.email) {
            apiFetch(`/api/enrollments?email=${encodeURIComponent(user.email)}`)
                .then((data) => {
                    setEnrollments(data);
                    // Fetch progress for every enrolled course in parallel
                    Promise.all(
                        data.map((e) =>
                            apiFetch(`/api/progress/courses/${e.courseSlug}`)
                                .then((p) => [e.courseSlug, p])
                                .catch(() => null)
                        )
                    ).then((results) => {
                        const map = {};
                        results.forEach((r) => { if (r) map[r[0]] = r[1]; });
                        setProgressMap(map);
                    });
                })
                .catch(() => {});
        }
    }, [user?.email]);

    if (!profile) return <p>Loading...</p>;

    const isTeacher = user?.role === "professor";

    return (
        <div className="dashboard">
            <Sidebar
                profile={profile}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isTeacher={isTeacher}
            />

            <div className="content">
                {/* Teacher course management */}
                {isTeacher && activeTab === "courses" && <TeacherDashboard />}

                {/* Student enrolled courses */}
                {!isTeacher && activeTab === "courses" && (
                    <>
                        <div className="content-header">
                            <h1>My Learning</h1>
                            <p>{enrollments.length} enrolled course{enrollments.length !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="courses-grid">
                            {enrollments.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📚</div>
                                    <h3>No courses yet</h3>
                                    <p>Browse the catalog and enroll in your first course</p>
                                </div>
                            )}
                            {enrollments.map((enrollment) => {
                                const progress = progressMap[enrollment.courseSlug];
                                return (
                                    <div key={enrollment.enrollmentId} className="course-card">
                                        <div className="course-info">
                                            <h3>{enrollment.courseTitle}</h3>
                                            <span className={`tag status-${enrollment.status?.toLowerCase()}`}>
                                                {enrollment.status}
                                            </span>
                                            {progress && (
                                                <div style={{ marginTop: 10 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                                                        <span>{progress.completedSteps}/{progress.totalSteps} lessons</span>
                                                        <span style={{ fontWeight: 600, color: "#6366f1" }}>{progress.percentComplete}%</span>
                                                    </div>
                                                    <div className="progress-bar-track">
                                                        <div
                                                            className="progress-bar-fill"
                                                            style={{ width: `${progress.percentComplete}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Certificates */}
                {activeTab === "certificates" && <Certificates />}

                {/* Settings — available to all roles */}
                {activeTab === "settings" && <Settings onSaved={(updated) => setProfile(updated)} />}
            </div>
        </div>
    );
}

export default UserProfile;
