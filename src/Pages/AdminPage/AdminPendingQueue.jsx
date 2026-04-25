import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

function RejectModal({ course, onClose, onRejected }) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!reason.trim()) { toast.error("Rejection reason is required"); return; }
        setLoading(true);
        try {
            await apiFetch(`/api/admin/courses/${course.id}/reject`, {
                method: "POST",
                body: JSON.stringify({ reason: reason.trim() }),
            });
            toast.success(`"${course.title}" rejected`);
            onRejected(course.id);
        } catch (err) {
            toast.error(err.message || "Failed to reject course");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="lms-modal-overlay">
            <div className="lms-modal">
                <h2>Reject Course</h2>
                <p>Provide a reason for rejecting <strong>{course.title}</strong>. The teacher will see this message.</p>
                <form onSubmit={handleSubmit} className="lms-form">
                    <div className="lms-field">
                        <label>Rejection Reason *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            placeholder="e.g., Please add more detailed lesson descriptions and improve video quality."
                            required
                        />
                    </div>
                    <div className="lms-form-actions">
                        <button type="submit" className="lms-btn-danger" disabled={loading}>
                            {loading ? "Rejecting…" : "Reject Course"}
                        </button>
                        <button type="button" className="lms-btn-ghost" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AdminPendingQueue() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [approvingId, setApprovingId] = useState(null);

    useEffect(() => {
        apiFetch("/api/admin/courses/pending")
            .then(setCourses)
            .catch(() => toast.error("Failed to load pending courses"))
            .finally(() => setLoading(false));
    }, []);

    async function handleApprove(course) {
        setApprovingId(course.id);
        try {
            await apiFetch(`/api/admin/courses/${course.id}/publish`, { method: "POST" });
            toast.success(`"${course.title}" approved and published`);
            setCourses((prev) => prev.filter((c) => c.id !== course.id));
        } catch (err) {
            toast.error(err.message || "Failed to approve");
        } finally {
            setApprovingId(null);
        }
    }

    function handleRejected(courseId) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setRejectTarget(null);
    }

    if (loading) return <p className="lms-loading">Loading pending courses…</p>;

    if (courses.length === 0) {
        return (
            <div className="lms-panel">
                <h2>Pending Review</h2>
                <p className="lms-empty">No courses awaiting review. All caught up!</p>
            </div>
        );
    }

    return (
        <div className="lms-panel">
            <div className="lms-panel-header">
                <div>
                    <h2>Pending Review</h2>
                    <p className="lms-subtitle" style={{ marginBottom: 0 }}>
                        {courses.length} course{courses.length !== 1 ? "s" : ""} awaiting approval
                    </p>
                </div>
            </div>

            {courses.map((course) => (
                <div key={course.id} className="lms-course-row">
                    <div className="lms-course-header" style={{ cursor: "default" }}>
                        <div className="lms-course-info">
                            <h3>{course.title}</h3>
                            <p>{course.subtitle || course.description?.slice(0, 100)}</p>
                            <div className="lms-course-tags">
                                {course.level && <span className="lms-tag">{course.level}</span>}
                                {course.locale && <span className="lms-tag">{course.locale.toUpperCase()}</span>}
                                {course.durationHours && <span className="lms-tag">{course.durationHours}h</span>}
                            </div>
                            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                                by <strong>{course.ownerEmail}</strong> · {course.lessonCount || 0} lessons
                                {course.price != null ? ` · $${Number(course.price).toFixed(2)}` : " · Free"}
                            </p>
                        </div>
                        <div className="lms-course-meta">
                            <span className="lms-status lms-status-pending_review">Under Review</span>
                        </div>
                    </div>

                    <div className="lms-course-actions">
                        <button
                            className="lms-btn-success"
                            disabled={approvingId === course.id}
                            onClick={() => handleApprove(course)}
                        >
                            {approvingId === course.id ? "Approving…" : "Approve & Publish"}
                        </button>
                        <button
                            className="lms-btn-danger"
                            onClick={() => setRejectTarget(course)}
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}

            {rejectTarget && (
                <RejectModal
                    course={rejectTarget}
                    onClose={() => setRejectTarget(null)}
                    onRejected={handleRejected}
                />
            )}
        </div>
    );
}

export default AdminPendingQueue;
