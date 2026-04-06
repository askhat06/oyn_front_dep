import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { apiFetch } from "../../lib/api";
import "./CourseCatalog.css";

function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Latest');

  const tabs = ['All Courses', 'Algorithms', 'Calculus', 'College', 'Computer', 'Science', 'Engineering', 'More Courses'];

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/courses');
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Implement search logic if needed
    console.log('Searching for:', searchQuery);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch(sortBy) {
      case 'Latest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'Popular':
        return (b.lessonCount || 0) - (a.lessonCount || 0);
      case 'Price: Low to High':
        return 0; // Price not in model yet
      case 'Price: High to Low':
        return 0;
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
          <h1 className="hero-title">OYAN Courses<br/>For All Standards</h1>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500" alt="Student studying" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
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
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
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
              {sortedCourses.map(course => (
                <Link to={`/courses/${course.slug}`} key={course.id} className="course-card-link">
                  <div className="course-card">
                    <div className="course-image">
                      <img 
                        src={course.thumbnailUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200`} 
                        alt={course.title} 
                      />
                    </div>
                    <div className="course-info">
                      <h3 className="course-title">{course.title}</h3>
                      <div className="course-rating">
                        <span className="stars">⭐⭐⭐⭐⭐</span>
                      </div>
                      <div className="course-footer">
                        <span className="course-price">$40.00</span>
                        <button className="cart-button" onClick={(e) => {
                          e.preventDefault();
                          console.log('Add to cart:', course.slug);
                        }}>🛒</button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button className="page-nav">‹</button>
              <span className="page-info">Page <strong>1</strong> of {Math.ceil(sortedCourses.length / 10)}</span>
              <button className="page-nav">›</button>
            </div>
          </>
        )}
      </div>

      {/* Subscription Section */}
      <div className="subscription-section">
        <div className="subscription-avatars left">
          <img src="https://i.pravatar.cc/60?img=1" alt="Student" className="avatar" />
          <img src="https://i.pravatar.cc/60?img=2" alt="Student" className="avatar" />
          <img src="https://i.pravatar.cc/60?img=3" alt="Student" className="avatar" />
        </div>
        
        <div className="subscription-content">
          <h2>Subscribe For Get Update<br/>Every New Courses</h2>
          <p>20k+ students daily learn with Eduvi. Subscribe for new courses.</p>
          <div className="subscription-form">
            <input type="email" placeholder="enter your email" />
            <button>Subscribe</button>
          </div>
        </div>

        <div className="subscription-avatars right">
          <img src="https://i.pravatar.cc/60?img=4" alt="Student" className="avatar" />
          <img src="https://i.pravatar.cc/60?img=5" alt="Student" className="avatar" />
          <img src="https://i.pravatar.cc/60?img=6" alt="Student" className="avatar" />
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CourseCatalog;