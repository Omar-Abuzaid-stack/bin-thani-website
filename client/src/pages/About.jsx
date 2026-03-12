import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';

const About = () => {
    return (
        <>
            <Helmet>
                <title>About Us - Bin Thani Real Estate</title>
                <meta name="description" content="Bin Thani Real Estate - Sharjah's most trusted luxury real estate agency" />
            </Helmet>
            
            <div className="about-page">
                {/* Hero Section - Luxury Sharjah Skyline */}
                <section className="page-hero">
                    <div className="page-hero-bg" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80)'}}></div>
                    <div className="page-hero-overlay"></div>
                    <div className="container">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="page-title">About Bin Thani</h1>
                            <p className="page-subtitle">Excellence in Real Estate Since 2010</p>
                        </motion.div>
                    </div>
                </section>

                {/* Founder Section */}
                <section className="founder-section">
                    <div className="container">
                        <motion.div 
                            className="founder-card"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="founder-info">
                                <span className="founder-label silver-text">Founder & CEO</span>
                                <h2 className="founder-name gold-text">Eissa bin Rashid bin Thani</h2>
                                <div className="founder-bio">
                                    <p>
                                        Eissa bin Rashid bin Thani is the visionary Founder and CEO of Bin Thani Real Estate. 
                                        With over two decades of profound experience in the UAE real estate sector, 
                                        he has cultivated a reputation for excellence, integrity, and an unparalleled 
                                        understanding of the luxury market landscape.
                                    </p>
                                    <p>
                                        His leadership has transformed Bin Thani Real Estate into a prestigious brand 
                                        synonymous with trust and sophistication. Specializing in high-end residential 
                                        and commercial developments, Eissa's strategic vision focuses on delivering 
                                        exceptional value and bespoke experiences to a discerning global clientele.
                                    </p>
                                    <p>
                                        Under his guidance, the firm continues to pioneer innovative real estate 
                                        solutions across Sharjah and the Northern Emirates, consistently setting 
                                        new benchmarks for quality and service in the industry.
                                    </p>
                                </div>
                                <div className="founder-contact">
                                    <a href="tel:+971557626912">
                                        <Phone size={16} /> +971 55 762 6912
                                    </a>
                                    <a href="tel:+971556611400">
                                        <Phone size={16} /> +971 55 661 1400
                                    </a>
                                    <a href="mailto:info@binthanirealestate.ae">
                                        <Mail size={16} /> info@binthanirealestate.ae
                                    </a>
                                </div>
                            </div>
                            <div className="founder-image">
                                <div className="image-frame gold-border">
                                    <img 
                                        src="/BinThaniOwner.png" 
                                        alt="Eissa bin Rashid bin Thani - Founder & CEO" 
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="stats-section">
                    <div className="container">
                        <div className="stats-grid">
                            {[
                                { number: '500+', label: 'Properties Sold' },
                                { number: '15+', label: 'Years Experience' },
                                { number: '200+', label: 'Happy Clients' },
                                { number: '50+', label: 'Developers' }
                            ].map((stat, index) => (
                                <motion.div 
                                    key={index}
                                    className="stat-item"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="values-section">
                    <div className="container">
                        <motion.div 
                            className="section-header"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="section-label">Why Choose Us</span>
                            <h2 className="section-title">Our Values</h2>
                            <div className="section-line"></div>
                        </motion.div>
                        
                        <div className="values-grid">
                            {[
                                { title: 'Expert Knowledge', desc: 'In-depth understanding of the UAE property market across all emirates' },
                                { title: 'Personalized Service', desc: 'Tailored solutions to meet your unique property needs and goals' },
                                { title: 'Trusted Partner', desc: 'Transparent, ethical, and professional service at all times' }
                            ].map((value, index) => (
                                <motion.div 
                                    key={index}
                                    className="value-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <h3>{value.title}</h3>
                                    <p>{value.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="cta-luxury">
                    <div className="cta-bg"></div>
                    <div className="cta-overlay"></div>
                    <div className="container">
                        <motion.div 
                            className="cta-content"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2>Ready to Work With Us?</h2>
                            <p>Get in touch with our team of experts</p>
                            <div className="cta-buttons">
                                <Link to="/contact" className="btn btn-primary">Contact Us</Link>
                                <Link to="/properties" className="btn btn-outline">View Properties</Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>

            <style>{`
                .about-page {
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
                
                /* Section Styles */
                section {
                    padding: 100px 0;
                    background: #080808;
                }
                
                .section-header {
                    text-align: center;
                    margin-bottom: 60px;
                }
                
                .section-label {
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    color: #B8960C;
                    display: block;
                    margin-bottom: 15px;
                }
                
                .section-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 3rem;
                    font-weight: 300;
                    color: #fff;
                }
                
                .section-line {
                    width: 60px;
                    height: 1px;
                    background: #B8960C;
                    margin: 20px auto 0;
                }
                
                /* Founder Section */
                .founder-section {
                    background: #0a0a0a;
                }
                
                .founder-card {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 80px;
                    align-items: center;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .founder-image {
                    position: relative;
                }
                
                .founder-image::before {
                    content: '';
                    position: absolute;
                    top: -15px;
                    left: -15px;
                    width: 100%;
                    height: 100%;
                    border: 1px solid #B8960C;
                    z-index: 0;
                }
                
                .founder-image img {
                    position: relative;
                    width: 100%;
                    height: 550px;
                    object-fit: cover;
                    object-position: center top;
                    z-index: 1;
                    display: block;
                }
                
                @media (max-width: 900px) {
                    .founder-image img {
                        height: 450px;
                    }
                }
                
                @media (max-width: 600px) {
                    .founder-image img {
                        height: 400px;
                    }
                }
                
                .founder-label {
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #B8960C;
                    display: block;
                    margin-bottom: 10px;
                }
                
                .founder-name {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 3.5rem;
                    font-weight: 300;
                    margin-bottom: 30px;
                }

                .gold-text {
                    background: linear-gradient(135deg, #B8960C 0%, #F1D153 50%, #B8960C 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .silver-text {
                    background: linear-gradient(135deg, #A8A8A8 0%, #E8E8E8 50%, #A8A8A8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: 4px;
                }

                .gold-border {
                    border: 2px solid #B8960C;
                    position: relative;
                }

                .gold-border::after {
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    right: -10px;
                    bottom: -10px;
                    border: 1px solid rgba(184, 150, 12, 0.3);
                    z-index: -1;
                }
                
                .founder-bio p {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 1rem;
                    color: #A8A8A8;
                    line-height: 1.9;
                    margin-bottom: 20px;
                }
                
                .founder-contact {
                    display: flex;
                    gap: 30px;
                    margin-top: 30px;
                    padding-top: 25px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
                
                .founder-contact a {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #B8960C;
                    text-decoration: none;
                    font-size: 0.95rem;
                    transition: color 0.3s ease;
                }
                
                .founder-contact a:hover {
                    color: #fff;
                }
                
                /* Stats */
                .stats-section {
                    background: #111111;
                    padding: 70px 0;
                    border-top: 1px solid rgba(184, 150, 12, 0.15);
                    border-bottom: 1px solid rgba(184, 150, 12, 0.15);
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 40px;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                
                .stat-item {
                    text-align: center;
                }
                
                .stat-number {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 3.5rem;
                    font-weight: 300;
                    color: #B8960C;
                }
                
                .stat-label {
                    font-size: 12px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #A8A8A8;
                }
                
                /* Values */
                .values-section {
                    background: #080808;
                }
                
                .values-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 30px;
                }
                
                .value-card {
                    background: #111111;
                    border: 1px solid transparent;
                    padding: 45px 35px;
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
                    font-size: 0.95rem;
                    color: #A8A8A8;
                    line-height: 1.7;
                }
                
                /* CTA */
                .cta-luxury {
                    position: relative;
                    padding: 120px 0;
                    background: #0a0a0a;
                    overflow: hidden;
                }
                
                .cta-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
                }
                
                .cta-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(ellipse at center, transparent 0%, rgba(8,8,8,0.8) 100%);
                }
                
                .cta-content {
                    position: relative;
                    z-index: 10;
                    text-align: center;
                }
                
                .cta-content h2 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 3rem;
                    font-weight: 300;
                    color: #fff;
                    margin-bottom: 15px;
                }
                
                .cta-content p {
                    font-size: 1rem;
                    color: #A8A8A8;
                    margin-bottom: 35px;
                }
                
                .cta-buttons {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                }
                
                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px 35px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    border: none;
                    cursor: pointer;
                    transition: all 0.4s ease;
                    text-decoration: none;
                }
                
                .btn-primary {
                    background: #B8960C;
                    color: #080808;
                }
                
                .btn-primary:hover {
                    background: #D4A90F;
                }
                
                .btn-outline {
                    background: transparent;
                    border: 1px solid #B8960C;
                    color: #B8960C;
                }
                
                .btn-outline:hover {
                    background: #B8960C;
                    color: #080808;
                }
                
                @media (max-width: 900px) {
                    section {
                        padding: 60px 0;
                    }
                    .page-hero {
                        height: 40vh;
                        min-height: 300px;
                    }
                    .page-title {
                        font-size: 2.8rem;
                    }
                    .founder-card {
                        grid-template-columns: 1fr;
                        gap: 35px;
                        padding: 0 15px;
                    }
                    .founder-name {
                        font-size: 2.4rem;
                        margin-bottom: 20px;
                    }
                    .founder-bio p {
                        font-size: 0.95rem;
                        margin-bottom: 15px;
                        line-height: 1.7;
                    }
                    .founder-image {
                        max-width: 300px;
                        margin: 0 auto;
                    }
                    .founder-image img {
                        height: 380px;
                    }
                    .founder-contact {
                        gap: 15px;
                        flex-direction: column;
                        padding-top: 20px;
                    }
                    .founder-contact a {
                        font-size: 0.85rem;
                    }
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 25px;
                    }
                    .stat-number {
                        font-size: 2.4rem;
                    }
                    .values-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    .value-card {
                        padding: 30px 20px;
                    }
                }
                
                @media (max-width: 600px) {
                    .page-title {
                        font-size: 2.4rem;
                    }
                    .founder-name {
                        font-size: 2rem;
                    }
                    .cta-content h2 {
                        font-size: 2.22rem;
                    }
                }
            `}</style>
        </>
    );
};

export default About;
