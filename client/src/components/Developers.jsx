import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Home, Info, X, ChevronRight, BedDouble, Tag, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Developers.css';

const GOLD_GRADIENT_FALLBACK = (lang) => `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23c9a84c'/%3E%3Cstop offset='50%25' stop-color='%23f9d57d'/%3E%3Cstop offset='100%25' stop-color='%23a07c33'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='Arial, sans-serif' font-size='26'%3E${lang === 'ar' ? '%D8%A7%D9%84%D8%B5%D9%88%D8%B1%D8%A9%20%D8%BA%D9%8A%D8%B1%20%D9%85%D8%AA%D9%88%D9%81%D8%B1%D8%A9' : 'Image%20Unavailable'}%3C/text%3E%3C/svg%3E`;

// Images are fetched dynamically from Supabase

const Developers = () => {
    const { t, language, getContent } = useLanguage();
    const [developersData, setDevelopersData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [expandedDeveloper, setExpandedDeveloper] = useState(null);
    const [imgErrors, setImgErrors] = useState({});

    const handleImgError = (name) => {
        setImgErrors(prev => ({ ...prev, [name]: true }));
    };

    const toggleDeveloper = (devName) => {
        setExpandedDeveloper(expandedDeveloper === devName ? null : devName);
    };

    useEffect(() => {
        const fetchDevelopers = async () => {
            try {
                const apiUrl = import.meta.env.PROD ? '/api/developers' : `${import.meta.env.VITE_API_URL || ''}/api/developers`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                setDevelopersData(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
                setDevelopersData([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDevelopers();
    }, []);

    const resolveProjectImage = (developer, projectName = '', imageUrl, projectType = '') => {
        return imageUrl || GOLD_GRADIENT_FALLBACK(language);
    };

    const openModal = (project, developer) => {
        const resolvedImage = resolveProjectImage(developer.name, project.name, project.image, project.type);
        setSelectedProject({ ...project, developer, image: resolvedImage });
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedProject(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <section className={`developers-section ${language === 'ar' ? 'rtl' : ''}`} id="developers">
            <div className="container">
                <motion.div 
                    className="dev-section-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="dev-section-title">{t('developerPartners')}</h2>
                    <p className="dev-section-subtitle">{t('developerSubtitle')}</p>
                    <div className="dev-section-line"></div>
                </motion.div>

                {isLoading ? (
                    <div className="dev-loading">
                        <Loader2 className="animate-spin" size={40} />
                        <p>{t('loadingProjects')}</p>
                    </div>
                ) : (
                    <div className="developers-grid compact-grid">
                        {developersData.map((dev, idx) => {
                            const isExpanded = expandedDeveloper === dev.name;
                            return (
                                <motion.div 
                                    key={idx} 
                                    className={`dev-card-glass compact ${isExpanded ? 'expanded' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => toggleDeveloper(dev.name)}
                                >
                                    <div className="dev-card-header compact-header">
                                        <div className="dev-logo-container">
                                            {dev.logo && !imgErrors[dev.name] ? (
                                                <img 
                                                    src={dev.logo} 
                                                    alt={dev.name} 
                                                    className="dev-real-logo compact-img" 
                                                    onError={() => handleImgError(dev.name)}
                                                />
                                            ) : (
                                                <div className="dev-initial-logo">
                                                    {getContent(dev, 'name')?.charAt(0) || 'D'}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="dev-card-name">{getContent(dev, 'name')}</h3>
                                        <div className="dev-tagline compact-tagline"><i>{getContent(dev, 'tagline')}</i></div>
                                        <button className="dev-expand-btn">
                                            {isExpanded 
                                              ? (language === 'ar' ? 'إغلاق المشاريع' : 'Close Projects') 
                                              : (language === 'ar' ? 'عرض المشاريع' : 'View Projects')}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                className="dev-projects-row"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {dev.projects && dev.projects.length > 0 ? dev.projects.map((proj, pIdx) => (
                                                    <div key={pIdx} className="dev-project-card">
                                                        <div className="dev-proj-img-wrap">
                                                            <img src={resolveProjectImage(dev.name, proj.name, proj.image)} alt={getContent(proj, 'name')} className="dev-proj-img" />
                                                            <div className="dev-proj-badges">
                                                                <span className={`badge-status ${proj.status?.toLowerCase()}`}>{getContent(proj, 'status')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="dev-proj-content">
                                                            <h4 className="dev-proj-name">{getContent(proj, 'name')}</h4>
                                                            <p className="dev-proj-loc"><MapPin size={14}/> {getContent(proj, 'location')}</p>
                                                            <button className="dev-proj-btn" onClick={() => openModal(proj, dev)}>
                                                                {t('viewProject')} <ChevronRight size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="no-projects-msg">
                                                        {language === 'ar' ? 'المشاريع قريباً' : 'Projects Coming Soon'}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedProject && (
                    <motion.div className="proj-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
                        <motion.div className={`proj-modal-content ${language === 'ar' ? 'rtl' : ''}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                            <button className="proj-modal-close" onClick={closeModal}><X size={24} /></button>
                            
                            <div className="proj-modal-hero">
                                <img src={selectedProject.image} alt={getContent(selectedProject, 'name')} />
                                <div className="proj-modal-hero-text">
                                    <span className="proj-modal-dev">{selectedProject.developer.name}</span>
                                    <h2>{getContent(selectedProject, 'name')}</h2>
                                    <p><MapPin size={16} /> {getContent(selectedProject, 'location')}</p>
                                </div>
                            </div>

                            <div className="proj-modal-body">
                                <div className="proj-modal-main">
                                    <div className="proj-modal-section">
                                        <h3><Info size={20} /> {language === 'ar' ? 'عن المشروع' : 'About Project'}</h3>
                                        <p className="proj-desc">{getContent(selectedProject, 'description')}</p>
                                    </div>
                                    <div className="proj-modal-section">
                                        <h3><Home size={20} /> {t('amenities')}</h3>
                                        <ul className="proj-features-list">
                                            {(selectedProject.features || []).map((feat, i) => (
                                                <li key={i}>{typeof feat === 'string' ? feat : getContent(feat, 'name')}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="proj-modal-sidebar">
                                    <div className="proj-modal-info-card">
                                        <div className="info-row">
                                            <Tag size={18} />
                                            <div>
                                                <span className="info-label">{t('developer')}</span>
                                                <span className="info-value">{selectedProject.developer.name}</span>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <BedDouble size={18} />
                                            <div>
                                                <span className="info-label">{t('beds')}</span>
                                                <span className="info-value">{selectedProject.bedrooms}</span>
                                            </div>
                                        </div>
                                        <a href="/contact" className="btn-primary-full">{t('requestDetails')}</a>
                                    </div>
                                    
                                    <div className="proj-modal-map">
                                        <iframe 
                                            title="Location"
                                            src={`https://maps.google.com/maps?q=${selectedProject.gmaps}&output=embed`}
                                            frameBorder="0" 
                                            allowFullScreen
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
