import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

function LessonViewer() {
  const { courseSlug, lessonSlug } = useParams();
  const [lessonData, setLessonData] = useState(null);

  useEffect(() => {
    // According to snapshot: /api/courses/{courseSlug}/lessons/{lessonSlug}
    fetch(`http://localhost:7777/api/courses/${courseSlug}/lessons/${lessonSlug}`)
      .then(res => res.json())
      .then(data => setLessonData(data))
      .catch(err => console.error("Error fetching lesson:", err));
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
