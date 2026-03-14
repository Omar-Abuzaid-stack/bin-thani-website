import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const getApiUrl = (endpoint) => {
    if (import.meta.env.PROD) return `/api/${endpoint}`;
    const baseUrl = import.meta.env.VITE_API_URL;
    return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

const PageTracker = () => {
    const location = useLocation();
    const enterTime = useRef(Date.now());
    const hasTrackedEnter = useRef(false);

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const deviceType = isMobile ? 'Mobile' : 'Desktop';
        const currentPath = location.pathname + location.search;

        if (!hasTrackedEnter.current) {
            hasTrackedEnter.current = true;
            try {
                fetch(getApiUrl('track'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'enter',
                        path: currentPath,
                        device: deviceType
                    })
                });
            } catch (err) {}
        }

        const handleUnload = () => {
            const timeSpent = Date.now() - enterTime.current;
            const data = JSON.stringify({
                action: 'leave',
                path: window.location.pathname + window.location.search,
                timeSpent: timeSpent
            });

            // Use keepalive fetch to assure the request completes as user exits
            try {
                fetch(getApiUrl('track'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    keepalive: true,
                    body: data
                });
            } catch (err) {}
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []); // Empty dependency array to mount only once and track entry/exit accurately

    useEffect(() => {
        // Track simple page changes internally without sending Telegram, or we could.
        // User just asked for website entering/leaving. We track the initial entry above.
    }, [location]);

    return null;
};

export default PageTracker;
