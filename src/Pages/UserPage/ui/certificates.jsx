import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiFetch } from "../../../lib/api";

function Certificates() {
    const user = useSelector((state) => state.user.user);
    const [completed, setCompleted] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) { setLoading(false); return; }
        apiFetch(`/api/enrollments?email=${encodeURIComponent(user.email)}`)
            .then((data) => setCompleted(data.filter((e) => e.status === "COMPLETED")))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user?.email]);

    if (loading) return <p className="lms-loading">Loading certificates…</p>;

    if (completed.length === 0) {
        return (
            <div className="lms-panel">
                <h2>Certificates</h2>
                <p className="lms-empty">
                    No certificates yet. Complete a course to earn one.
                </p>
            </div>
        );
    }

    return (
        <div className="lms-panel">
            <h2>Certificates</h2>
            <p className="lms-subtitle">{completed.length} certificate{completed.length !== 1 ? "s" : ""} earned</p>
            <div className="certificates-grid">
                {completed.map((e) => (
                    <div key={e.enrollmentId} className="certificate-card">
                        <div className="certificate-icon">🎓</div>
                        <h3>{e.courseTitle}</h3>
                        <p className="certificate-label">Certificate of Completion</p>
                        <button className="lms-btn-outline" disabled>
                            Download PDF <span style={{ fontSize: 11, opacity: 0.6 }}>(coming soon)</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Certificates;
