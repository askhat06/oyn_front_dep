import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

const STATUS_FILTERS = ["ALL", "DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED"];

const STATUS_LABELS = {
    DRAFT: "Draft",
    PENDING_REVIEW: "Under Review",
    PUBLISHED: "Published",
    REJECTED: "Rejected",
};

const STATUS_CSS = {
    DRAFT: "lms-status-draft",
    PENDING_REVIEW: "lms-status-pending_review",
    PUBLISHED: "lms-status-published",
    REJECTED: "lms-status-rejected",
};

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
            onRejected(course.id, "REJECTED", reason.trim());
        } catch (err) {
            toast.error(err.message || "Failed to reject");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="lms-modal-overlay">
            <div className="lms-modal">
                <h2>Reject Course</h2>
                <p>Provide a reason for rejecting <strong>{course.title}</strong>.</p>
                <form onSubmit={handleSubmit} className="lms-form">
                    <div className="lms-field">
                        <label>Rejection Reason *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            placeholder="e.g., Please improve the lesson descriptions."
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

function AdminAllCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [rejectTarget, setRejectTarget] = useState(null);
    const [approvingId, setApprovingId] = useState(null);

    useEffect(() => {
        apiFetch("/api/admin/courses")
            .then(setCourses)
            .catch(() => toast.error("Failed to load courses"))
            .finally(() => setLoading(false));
    }, []);

    async function handleApprove(course) {
        setApprovingId(course.id);
        try {
            await apiFetch(`/api/admin/courses/${course.id}/publish`, { method: "POST" });
            toast.success(`"${course.title}" approved and published`);
            setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, status: "PUBLISHED" } : c));
        } catch (err) {
            toast.error(err.message || "Failed to approve");
        } finally {
            setApprovingId(null);
        }
    }

    function handleRejected(courseId, newStatus, reason) {
        setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, status: newStatus, rejectionReason: reason } : c));
        setRejectTarget(null);
    }

    const filtered = statusFilter === "ALL"
        ? courses
        : courses.filter((c) => c.status === statusFilter);

    if (loading) return <p className="lms-loading">Loading courses…</p>;

    return (
        <div className="lms-panel">
            <div className="lms-panel-header">
                <div>
                    <h2>All Courses</h2>
                    <p className="lms-subtitle" style={{ marginBottom: 0 }}>
                        {courses.length} total · {courses.filter((c) => c.status === "PUBLISHED").length} published
                    </p>
                </div>
            </div>

            <div className="lms-lesson-tabs" style={{ marginBottom: 16 }}>
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        className={statusFilter === s ? "active" : ""}
                        onClick={() => setStatusFilter(s)}
                    >
                        {s === "ALL" ? "All" : STATUS_LABELS[s]}
                        {" "}({s === "ALL" ? courses.length : courses.filter((c) => c.status === s).length})
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="lms-empty">No courses in this category.</p>
            )}

            {filtered.map((course) => (
                <div key={course.id} className="lms-course-row">
                    <div className="lms-course-header" style={{ cursor: "default" }}>
                        <div className="lms-course-info">
                            <h3>{course.title}</h3>
                            <div className="lms-course-tags">
                                {course.level && <span className="lms-tag">{course.level}</span>}
                                {course.locale && <span className="lms-tag">{course.locale.toUpperCase()}</span>}
                            </div>
                            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                                by <strong>{course.ownerEmail || "—"}</strong>
                                {" · "}{course.lessonCount || 0} lessons
                                {" · "}{course.enrollmentCount || 0} students
                                {course.price != null ? ` · $${Number(course.price).toFixed(2)}` : " · Free"}
                            </p>
                            {course.status === "REJECTED" && course.rejectionReason && (
                                <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
                                    Rejection reason: {course.rejectionReason}
                                </p>
                            )}
                        </div>
                        <div className="lms-course-meta">
                            <span className={`lms-status ${STATUS_CSS[course.status] || ""}`}>
                                {STATUS_LABELS[course.status] || course.status}
                            </span>
                        </div>
                    </div>

                    {course.status === "PENDING_REVIEW" && (
                        <div className="lms-course-actions">
                            <button
                                className="lms-btn-success"
                                disabled={approvingId === course.id}
                                onClick={() => handleApprove(course)}
                            >
                                {approvingId === course.id ? "Approving…" : "Approve & Publish"}
                            </button>
                            <button className="lms-btn-danger" onClick={() => setRejectTarget(course)}>
                                Reject
                            </button>
                        </div>
                    )}
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

export default AdminAllCourses;
