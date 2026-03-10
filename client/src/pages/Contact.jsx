import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://binthani.netlify.app/.netlify/functions/leads', {
        ...formData,
        source: 'contact_page'
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Bin Thani Real Estate</title>
        <meta name="description" content="Contact Bin Thani Real Estate for premium property services" />
      </Helmet>
      
      <div className="contact-page">
        <section className="page-hero">
          <div className="container">
            <h1 className="hero-title">Contact Us</h1>
            <p className="hero-subtitle">We're Here to Help</p>
          </div>
        </section>

        <section className="contact-content">
          <div className="container">
            <div className="contact-grid">
              <div className="contact-info">
                <div className="info-block">
                  <h3>Visit Us</h3>
                  <p>
                    Al Khan Street<br />
                    Sharjah, United Arab Emirates
                  </p>
                </div>
                <div className="info-block">
                  <h3>Call Us</h3>
                  <p>+971 6 123 4567</p>
                  <p>+971 50 123 4567</p>
                </div>
                <div className="info-block">
                  <h3>Email Us</h3>
                  <p>info@binthani.ae</p>
                </div>
                <div className="info-block">
                  <h3>Office Hours</h3>
                  <p>Saturday - Thursday: 9:00 AM - 7:00 PM</p>
                  <p>Friday: Closed</p>
                </div>
              </div>

              <div className="contact-form-wrapper">
                {submitted ? (
                  <div className="success-message">
                    <h3>Thank You!</h3>
                    <p>We've received your message and will get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                      <label>Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="How can we help you?"
                        rows="5"
                      />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="map-section">
          <div className="map-placeholder">
            <p>📍 Al Khan Street, Sharjah, UAE</p>
          </div>
        </section>
      </div>

      <style>{`
        .contact-page {
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
        
        .contact-content {
          padding: 100px 20px;
          background: #080808;
        }
        
        .contact-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
        }
        
        .info-block {
          margin-bottom: 40px;
        }
        
        .info-block h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: #B8960C;
          margin-bottom: 15px;
        }
        
        .info-block p {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          color: #A8A8A8;
          line-height: 1.8;
        }
        
        .contact-form-wrapper {
          background: #111111;
          border: 1px solid #222;
          padding: 50px;
        }
        
        .form-group {
          margin-bottom: 25px;
        }
        
        .form-group label {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #A8A8A8;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 15px 20px;
          background: #0a0a0a;
          border: 1px solid #222;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #B8960C;
        }
        
        .form-group textarea {
          resize: vertical;
        }
        
        .submit-btn {
          width: 100%;
          padding: 18px;
          background: #B8960C;
          border: none;
          color: #080808;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .submit-btn:hover {
          background: #d4a90f;
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .success-message {
          text-align: center;
          padding: 40px;
        }
        
        .success-message h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          color: #B8960C;
          margin-bottom: 15px;
        }
        
        .success-message p {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          color: #A8A8A8;
        }
        
        .map-section {
          padding: 50px 20px;
          background: #0a0a0a;
        }
        
        .map-placeholder {
          max-width: 1200px;
          margin: 0 auto;
          height: 300px;
          background: #111111;
          border: 1px solid #222;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .map-placeholder p {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.2rem;
          color: #A8A8A8;
        }
        
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default Contact;
