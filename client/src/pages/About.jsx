import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';

const teamMembers = [
    {
        name: 'Ahmed Al Thani',
        position: 'Managing Director',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
    },
    {
        name: 'Sarah Johnson',
        position: 'Head of Sales',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'
    },
    {
        name: 'Mohammed Rashid',
        position: 'Investment Consultant',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
    },
    {
        name: 'Fatima Al Mahdi',
        position: 'Property Manager',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80'
    }
];

const About = () => {
    return (
        <>
            <Helmet>
                <title>About Us - Bin Thani Real Estate</title>
                <meta name="description" content="Bin Thani Real Estate - Sharjah's most trusted luxury real estate agency" />
            </Helmet>
            
            <div className="about-page">
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
                            <h1 className="page-title">About Bin Thani</h1>
                            <p className="page-subtitle">Excellence in Real Estate Since 2010</p>
                        </motion.div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="about-story">
                    <div className="container">
                        <div className="story-grid">
                            <motion.div 
                                className="story-content"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <span className="section-label">Our Story</span>
                                <h2>A Legacy of Excellence</h2>
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
                            </motion.div>
                            <motion.div 
                                className="story-image"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" alt="Luxury Property" />
                            </motion.div>
                        </div>
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

                {/* Team Section */}
                <section className="team-section">
                    <div className="container">
                        <motion.div 
                            className="section-header"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="section-label">Our Team</span>
                            <h2 className="section-title">Meet the Experts</h2>
                            <div className="section-line"></div>
                        </motion.div>
                        
                        <div className="team-grid">
                            {teamMembers.map((member, index) => (
                                <motion.div 
                                    key={index}
                                    className="team-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="team-image">
                                        <img src={member.image} alt={member.name} />
                                    </div>
                                    <div className="team-info">
                                        <h3>{member.name}</h3>
                                        <p>{member.position}</p>
                                    </div>
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
                
                /* Story */
                .about-story {
                    background: #0a0a0a;
                }
                
                .story-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 80px;
                    align-items: center;
                }
                
                .story-content h2 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 2.5rem;
                    color: #B8960C;
                    margin-bottom: 25px;
                }
                
                .story-content p {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 1rem;
                    color: #A8A8A8;
                    line-height: 1.9;
                    margin-bottom: 20px;
                }
                
                .story-image img {
                    width: 100%;
                    height: 400px;
                    object-fit: cover;
                    border-radius: 4px;
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
                
                /* Team */
                .team-section {
                    background: #080808;
                }
                
                .team-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 30px;
                }
                
                .team-card {
                    background: #111111;
                    border: 1px solid transparent;
                    transition: all 0.3s ease;
                }
                
                .team-card:hover {
                    border-color: #B8960C;
                }
                
                .team-image {
                    height: 280px;
                    overflow: hidden;
                }
                
                .team-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                
                .team-card:hover .team-image img {
                    transform: scale(1.05);
                }
                
                .team-info {
                    padding: 25px;
                    text-align: center;
                }
                
                .team-info h3 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.3rem;
                    color: #fff;
                    margin-bottom: 8px;
                }
                
                .team-info p {
                    font-size: 0.85rem;
                    color: #A8A8A8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                /* Values */
                .values-section {
                    background: #0a0a0a;
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
                
                @media (max-width: 1024px) {
                    .story-grid, .team-grid, .values-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (max-width: 600px) {
                    .story-grid, .team-grid, .values-grid, .stats-grid {
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

export default About;
