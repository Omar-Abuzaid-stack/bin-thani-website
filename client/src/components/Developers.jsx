import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Home, Info, X, ChevronRight, BedDouble, Tag, Loader2 } from 'lucide-react';
import './Developers.css';

const Developers = () => {
    const [developersData, setDevelopersData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const fetchDevelopers = async () => {
            try {
                // Using relative path for Vercel, or full URL in dev
                const apiUrl = import.meta.env.PROD 
                    ? '/api/developers'
                    : `${import.meta.env.VITE_API_URL || ''}/api/developers`;
                
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Failed to fetch developers');
                
                const data = await response.json();
                setDevelopersData(data || []);
            } catch (err) {
                console.error("Error loading developers:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDevelopers();
    }, []);

    const openModal = (project, developer) => {
        setSelectedProject({ ...project, developerName: developer });
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedProject(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <section className="developers-section" id="developers">
            <div className="container">
                <motion.div 
                    className="dev-section-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <h2 className="dev-section-title">Our Developer Partners</h2>
                    <p className="dev-section-subtitle">Explore exclusive projects from Sharjah's top developers</p>
                    <span className="dev-section-hint">Click any project to explore details</span>
                    <div className="dev-section-line"></div>
                </motion.div>

                {isLoading ? (
                    <div className="dev-loading" style={{ textAlign: 'center', padding: '50px', color: '#B8960C' }}>
                        <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 20px' }} />
                        <p>Loading Developer Projects...</p>
                    </div>
                ) : error ? (
                    <div className="dev-error" style={{ textAlign: 'center', padding: '50px', color: '#ff4c4c' }}>
                        <p>Error loading projects: {error}</p>
                    </div>
                ) : (
                    <div className="developers-grid">
                        {developersData.map((dev, idx) => (
                            <motion.div 
                                key={idx} 
                                className="dev-card-glass"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: (idx % 3) * 0.1 }}
                            >
                                <div className="dev-card-header">
                                    {dev.logo ? (
                                        <img src={dev.logo} alt={dev.name} className="dev-real-logo" />
                                    ) : (
                                        <h3 className="dev-fallback-logo">{dev.name}</h3>
                                    )}
                                    {dev.logo && <div className="dev-name-sub">{dev.name}</div>}
                                    <div className="dev-tagline"><i>{dev.tagline}</i></div>
                                </div>

                                <div className="dev-projects-row">
                                    {dev.projects.map((proj, pIdx) => (
                                        <div key={pIdx} className="dev-project-card">
                                            <div className="dev-proj-img-wrap">
                                                <img src={proj.image} alt={proj.name} className="dev-proj-img" />
                                                <div className="dev-proj-overlay"></div>
                                                <div className="dev-proj-badges">
                                                    <span className="badge-type">{proj.type}</span>
                                                    <span className={`badge-status ${proj.status.replace(/\s+/g, '-').toLowerCase()}`}>{proj.status}</span>
                                                </div>
                                            </div>
                                            <div className="dev-proj-content">
                                                <h4 className="dev-proj-name">{proj.name}</h4>
                                                <p className="dev-proj-loc"><MapPin size={14} className="icon"/> {proj.location}</p>
                                                <button className="dev-proj-btn" onClick={() => openModal(proj, dev.name)}>
                                                    View Project <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedProject && (
                    <motion.div 
                        className="proj-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div 
                            className="proj-modal-content"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="proj-modal-close" onClick={closeModal}><X size={24} /></button>
                            
                            <div className="proj-modal-hero">
                                <img src={selectedProject.image} alt={selectedProject.name} />
                                <div className="proj-modal-hero-overlay"></div>
                                <div className="proj-modal-hero-text">
                                    <span className="proj-modal-dev">{selectedProject.developerName}</span>
                                    <h2>{selectedProject.name}</h2>
                                    <p><MapPin size={16} /> {selectedProject.location}</p>
                                </div>
                            </div>

                            <div className="proj-modal-body">
                                <div className="proj-modal-main">
                                    <div className="proj-modal-section">
                                        <h3><Info size={20} /> About {selectedProject.name}</h3>
                                        <p className="proj-desc">{selectedProject.description}</p>
                                    </div>
                                    
                                    <div className="proj-modal-section">
                                        <h3><Home size={20} /> Key Features</h3>
                                        <ul className="proj-features-list">
                                            {selectedProject.features.map((feat, i) => (
                                                <li key={i}>{feat}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="proj-modal-sidebar">
                                    <div className="proj-modal-info-card">
                                        <div className="info-row">
                                            <Tag size={18} className="gold"/>
                                            <div>
                                                <span className="info-label">Price Range</span>
                                                <span className="info-value">{selectedProject.price}</span>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <BedDouble size={18} className="gold"/>
                                            <div>
                                                <span className="info-label">Unit Types</span>
                                                <span className="info-value">{selectedProject.bedrooms}</span>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="badge-wrap">
                                                <span className="badge-type">{selectedProject.type}</span>
                                                <span className={`badge-status ${selectedProject.status.replace(/\s+/g, '-').toLowerCase()}`}>{selectedProject.status}</span>
                                            </div>
                                        </div>
                                        
                                        <a href="/contact" className="btn-primary-full">Request Information</a>
                                    </div>

                                    <div className="proj-modal-map">
                                        <iframe 
                                            title={`${selectedProject.name} Location`}
                                            src={`https://maps.google.com/maps?q=${selectedProject.gmaps}&output=embed`}
                                            frameBorder="0" 
                                            allowFullScreen
                                            loading="lazy"
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Developers;
