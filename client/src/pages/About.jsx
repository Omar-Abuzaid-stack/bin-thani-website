import React from 'react';
import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Bin Thani Real Estate</title>
        <meta name="description" content="Bin Thani Real Estate - Sharjah's most trusted luxury real estate agency" />
      </Helmet>
      
      <div className="about-page">
        <section className="page-hero">
          <div className="container">
            <h1 className="hero-title">About Bin Thani</h1>
            <p className="hero-subtitle">Excellence in Real Estate Since 2010</p>
          </div>
        </section>

        <section className="about-story">
          <div className="container">
            <div className="story-content">
              <div className="story-text">
                <h2>Our Story</h2>
                <p>
                  Bin Thani Real Estate has been a trusted name in the UAE's luxury property market 
                  for over a decade. Founded in Sharjah, we have expanded our expertise to serve 
                  clients across Dubai, Abu Dhabi, and the Northern Emirates.
                </p>
                <p>
                  Our commitment to excellence and personalized service has helped thousands of 
                  clients find their dream properties. Whether you're looking for a luxury villa, 
                  a premium apartment, or a sound investment opportunity, our team of experts 
                  is here to guide you every step of the way.
                </p>
              </div>
              <div className="story-stats">
                <div className="stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Properties Sold</span>
                </div>
                <div className="stat">
                  <span className="stat-number">15+</span>
                  <span className="stat-label">Years Experience</span>
                </div>
                <div className="stat">
                  <span className="stat-number">200+</span>
                  <span className="stat-label">Happy Clients</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-values">
          <div className="container">
            <h2 className="section-title">Why Choose Us</h2>
            <div className="values-grid">
              <div className="value-card">
                <h3>Expert Knowledge</h3>
                <p>In-depth understanding of the UAE property market across all emirates</p>
              </div>
              <div className="value-card">
                <h3>Personalized Service</h3>
                <p>Tailored solutions to meet your unique property needs and goals</p>
              </div>
              <div className="value-card">
                <h3>Trusted Partner</h3>
                <p>Transparent, ethical, and professional service at all times</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .about-page {
          padding-top: 100px;
          min-height: 100vh;
        }
        
        .page-hero {
          text-align: center;
          padding: 60px 20px;
          background: linear-gradient(180deg, #080808 0%, #0a0a0a 100%);
        }
        
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 4rem;
          font-weight: 300;
          color: #fff;
          margin-bottom: 20px;
          letter-spacing: 0.1em;
        }
        
        .hero-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.2rem;
          color: #A8A8A8;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        
        .about-story {
          padding: 100px 20px;
          background: #0a0a0a;
        }
        
        .story-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        
        .story-text h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          color: #B8960C;
          margin-bottom: 30px;
        }
        
        .story-text p {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.1rem;
          color: #A8A8A8;
          line-height: 1.9;
          margin-bottom: 20px;
        }
        
        .story-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        
        .stat {
          text-align: center;
          padding: 30px;
          background: #111111;
          border: 1px solid #222;
        }
        
        .stat-number {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          color: #B8960C;
          font-weight: 300;
        }
        
        .stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #A8A8A8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .about-values {
          padding: 100px 20px;
          background: #080808;
        }
        
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          color: #fff;
          text-align: center;
          margin-bottom: 60px;
        }
        
        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .value-card {
          background: #111111;
          border: 1px solid #222;
          padding: 40px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .value-card:hover {
          border-color: #B8960C;
        }
        
        .value-card h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: #fff;
          margin-bottom: 15px;
        }
        
        .value-card p {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          color: #A8A8A8;
          line-height: 1.7;
        }
        
        @media (max-width: 900px) {
          .story-content, .values-grid {
            grid-template-columns: 1fr;
          }
          .story-stats {
            grid-template-columns: repeat(3, 1fr);
          }
          .hero-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default About;
