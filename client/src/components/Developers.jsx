import React from 'react';
import { motion } from 'framer-motion';
import './Developers.css';

const developerPartners = [
    { 
        name: "Alef Group", 
        logo: "https://www.alefgroup.ae/wp-content/uploads/2022/11/alef-group-logo-white.png", 
        website: "https://www.alefgroup.ae", 
        projects: ["Al Mamsha", "Hayyan", "Palace Residences", "Olfah", "Suroor"] 
    },
    { 
        name: "Arada", 
        logo: "https://aradawebcontent.blob.core.windows.net/arada-com/2022/06/arada-logo.svg", 
        website: "https://www.arada.com", 
        projects: ["Aljada", "Masaar", "Jouri Hills", "Nasaq", "Sokoon"] 
    },
    { 
        name: "Maryam Island", 
        logo: "https://maryamisland.ae/wp-content/uploads/2023/09/Uplifted-MI-logo-01-02-white.png.webp", 
        website: "https://maryamisland.ae", 
        projects: ["Maryam Gate", "Rehan Residences", "Cyan Beach", "Sahab"] 
    },
    { 
        name: "Shoumous", 
        logo: null, 
        website: "https://www.shoumous.com", 
        projects: ["Shoumous Residences", "Luxury Villas", "Naseem Townhouses"] 
    },
    { 
        name: "Ajmal Makan", 
        logo: null, 
        website: "https://ajmalmakan.com", 
        projects: ["Waterfront City", "The View Island", "Blue Beach", "Aryam Villas"] 
    },
    { 
        name: "Tiger Group", 
        logo: null, 
        website: "https://www.tigergroup.ae", 
        projects: ["Tiger Sky Tower", "Faradis Tower", "Cloud Tower", "Guzel Tower"] 
    },
    { 
        name: "Altay Hills", 
        logo: null, 
        website: "https://www.altayhills.ae", 
        projects: ["Altay Hills Villas", "Green River", "Luxury Mansions"] 
    },
    { 
        name: "Manazil", 
        logo: null, 
        website: "https://manazil-uae.com", 
        projects: ["Manazil Towers", "Terhab Hotel", "Al Manazil Tower"] 
    },
    { 
        name: "Al Marwan", 
        logo: null, 
        website: "https://almarwandevelopments.com", 
        projects: ["Hawa Residence", "District 11", "Garden City", "Robot Park"] 
    }
];

const Developers = ({ onDeveloperClick }) => {
    return (
        <section className="developers-carousel-section">
            <div className="container">
                <motion.div 
                    className="section-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="section-label">Trusted Partners</span>
                    <h2 className="section-title">Our Developer Partners</h2>
                    <div className="section-line"></div>
                </motion.div>
            </div>
            
            <div className="carousel-container">
                <div className="carousel-track">
                    {[...developerPartners, ...developerPartners].map((dev, i) => (
                        <a 
                            key={`${dev.name}-${i}`} 
                            href={dev.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="developer-card"
                            onClick={(e) => {
                                if (onDeveloperClick) {
                                    e.preventDefault();
                                    onDeveloperClick(dev.name);
                                }
                            }}
                        >
                            {dev.logo ? (
                                <img src={dev.logo} alt={dev.name} className="developer-logo-img" />
                            ) : (
                                <span className="developer-name">{dev.name}</span>
                            )}
                            <div className="developer-projects-list">
                                {dev.projects.slice(0, 3).map((proj, idx) => (
                                    <span key={idx} className="project-tag">{proj}</span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Developers;
