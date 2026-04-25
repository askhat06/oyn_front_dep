import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import "./LessonViewer.css";

function CourseStars({ rating }) {
  const filled = rating ? Math.round(rating) : 0;
  return (
    <span
      className="course-card-stars"
      title={rating ? `${rating.toFixed(1)} stars` : "Not rated"}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= filled ? "#f59e0b" : "#d1d5db" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function parseAssessment(content) {
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "assessment" && Array.isArray(parsed.questions))
      return parsed;
  } catch (e) {}
  return null;
}

function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function VideoPlayer({ videoUrl }) {
  const embedUrl = getEmbedUrl(videoUrl);
  if (embedUrl) {
    return (
      <div className="video-container">
        <iframe
          src={embedUrl}
          title="Lesson video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: 0,
          }}
        />
      </div>
    );
  }
  return (
    <div className="video-container">
      <video
        controls
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

function AssessmentUI({ assessment, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const handleSubmit = () => {
    if (Object.keys(answers).length < assessment.questions.length) {
      toast.warn("Please answer all questions before submitting.");
      return;
    }
    let correct = 0;
    assessment.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const percent = Math.round((correct / assessment.questions.length) * 100);
    setScore({ correct, total: assessment.questions.length, percent });
    setSubmitted(true);
    onComplete();
  };

  if (submitted) {
    return (
      <div className="assessment-result">
        <div
          className={`score-circle ${score.percent >= 70 ? "pass" : "fail"}`}
        >
          {score.percent}%
        </div>
        <h2>Assessment Complete!</h2>
        <p>
          {score.correct} out of {score.total} correct
        </p>
        <p className="result-label">
          {score.percent >= 70 ? "Passed! 🎉" : "Keep studying and try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="assessment-container">
      {assessment.description && (
        <p className="assessment-description">{assessment.description}</p>
      )}
      {assessment.questions.map((q, i) => (
        <div key={i} className="question-block">
          <p className="question-text">
            {i + 1}. {q.text}
          </p>
          <div className="options-list">
            {q.options.map((opt, j) => (
              <label
                key={j}
                className={`option-label ${answers[i] === j ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name={`question-${i}`}
                  value={j}
                  checked={answers[i] === j}
                  onChange={() => setAnswers((prev) => ({ ...prev, [i]: j }))}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button className="submit-assessment-btn" onClick={handleSubmit}>
        Submit Assessment
      </button>
    </div>
  );
}

function LessonViewer() {
  const hasContent = (value) =>
    value && (Array.isArray(value) ? value.length > 0 : true);
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const [lessonData, setLessonData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresh presigned video URL every 25 min before the 30-min S3 expiry
  useEffect(() => {
    if (!lessonData) return;
    const interval = setInterval(() => {
      apiFetch(`/api/courses/${courseSlug}/lessons/${lessonSlug}`)
        .then((data) => setLessonData(data))
        .catch(() => {});
    }, 25 * 60 * 1000);
    return () => clearInterval(interval);
  }, [courseSlug, lessonSlug, lessonData]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [lesson, course] = await Promise.all([
          apiFetch(`/api/courses/${courseSlug}/lessons/${lessonSlug}`),
          apiFetch(`/api/courses/${courseSlug}`),
        ]);
        setLessonData(lesson);
        setCourseData(course);

        if (user) {
          try {
            let progress = await apiFetch(
              `/api/progress/courses/${courseSlug}`,
            );
            if (progress.status === "NOT_STARTED") {
              progress = await apiFetch(
                `/api/progress/courses/${courseSlug}/start`,
                { method: "POST" },
              );
            }
            await apiFetch(`/api/progress/courses/${courseSlug}/current-step`, {
              method: "PUT",
              body: JSON.stringify({ lessonSlug }),
            });
            progress = await apiFetch(`/api/progress/courses/${courseSlug}`);
            setProgressData(progress);
          } catch (err) {
            // Progress tracking unavailable (not enrolled, etc.) — silent
          }
        }
      } catch (err) {
        if (err.status === 404) {
          toast.error("Lesson not found");
        } else if (err.status === 403 || err.status === 401) {
          toast.error("You must be enrolled to view this lesson.");
        } else {
          console.error("Error fetching data:", err);
          toast.error("Failed to load lesson");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [courseSlug, lessonSlug, user]);

  const isStepCompleted = (slug) => {
    if (!progressData?.steps) return false;
    return (
      progressData.steps.find((s) => s.lessonSlug === slug)?.status ===
      "COMPLETED"
    );
  };

  const markComplete = async () => {
    try {
      const updated = await apiFetch(
        `/api/progress/courses/${courseSlug}/steps/${lessonSlug}/complete`,
        { method: "POST" },
      );
      setProgressData(updated);
      toast.success("Lesson completed!");
      const idx =
        courseData.lessons?.findIndex((l) => l.slug === lessonSlug) ?? -1;
      if (idx >= 0 && idx < courseData.lessons.length - 1) {
        navigate(
          `/courses/${courseSlug}/lessons/${courseData.lessons[idx + 1].slug}`,
        );
      } else if (updated.status === "COMPLETED") {
        toast.success("You completed the course! 🎉");
      }
    } catch (err) {
      toast.error("Failed to mark lesson as complete");
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <p style={{ padding: "40px", textAlign: "center" }}>
          Loading lesson...
        </p>
        <Footer />
      </div>
    );
  }

  if (!lessonData || !courseData) {
    return (
      <div>
        <Header />
        <p style={{ padding: "40px", textAlign: "center" }}>Lesson not found</p>
        <Footer />
      </div>
    );
  }

  const assessment = parseAssessment(lessonData.content);
  const currentStepCompleted = isStepCompleted(lessonSlug);

  const similarCourses = [
    { id: 1, title: "The Three Musketeers", price: "$40.00" },
    { id: 2, title: "The Three Musketeers", price: "$40.00" },
    { id: 3, title: "The Three Musketeers", price: "$40.00" },
    { id: 4, title: "The Three Musketeers", price: "$40.00" },
  ];

  return (
    <>
      <Header />

      <div className="lesson-viewer-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> | <Link to="/courses">Courses</Link> |{" "}
          <span className="active">Course Details</span>
        </div>

        {/* Progress Bar */}
        {progressData && (
          <div className="progress-bar-container">
            <div className="progress-bar-header">
              <span>Course Progress</span>
              <span>
                {progressData.completedSteps} / {progressData.totalSteps}{" "}
                lessons &middot; {progressData.percentComplete}%
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressData.percentComplete}%` }}
              />
            </div>
          </div>
        )}

        <div className="lesson-main-content">
          {/* Video / Assessment Section */}
          <div className="video-section">
            {assessment ? (
              <AssessmentUI assessment={assessment} onComplete={markComplete} />
            ) : (
              <>
                {lessonData.videoUrl ? (
                  <VideoPlayer videoUrl={lessonData.videoUrl} />
                ) : (
                  <div className="video-placeholder">
                    <button className="play-button">▶</button>
                  </div>
                )}
              </>
            )}

            <div className="lesson-footer">
              <h1 className="lesson-title">
                {courseData.title} | Episode {lessonData.position}
              </h1>
              {user &&
                !assessment &&
                (currentStepCompleted ? (
                  <span className="completed-badge">✓ Completed</span>
                ) : (
                  <button className="mark-complete-btn" onClick={markComplete}>
                    ✓ Mark as Complete
                  </button>
                ))}
            </div>
          </div>

          {/* Playlist Sidebar */}
          <div className="playlist-sidebar">
            <h2 className="playlist-title">Course Playlists</h2>
            <div className="playlist-items">
              {courseData.lessons &&
                courseData.lessons.map((lesson) => (
                  <Link
                    to={`/courses/${courseSlug}/lessons/${lesson.slug}`}
                    key={lesson.id}
                    className="playlist-item-link"
                  >
                    <div
                      className={`playlist-item ${lesson.slug === lessonSlug ? "active" : ""}`}
                    >
                      <div className="playlist-thumbnail">
                        <img
                          src={
                            lesson.thumbnailUrl ||
                            `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100`
                          }
                          alt={lesson.title}
                        />
                        {lesson.slug === lessonSlug && (
                          <div className="play-icon">▶</div>
                        )}
                        {isStepCompleted(lesson.slug) && (
                          <div className="completed-icon">✓</div>
                        )}
                      </div>
                      <div className="playlist-info">
                        <h4>{lesson.title}</h4>
                        <span className="duration">
                          {lesson.durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>

        <div className="details-container">
          <div className="details-left">
            <section className="detail-section">
              {hasContent(courseData.description) && (
                <section className="detail-section">
                  <h2>Course Details</h2>
                  <p>{courseData.description}</p>
                </section>
              )}{" "}
            </section>
          </div>
          {hasContent(courseData.certificationDescription) && (
            <section className="detail-section">
              <h2>Certification</h2>
              <p>{courseData.certificationDescription}</p>
            </section>
          )}
          {hasContent(courseData.targetAudience) && (
            <section className="detail-section">
              <h2>Who this course is for</h2>
              <p>{courseData.targetAudience}</p>
            </section>
          )}

          <div className="details-right">
            <div className="price-card">
              <div className="info-row">
                <span className="label">Price</span>
                <span className="value price">
                  {courseData.price != null
                    ? `$${Number(courseData.price).toFixed(2)}`
                    : "Free"}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Instructor</span>
                <span className="value">
                  {courseData.instructorName || "Wade Warren"}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Ratings</span>
                <CourseStars rating={courseData.averageRating} />
              </div>
              <div className="info-row">
                <span className="label">Duration</span>
                <span className="value">{courseData.durationHours} Hours</span>
              </div>
              <div className="info-row">
                <span className="label">Lessons</span>
                <span className="value">
                  {courseData.lessonCount || courseData.lessons?.length || 0}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Quizzes</span>
                <span className="value">5</span>
              </div>
              <div className="info-row">
                <span className="label">Certificate</span>
                <span className="value">Yes</span>
              </div>
              <div className="info-row">
                <span className="label">Language</span>
                <span className="value">{courseData.locale || "English"}</span>
              </div>
              <div className="info-row">
                <span className="label">Level</span>
                <span className="value">{courseData.level || "Beginner"}</span>
              </div>
              <button className="purchase-button">Purchase Course</button>
            </div>
          </div>
        </div>

        {/* Similar Courses */}
        <section className="similar-courses">
          <h2>Similar Courses</h2>
          <div className="courses-grid-similar">
            {similarCourses.map((course) => (
              <div key={course.id} className="similar-course-card">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200"
                  alt={course.title}
                />
                <div className="course-info-similar">
                  <h4>{course.title}</h4>
                  <CourseStars rating={course.averageRating} />
                  <div className="course-footer-similar">
                    <span className="price">{course.price}</span>
                    <button className="cart-btn">🛒</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default LessonViewer;
