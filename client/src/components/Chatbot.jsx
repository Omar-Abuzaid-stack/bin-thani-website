import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Bot, PhoneCall, MessageCircle, MapPin } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import './Chatbot.css';

const getApiUrl = (endpoint) => {
    if (import.meta.env.PROD) return `/api/${endpoint}`;
    const baseUrl = import.meta.env.VITE_API_URL;
    return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

const getOptions = (lang) => [
    { id: 'property', text: lang === 'ar' ? "🏠 أنا مهتم بعقار" : "🏠 I'm Interested in a Property" },
    { id: 'contact', text: lang === 'ar' ? "📞 الحصول على رقم التواصل" : "📞 Get Contact Number" },
    { id: 'payment', text: lang === 'ar' ? "💰 خطط الدفع" : "💰 Payment Plans" },
    { id: 'location', text: lang === 'ar' ? "📍 أين يقع مقركم؟" : "📍 Our Location" },
    { id: 'projects', text: lang === 'ar' ? "🏗️ مشاريعنا" : "🏗️ Our Projects" },
    { id: 'details', text: lang === 'ar' ? "📋 اترك بياناتك" : "📋 Leave Your Details" }
];

const getResponses = (lang) => ({
    property: {
        text: lang === 'ar' 
        ? `لدينا عقارات رائعة في جميع أنحاء الشارقة بما في ذلك الشقق والفلل ومنازل التاون هاوس ومشاريع على المخطط!\n\n🏡 أبرز المطورين:\n- أرادا • مجموعة ألف • إيجل هيلز\n- مجموعة تايجر • بيئة • أجمل مكان\n\nفريقنا مستعد لمساعدتك في العثور على منزل أحلامك!` 
        : `We have amazing properties across Sharjah including apartments, villas, townhouses and off-plan projects!\n\n🏡 Featured Developers:\n- Arada • Alef Group • Eagle Hills\n- Tiger Group • BEEAH • Ajmal Makan\n\nOur team is ready to help you find your dream home!`,
        actions: ['call', 'whatsapp', 'back']
    },
    contact: {
        text: lang === 'ar' 
        ? `📞 الرقم الأساسي: 971557626912+\n📞 الرقم الثانوي: 971556611400+\n\nلا تتردد في الاتصال أو مراسلتنا على واتساب في أي وقت!\n🕐 متاحون 7 أيام في الأسبوع` 
        : `📞 Primary: +971 55 762 6912\n📞 Secondary: +971 55 661 1400\n\nFeel free to call or WhatsApp us anytime!\n🕐 Available 7 days a week`,
        actions: ['whatsapp', 'back']
    },
    payment: {
        text: lang === 'ar' 
        ? `💰 نقدم خطط دفع مرنة على معظم مشاريعنا على المخطط بما في ذلك:\n\n✅ خطط دفع ما بعد التسليم\n✅ خيارات 0% فوائد\n✅ دفعة أولى تبدأ من 10%\n✅ أقساط تصل إلى 8 سنوات\n\nتواصل معنا للحصول على خطة تناسب ميزانيتك!` 
        : `💰 We offer flexible payment plans on most of our off-plan projects including:\n\n✅ Post-handover payment plans\n✅ 0% interest options\n✅ Down payment from 10%\n✅ Installments up to 8 years\n\nContact us for a plan tailored to your budget!`,
        actions: ['call', 'whatsapp', 'back']
    },
    location: {
        text: lang === 'ar' 
        ? `📍 نحن متواجدون في:\nمويلح، الشارقة، الإمارات العربية المتحدة\n\n🕐 مفتوح 7 أيام في الأسبوع\n📞 971557626912+` 
        : `📍 We are located in:\nMuwaileh, Sharjah, UAE\n\n🕐 Open 7 days a week\n📞 +971 55 762 6912`,
        actions: ['directions', 'call', 'back']
    },
    projects: {
        text: lang === 'ar' 
        ? `🏗️ نحن نمثل أفضل المشاريع في الشارقة:\n\n🌿 مسار — مجتمع غابة من أراداء\n🏙️ الجادة — مركز حضري من أراداء\n🌊 جزيرة مريم — واجهة مائية من إيجل هيلز\n🏡 حيان — مجتمع فلل من مجموعة ألف\n🌆 مدينة تلال — مجتمع متكامل\n🏢 تايجر سكاي تاور — برج شاهق مميز` 
        : `🏗️ We represent top projects in Sharjah:\n\n🌿 Masaar — Forest Community by Arada\n🏙️ Aljada — Urban Hub by Arada  \n🌊 Maryam Island — Waterfront by Eagle Hills\n🏡 Hayyan — Villa Community by Alef Group\n🌆 Tilal City — Master Community\n🏢 Tiger Sky Tower — Iconic High Rise`,
        actions: ['call', 'whatsapp', 'back']
    },
    details: {
        isForm: true,
        text: lang === 'ar' ? 'يرجى إدخال بياناتك حتى نتمكن من التواصل معك:' : 'Please enter your details so we can assist you:'
    }
});

const Chatbot = () => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    
    const initialMessage = language === 'ar' 
        ? '👋 مرحباً بكم في بن ثاني للعقارات!\n🏆 الوكالة الأكثر موثوقية في الشارقة\nكيف يمكنني مساعدتكم اليوم؟'
        : '👋 Welcome to Bin Thani Real Estate!\n🏆 Sharjah\'s Most Trusted Agency\nHow can I help you today?';

    useEffect(() => {
        const saved = localStorage.getItem('chat_msgs_preset_v2');
        if (!saved) {
            setMessages([{ role: 'assistant', content: initialMessage, isMenu: true }]);
        }
    }, [language]);

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_msgs_preset_v2');
        return saved ? JSON.parse(saved) : [{ role: 'assistant', content: initialMessage, isMenu: true }];
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', interest: 'General Enquiry' });

    const scrollRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('chat_msgs_preset_v2', JSON.stringify(messages));
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, isSubmitting, formData]);

    const handleOptionSelect = async (option) => {
        if (isLoading) return;

        const userMsg = { role: 'user', content: option.text };
        const responseData = getResponses(language)[option.id];
        
        const botMsg = { 
            role: 'assistant', 
            content: responseData.text, 
            actions: responseData.actions,
            isForm: responseData.isForm
        };
        
        if (responseData.isForm) {
            setFormData({ name: '', phone: '', email: '', interest: 'General Enquiry' });
        }

        const newMessages = [...messages, userMsg, botMsg];
        setMessages(newMessages);
    };

    const handleBackToMenu = () => {
        setMessages(prev => [...prev, { role: 'assistant', content: initialMessage, isMenu: true }]);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post(getApiUrl('leads'), {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                interest: formData.interest,
                source: 'Chatbot'
            });
            
            const successMsg = language === 'ar' 
                ? 'شكراً لك! فريقنا سيتواصل معك في أقرب وقت. 😊'
                : 'Thank you! Our team will contact you shortly. 😊';
                
            setMessages(prev => [
                ...prev, 
                { role: 'user', content: language === 'ar' ? 'تم تقديم النموذج' : 'Form submitted' },
                { role: 'assistant', content: successMsg, actions: ['back'] }
            ]);
        } catch (err) {
            console.error('Submit error:', err);
            const errorMsg = language === 'ar' 
                ? 'حدث خطأ. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.'
                : 'An error occurred. Please try again or contact us directly.';
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, actions: ['back'] }]);
        } finally {
            setIsSubmitting(false);
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
                            <Bot size={22} color="#D4A90F" />
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
                                            {getOptions(language).map(opt => (
                                                <button 
                                                    key={opt.id} 
                                                    className="chatbot-option-btn outline-gold-btn"
                                                    onClick={() => handleOptionSelect(opt)}
                                                    disabled={isLoading || isSubmitting}
                                                >
                                                    {opt.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {m.isForm && i === messages.length - 1 && (
                                        <form className="chatbot-form" onSubmit={handleFormSubmit}>
                                            <input 
                                                type="text" 
                                                required 
                                                placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                            <input 
                                                type="text" 
                                                required 
                                                placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                            <input 
                                                type="email" 
                                                required 
                                                placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                            <select 
                                                required
                                                value={formData.interest}
                                                onChange={(e) => setFormData({...formData, interest: e.target.value})}
                                            >
                                                {language === 'ar' ? (
                                                    <>
                                                        <option value="Apartment">شقة</option>
                                                        <option value="Villa">فيلا</option>
                                                        <option value="Townhouse">تاون هاوس</option>
                                                        <option value="Off-Plan">على المخطط</option>
                                                        <option value="General Enquiry">استفسار عام</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Apartment">Apartment</option>
                                                        <option value="Villa">Villa</option>
                                                        <option value="Townhouse">Townhouse</option>
                                                        <option value="Off-Plan">Off-Plan</option>
                                                        <option value="General Enquiry">General Enquiry</option>
                                                    </>
                                                )}
                                            </select>
                                            <button type="submit" disabled={isSubmitting} className="chatbot-action-btn primary mt-2">
                                                {isSubmitting ? '...' : (language === 'ar' ? 'إرسال' : 'Submit')}
                                            </button>
                                            <button type="button" onClick={handleBackToMenu} className="chatbot-action-btn secondary mt-1">
                                                {language === 'ar' ? '🔙 العودة للقائمة' : '🔙 Back to Menu'}
                                            </button>
                                        </form>
                                    )}

                                    {m.actions && i === messages.length - 1 && (
                                        <div className="chatbot-actions">
                                            {m.actions.includes('directions') && (
                                                <a href="https://maps.google.com/?q=Muwaileh,Sharjah" target="_blank" rel="noreferrer" className="chatbot-action-btn primary">
                                                    <MapPin size={14} /> {language === 'ar' ? 'الحصول على الاتجاهات' : 'Get Directions'}
                                                </a>
                                            )}
                                            {m.actions.includes('call') && (
                                                <a href="tel:+971557626912" className="chatbot-action-btn primary">
                                                    <PhoneCall size={14} /> {language === 'ar' ? 'اتصل الآن' : 'Call Now'}
                                                </a>
                                            )}
                                            {m.actions.includes('whatsapp') && (
                                                <a href="https://wa.me/971557626912" target="_blank" rel="noreferrer" className="chatbot-action-btn whatsapp">
                                                    <MessageCircle size={14} /> {language === 'ar' ? 'راسلنا على واتساب' : 'WhatsApp Us'}
                                                </a>
                                            )}
                                            {m.actions.includes('back') && (
                                                <button className="chatbot-action-btn secondary" onClick={handleBackToMenu}>
                                                    {language === 'ar' ? '🔙 العودة للقائمة' : '🔙 Back to Menu'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
