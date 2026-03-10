import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Hero, Stats, PropertyCard } from './HomeComponents';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

// Use VITE_API_URL if set, otherwise use Netlify functions path
const getApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  if (baseUrl) return `${baseUrl}/.netlify/functions/${endpoint}`;
  return `/.netlify/functions/${endpoint}`;
};

const heroImages = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1920&q=80'
];

const Home = () => {
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentHero, setCurrentHero] = useState(0);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await axios.get(getApiUrl('featured'));
                setFeaturedProperties(res.data);
            } catch (err) {
                console.error('Error fetching featured properties:', err);
            }
        };
        fetchFeatured();
    }, []);

    // Hero image rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHero((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredProperties.length / 3));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + Math.ceil(featuredProperties.length / 3)) % Math.ceil(featuredProperties.length / 3));
    };

    const getVisibleProperties = () => {
        const perSlide = 3;
        const start = currentSlide * perSlide;
        return featuredProperties.slice(start, start + perSlide);
    };

    return (
        <div className="home-page">
            {/* Hero Section with Rotating Background */}
            <section className="hero">
                {heroImages.map((img, idx) => (
                    <div 
                        key={idx}
                        className={`hero-bg ${idx === currentHero ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
                <div className="hero-overlay" />
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Find Your <span className="gold">Dream Home</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Discover premium properties in Sharjah, Dubai & Abu Dhabi
                    </motion.p>
                    
                    <motion.div 
                        className="search-bar"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div className="search-input">
                            <input type="text" placeholder="Search location..." />
                        </div>
                        <div className="search-input">
                            <select>
                                <option>Property Type</option>
                                <option>Villa</option>
                                <option>Apartment</option>
                                <option>Townhouse</option>
                            </select>
                        </div>
                        <button className="btn-primary search-btn">Search</button>
                    </motion.div>
                </div>
            </section>

            <Stats />

            <section className="featured-properties container">
                <div className="section-header">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {t('featuredProperties')}
                    </motion.h2>
                    <p>{t('exploreLuxury')}</p>
                </div>

                <div className="carousel-container">
                    <button className="carousel-btn prev" onClick={prevSlide}>
                        <ChevronLeft size={24} />
                    </button>
                    
                    <div className="featured-carousel">
                        {getVisibleProperties().map((property, idx) => {
                            const images = property.images ? JSON.parse(property.images) : [];
                            return (
                                <motion.div 
                                    key={property.id}
                                    className="featured-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Link to={`/property/${property.id}`}>
                                        <div className="featured-image">
                                            <img src={images[0] || 'https://via.placeholder.com/400x300'} alt={property.title} />
                                            <span className="featured-badge">Featured</span>
                                        </div>
                                        <div className="featured-info">
                                            <h3>{property.title}</h3>
                                            <p className="location">{property.location}</p>
                                            <div className="featured-details">
                                                <span>{property.bedrooms} {t('beds')}</span>
                                                <span>{property.bathrooms} {t('baths')}</span>
                                                <span>{property.area}</span>
                                            </div>
                                            <div className="featured-price">
                                                {property.price}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    <button className="carousel-btn next" onClick={nextSlide}>
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="view-all-container">
                    <Link to="/properties" className="view-all-btn">
                        {t('viewAllProperties')} <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <section className="cta-section">
                <div className="container">
                    <h2>{t('readyToFind')}</h2>
                    <p>Let our expert agents guide you through the best properties in UAE</p>
                    <Link to="/properties" className="cta-btn">
                        {t('browseProperties')}
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
