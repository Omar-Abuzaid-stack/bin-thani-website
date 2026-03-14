import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Check } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const Contact = () => {
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/leads', { ...formData, source: 'contact_page' });
            setSubmitted(true);
        } catch (err) {
            console.error('Error:', err);
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>{language === 'ar' ? 'اتصل بنا | بن ثاني للعقارات' : 'Contact Us | Bin Thani Real Estate'}</title>
            </Helmet>
            
            <div className={`contact-page ${language === 'ar' ? 'rtl' : ''}`}>
                <section className="contact-hero">
                    <div className="container">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="page-title">{t('contactHeroTitle')}</h1>
                            <p className="page-subtitle">{t('contactHeroSubtitle')}</p>
                        </motion.div>
                    </div>
                </section>

                <section className="contact-section">
                    <div className="container">
                        <div className="contact-grid">
                            <motion.div 
                                className="contact-info-list"
                                initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="info-block">
                                    <div className="icon"><MapPin size={24} /></div>
                                    <div className="content">
                                        <h3>{t('visitUs')}</h3>
                                        <p><a href="https://maps.app.goo.gl/SugwwCEYqJiPKSoA9?g_st=iw" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{t('sharjahOffice')}</a></p>
                                    </div>
                                </div>
                                <div className="info-block">
                                    <div className="icon"><Phone size={24} /></div>
                                    <div className="content">
                                        <h3>{t('callUs')}</h3>
                                        <p dir="ltr">+971 55 762 6912</p>
                                        <p dir="ltr">+971 55 661 1400</p>
                                    </div>
                                </div>
                                <div className="info-block">
                                    <div className="icon"><Mail size={24} /></div>
                                    <div className="content">
                                        <h3>{t('emailUs')}</h3>
                                        <p>info@binthanirealestate.ae</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="contact-form-card"
                                initial={{ opacity: 0, x: language === 'ar' ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                {submitted ? (
                                    <div className="success-notif">
                                        <Check size={50} />
                                        <h3>{language === 'ar' ? 'شكراً لك!' : 'Thank You!'}</h3>
                                        <p>{language === 'ar' ? 'تم استلام رسالتك بنجاح. سنرد عليك في أقرب وقت ممكن.' : "We've received your message and will get back to you shortly."}</p>
                                        <button className="btn-resend" onClick={() => setSubmitted(false)}>{language === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group">
                                            <label>{t('yourName')}</label>
                                            <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder={language === 'ar' ? 'أدخل اسمك' : 'Your full name'} />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('emailAddress')}</label>
                                            <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email address'} />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('phoneNumber')}</label>
                                            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder={language === 'ar' ? 'رقم الهاتف' : 'Your phone number'} />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('yourMessage')}</label>
                                            <textarea name="message" required rows="5" value={formData.message} onChange={handleChange} placeholder={language === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'} />
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={loading}>
                                            {loading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t('sendEnquiry')}
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </section>

                <div className="map-embed-section" style={{ position: 'relative' }}>
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14434.78635798485!2d55.456381!3d25.2976527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5f33f66f917b%3A0xffef002f2323cc9a!2sMuwaileh%2C%20Sharjah%2C%20UAE!5e0!3m2!1sen!2sae!4v1709214567890!5m2!1sen!2sae" 
                        width="100%" 
                        height="450" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy"
                    ></iframe>
                    <div style={{ position: 'absolute', bottom: '20px', left: language === 'ar' ? '20px' : 'auto', right: language === 'ar' ? 'auto' : '20px', zIndex: 10 }}>
                        <a href="https://maps.app.goo.gl/SugwwCEYqJiPKSoA9?g_st=iw" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 24px', background: '#B8960C', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                            <MapPin size={18} />
                            {language === 'ar' ? 'افتح في خرائط جوجل' : 'Open in Google Maps'}
                        </a>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .contact-page { background: #080808; color: #fff; }
                .rtl { direction: rtl; }
                
                .contact-hero { height: 50vh; min-height: 350px; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80'); background-size: cover; background-position: center; }
                .page-title { font-family: 'Cormorant Garamond', serif; font-size: 4rem; margin-bottom: 20px; }
                .page-subtitle { font-size: 1.1rem; color: #A8A8A8; text-transform: uppercase; letter-spacing: 3px; }
                
                .contact-section { padding: 100px 0; }
                .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 80px; align-items: start; }
                
                .info-block { display: flex; gap: 20px; margin-bottom: 40px; }
                .info-block .icon { color: #B8960C; }
                .info-block h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; margin-bottom: 10px; color: #B8960C; }
                .info-block p { color: #888; line-height: 1.6; }
                
                .contact-form-card { background: #111; padding: 50px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
                .form-group { margin-bottom: 25px; }
                .form-group label { display: block; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 10px; }
                .form-group input, .form-group textarea { width: 100%; padding: 15px; background: #222; border: 1px solid #333; color: #fff; border-radius: 8px; outline: none; transition: 0.3s; }
                .form-group input:focus, .form-group textarea:focus { border-color: #B8960C; }
                
                .submit-btn { width: 100%; padding: 18px; background: #B8960C; color: #000; border: none; border-radius: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; cursor: pointer; transition: 0.3s; }
                .submit-btn:hover:not(:disabled) { background: #d4af37; transform: translateY(-3px); }
                .submit-btn:disabled { opacity: 0.6; cursor: wait; }
                
                .success-notif { text-align: center; color: #22c55e; }
                .success-notif h3 { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; margin: 20px 0; }
                .success-notif p { color: #888; margin-bottom: 30px; }
                .btn-resend { background: none; border: 1px solid #B8960C; color: #B8960C; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
                
                @media (max-width: 992px) {
                    .contact-grid { grid-template-columns: 1fr; gap: 50px; }
                    .contact-form-card { padding: 30px; }
                }
                @media (max-width: 768px) {
                    .page-title { font-size: 2.5rem; }
                    .contact-hero { height: auto; padding: 120px 0 60px; }
                    .contact-section { padding: 60px 0; }
                    .submit-btn { padding: 15px; font-size: 0.9rem; }
                    .info-block { flex-direction: column; gap: 10px; text-align: center; align-items: center; }
                }
            `}} />
        </>
    );
};

export default Contact;
