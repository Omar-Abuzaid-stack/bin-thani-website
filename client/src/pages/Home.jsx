import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowRight, Search, MapPin, Bed, Bath, Square, 
    Home as HomeIcon, Key, TrendingUp, Building 
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Helmet } from 'react-helmet-async';
import Developers from '../components/Developers';
import './Home.css';

// Use VITE_API_URL if set, otherwise use Vercel /api/ path
const getApiUrl = (endpoint) => {
  if (import.meta.env.PROD) return `/api/${endpoint}`;
  const baseUrl = import.meta.env.VITE_API_URL;
  return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

// 5 Luxury UAE Property Images for Hero
const heroImages = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1920&q=80'
];

// Services and Stats data are defined dynamically inside the component to support translation.

const Home = () => {
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const { t, language, getContent } = useLanguage();

    // Services Data (dynamically translated)
    const services = [
        {
            title: t('buyProperty'),
            description: t('buyDesc'),
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
            link: '/properties?type=Buy',
            icon: <HomeIcon size={24} />
        },
        {
            title: t('rentProperty'),
            description: t('rentDesc'),
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            link: '/properties?type=Rent',
            icon: <Key size={24} />
        },
        {
            title: t('investment'),
            description: t('investDesc'),
            image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
            link: '/contact',
            icon: <TrendingUp size={24} />
        },
        {
            title: t('offPlanService'),
            description: t('offPlanDesc'),
            image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
            link: '/properties?status=Off-Plan',
            icon: <Building size={24} />
        }
    ];

    // Stats Data
    const stats = [
        { number: '500+', label: t('propertiesSold') },
        { number: '15+', label: t('yearsExperience') },
        { number: '200+', label: t('happyClients') },
        { number: '50+', label: t('developers') }
    ];

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
        <div className={`home-page ${language === 'ar' ? 'rtl' : ''}`}>
            <Helmet>
                <title>{language === 'ar' ? 'الرئيسية | بن ثاني للعقارات' : 'Home | Bin Thani Real Estate'}</title>
            </Helmet>
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
                        {t('heroTagline')}
                    </motion.span>
                    
                    <motion.h1 
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className="line">{t('heroLine1')}</span>
                        <span className="line">{t('heroLine2')}</span>
                    </motion.h1>
                    
                    <motion.p 
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        {t('heroSubtitle')}
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
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="search-btn">{t('search')}</button>
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
                        <span className="section-label">{t('whatWeOffer')}</span>
                        <h2 className="section-title">{t('ourServices')}</h2>
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
                                        {t('learnMore')} <ArrowRight size={16} />
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
                        <span className="section-label">{t('handpicked')}</span>
                        <h2 className="section-title">{t('featuredProperties')}</h2>
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
                                                alt={getContent(property, 'title')}
                                            />
                                            {property.status === 'Off-Plan' && (
                                                <span className="property-badge">{t('offPlan')}</span>
                                            )}
                                        </div>
                                        <div className="property-info">
                                            <div className="property-price">
                                                {property.price_numeric > 0 
                                                    ? `${language === 'ar' ? 'د.إ ' : 'AED '} ${property.price_numeric.toLocaleString()}`
                                                    : (language === 'ar' ? 'تواصل لمعرفة السعر' : 'Contact for Details')
                                                }
                                            </div>
                                            <h3 className="property-title">{getContent(property, 'title')}</h3>
                                            <div className="property-location">
                                                <MapPin size={14} />
                                                <span>{getContent(property, 'location')}</span>
                                            </div>
                                            <div className="property-details">
                                                {property.bedrooms > 0 && (
                                                    <span className="property-detail">
                                                        <Bed size={14} /> {property.bedrooms} {t('beds')}
                                                    </span>
                                                )}
                                                {property.bathrooms > 0 && (
                                                    <span className="property-detail">
                                                        <Bath size={14} /> {property.bathrooms} {t('baths')}
                                                    </span>
                                                )}
                                                <span className="property-detail">
                                                    <Square size={14} /> {property.area ? property.area.replace(/sqft/i, t('sqft')) : ''}
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
                            {t('viewAllProperties')}
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
                        <h2>{t('readyToFind')}</h2>
                        <p>{t('findPerfect')}</p>
                        <div className="cta-buttons">
                            <Link to="/properties" className="btn btn-primary">{t('browseProperties')}</Link>
                            <Link to="/contact" className="btn btn-outline">{t('contactUs')}</Link>
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
