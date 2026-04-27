import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { toast } from "react-toastify";

const ALLOWED_TYPES = ["video/mp4", "video/webm"];
const MAX_BYTES = 512 * 1024 * 1024;

function getVideoPreviewUrl(url) {
    if (!url) return null;
    const ytMatch = url.match(
        /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
}

function VideoPreview({ url }) {
    const embedUrl = getVideoPreviewUrl(url);
    if (!embedUrl) return null;
    return (
        <div className="lms-video-preview">
            <iframe
                src={embedUrl}
                title="Preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}

function parseDuration(str) {
    const parts = str.trim().split(":").map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
}

function uploadToS3(uploadUrl, file, contentType, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener("load", () => {
            xhr.status >= 200 && xhr.status < 300
                ? resolve()
                : reject(new Error(`S3 upload failed with status ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.send(file);
    });
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function ModeTab({ label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: "8px 16px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "#111827" : "#6b7280",
                borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
                marginBottom: -1,
            }}
        >
            {label}
        </button>
    );
}

// ─── URL mode ─────────────────────────────────────────────────────────────────

function UrlModeForm({ courses }) {
    const [form, setForm] = useState({
        courseSlug: "",
        title: "",
        summary: "",
        duration: "",
        videoUrl: "",
    });
    const [loading, setLoading] = useState(false);

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.courseSlug) { toast.error("Select a course"); return; }
        if (!form.videoUrl.trim()) { toast.error("Enter a video URL"); return; }
        const durationMinutes = parseDuration(form.duration);
        if (!durationMinutes) { toast.error("Enter valid duration (MM:SS or HH:MM:SS)"); return; }

        setLoading(true);
        try {
            await apiFetch(`/api/teacher/courses/${form.courseSlug}/lessons`, {
                method: "POST",
                body: JSON.stringify({
                    title: form.title.trim(),
                    summary: form.summary.trim(),
                    content: form.summary.trim() || form.title.trim(),
                    videoUrl: form.videoUrl.trim(),
                    durationMinutes,
                }),
            });
            toast.success("Video lesson added!");
            setForm(f => ({ ...f, title: "", summary: "", duration: "", videoUrl: "" }));
        } catch (err) {
            toast.error(err.message || "Failed to add lesson");
        } finally {
            setLoading(false);
        }
    }

    const previewEmbed = getVideoPreviewUrl(form.videoUrl);

    return (
        <form onSubmit={handleSubmit} className="lms-form">
            <div className="lms-field">
                <label>Course *</label>
                <select value={form.courseSlug} onChange={e => set("courseSlug", e.target.value)} required>
                    <option value="">Select a course</option>
                    {courses.map(c => <option key={c.id} value={c.slug}>{c.title}</option>)}
                </select>
            </div>

            <div className="lms-field">
                <label>Video Title *</label>
                <input
                    placeholder="e.g., Introduction to React Hooks"
                    value={form.title}
                    onChange={e => set("title", e.target.value)}
                    required
                />
            </div>

            <div className="lms-field">
                <label>Video URL *</label>
                <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={form.videoUrl}
                    onChange={e => set("videoUrl", e.target.value)}
                    required
                />
                <small>Supports YouTube, Vimeo, or any direct video link</small>
            </div>

            {form.videoUrl && !previewEmbed && (
                <p className="lms-url-note">Direct link — will play in browser</p>
            )}
            {previewEmbed && <VideoPreview url={form.videoUrl} />}

            <div className="lms-field">
                <label>Description</label>
                <textarea
                    placeholder="Briefly describe what students will learn"
                    value={form.summary}
                    onChange={e => set("summary", e.target.value)}
                    rows={3}
                />
            </div>

            <div className="lms-field">
                <label>Duration *</label>
                <input
                    placeholder="e.g., 15:30"
                    value={form.duration}
                    onChange={e => set("duration", e.target.value)}
                    required
                />
                <small>Format: MM:SS or HH:MM:SS</small>
            </div>

            <div className="lms-form-actions">
                <button type="submit" className="lms-btn-primary" disabled={loading}>
                    {loading ? "Saving…" : "Add Lesson"}
                </button>
                <button
                    type="button"
                    className="lms-btn-ghost"
                    onClick={() => setForm(f => ({ ...f, title: "", summary: "", duration: "", videoUrl: "" }))}
                >
                    Clear
                </button>
            </div>
        </form>
    );
}

// ─── Upload mode ──────────────────────────────────────────────────────────────

const STEP_LABELS = {
    creating: "Creating lesson…",
    initiating: "Preparing upload…",
    completing: "Finalizing…",
    done: "Upload complete!",
};

function UploadModeForm({ courses }) {
    const [form, setForm] = useState({ courseSlug: "", title: "", summary: "", duration: "" });
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState(null);
    const [step, setStep] = useState(null); // null | "creating" | "initiating" | "uploading" | "completing" | "done"
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef();

    const busy = step !== null;

    function set(field, value) {
        setForm(f => ({ ...f, [field]: value }));
    }

    function pickFile(f) {
        if (!f) return;
        if (!ALLOWED_TYPES.includes(f.type)) {
            setFileError("Only MP4 and WebM files are accepted.");
            setFile(null);
            return;
        }
        if (f.size > MAX_BYTES) {
            setFileError("File too large — maximum size is 512 MB.");
            setFile(null);
            return;
        }
        setFileError(null);
        setFile(f);
    }

    function handleDrop(e) {
        e.preventDefault();
        pickFile(e.dataTransfer.files[0]);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.courseSlug) { toast.error("Select a course"); return; }
        if (!file) { toast.error("Select a video file"); return; }
        const durationMinutes = parseDuration(form.duration);
        if (!durationMinutes) { toast.error("Enter valid duration (MM:SS or HH:MM:SS)"); return; }

        try {
            // 1 — create lesson
            setStep("creating");
            const lesson = await apiFetch(`/api/teacher/courses/${form.courseSlug}/lessons`, {
                method: "POST",
                body: JSON.stringify({
                    title: form.title.trim(),
                    summary: form.summary.trim(),
                    content: form.summary.trim() || form.title.trim(),
                    durationMinutes,
                }),
            });

            // 2 — init upload → get presigned URL
            setStep("initiating");
            const init = await apiFetch(
                `/api/teacher/courses/${form.courseSlug}/lessons/${lesson.slug}/video-upload`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        fileName: file.name,
                        contentType: file.type,
                        sizeBytes: file.size,
                    }),
                }
            );

            // 3 — PUT file directly to MinIO/S3
            setStep("uploading");
            setProgress(0);
            await uploadToS3(
                init.uploadUrl,
                file,
                init.requiredHeaders["Content-Type"],
                setProgress
            );

            // 4 — confirm upload
            setStep("completing");
            await apiFetch(
                `/api/teacher/courses/${form.courseSlug}/lessons/${lesson.slug}/video-upload/complete`,
                {
                    method: "POST",
                    body: JSON.stringify({ objectKey: init.objectKey }),
                }
            );

            setStep("done");
            toast.success("Video uploaded successfully!");
            setForm(f => ({ ...f, title: "", summary: "", duration: "" }));
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setTimeout(() => setStep(null), 2000);
        } catch (err) {
            toast.error(err.message || "Upload failed. Please try again.");
            setStep(null);
        }
    }

    function handleClear() {
        setForm(f => ({ ...f, title: "", summary: "", duration: "" }));
        setFile(null);
        setFileError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const btnLabel = step === "uploading"
        ? `Uploading ${progress}%…`
        : step && step !== "done"
            ? STEP_LABELS[step]
            : "Upload Video";

    return (
        <form onSubmit={handleSubmit} className="lms-form">
            <div className="lms-field">
                <label>Course *</label>
                <select value={form.courseSlug} onChange={e => set("courseSlug", e.target.value)} required disabled={busy}>
                    <option value="">Select a course</option>
                    {courses.map(c => <option key={c.id} value={c.slug}>{c.title}</option>)}
                </select>
            </div>

            <div className="lms-field">
                <label>Video Title *</label>
                <input
                    placeholder="e.g., Introduction to React Hooks"
                    value={form.title}
                    onChange={e => set("title", e.target.value)}
                    required
                    disabled={busy}
                />
            </div>

            <div className="lms-field">
                <label>Video File *</label>
                <div
                    className="lms-dropzone"
                    onClick={() => !busy && fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={!busy ? handleDrop : undefined}
                    style={{ cursor: busy ? "default" : "pointer" }}
                >
                    {file ? (
                        <div className="lms-file-selected">
                            <div>{file.name}</div>
                            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                                {(file.size / (1024 * 1024)).toFixed(1)} MB &middot; {file.type}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="lms-upload-icon">⬆</div>
                            <div>Click or drag a video file here</div>
                            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                                MP4 or WebM &middot; max 512 MB
                            </div>
                        </>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    style={{ display: "none" }}
                    onChange={e => pickFile(e.target.files[0])}
                />
                {fileError && <small style={{ color: "#ef4444" }}>{fileError}</small>}
            </div>

            <div className="lms-field">
                <label>Description</label>
                <textarea
                    placeholder="Briefly describe what students will learn"
                    value={form.summary}
                    onChange={e => set("summary", e.target.value)}
                    rows={3}
                    disabled={busy}
                />
            </div>

            <div className="lms-field">
                <label>Duration *</label>
                <input
                    placeholder="e.g., 15:30"
                    value={form.duration}
                    onChange={e => set("duration", e.target.value)}
                    required
                    disabled={busy}
                />
                <small>Format: MM:SS or HH:MM:SS</small>
            </div>

            {step === "uploading" && (
                <div style={{ marginBottom: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: "#6b7280" }}>Uploading to server…</span>
                        <span style={{ fontWeight: 600 }}>{progress}%</span>
                    </div>
                    <div style={{ background: "#e5e7eb", borderRadius: 6, height: 8, overflow: "hidden" }}>
                        <div
                            style={{
                                background: "#6366f1",
                                height: "100%",
                                width: `${progress}%`,
                                borderRadius: 6,
                                transition: "width 0.15s ease",
                            }}
                        />
                    </div>
                </div>
            )}

            {step && step !== "uploading" && (
                <p style={{ fontSize: 13, color: step === "done" ? "#22c55e" : "#6b7280", margin: 0 }}>
                    {STEP_LABELS[step]}
                </p>
            )}

            <div className="lms-form-actions">
                <button type="submit" className="lms-btn-primary" disabled={busy || !file}>
                    {btnLabel}
                </button>
                {!busy && (
                    <button type="button" className="lms-btn-ghost" onClick={handleClear}>
                        Clear
                    </button>
                )}
            </div>
        </form>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function TeacherUploadVideo() {
    const [courses, setCourses] = useState([]);
    const [mode, setMode] = useState("url");

    useEffect(() => {
        apiFetch("/api/teacher/courses").then(setCourses).catch(() => {});
    }, []);

    return (
        <div className="lms-panel">
            <h2>Add Video Lesson</h2>
            <p className="lms-subtitle">Add a lesson via YouTube/Vimeo link or by uploading a video file</p>

            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 24 }}>
                <ModeTab label="Video URL" active={mode === "url"} onClick={() => setMode("url")} />
                <ModeTab label="Upload File" active={mode === "upload"} onClick={() => setMode("upload")} />
            </div>

            {mode === "url"
                ? <UrlModeForm courses={courses} />
                : <UploadModeForm courses={courses} />
            }
        </div>
    );
}

export default TeacherUploadVideo;
