import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, Instagram, Facebook, Twitter, MessageCircle, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const marqueeMessages = [
    "🏆 Bin Thani Real Estate — Sharjah's Most Trusted Agency",
    "🏠 Premium Properties in Sharjah",
    "📞 Book a Free Consultation Today",
    "✨ Off-Plan & Ready Properties Available Now"
];

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { language, toggleLanguage, t } = useLanguage();
    const location = useLocation();
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % marqueeMessages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="announcement-bar">
                <div className="marquee-container">
                    <div className="marquee-content">
                        <span>{marqueeMessages[messageIndex]}</span>
                    </div>
                </div>
            </div>
            <nav className="navbar">
                <div className="container nav-content">
                    <Link to="/" className="logo">
                        <span className="gold">BIN</span> THANI
                    </Link>
                    <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                        <Link to="/" onClick={() => setIsOpen(false)}>{t('home')}</Link>
                        <Link to="/properties" onClick={() => setIsOpen(false)}>{t('properties')}</Link>
                        <Link to="/services" onClick={() => setIsOpen(false)}>{t('services')}</Link>
                        <Link to="/about" onClick={() => setIsOpen(false)}>{t('about')}</Link>
                        <Link to="/contact" onClick={() => setIsOpen(false)}>{t('contact')}</Link>
                    </div>
                    <div className="nav-actions">
                        <button className="lang-toggle" onClick={toggleLanguage}>
                            <Globe size={18} />
                            <span className="lang-label">{language === 'en' ? 'عربي' : 'EN'}</span>
                        </button>
                        <div className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X color="#c9a84c" /> : <Menu color="#c9a84c" />}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export const Footer = () => {
    const { t } = useLanguage();
    
    return (
        <footer className="footer">
            <div className="container footer-grid">
                <div className="footer-info">
                    <h3>BIN THANI</h3>
                    <p>{t('luxuryRealEstate')}</p>
                    <div className="social-links">
                        <a href="https://www.facebook.com/share/1CKmiQDoqX/?mibextid=wwXIfr" target="_blank" rel="noreferrer"><Facebook size={20} /></a>
                        <a href="https://www.instagram.com/bin_thani1?igsh=MTNzZHJzZnhtcm1raA%3D%3D&utm_source=qr" target="_blank" rel="noreferrer"><Instagram size={20} /></a>
                        <a href="https://www.tiktok.com/@binthani.realestate?_r=1&_t=ZS-94cTyhzej2e" target="_blank" rel="noreferrer" title="TikTok">
                            <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
                                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                            </svg>
                        </a>
                    </div>
                </div>
                <div className="footer-links">
                    <h4>{t('quickLinks')}</h4>
                    <ul>
                        <li><Link to="/properties">{t('properties')}</Link></li>
                        <li><Link to="/services">{t('services')}</Link></li>
                        <li><Link to="/about">{t('about')}</Link></li>
                        <li><Link to="/contact">{t('contact')}</Link></li>
                    </ul>
                </div>
                <div className="footer-contact">
                    <h4>{t('contactUs')}</h4>
                    <p><Phone size={16} /> <a href="tel:+971557626912" style={{ color: 'inherit', textDecoration: 'none' }}>+971 55 762 6912</a></p>
                    <p><Phone size={16} /> <a href="tel:+971556611400" style={{ color: 'inherit', textDecoration: 'none' }}>+971 55 661 1400</a></p>
                    <p><Mail size={16} /> <a href="mailto:info@binthanirealestate.ae" style={{ color: 'inherit', textDecoration: 'none' }}>info@binthanirealestate.ae</a></p>
                    <p>Muwaileh Sharjah, United Arab Emirates</p>
                </div>
                <div className="footer-newsletter">
                    <h4>{t('newsletter')}</h4>
                    <form className="newsletter-form">
                        <input type="email" placeholder={t('yourEmail')} />
                        <button type="submit" className="btn-primary">{t('join')}</button>
                    </form>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 Bin Thani Real Estate. {t('copyright')}</p>
            </div>
        </footer>
    );
};

export const WhatsAppButton = () => {
    return (
        <a href="https://wa.me/971557626912" className="whatsapp-btn" target="_blank" rel="noreferrer">
            <MessageCircle size={32} />
        </a>
    );
};
