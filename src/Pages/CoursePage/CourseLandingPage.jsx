import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { toast } from "react-toastify";

function CourseLandingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [email, setEmail] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:7777/api/courses/${slug}`)
      .then(res => res.json())
      .then(data => setCourse(data))
      .catch(err => console.error("Error fetching course:", err));
  }, [slug]);

  const handleEnrollment = async (e) => {
    e.preventDefault();
    setIsEnrolling(true);
    
    // Enrollment endpoint according to backend snapshot: /api/enrollments
    // "EnrollmentService finds or creates a PlatformUser by normalized email."
    
    try {
      const response = await fetch(`http://localhost:7777/api/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, courseId: course.id })
      });

      if (response.ok) {
        toast.success("Successfully enrolled!");
        // If there is a first lesson, navigate there
        if (course.lessons && course.lessons.length > 0) {
          navigate(`/courses/${slug}/lessons/${course.lessons[0].slug}`);
        }
      } else {
        const err = await response.json();
        toast.error(`Enrollment failed: ${err.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error("Network error during enrollment");
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
