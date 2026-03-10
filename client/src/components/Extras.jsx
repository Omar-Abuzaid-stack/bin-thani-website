import React, { useState, useEffect } from 'react';
import './Extras.css';

export const CookieBanner = () => {
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
        <div className="cookie-banner fade-in">
            <div className="container banner-content">
                <p>We use cookies to ensure you get the best experience on our website. <a href="/privacy">Learn more</a></p>
                <button className="btn-primary" onClick={handleAccept}>Accept</button>
            </div>
        </div>
    );
};

export const LoadingScreen = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return (
        <div className="loading-screen">
            <div className="loader-logo">
                <span className="gold">BIN</span> THANI
            </div>
            <div className="loader-bar"></div>
        </div>
    );
};
