import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Bot, PhoneCall, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import './Chatbot.css';

const getApiUrl = (endpoint) => {
    if (import.meta.env.PROD) return `/api/${endpoint}`;
    const baseUrl = import.meta.env.VITE_API_URL;
    return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

const OPTIONS = [
    { id: 'property', text: "🏠 I'm Interested in a Property" },
    { id: 'contact', text: "📞 Get Contact Number" },
    { id: 'payment', text: "💰 Payment Plans" },
    { id: 'location', text: "📍 Where are you located?" }
];

const RESPONSES = {
    property: `Great! We have amazing off-plan and ready properties across Sharjah. \nOur team would love to help you find your dream home!\n\n📞 Call/WhatsApp: +971 55 762 6912\n🕐 Available 7 days a week`,
    contact: `📞 You can reach us at:\n+971 55 762 6912\n\nFeel free to call or WhatsApp us anytime!`,
    payment: `We offer flexible payment plans on most of our off-plan projects. \nContact our team for details tailored to your budget.\n\n📞 Call/WhatsApp: +971 55 762 6912`,
    location: `📍 We are located in Muwaileh, Sharjah, UAE.\n\n📞 Call/WhatsApp: +971 55 762 6912\n🕐 Open 7 days a week`
};

const Chatbot = () => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    
    const initialMessage = '👋 Welcome to Bin Thani Real Estate! How can I help you today?';

    useEffect(() => {
        const saved = localStorage.getItem('chat_msgs_preset');
        if (!saved) {
            setMessages([{ role: 'assistant', content: initialMessage, isMenu: true }]);
        }
    }, [language]);

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_msgs_preset');
        return saved ? JSON.parse(saved) : [{ role: 'assistant', content: initialMessage, isMenu: true }];
    });
    
    const [isLoading, setIsLoading] = useState(false);
    
    const [sessionId] = useState(() => {
        const saved = localStorage.getItem('chat_session_preset');
        if (saved) return saved;
        const newId = `session_preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chat_session_preset', newId);
        return newId;
    });

    const scrollRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('chat_msgs_preset', JSON.stringify(messages));
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleOptionSelect = async (option) => {
        if (isLoading) return;

        const userMsg = { role: 'user', content: option.text };
        const botMsg = { role: 'assistant', content: RESPONSES[option.id], showActions: true };
        
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            await axios.post(getApiUrl('chat'), { 
                messages: newMessages.slice(-2), 
                sessionId,
                isPreset: true,
                botResponseText: botMsg.content
            });
        } catch (err) {
            console.error('Chat error:', err);
        } finally {
            setMessages(prev => [...prev, botMsg]);
            setIsLoading(false);
        }
    };

    const handleBackToMenu = () => {
        setMessages(prev => [...prev, { role: 'assistant', content: initialMessage, isMenu: true }]);
    };

    return (
        <div className={`chatbot-container ${language === 'ar' ? 'rtl' : ''}`}>
            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <MessageSquare size={26} />
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <Bot size={22} />
                            <div className="chatbot-header-text">
                                <h4>{language === 'ar' ? 'بن ثاني للعقارات' : 'Bin Thani Real Estate'}</h4>
                                <p>{t('onlineSupport')}</p>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}><X size={18} /></button>
                    </div>

                    <div className="chatbot-messages" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.role}`}>
                                <div className="message-content">
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                                    
                                    {m.isMenu && i === messages.length - 1 && (
                                        <div className="chatbot-options">
                                            {OPTIONS.map(opt => (
                                                <button 
                                                    key={opt.id} 
                                                    className="chatbot-option-btn"
                                                    onClick={() => handleOptionSelect(opt)}
                                                    disabled={isLoading}
                                                >
                                                    {opt.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {m.showActions && i === messages.length - 1 && (
                                        <div className="chatbot-actions">
                                            <a href="tel:+971557626912" className="chatbot-action-btn primary">
                                                <PhoneCall size={14} /> Call Now
                                            </a>
                                            <a href="https://wa.me/971557626912" target="_blank" rel="noreferrer" className="chatbot-action-btn whatsapp">
                                                <MessageCircle size={14} /> WhatsApp Us
                                            </a>
                                            <button 
                                                className="chatbot-action-btn secondary"
                                                onClick={handleBackToMenu}
                                            >
                                                🔙 Back to Menu
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message assistant">
                                <div className="typing-indicator"><span></span><span></span><span></span></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
