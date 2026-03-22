import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CourseContext } from "../../App";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

function CourseCatalog() {
  const { courses } = useContext(CourseContext);

  return (
    <>
      <Header />
      <div className="course-catalog-container" style={{ padding: '40px' }}>
        <h1>Course Catalog</h1>
        {courses.length === 0 ? (
          <p>Loading courses or no courses available...</p>
        ) : (
          <div className="courses-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {courses.map(course => (
              <div key={course.id} className="course-card" style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '300px' }}>
                <h3>{course.title}</h3>
                <p>Level: {course.level}</p>
                <p>Duration: {course.durationHours} hours</p>
                <Link to={`/courses/${course.slug}`}>
                  <button style={{ padding: '10px', marginTop: '10px', cursor: 'pointer' }}>View Course</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default CourseCatalog;
