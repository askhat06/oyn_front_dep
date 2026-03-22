import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { toast } from "react-toastify";
import { apiFetch } from "../../lib/api";

function CourseLandingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [email, setEmail] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    apiFetch(`/api/courses/${slug}`)
      .then(data => setCourse(data))
      .catch(err => {
        if (err.status === 404) {
          toast.error("Course not found");
        } else {
          console.error("Error fetching course:", err);
        }
      });
  }, [slug]);

  const handleEnrollment = async (e) => {
    e.preventDefault();
    setIsEnrolling(true);
    
    try {
      await apiFetch(`/api/enrollments`, {
        method: "POST",
        body: JSON.stringify({ email: email, courseId: course.id })
      });

      toast.success("Successfully enrolled!");
      // If there is a first lesson, navigate there
      if (course.lessons && course.lessons.length > 0) {
        navigate(`/courses/${slug}/lessons/${course.lessons[0].slug}`);
      }
    } catch (error) {
      if (error.status === 409) {
        toast.info("You are already enrolled in this course!");
        if (course.lessons && course.lessons.length > 0) {
          navigate(`/courses/${slug}/lessons/${course.lessons[0].slug}`);
        }
      } else if (error.status === 429) {
        toast.error("Too many requests. Please slow down.");
      } else {
        toast.error(`Enrollment failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  if (!course) return <div><Header/><p style={{padding:'40px'}}>Loading...</p><Footer/></div>;

  return (
    <>
      <Header />
      <div className="course-landing" style={{ padding: '40px' }}>
        <h1>{course.title}</h1>
        <p><strong>Level:</strong> {course.level}</p>
        <p><strong>Duration:</strong> {course.durationHours} hours</p>
        <p><strong>Locale:</strong> {course.locale}</p>
        
        <div className="enrollment-section" style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>Ready to start? Enroll now!</h2>
          <form onSubmit={handleEnrollment} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ padding: '10px', width: '300px' }}
            />
            <button type="submit" disabled={isEnrolling} style={{ padding: '10px 20px', cursor: 'pointer' }}>
              {isEnrolling ? "Enrolling..." : "Enroll"}
            </button>
          </form>
        </div>

        <div className="course-content" style={{ marginTop: '40px' }}>
          <h2>Course Syllabus</h2>
          {course.lessons && course.lessons.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {course.lessons.map(lesson => (
                <li key={lesson.id} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                  <strong>Lesson {lesson.position}:</strong> <Link to={`/courses/${slug}/lessons/${lesson.slug}`}>{lesson.title}</Link> ({lesson.durationMinutes} min)
                </li>
              ))}
            </ul>
          ) : (
            <p>No lessons available for this course yet.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CourseLandingPage;
