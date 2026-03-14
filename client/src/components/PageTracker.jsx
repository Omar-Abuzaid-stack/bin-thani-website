import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const getApiUrl = (endpoint) => {
    if (import.meta.env.PROD) return `/api/${endpoint}`;
    const baseUrl = import.meta.env.VITE_API_URL;
    return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

const PageTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const trackPageView = async () => {
            try {
                await axios.post(getApiUrl('track'), {
                    path: location.pathname + location.search,
                    referrer: document.referrer || 'direct'
                });
            } catch (err) {
                // Silently fail as tracking shouldn't break the UI
                console.log('Tracking failed:', err.message);
            }
        };

        trackPageView();
    }, [location]);

    return null;
};

export default PageTracker;
