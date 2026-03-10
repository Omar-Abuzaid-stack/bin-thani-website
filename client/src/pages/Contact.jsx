import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';
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
        {/* Hero Section */}
        <section className="page-hero">
            <div className="page-hero-bg" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80)'}}></div>
            <div className="page-hero-overlay"></div>
            <div className="container">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="page-title">Contact Us</h1>
                    <p className="page-subtitle">We're Here to Help</p>
                </motion.div>
            </div>
        </section>

        {/* Contact Content */}
        <section className="contact-content">
            <div className="container">
                <div className="contact-grid">
                    {/* Contact Info */}
                    <motion.div 
                        className="contact-info"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="info-block">
                            <div className="info-icon">
                                <MapPin />
                            </div>
                            <h3>Visit Us</h3>
                            <p>
                                Al Khan Street<br />
                                Sharjah, United Arab Emirates
                            </p>
                        </div>
                        <div className="info-block">
                            <div className="info-icon">
                                <Phone />
                            </div>
                            <h3>Call Us</h3>
                            <p>+971 6 123 4567</p>
                            <p>+971 50 123 4567</p>
                        </div>
                        <div className="info-block">
                            <div className="info-icon">
                                <Mail />
                            </div>
                            <h3>Email Us</h3>
                            <p>info@binthani.ae</p>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div 
                        className="contact-form-wrapper"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
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
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Map Section */}
        <section className="map-section">
            <div className="container">
                <div className="map-placeholder">
                    <MapPin size={40} />
                    <p>Al Khan Street, Sharjah, UAE</p>
                </div>
            </div>
        </section>
      </div>

      <style>{`
        .contact-page {
            padding-top: 45px;
        }
        
        /* Page Hero */
        .page-hero {
            position: relative;
            height: 50vh;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        
        .page-hero-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
        }
        
        .page-hero-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.9) 100%);
        }
        
        .page-hero .container {
            position: relative;
            z-index: 10;
        }
        
        .page-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 4.5rem;
            font-weight: 300;
            color: #fff;
            margin-bottom: 20px;
            letter-spacing: 0.05em;
        }
        
        .page-subtitle {
            font-family: 'DM Sans', sans-serif;
            font-size: 1rem;
            color: #A8A8A8;
            letter-spacing: 0.3em;
            text-transform: uppercase;
        }
        
        /* Contact Content */
        .contact-content {
            padding: 100px 0;
            background: #080808;
        }
        
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 80px;
            align-items: start;
        }
        
        /* Contact Info */
        .info-block {
            margin-bottom: 45px;
        }
        
        .info-icon {
            width: 50px;
            height: 50px;
            border: 1px solid rgba(184, 150, 12, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            color: #B8960C;
        }
        
        .info-block h3 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.4rem;
            color: #fff;
            margin-bottom: 12px;
        }
        
        .info-block p {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.95rem;
            color: #A8A8A8;
            line-height: 1.8;
        }
        
        /* Contact Form - Glass Morphism */
        .contact-form-wrapper {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 50px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        .form-group label {
            display: block;
            font-family: 'DM Sans', sans-serif;
            font-size: 12px;
            color: #A8A8A8;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 16px 20px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            font-family: 'DM Sans', sans-serif;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #B8960C;
            background: rgba(255, 255, 255, 0.08);
        }
        
        .form-group input::placeholder,
        .form-group textarea::placeholder {
            color: #666;
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 120px;
        }
        
        .submit-btn {
            width: 100%;
            padding: 18px;
            background: #B8960C;
            border: none;
            border-radius: 8px;
            color: #080808;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .submit-btn:hover {
            background: #D4A90F;
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
        
        /* Map */
        .map-section {
            padding: 60px 0;
            background: #0a0a0a;
        }
        
        .map-placeholder {
            height: 300px;
            background: #111111;
            border: 1px solid rgba(184, 150, 12, 0.2);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            color: #A8A8A8;
        }
        
        .map-placeholder p {
            font-family: 'DM Sans', sans-serif;
            font-size: 1.1rem;
        }
        
        @media (max-width: 900px) {
            .contact-grid {
                grid-template-columns: 1fr;
            }
            .page-title {
                font-size: 3rem;
            }
        }
      `}</style>
    </>
  );
};

export default Contact;
