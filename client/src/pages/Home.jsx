import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowRight, Search, MapPin, Bed, Bath, Square, 
    Home as HomeIcon, Key, TrendingUp, Building 
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import Developers from '../components/Developers';
import './Home.css';

// Use VITE_API_URL if set, otherwise use Netlify functions path
const getApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  if (baseUrl) return `${baseUrl}/.netlify/functions/${endpoint}`;
  return `/.netlify/functions/${endpoint}`;
};

// 5 Luxury UAE Property Images for Hero
const heroImages = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1920&q=80'
];

// Services Data
const services = [
    {
        title: 'Buy Property',
        description: 'Find your dream home from our curated selection of luxury properties',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        link: '/properties?type=Buy',
        icon: <HomeIcon size={24} />
    },
    {
        title: 'Rent Property',
        description: 'Premium rental options for short and long-term leases',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        link: '/properties?type=Rent',
        icon: <Key size={24} />
    },
    {
        title: 'Investment',
        description: 'High-yield investment opportunities in UAE real estate',
        image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80', // Updated image from previous task
        link: '/contact',
        icon: <TrendingUp size={24} />
    },
    {
        title: 'Off-Plan',
        description: 'Latest off-plan developments with attractive payment plans',
        image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
        link: '/properties?status=Off-Plan',
        icon: <Building size={24} />
    }
];

// Stats Data
const stats = [
    { number: '500+', label: 'Properties Sold' },
    { number: '15+', label: 'Years Experience' },
    { number: '200+', label: 'Happy Clients' },
    { number: '50+', label: 'Developers' }
];

const Home = () => {
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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

    const handleSearch = (e) => {
        e.preventDefault();
        window.location.href = `/properties?search=${encodeURIComponent(searchQuery)}`;
    };

    return (
        <div className="home-page">
            {/* HERO SECTION */}
            <section className="hero">
                <div className="hero-slider">
                    {heroImages.map((img, index) => (
                        <div key={index} className={`hero-slide ${index === currentSlide ? 'active' : ''}`}>
                            <img src={img} alt={`Luxury Property ${index + 1}`} />
                        </div>
                    ))}
                </div>
                <div className="hero-overlay"></div>
                
                <div className="hero-content">
                    <motion.span 
                        className="hero-tagline"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Premium Real Estate
                    </motion.span>
                    
                    <motion.h1 
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className="line">Find Your</span>
                        <span className="line">Dream Home</span>
                    </motion.h1>
                    
                    <motion.p 
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        Discover exclusive luxury properties across UAE
                    </motion.p>
                    
                    {/* Glass Morphism Search Bar */}
                    <motion.form 
                        className="search-bar"
                        onSubmit={handleSearch}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <div className="search-input-wrapper">
                            <Search className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search by location, property name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="search-btn">Search</button>
                    </motion.form>
                </div>

                {/* Hero Navigation Dots */}
                <div className="hero-nav">
                    {heroImages.map((_, index) => (
                        <div 
                            key={index} 
                            className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </section>

            {/* SERVICES SECTION */}
            <section className="services-luxury">
                <div className="container">
                    <motion.div 
                        className="section-header"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="section-label">What We Offer</span>
                        <h2 className="section-title">Our Services</h2>
                        <div className="section-line"></div>
                    </motion.div>
                    
                    <div className="services-grid">
                        {services.map((service, index) => (
                            <motion.div 
                                key={index}
                                className="service-card-luxury"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <div className="service-bg" style={{backgroundImage: `url(${service.image})`}}></div>
                                <div className="service-overlay">
                                    <div className="service-icon-wrapper">
                                        {service.icon}
                                    </div>
                                    <h3>{service.title}</h3>
                                    <p>{service.description}</p>
                                    <Link to={service.link} className="service-link">
                                        Learn More <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DEVELOPERS SECTION */}
            <Developers />

            {/* FEATURED PROPERTIES */}
            <section className="featured-properties">
                <div className="container">
                    <motion.div 
                        className="section-header"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="section-label">Handpicked</span>
                        <h2 className="section-title">Featured Properties</h2>
                        <div className="section-line"></div>
                    </motion.div>
                    
                    <div className="properties-grid">
                        {featuredProperties.slice(0, 6).map((property, index) => {
                            let images = [];
                            try {
                                images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
                            } catch (e) {
                                console.error('Error parsing property images:', e);
                                images = ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'];
                            }
                            
                            return (
                                <motion.div 
                                    key={property.id || index}
                                    className="property-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link to={`/property/${property.id}`}>
                                        <div className="property-image">
                                            <img 
                                                src={images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'} 
                                                alt={property.title}
                                            />
                                            {property.status === 'Off-Plan' && (
                                                <span className="property-badge">Off-Plan</span>
                                            )}
                                        </div>
                                        <div className="property-info">
                                            <div className="property-price">AED {property.price?.toLocaleString()}</div>
                                            <h3 className="property-title">{property.title}</h3>
                                            <div className="property-location">
                                                <MapPin size={14} />
                                                <span>{property.location}</span>
                                            </div>
                                            <div className="property-details">
                                                {property.bedrooms > 0 && (
                                                    <span className="property-detail">
                                                        <Bed size={14} /> {property.bedrooms} Beds
                                                    </span>
                                                )}
                                                {property.bathrooms > 0 && (
                                                    <span className="property-detail">
                                                        <Bath size={14} /> {property.bathrooms} Baths
                                                    </span>
                                                )}
                                                <span className="property-detail">
                                                    <Square size={14} /> {property.area}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                    
                    <motion.div 
                        className="view-all-wrapper"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <Link to="/properties" className="btn btn-outline">
                            View All Properties
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* CTA SECTION */}
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
                        <h2>Ready to Find Your Dream Home?</h2>
                        <p>Let our experts help you find the perfect property</p>
                        <div className="cta-buttons">
                            <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
                            <Link to="/contact" className="btn btn-outline">Contact Us</Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* STATS */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
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
        </div>
    );
};

export default Home;
