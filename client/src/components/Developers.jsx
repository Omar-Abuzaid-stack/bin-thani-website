import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import './Developers.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Developers = ({ onDeveloperClick }) => {
    const [developers, setDevelopers] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        fetchDevelopers();
    }, []);

    const fetchDevelopers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/developers`);
            setDevelopers(res.data);
        } catch (err) {
            console.error('Error fetching developers:', err);
            // Fallback developers
            setDevelopers([
                { id: 1, name: 'Emaar', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Emaar_Properties_Logo.svg/200px-Emaar_Properties_Logo.svg.png', description: 'World-class developer' },
                { id: 2, name: 'Aldar', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Aldar_Properties_logo.svg/200px-Aldar_Properties_logo.svg.png', description: 'Leading Abu Dhabi developer' },
                { id: 3, name: 'Damac', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d9/DAMAC_Properties_Logo.svg/200px-DAMAC_Properties_Logo.svg.png', description: 'Luxury real estate' },
                { id: 4, name: 'Sobha Realty', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Sobha_Group_Logo.svg/200px-Sobha_Group_Logo.svg.png', description: 'Premium quality' },
                { id: 5, name: 'Binghatti', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Binghatti_Developers_Logo.svg/200px-Binghatti_Developers_Logo.svg.png', description: 'Innovative UAE developer' },
                { id: 6, name: 'Nakheel', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/96/Nakheel_Properties_Logo.svg/200px-Nakheel_Properties_Logo.svg.png', description: 'Iconic developments' },
                { id: 7, name: 'Arada', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Arada_Logo.svg/200px-Arada_Logo.svg.png', description: 'Sharjah developer' },
                { id: 8, name: 'Eagle Hills', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Eagle_Hills_Logo.svg/200px-Eagle_Hills_Logo.svg.png', description: 'UAE real estate' }
            ]);
        }
    };

    return (
        <div className="developers-section">
            <h2>{t('ourDevelopers')}</h2>
            <p className="section-subtitle">{t('partneringBest')}</p>
            
            <div 
                className="developers-carousel"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className={`carousel-track ${isPaused ? 'paused' : ''}`}>
                    {[...developers, ...developers].map((dev, idx) => (
                        <div 
                            key={`${dev.id}-${idx}`} 
                            className="developer-card"
                            onClick={() => onDeveloperClick && onDeveloperClick(dev.name)}
                        >
                            <div className="dev-logo">
                                <img 
                                    src={dev.logo} 
                                    alt={dev.name}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                            <h4>{dev.name}</h4>
                            <p>{dev.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Developers;
