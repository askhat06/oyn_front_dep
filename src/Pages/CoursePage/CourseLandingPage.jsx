import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { toast } from "react-toastify";
import { apiFetch } from "../../lib/api";
import styles from "./CourseLandingPage.module.css";
function CourseLandingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    apiFetch(`/api/courses/${slug}`)
      .then(data => setCourse(data))
      .catch(err => {
        if (err.status === 404) toast.error("Course not found");
      });
  }, [slug]);

  const handleEnrollment = () => {
    if (course.lessons?.length > 0) {
      navigate(`/courses/${slug}/lessons/${course.lessons[0].slug}`);
    }
  };

  if (!course) {
    return (
      <>
        <Header />
        <p style={{ padding: 40 }}>Loading...</p>
        <Footer />
      </>
    );
  }

  return (
<>
 <div className={styles.wrapper}>

  <Header />

  {/* HERO */}
  <div className={styles.hero}>
    <div className={styles.heroLeft}>
      <img
        src={course.imageUrl}
        alt={course.title}
        className={styles.heroImage}
      />

      <h1 className={styles.title}>{course.title}</h1>

      <div className={styles.meta}>
        <span>🕒 {course.durationHours} hours</span>
        <span>📊 {course.level}</span>
        <span>🌐 {course.locale}</span>
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "overview" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          className={`${styles.tab} ${activeTab === "curriculum" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("curriculum")}
        >
          Curriculum
        </button>
      </div>
    </div>

    {/* SIDEBAR */}
    <div className={styles.sidebar}>
      <img src={course.imageUrl} className={styles.sidebarImage} />

      <div className={styles.price}>Free Course</div>

      <button className={styles.enrollBtn} onClick={handleEnrollment}>
        Enroll Now
      </button>

      <div>
        <p>Lessons: {course.lessons?.length}</p>
        <p>Level: {course.level}</p>
        <p>Language: {course.locale}</p>
      </div>
    </div>
  </div>

  {/* CONTENT */}
  <div className={styles.content}>
    <div className={styles.main}>

      {activeTab === "overview" && (
        <>
          <h3 className={styles.sectionTitle}>Course Description</h3>
          <p className={styles.description}>{course.description}</p>

          <h3 className={styles.sectionTitle}>What you will learn</h3>
          <ul>
            {course.learningOutcomes?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {activeTab === "curriculum" && (
        <ul>
          {course.lessons?.map((lesson) => (
            <li key={lesson.id}>
              {lesson.title} ({lesson.durationMinutes} min)
            </li>
          ))}
        </ul>
      )}

    </div>
  </div>

  <Footer />
</div>
</>
  );
}

export default CourseLandingPage;