import React from "react";
import { Link } from "react-router-dom";
import Feature from "./Feature";
import "./HomePage.css";

const features = [
  {
    id: 1,
    photo: "practical.png",
    title: "Practical Courses",
    text: "Learn real-world skills in IT, business, design, and communication.",
  },
  {
    id: 2,
    photo: "live.png",
    title: "Live Classes",
    text: "Join interactive lessons and communicate with mentors in real time.",
  },
  {
    id: 3,
    photo: "recorded.png",
    title: "Recorded Lessons",
    text: "Watch course materials anytime and learn at your own pace.",
  },
  {
    id: 4,
    photo: "career.png",
    title: "Career Growth",
    text: "Build skills that help students and young specialists grow professionally.",
  },
];

const learningFormats = [
  {
    id: 1,
    title: "Video Courses",
    text: "Study from structured lessons with practical explanations.",
  },
  {
    id: 2,
    title: "Live Sessions",
    text: "Attend online classes and ask questions directly to instructors.",
  },
  {
    id: 3,
    title: "Mentor Support",
    text: "Receive guidance from experienced teachers and professionals.",
  },
  {
    id: 4,
    title: "Assignments",
    text: "Practice with quizzes, tasks, and mini projects.",
  },
];

const categories = [
  "IT & Programming",
  "Digital Marketing",
  "Business & Management",
  "UI/UX & Design",
  "English & Communication",
  "Career Skills",
];

function Index() {
  return (
    <main className="homepage">
      <section className="hero hero-modern" id="home">
        <div className="container hero-content hero-modern-content">
          <div className="hero-left">
            <span className="badge badge-soft">Never Stop Learning</span>

            <h1 className="hero-title">
              Grow your skills
              <br />
              by online courses
              <br />
              in Kazakhstan
            </h1>

            <p className="hero-description">
              Our platform helps students and young professionals learn practical
              skills through modern online education. Explore courses, connect with
              mentors, and build your future from anywhere in Kazakhstan.
            </p>

            <div className="hero-search hero-search-modern">
              <input type="text" placeholder="Class/Course" />
              <button className="btn btn-primary">Search</button>
            </div>
          </div>

          <div className="hero-right">
  <div className="hero-visual-card">
    <img
      src="/img/IndexPage/student.png"
      alt="Student learning online"
      className="hero-student-image"
    />
  </div>
</div>
        </div>
      </section>


      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <h2>High-quality online education for modern skills</h2>
            <p>
              Our platform provides accessible and effective learning for people
              across Kazakhstan through practical courses and flexible study formats.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <Feature
                key={feature.id}
                photo={feature.photo}
                title={feature.title}
                text={feature.text}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section light-section">
        <div className="container split-section">
          <div className="split-image">
            <img
              src="/img/IndexPage/class-preview.png"
              alt="Online class preview"
              className="split-main-image"
            />
          </div>

          <div className="split-text">
            <span className="badge">Why choose us</span>
            <h2>Learn in the format that suits you best</h2>
            <p>
              Choose from video lessons, live sessions, recorded classes, and
              assignments. This makes learning flexible and comfortable for every
              student.
            </p>

            <div className="format-list">
              {learningFormats.map((item) => (
                <div className="format-item" key={item.id}>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="courses">
        <div className="container">
          <div className="section-header">
            <h2>Popular learning areas</h2>
            <p>
              Explore the most popular directions for students and young
              professionals in Kazakhstan.
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((category, index) => (
              <div className="category-card" key={index}>
                <div className="category-number">{index + 1}</div>
                <h3>{category}</h3>
                <p>
                  Practical lessons, professional guidance, and flexible learning
                  for your future growth.
                </p>
                <Link to="/courses" className="btn btn-small btn-outline">
                  View Courses
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section mentor-section" id="mentors">
        <div className="container mentor-wrapper">
          <div className="mentor-image">
            <img
              src="/img/IndexPage/mentor.png"
              alt="Mentor"
              className="mentor-main-image"
            />
          </div>

          <div className="mentor-text">
            <span className="badge">Qualified Mentors</span>
            <h2>Learn from professionals and experienced instructors</h2>
            <p>
              Our mentors help students understand difficult topics, stay motivated,
              and apply their knowledge in practice. The platform is designed to
              support learners across Kazakhstan.
            </p>

            <Link to="/mentors" className="btn btn-primary">
              Become a Mentor
            </Link>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="container newsletter-box">
          <h2>Subscribe for updates and new courses</h2>
          <p>
            Get information about new programs, course launches, and learning
            opportunities.
          </p>

          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button className="btn btn-primary">Subscribe</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Index;