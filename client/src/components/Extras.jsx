import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Extras.css';

export const CookieBanner = () => {
    const { t, language } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setTimeout(() => setIsVisible(true), 2000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={`cookie-banner fade-in ${language === 'ar' ? 'rtl' : ''}`}>
            <div className="container banner-content">
                <p>{t('cookieText')} <a href="/privacy">{t('privacyPolicy')}</a></p>
                <button className="btn-primary" onClick={handleAccept}>{t('accept')}</button>
            </div>
        </div>
    );
};

export const LoadingScreen = () => {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return (
        <div className="loading-screen">
            <div className={`loader-logo ${language === 'ar' ? 'rtl' : ''}`}>
                <span className="gold">{language === 'ar' ? 'بن' : 'BIN'}</span> {language === 'ar' ? 'ثاني' : 'THANI'}
            </div>
            <div className="loader-bar"></div>
            <div className="loader-text">{t('loading')}</div>
        </div>
    );
};
