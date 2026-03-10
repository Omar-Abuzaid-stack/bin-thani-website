import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const servicesData = [
    {
        title: 'Buy Property',
        description: 'Find your dream home from our curated selection of luxury properties across UAE',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        link: '/properties?type=Buy'
    },
    {
        title: 'Rent Property',
        description: 'Premium rental options for short-term and long-term leases',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        link: '/properties?type=Rent'
    },
    {
        title: 'Investment Advisory',
        description: 'Expert guidance on high-yield investment opportunities in UAE real estate',
        image: 'https://images.unsplash.com/photo-1582407947304-fd86f28f5dde?w=800',
        link: '/contact'
    },
    {
        title: 'Off-Plan Projects',
        description: 'Access to the latest off-plan developments with attractive payment plans',
        image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
        link: '/properties?status=Off-Plan'
    },
    {
        title: 'Property Management',
        description: 'Full-service property management for investors and landlords',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        link: '/contact'
    },
    {
        title: 'Mortgage Advisory',
        description: 'Professional assistance with financing options and mortgage approvals',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
        link: '/contact'
    }
];

const Services = () => {
    return (
        <>
            <Helmet>
                <title>Services - Bin Thani Real Estate</title>
                <meta name="description" content="Premium real estate services in Sharjah, Dubai, and Abu Dhabi" />
            </Helmet>
            
            <div className="services-page">
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
                            <h1 className="page-title">Our Services</h1>
                            <p className="page-subtitle">Excellence in Every Transaction</p>
                        </motion.div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="services-grid-section">
                    <div className="container">
                        <div className="services-grid-full">
                            {servicesData.map((service, index) => (
                                <motion.div 
                                    key={index}
                                    className="service-card-full"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <Link to={service.link}>
                                        <div className="service-card-bg" style={{backgroundImage: `url(${service.image})`}}></div>
                                        <div className="service-card-overlay">
                                            <div className="service-card-content">
                                                <h3>{service.title}</h3>
                                                <p>{service.description}</p>
                                                <span className="service-card-link">
                                                    Learn More <ArrowRight size={16} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
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
                            <h2>Ready to Get Started?</h2>
                            <p>Contact our team of experts today</p>
                            <div className="cta-buttons">
                                <Link to="/contact" className="btn btn-primary">Contact Us</Link>
                                <Link to="/properties" className="btn btn-outline">View Properties</Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>

            <style>{`
                .services-page {
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
                
                /* Services Grid */
                .services-grid-section {
                    padding: 80px 0;
                    background: #080808;
                }
                
                .services-grid-full {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 25px;
                }
                
                .service-card-full {
                    position: relative;
                    height: 400px;
                    border-radius: 4px;
                    overflow: hidden;
                    cursor: pointer;
                }
                
                .service-card-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    background-color: #1a1a1a;
                    transition: transform 0.8s ease;
                    z-index: 1;
                }
                
                .service-card-full:hover .service-card-bg {
                    transform: scale(1.1);
                }
                
                .service-card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(180deg, transparent 40%, rgba(8,8,8,0.95) 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 35px;
                    transition: all 0.4s ease;
                }
                
                .service-card-full::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 1px solid transparent;
                    transition: border-color 0.4s ease;
                    z-index: 2;
                    pointer-events: none;
                }
                
                .service-card-full:hover::before {
                    border-color: #B8960C;
                }
                
                .service-card-content h3 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.8rem;
                    font-weight: 400;
                    color: #fff;
                    margin-bottom: 12px;
                }
                
                .service-card-content p {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    color: #A8A8A8;
                    line-height: 1.7;
                    margin-bottom: 20px;
                    opacity: 0.9;
                }
                
                .service-card-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #B8960C;
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
                    .services-grid-full {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (max-width: 600px) {
                    .services-grid-full {
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

export default Services;
