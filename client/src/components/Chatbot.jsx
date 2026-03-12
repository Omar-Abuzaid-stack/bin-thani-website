import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import './Chatbot.css';

// Direct Vercel /api/ path - no need for VITE_API_URL
// Use relative paths for Vercel serverless functions
const CHAT_API_URL = '/api/chat';
const LEADS_API_URL = '/api/leads';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();
    
    // Persist states in localStorage to support long conversations
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_messages');
        return saved ? JSON.parse(saved) : [{ role: 'assistant', content: 'Marhaba! I am Layla from Bin Thani Real Estate. How can I assist you with your luxury property search in UAE today?' }];
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

    // Save states whenever they change
    useEffect(() => {
        localStorage.setItem('chat_messages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        localStorage.setItem('chat_message_count', userMessageCount.toString());
    }, [userMessageCount]);

    useEffect(() => {
        localStorage.setItem('chat_show_lead_form', showLeadForm.toString());
    }, [showLeadForm]);

    useEffect(() => {
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
            // Keep only the last 40 messages to avoid huge payloads and hitting token limits
            const messagesToSend = newMessages.length > 40 ? newMessages.slice(-40) : newMessages;
            
            const res = await axios.post('/api/chat', { messages: messagesToSend, sessionId }, { timeout: 10000 });
            const assistantResponse = res.data;
            setMessages(prev => [...prev, assistantResponse]);

            // Show lead form after 2 messages
            if (userMessageCount + 1 >= 2 && !showLeadForm) {
                setTimeout(() => setShowLeadForm(true), 1500);
            }
        } catch (err) {
            console.error('Chat error:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Sorry, I am having trouble connecting. Please try again later.';
            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(LEADS_API_URL, {
                ...leadInfo,
                source: 'chatbot'
            }, { timeout: 10000 });
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Thank you ${leadInfo.name}! I've saved your details and one of our agents will contact you at ${leadInfo.email} shortly.` 
            }]);
            setShowLeadForm(false);
            setLeadInfo({ name: '', email: '', requirements: '' });
        } catch (err) {
            console.error('Lead submission error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Thank you! We have received your details and will contact you soon.' }]);
            setShowLeadForm(false);
        }
    };

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)} aria-label="Open chat">
                    <MessageSquare size={26} />
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <Bot size={22} />
                            </div>
                            <div className="chatbot-header-text">
                                <h4>Bin Thani Real Estate</h4>
                                <p>info@binthanirealestate.ae</p>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chatbot-messages" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.role}`}>
                                <div className="message-avatar">
                                    {m.role === 'assistant' ? <Bot size={14} /> : <span>{(i % 2) + 1}</span>}
                                </div>
                                <div className="message-content">{m.content}</div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message assistant">
                                <div className="message-avatar"><Bot size={14} /></div>
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {showLeadForm && (
                        <div className="lead-form">
                            <h4>Get in Touch</h4>
                            <input
                                type="text"
                                placeholder="Your Name"
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
                            <input
                                type="tel"
                                placeholder="Phone: +971 55 762 6912"
                                value={leadInfo.requirements}
                                onChange={(e) => setLeadInfo({ ...leadInfo, requirements: e.target.value })}
                            />
                            <button type="submit" onClick={handleLeadSubmit}>Submit</button>
                            <button type="button" className="skip-btn" onClick={() => setShowLeadForm(false)}>Continue Chatting</button>
                        </div>
                    )}

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <div className="chatbot-form">
                            <input
                                type="text"
                                className="chatbot-input"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <button type="submit" className="chatbot-send" disabled={isLoading || !input.trim()}>
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
