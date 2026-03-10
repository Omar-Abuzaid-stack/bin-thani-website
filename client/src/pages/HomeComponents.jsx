import React from 'react';
import { Search, MapPin, Home, Users, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import './Home.css';

export const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="container hero-content">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Elevating Luxury Living <br /> <span className="gold">In Sharjah</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Discover premium properties and investment opportunities with Bin Thani Real Estate.
                </motion.p>

                <motion.div
                    className="search-bar"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <div className="search-input">
                        <MapPin size={20} color="#c9a84c" />
                        <input type="text" placeholder="Location..." />
                    </div>
                    <div className="search-input">
                        <Home size={20} color="#c9a84c" />
                        <select>
                            <option>Property Type</option>
                            <option>Apartment</option>
                            <option>Villa</option>
                            <option>Office</option>
                        </select>
                    </div>
                    <button className="btn-primary search-btn">
                        <Search size={20} /> Search
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export const Stats = () => {
    const stats = [
        { icon: <Home />, label: 'Properties Sold', value: '2,500+' },
        { icon: <Award />, label: 'Years Experience', value: '15+' },
        { icon: <Users />, label: 'Happy Clients', value: '1,800+' },
    ];

    return (
        <section className="stats container">
            {stats.map((stat, index) => (
                <div key={index} className="stat-item fade-in">
                    <div className="stat-icon">{stat.icon}</div>
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                </div>
            ))}
        </section>
    );
};

export const PropertyCard = ({ property }) => {
    const images = JSON.parse(property.images || '[]');
    return (
        <motion.div
            className="property-card"
            whileHover={{ y: -10 }}
        >
            <div className="property-image">
                <img src={images[0]} alt={property.title} />
                <div className="property-status">{property.status}</div>
            </div>
            <div className="property-info">
                <h3>{property.title}</h3>
                <p className="location"><MapPin size={14} /> {property.location}</p>
                <div className="specs">
                    <span>{property.bedrooms} Beds</span>
                    <span>{property.bathrooms} Baths</span>
                    <span>{property.area}</span>
                </div>
                <div className="property-footer">
                    <span className="price">{property.price}</span>
                    <button className="btn-outline">View Details</button>
                </div>
            </div>
        </motion.div>
    );
};
