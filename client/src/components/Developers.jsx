import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Home, Info, X, ChevronRight, BedDouble, Tag, Loader2 } from 'lucide-react';
import './Developers.css';

const GOLD_GRADIENT_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23c9a84c'/%3E%3Cstop offset='50%25' stop-color='%23f9d57d'/%3E%3Cstop offset='100%25' stop-color='%23a07c33'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='Arial, sans-serif' font-size='26'%3EImage Unavailable%3C/text%3E%3C/svg%3E";

const PROJECT_IMAGE_OVERRIDES = {
    'Alef Group': {
        'Masaar': 'https://mybayutcdn.bayut.com/mybayut/wp-content/uploads/Cover-Aerial-view-of-Masaar-ar29082021.jpg',
        'Al Mamsha Sharjah': 'https://www.alefgroup.ae/wp-content/uploads/al-mamsha-cover.jpg',
        'Hayyan Villas': 'https://www.alefgroup.ae/wp-content/uploads/2024/09/hayyan-by-alef.jpg'
    },
    'Arada': {
        'Masaar': 'https://mybayutcdn.bayut.com/mybayut/wp-content/uploads/Cover-Aerial-view-of-Masaar-ar29082021.jpg',
        'Aljada Sharjah': 'https://aradawebcontent.blob.core.windows.net/arada-com/2022/06/aljada-hero.jpg',
        'Aljada Residences': 'https://aradawebcontent.blob.core.windows.net/arada-com/2022/06/aljada-hero.jpg',
        'Jouri Hills': 'https://aradawebcontent.blob.core.windows.net/arada-com/2022/06/jouri-hills-hero.jpg',
        'Naseej District': 'https://aradawebcontent.blob.core.windows.net/arada-com/2021/10/hero-banner-new.jpg'
    },
    'Shoumous': {
        'Shoumous Residences': 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80'
    },
    'Ajmal Makan': {
        'City Hamriyah': 'https://ajmalmakan.com/wp-content/uploads/2024/11/resized_AJMAL-MAKAN-CITY-3D-111-scaled.jpg',
        'Bab Al Bahar': 'https://ajmalmakan.com/wp-content/uploads/2024/11/resized_AJMAL-MAKAN-CITY-3D-111-scaled.jpg'
    },
    'Tiger Group': {
        'Tiger Sky Tower': 'https://www.tigergroup.ae/_next/static/media/modal-tower.46f2808e.jpg',
        'Tiger Palace': 'https://www.tigergroup.ae/_next/static/media/modal-tower.46f2808e.jpg'
    },
    'Altay Hills': {
        'Alta Hills villas': 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80'
    },
    'Manazil': {
        'Al Reef': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80'
    },
    'Maryam Island': {
        'Sharjah apartments': 'https://images.unsplash.com/photo-1491993946051-9fab1c8fd5af?auto=format&fit=crop&w=1400&q=80'
    },
    'Al Marwan': {
        'Tilal City': 'https://images.unsplash.com/photo-1489390355872-2f5f9d3b9d5c?auto=format&fit=crop&w=1400&q=80',
        'Garden City': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1400&q=80'
    }
};

const UNSPLASH_IMAGE_BY_TYPE = {
    apartment: 'https://images.unsplash.com/photo-1560448070-9a79ef82d833?auto=format&fit=crop&w=1400&q=80',
    villa: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
    townhouse: 'https://images.unsplash.com/photo-1572120360610-d971b9f5792b?auto=format&fit=crop&w=1400&q=80',
    penthouse: 'https://images.unsplash.com/photo-1600077081180-122bba7565fe?auto=format&fit=crop&w=1400&q=80',
    tower: 'https://images.unsplash.com/photo-1560184897-0af3f358b79a?auto=format&fit=crop&w=1400&q=80',
    office: 'https://images.unsplash.com/photo-1592928306898-0bdcbce1c80a?auto=format&fit=crop&w=1400&q=80',
    default: 'https://images.unsplash.com/photo-1492717560260-1a4d0ffc1caa?auto=format&fit=crop&w=1400&q=80'
};

const isUnsplash = (url) => typeof url === 'string' && url.includes('images.unsplash.com');

const resolveProjectImage = (developer, projectName = '', imageUrl, projectType = '') => {
    // 1) use explicit project override if exists
    const devSpec = PROJECT_IMAGE_OVERRIDES[developer];
    if (devSpec) {
        const normalizedProjectName = (projectName || '').trim().toLowerCase();
        const exactImage = Object.entries(devSpec).find(([key]) => key.toLowerCase() === normalizedProjectName);
        if (exactImage) return exactImage[1];

        const fuzzyImage = Object.entries(devSpec).find(([key]) => {
            const needle = key.toLowerCase();
            return normalizedProjectName.includes(needle) || needle.includes(normalizedProjectName) || needle.split(' ').some(s => normalizedProjectName.includes(s));
        });
        if (fuzzyImage) return fuzzyImage[1];

        // if no exact match but we have project override values, use first one
        const firstImage = Object.values(devSpec)[0];
        if (firstImage) return firstImage;
    }

    // 2) fallback to type-based Unsplash
    const normalizedType = (projectType || '').trim().toLowerCase();
    const typeImage = UNSPLASH_IMAGE_BY_TYPE[normalizedType] || UNSPLASH_IMAGE_BY_TYPE.default;
    if (typeImage) {
        return typeImage;
    }

    // 3) last fallback
    return GOLD_GRADIENT_FALLBACK;
};

const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = GOLD_GRADIENT_FALLBACK;
};

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
        const resolvedImage = resolveProjectImage(developer, project.name, project.image, project.type);
        setSelectedProject({ ...project, developerName: developer, image: resolvedImage });
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
                                        <img src={dev.logo} alt={dev.name} className="dev-real-logo" loading="lazy" onError={handleImageError} />
                                    ) : (
                                        <h3 className="dev-fallback-logo">{dev.name}</h3>
                                    )}
                                    {dev.logo && <div className="dev-name-sub">{dev.name}</div>}
                                    <div className="dev-tagline"><i>{dev.tagline}</i></div>
                                </div>

                                <div className="dev-projects-row">
                                    {dev.projects.map((proj, pIdx) => {
                                        const projectImage = resolveProjectImage(dev.name, proj.name, proj.image, proj.type);
                                        return (
                                            <div key={pIdx} className="dev-project-card">
                                                <div className="dev-proj-img-wrap">
                                                    <img src={projectImage} alt={proj.name} className="dev-proj-img" loading="lazy" onError={handleImageError} />
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
                                    );
                                })}
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
                                <img src={selectedProject.image || GOLD_GRADIENT_FALLBACK} alt={selectedProject.name} className="proj-modal-hero-img" loading="lazy" onError={handleImageError} />
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
                                                <span className="info-label">Developer</span>
                                                <span className="info-value">{selectedProject.developerName}</span>
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
