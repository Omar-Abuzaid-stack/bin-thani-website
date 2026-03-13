import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Phone, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const About = () => {
    const { t, language } = useLanguage();

    const stats = [
        { number: '500+', label: t('propertiesSold') },
        { number: '15+', label: t('yearsExperience') },
        { number: '200+', label: t('happyClients') },
        { number: '50+', label: t('developers') }
    ];

    const values = [
        { title: t('expertKnowledge'), desc: t('expertKnowledgeDesc') },
        { title: t('personalizedService'), desc: t('personalizedServiceDesc') },
        { title: t('trustedPartner'), desc: t('trustedPartnerDesc') }
    ];

    return (
        <>
            <Helmet>
                <title>{language === 'ar' ? 'من نحن | بن ثاني للعقارات' : 'About Us | Bin Thani Real Estate'}</title>
            </Helmet>
            
            <div className={`about-page ${language === 'ar' ? 'rtl' : ''}`}>
                <section className="about-hero">
                    <div className="container">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="page-title">{t('aboutHeroTitle')}</h1>
                            <p className="page-subtitle">{t('aboutHeroSubtitle')}</p>
                        </motion.div>
                    </div>
                </section>

                <section className="founder-section">
                    <div className="container">
                        <div className="founder-grid">
                            <motion.div 
                                className="founder-text"
                                initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="label">{t('founderLabel')}</span>
                                <h2 className="name">{t('founderName')}</h2>
                                <div className="bio">
                                    <p>{t('founderBio1')}</p>
                                    <p>{t('founderBio2')}</p>
                                    <p>{t('founderBio3')}</p>
                                </div>
                                <div className="founder-contact">
                                    <a href="tel:+971557626912">
                                        <Phone size={18} />
                                        <span>+971 55 762 6912</span>
                                    </a>
                                    <a href="mailto:info@binthanirealestate.ae">
                                        <Mail size={18} />
                                        <span>info@binthanirealestate.ae</span>
                                    </a>
                                </div>
                            </motion.div>
                            <motion.div 
                                className="founder-image"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="img-wrapper">
                                    <img src="/BinThaniOwner.png" alt={t('founderName')} />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className="stats-section">
                    <div className="container">
                        <div className="stats-grid">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="stat-card">
                                    <div className="stat-num">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="values-section">
                    <div className="container">
                        <div className="section-header">
                            <span className="label">{t('whyUs')}</span>
                            <h2 className="title">{t('ourValues')}</h2>
                        </div>
                        <div className="values-grid">
                            {values.map((v, idx) => (
                                <motion.div 
                                    key={idx} 
                                    className="value-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <h3>{v.title}</h3>
                                    <p>{v.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="container">
                        <div className="cta-card">
                            <h2>{t('readyToWork')}</h2>
                            <p>{t('getInTouchDesc')}</p>
                            <div className="btns">
                                <Link to="/contact" className="btn btn-gold">{t('contactUs')}</Link>
                                <Link to="/properties" className="btn btn-outline">{t('viewProperties')}</Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .about-page { background: #080808; color: #fff; padding-bottom: 0; }
                .rtl { direction: rtl; }
                
                .about-hero { height: 60vh; min-height: 400px; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80'); background-size: cover; background-position: center; }
                .page-title { font-family: 'Cormorant Garamond', serif; font-size: 4rem; margin-bottom: 20px; }
                .page-subtitle { font-size: 1.2rem; color: #B8960C; letter-spacing: 2px; text-transform: uppercase; }
                
                .founder-section { padding: 100px 0; background: #0a0a0a; }
                .founder-grid { display: grid; grid-template-columns: 1fr 450px; gap: 80px; align-items: center; }
                .founder-text .label { color: #B8960C; text-transform: uppercase; letter-spacing: 3px; font-size: 0.9rem; display: block; margin-bottom: 15px; }
                .founder-text .name { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; margin-bottom: 30px; }
                .bio p { line-height: 1.8; color: #888; margin-bottom: 20px; font-size: 1.05rem; }
                .founder-contact { display: flex; gap: 30px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #222; }
                .founder-contact a { display: flex; align-items: center; gap: 10px; color: #B8960C; text-decoration: none; font-size: 0.95rem; }
                
                .img-wrapper { position: relative; border: 2px solid #B8960C; padding: 15px; border-radius: 8px; }
                .img-wrapper img { width: 100%; height: 550px; object-fit: cover; border-radius: 4px; }
                
                .stats-section { padding: 60px 0; background: #111; border-top: 1px solid #222; border-bottom: 1px solid #222; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; text-align: center; }
                .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; color: #B8960C; margin-bottom: 5px; }
                .stat-label { color: #888; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 2px; }
                
                .values-section { padding: 100px 0; }
                .section-header { text-align: center; margin-bottom: 60px; }
                .section-header .label { color: #B8960C; text-transform: uppercase; letter-spacing: 4px; font-size: 0.8rem; display: block; margin-bottom: 15px; }
                .section-header .title { font-family: 'Cormorant Garamond', serif; font-size: 3rem; }
                .values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
                .value-card { background: #111; padding: 50px 30px; border-radius: 12px; text-align: center; border: 1px solid transparent; transition: 0.3s; }
                .value-card:hover { border-color: #B8960C; transform: translateY(-5px); }
                .value-card h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; margin-bottom: 15px; color: #B8960C; }
                .value-card p { color: #888; font-size: 0.95rem; line-height: 1.7; }
                
                .cta-section { padding: 120px 0; background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&q=80'); background-size: cover; background-position: center; }
                .cta-card { text-align: center; max-width: 800px; margin: 0 auto; }
                .cta-card h2 { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; margin-bottom: 20px; }
                .cta-card p { font-size: 1.2rem; color: #888; margin-bottom: 40px; }
                .btns { display: flex; gap: 20px; justify-content: center; }
                .btn { padding: 15px 40px; border-radius: 6px; text-decoration: none; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; transition: 0.3s; }
                .btn-gold { background: #B8960C; color: #000; }
                .btn-gold:hover { background: #d4af37; transform: translateY(-3px); }
                .btn-outline { border: 1px solid #B8960C; color: #B8960C; }
                .btn-outline:hover { background: #B8960C; color: #000; transform: translateY(-3px); }
                
                @media (max-width: 992px) {
                    .founder-grid { grid-template-columns: 1fr; gap: 40px; }
                    .founder-image { order: -1; max-width: 400px; margin: 0 auto; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .values-grid { grid-template-columns: 1fr; }
                    .page-title { font-size: 3rem; }
                }
                @media (max-width: 768px) {
                    .page-title { font-size: 2.5rem; }
                    .founder-text .name { font-size: 2.5rem; }
                    .img-wrapper img { height: 400px; }
                    .stats-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
                    .stat-num { font-size: 2.5rem; }
                    .cta-card h2 { font-size: 2.22rem; }
                    .btns { flex-direction: column; }
                    .founder-contact { flex-direction: column; gap: 15px; }
                }
            `}} />
        </>
    );
};

export default About;
