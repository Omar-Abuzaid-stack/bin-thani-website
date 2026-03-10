import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User, Bot, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: t('welcomeMessage') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [leadInfo, setLeadInfo] = useState({ name: '', email: '', requirements: '' });
    const [userMessageCount, setUserMessageCount] = useState(0);
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setUserMessageCount(prev => prev + 1);

        try {
            const res = await axios.post('http://localhost:5001/api/chat', { messages: newMessages, sessionId });
            setMessages([...newMessages, res.data]);

            // Show lead form after 2 messages
            if (userMessageCount + 1 >= 2 && !showLeadForm) {
                setTimeout(() => setShowLeadForm(true), 1000);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I am having trouble connecting. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/leads', leadInfo);
            setMessages([...messages, { role: 'assistant', content: `Thank you ${leadInfo.name}! I've saved your details and one of our agents will contact you shortly.` }]);
            setShowLeadForm(false);
        } catch (err) {
            console.error('Lead submission error:', err);
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="chat-toggle" onClick={() => setIsOpen(true)}>
                    <span className="notification-dot"></span>
                    <MessageSquare size={28} />
                </button>
            )}

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="header-info">
                            <Bot size={24} color="#c9a84c" />
                            <div>
                                <h4>Bin Thani Assistant</h4>
                                <span>Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)}><X size={20} /></button>
                    </div>

                    <div className="messages" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.role}`}>
                                <div className="bubble">{m.content}</div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message assistant">
                                <div className="bubble loading">
                                    <Loader2 className="animate-spin" size={16} /> Typing...
                                </div>
                            </div>
                        )}

                        {showLeadForm && (
                            <div className="lead-form-overlay">
                                <form className="lead-form" onSubmit={handleLeadSubmit}>
                                    <h5>Quick Enquiry</h5>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        value={leadInfo.name}
                                        onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        required
                                        value={leadInfo.email}
                                        onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="What are you looking for?"
                                        required
                                        value={leadInfo.requirements}
                                        onChange={(e) => setLeadInfo({ ...leadInfo, requirements: e.target.value })}
                                    ></textarea>
                                    <button type="submit" className="btn-primary">Submit Info</button>
                                    <button type="button" className="skip-btn" onClick={() => setShowLeadForm(false)}>Maybe later</button>
                                </form>
                            </div>
                        )}
                    </div>

                    <form className="chat-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder={t('typeMessage')}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={showLeadForm}
                        />
                        <button type="submit" disabled={showLeadForm}><Send size={20} /></button>
                    </form>
                    <div className="chat-powered-by">
                        {t('poweredBy')}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
