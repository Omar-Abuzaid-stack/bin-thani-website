import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import './Chatbot.css';

const Chatbot = () => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    
    const initialMessage = language === 'ar' 
        ? 'مرحباً! أنا ليلى من بن ثاني للعقارات. كيف يمكنني مساعدتكم في البحث عن عقار فاخر في الإمارات اليوم؟'
        : 'Marhaba! I am Layla from Bin Thani Real Estate. How can I assist you with your luxury property search in UAE today?';

    useEffect(() => {
        const saved = localStorage.getItem('chat_messages');
        if (!saved) {
            setMessages([{ role: 'assistant', content: initialMessage }]);
        }
    }, [language, initialMessage]);

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_messages');
        return saved ? JSON.parse(saved) : [{ role: 'assistant', content: initialMessage }];
    });
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLeadForm, setShowLeadForm] = useState(() => localStorage.getItem('chat_show_lead_form') === 'true');
    const [leadInfo, setLeadInfo] = useState({ name: '', email: '', requirements: '' });
    const [userMessageCount, setUserMessageCount] = useState(() => parseInt(localStorage.getItem('chat_message_count') || '0', 10));
    
    const [sessionId] = useState(() => {
        const saved = localStorage.getItem('chat_session_id');
        if (saved) return saved;
        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chat_session_id', newId);
        return newId;
    });

    const scrollRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('chat_messages', JSON.stringify(messages));
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, showLeadForm]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setUserMessageCount(prev => prev + 1);

        try {
            const res = await axios.post('/api/chat', { 
                messages: newMessages.slice(-20), 
                sessionId,
                language // Pass language to backend if needed
            });
            setMessages(prev => [...prev, res.data]);

            if (userMessageCount >= 1 && !showLeadForm) {
                setTimeout(() => setShowLeadForm(true), 1500);
            }
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = language === 'ar' ? 'عذراً، أواجه مشكلة في الاتصال حالياً.' : 'Sorry, I am having trouble connecting.';
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/leads', { ...leadInfo, source: 'chatbot' });
            const successMsg = language === 'ar' 
                ? `شكراً لك ${leadInfo.name}! لقد تم استلام بياناتك وسنتواصل معك قريباً.`
                : `Thank you ${leadInfo.name}! I've saved your details and we will contact you shortly.`;
            setMessages(prev => [...prev, { role: 'assistant', content: successMsg }]);
            setShowLeadForm(false);
        } catch (err) {
            setShowLeadForm(false);
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

                    {showLeadForm && (
                        <div className="lead-form">
                            <h4>{t('getInTouch')}</h4>
                            <input type="text" placeholder={t('yourName')} value={leadInfo.name} onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })} />
                            <input type="email" placeholder={t('emailAddress')} value={leadInfo.email} onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })} />
                            <input type="tel" placeholder={t('phoneNumber')} value={leadInfo.requirements} onChange={(e) => setLeadInfo({ ...leadInfo, requirements: e.target.value })} />
                            <button onClick={handleLeadSubmit} className="btn-primary">{t('submit')}</button>
                            <button className="skip-btn" onClick={() => setShowLeadForm(false)}>{t('skip')}</button>
                        </div>
                    )}

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder={t('typeMessage')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}><Send size={18} /></button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
