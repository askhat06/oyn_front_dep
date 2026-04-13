import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import "./LessonViewer.css";

function LessonViewer() {
  const { courseSlug, lessonSlug } = useParams();
  const [lessonData, setLessonData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch lesson data
        const lesson = await apiFetch(`/api/courses/${courseSlug}/lessons/${lessonSlug}`);
        setLessonData(lesson);

        // Fetch course data for details and playlist
        const course = await apiFetch(`/api/courses/${courseSlug}`);
        setCourseData(course);
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
  }, [courseSlug, lessonSlug]);

  if (loading) {
    return (
      <div>
        <Header />
        <p style={{ padding: '40px', textAlign: 'center' }}>Loading lesson...</p>
        <Footer />
      </div>
    );
  }

  if (!lessonData || !courseData) {
    return (
      <div>
        <Header />
        <p style={{ padding: '40px', textAlign: 'center' }}>Lesson not found</p>
        <Footer />
      </div>
    );
  }

  // Mock similar courses - ideally this should come from API
  const similarCourses = [
    { id: 1, title: "The Three Musketeers", price: "$40.00", rating: 5 },
    { id: 2, title: "The Three Musketeers", price: "$40.00", rating: 5 },
    { id: 3, title: "The Three Musketeers", price: "$40.00", rating: 5 },
    { id: 4, title: "The Three Musketeers", price: "$40.00", rating: 5 },
  ];

  return (
    <>
      <Header />
      
      <div className="lesson-viewer-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> | <Link to="/courses">Courses</Link> | <span className="active">Course Details</span>
        </div>

        <div className="lesson-main-content">
          {/* Video Section */}
          <div className="video-section">
            {lessonData.videoUrl ? (
              <div className="video-container">
                <video controls>
                  <source src={lessonData.videoUrl} type={lessonData.videoContentType || "video/mp4"} />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="video-placeholder">
                <button className="play-button">▶</button>
              </div>
            )}
            
            <h1 className="lesson-title">{courseData.title} | Episode {lessonData.position}</h1>
          </div>

          {/* Playlist Sidebar */}
          <div className="playlist-sidebar">
            <h2 className="playlist-title">Course Playlists</h2>
            <div className="playlist-items">
              {courseData.lessons && courseData.lessons.map((lesson) => (
                <Link 
                  to={`/courses/${courseSlug}/lessons/${lesson.slug}`} 
                  key={lesson.id}
                  className="playlist-item-link"
                >
                  <div className={`playlist-item ${lesson.slug === lessonSlug ? 'active' : ''}`}>
                    <div className="playlist-thumbnail">
                      <img 
                        src={lesson.thumbnailUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100`} 
                        alt={lesson.title} 
                      />
                      {lesson.slug === lessonSlug && <div className="play-icon">▶</div>}
                    </div>
                    <div className="playlist-info">
                      <h4>{lesson.title}</h4>
                      <span className="duration">{lesson.durationMinutes} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Course Details Section */}
        <div className="details-container">
          <div className="details-left">
            <section className="detail-section">
              <h2>Course Details</h2>
              <p>{courseData.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis consectetur adipiscing elit."}</p>
            </section>

            <section className="detail-section">
              <h2>Certification</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis consectetur adipiscing elit.</p>
            </section>

            <section className="detail-section">
              <h2>Who this course is for</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis consectetur adipiscing elit.</p>
            </section>

            <section className="detail-section">
              <h2>What you'll learn in this course:</h2>
              <ul className="learning-list">
                <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
                <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
                <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
                <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
                <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
              </ul>
            </section>
          </div>

          <div className="details-right">
            <div className="price-card">
              <div className="info-row">
                <span className="label">Price</span>
                <span className="value price">$49.00</span>
              </div>
              <div className="info-row">
                <span className="label">Instructor</span>
                <span className="value">Wade Warren</span>
              </div>
              <div className="info-row">
                <span className="label">Ratings</span>
                <span className="value stars">⭐⭐⭐⭐⭐</span>
              </div>
              <div className="info-row">
                <span className="label">Duration</span>
                <span className="value">{courseData.durationHours} Hours</span>
              </div>
              <div className="info-row">
                <span className="label">Lessons</span>
                <span className="value">{courseData.lessonCount || courseData.lessons?.length || 0}</span>
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
                <span className="value">{courseData.locale || 'English'}</span>
              </div>
              <div className="info-row">
                <span className="label">Level</span>
                <span className="value">{courseData.level || 'Beginner'}</span>
              </div>
              <button className="purchase-button">Purchase Course</button>
            </div>
          </div>
        </div>

        {/* Similar Courses */}
        <section className="similar-courses">
          <h2>Similar Courses</h2>
          <div className="courses-grid-similar">
            {similarCourses.map(course => (
              <div key={course.id} className="similar-course-card">
                <img src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200`} alt={course.title} />
                <div className="course-info-similar">
                  <h4>{course.title}</h4>
                  <div className="stars">⭐⭐⭐⭐⭐</div>
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