import React from "react";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import "./AboutPlatform.css";

function AboutPlatform() {
  return (
    <>
      <Header />

      <div className="about-page">

        {/* TOP SECTION */}
        <section className="about-top">
          <div className="about-images">
            <img
              src="https://pngimg.com/d/student_PNG124.png"
              alt=""
              className="img-main"
            />
          </div>

          <div className="about-text">
            <span className="tag">ABOUT US</span>
            <h1>
              Benefit From Our Online Learning Expertise Earn{" "}
              <span>Professional</span>
            </h1>

            <p>
              We provide high quality education with modern technologies and
              real-world skills for students all around the world.
            </p>

            <div className="mission-vision">
              <div>
                <h4>OUR MISSION:</h4>
                <p>
                  Provide accessible education and help students grow their
                  careers.
                </p>
              </div>
              <div>
                <h4>OUR VISION:</h4>
                <p>
                  Become a leading platform for online learning globally.
                </p>
              </div>
            </div>

            <button className="cta-btn" onClick={() => { window.location.href = "/courses"; }}>
              View Courses →
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="about-stats">
          <div className="stat"><h3>3K+</h3><p>Successfully Trained</p></div>
          <div className="stat"><h3>15K+</h3><p>Classes Completed</p></div>
          <div className="stat"><h3>97K+</h3><p>Satisfaction Rate</p></div>
          <div className="stat"><h3>102K+</h3><p>Students Community</p></div>
        </section>

        {/* TESTIMONIALS */}
        <section className="about-testimonials">
          <span className="tag">TESTIMONIAL</span>
          <h2>Creating A Community Of Life Long Learners.</h2>

          <div className="testimonial-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="testimonial-card">
                <p>
                  “Lorem ipsum dolor sit amet, elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua.”
                </p>
                <h4>Kathy Sullivan</h4>
                <span>CEO at OYAN</span>
              </div>
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}

export default AboutPlatform;