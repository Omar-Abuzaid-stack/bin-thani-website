import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import './Chatbot.css';

const getApiUrl = (endpoint) => {
    if (import.meta.env.PROD) return `/api/${endpoint}`;
    const baseUrl = import.meta.env.VITE_API_URL;
    return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

const Chatbot = () => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    
    const initialMessage = language === 'ar' 
        ? 'مرحباً! أنا ليلى من بن ثاني للعقارات. كيف يمكنني مساعدتكم في البحث عن عقار فاخر في الإمارات اليوم؟'
        : 'Marhaba! I am Layla from Bin Thani Real Estate. How can I assist you with your luxury property search in UAE today?';

    useEffect(() => {
        const saved = localStorage.getItem('chat_msgs_v3');
        if (!saved) {
            setMessages([{ role: 'assistant', content: initialMessage }]);
        }
    }, [language, initialMessage]);

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_msgs_v3');
        return saved ? JSON.parse(saved) : [{ role: 'assistant', content: initialMessage }];
    });
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [sessionId] = useState(() => {
        const saved = localStorage.getItem('chat_session_v3');
        if (saved) return saved;
        const newId = `session_v3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chat_session_v3', newId);
        return newId;
    });

    const scrollRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('chat_msgs_v3', JSON.stringify(messages));
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await axios.post(getApiUrl('chat'), { 
                messages: newMessages.slice(-20), 
                sessionId,
                language // Pass language to backend if needed
            });
            setMessages(prev => [...prev, res.data]);

        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = language === 'ar' ? 'عذراً، أواجه مشكلة في الاتصال حالياً.' : 'Sorry, I am having trouble connecting.';
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
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
                                <div className="message-content">{m.content}</div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message assistant">
                                <div className="typing-indicator"><span></span><span></span><span></span></div>
                            </div>
                        )}
                    </div>

                    <div className="chatbot-input-area">
                        <form className="chatbot-form" onSubmit={handleSend}>
                            <input
                                className="chatbot-input"
                                type="text"
                                placeholder={t('typeMessage')}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <button className="chatbot-send" type="submit" disabled={isLoading || !input.trim()}>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
