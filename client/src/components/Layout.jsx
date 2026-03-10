import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, Instagram, Facebook, Twitter, MessageCircle, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const marqueeMessages = [
    "🏆 Bin Thani Real Estate — Sharjah's Most Trusted Agency",
    "🏠 Premium Properties in Sharjah, Dubai & Abu Dhabi",
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
                        <Facebook size={20} />
                        <Instagram size={20} />
                        <Twitter size={20} />
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
                    <p><Phone size={16} /> +971 55 662 6912</p>
                    <p><Phone size={16} /> +971 55 761 1400</p>
                    <p><Mail size={16} /> info@binthanirealestate.ae</p>
                    <p>Muwaila, Sharjah, United Arab Emirates</p>
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
        <a href="https://wa.me/971500000000" className="whatsapp-btn" target="_blank" rel="noreferrer">
            <MessageCircle size={32} />
        </a>
    );
};
