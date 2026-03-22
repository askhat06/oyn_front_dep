import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

function LessonViewer() {
  const { courseSlug, lessonSlug } = useParams();
  const [lessonData, setLessonData] = useState(null);

  useEffect(() => {
    // Backend returns 403 or 401 if restricted, 404 if not found
    apiFetch(`/api/courses/${courseSlug}/lessons/${lessonSlug}`)
      .then(data => setLessonData(data))
      .catch(err => {
        if (err.status === 404) {
          toast.error("Lesson not found");
        } else if (err.status === 403 || err.status === 401) {
          toast.error("You must be enrolled to view this lesson.");
        } else {
          console.error("Error fetching lesson:", err);
        }
      });
  }, [courseSlug, lessonSlug]);

  if (!lessonData) return <div><Header/><p style={{padding:'40px'}}>Loading lesson...</p><Footer/></div>;

  return (
    <>
      <Header />
      <div className="lesson-viewer" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <Link to={`/courses/${courseSlug}`} style={{ display: 'inline-block', marginBottom: '20px' }}>&larr; Back to Course</Link>
        
        <h1>Lesson {lessonData.position}: {lessonData.title}</h1>
        
        {lessonData.videoUrl ? (
          <div className="video-container" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <video controls style={{ width: '100%', borderRadius: '8px' }}>
              <source src={lessonData.videoUrl} type={lessonData.videoContentType || "video/mp4"} />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div style={{ padding: '40px', background: '#eee', textAlign: 'center', margin: '20px 0', borderRadius: '8px' }}>
            No video available for this lesson right now.
          </div>
        )}
        
        <p><strong>Duration:</strong> {lessonData.durationMinutes} minutes</p>
      </div>
      <Footer />
    </>
  );
}

export default LessonViewer;
