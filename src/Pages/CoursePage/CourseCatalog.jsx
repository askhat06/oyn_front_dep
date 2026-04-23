import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { apiFetch } from "../../lib/api";
import "./CourseCatalog.css";

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

function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Latest");
  const levels = Array.from(
    new Set(courses.map((course) => course.level || "Beginner")),
  );
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/courses");
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Implement search logic if needed
    console.log("Searching for:", searchQuery);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      activeTab === "All" || (course.level || "Beginner") === activeTab;

    return matchesSearch && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "Latest":
        return new Date(b.createdAt) - new Date(a.createdAt);

      case "Popular":
        return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);

      case "Price: Low to High":
        return (a.price ?? Infinity) - (b.price ?? Infinity);

      case "Price: High to Low":
        return (b.price ?? -Infinity) - (a.price ?? -Infinity);

      default:
        return 0;
    }
  });

  return (
    <>
      <Header />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="breadcrumb">
            <Link to="/">Home</Link> | <span className="active">Courses</span>
          </div>
          <h1 className="hero-title">
            OYAN Courses
            <br />
            For All Standards
          </h1>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500"
            alt="Student studying"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === "All" ? "active" : ""}`}
          onClick={() => setActiveTab("All")}
        >
          All Courses
        </button>
        {levels.map((level) => (
          <button
            key={level}
            className={`tab ${activeTab === level ? "active" : ""}`}
            onClick={() => setActiveTab(level)}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="course-catalog-container">
        <h2 className="section-title">Other Courses For High School</h2>

        {/* Search and Sort */}
        <div className="controls-container">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search Class, Course"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-button" onClick={handleSearch}>
              🔍 Search
            </button>
          </div>
          <div className="sort-wrapper">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option>Latest</option>
              <option>Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <p className="no-courses">Loading courses...</p>
        ) : sortedCourses.length === 0 ? (
          <p className="no-courses">No courses available</p>
        ) : (
          <>
            <div className="courses-grid">
              {sortedCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="course-card-image-wrap"
                  >
                    <img
                      src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400`}
                      alt={course.title}
                      className="course-card-img"
                    />
                    {course.level && (
                      <span className="course-card-badge">{course.level}</span>
                    )}
                  </Link>
                  <div className="course-card-body">
                    <div className="course-card-meta-top">
                      <div className="course-card-rating">
                        <CourseStars rating={course.averageRating} />
                        <span className="course-card-rating-count">
                          {course.ratingCount > 0
                            ? `${course.ratingCount} review${course.ratingCount !== 1 ? "s" : ""}`
                            : "No reviews"}
                        </span>
                      </div>
                      {course.price != null && (
                        <span className="course-card-price">
                          ${Number(course.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/courses/${course.slug}`}
                      className="course-card-title-link"
                    >
                      <h3 className="course-card-title">{course.title}</h3>
                    </Link>
                    <div className="course-card-stats">
                      <span className="course-card-stat">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                        Lesson {course.lessonCount || 0}
                      </span>
                      <span className="course-card-stat">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {course.durationHours || 0}h
                      </span>
                      <span className="course-card-stat">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Students{" "}
                        {course.enrollmentCount > 0
                          ? `${course.enrollmentCount}+`
                          : "0"}
                      </span>
                    </div>
                    <div className="course-card-footer">
                      <div className="course-card-instructor">
                        <div className="instructor-avatar-wrap">
                          <img
                            src="https://i.pravatar.cc/40"
                            alt={course.instructorName || "Instructor"}
                            className="course-card-avatar"
                          />
                        </div>

                        <span className="course-card-instructor-name">
                          {course.instructorName || "Instructor"}
                        </span>
                      </div>
                      <Link
                        to={`/courses/${course.slug}`}
                        className="course-card-enroll-btn"
                      >
                        Enroll →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button className="page-nav">‹</button>
              <span className="page-info">
                Page <strong>1</strong> of{" "}
                {Math.ceil(sortedCourses.length / 10)}
              </span>
              <button className="page-nav">›</button>
            </div>
          </>
        )}
      </div>

      {/* Subscription Section */}
      <div className="subscription-section">
        <div className="subscription-avatars left">
          <img
            src="https://i.pravatar.cc/60?img=1"
            alt="Student"
            className="avatar"
          />
          <img
            src="https://i.pravatar.cc/60?img=2"
            alt="Student"
            className="avatar"
          />
          <img
            src="https://i.pravatar.cc/60?img=3"
            alt="Student"
            className="avatar"
          />
        </div>

        <div className="subscription-content">
          <h2>
            Subscribe For Get Update
            <br />
            Every New Courses
          </h2>
          <p>
            20k+ students daily learn with Eduvi. Subscribe for new courses.
          </p>
          <div className="subscription-form">
            <input type="email" placeholder="enter your email" />
            <button>Subscribe</button>
          </div>
        </div>

        <div className="subscription-avatars right">
          <img
            src="https://i.pravatar.cc/60?img=4"
            alt="Student"
            className="avatar"
          />
          <img
            src="https://i.pravatar.cc/60?img=5"
            alt="Student"
            className="avatar"
          />
          <img
            src="https://i.pravatar.cc/60?img=6"
            alt="Student"
            className="avatar"
          />
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CourseCatalog;
