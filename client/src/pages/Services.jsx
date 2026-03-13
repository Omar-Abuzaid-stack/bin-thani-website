import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Services = () => {
    const { t, language } = useLanguage();

    const servicesData = [
        {
            title: t('buyProperty'),
            description: t('buyDesc'),
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            link: '/properties?type=Buy'
        },
        {
            title: t('rentProperty'),
            description: t('rentDesc'),
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
            link: '/properties?type=Rent'
        },
        {
            title: t('investment'),
            description: t('investDesc'),
            image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800',
            link: '/contact'
        },
        {
            title: t('sellProperty'),
            description: t('sellPropertyDesc'),
            image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
            link: '/contact'
        },
        {
            title: t('propertyManagement'),
            description: t('propertyManagementDesc'),
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
            link: '/contact'
        },
        {
            title: t('mortgageAdvisory'),
            description: t('mortgageAdvisoryDesc'),
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
            link: '/contact'
        }
    ];

    return (
        <>
            <Helmet>
                <title>{language === 'ar' ? 'خدماتنا | بن ثاني للعقارات' : 'Our Services | Bin Thani Real Estate'}</title>
            </Helmet>
            
            <div className={`services-page ${language === 'ar' ? 'rtl' : ''}`}>
                <section className="services-hero">
                    <div className="container">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="page-title">{t('servicesHeroTitle')}</h1>
                            <p className="page-subtitle">{t('servicesHeroSubtitle')}</p>
                        </motion.div>
                    </div>
                </section>

                <section className="services-grid-section">
                    <div className="container">
                        <div className="services-grid">
                            {servicesData.map((service, index) => (
                                <motion.div 
                                    key={index}
                                    className="service-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link to={service.link}>
                                        <div className="img-wrapper">
                                            <img src={service.image} alt={service.title} />
                                            <div className="overlay"></div>
                                        </div>
                                        <div className="content">
                                            <h3>{service.title}</h3>
                                            <p>{service.description}</p>
                                            <span className="learn-more">
                                                {t('learnMore')} <ArrowRight size={16} />
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="container">
                        <div className="cta-content">
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
                .services-page { background: #080808; color: #fff; }
                .rtl { direction: rtl; }
                
                .services-hero { height: 50vh; min-height: 350px; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80'); background-size: cover; background-position: center; }
                .page-title { font-family: 'Cormorant Garamond', serif; font-size: 4rem; margin-bottom: 20px; }
                .page-subtitle { font-size: 1.1rem; color: #B8960C; text-transform: uppercase; letter-spacing: 3px; }
                
                .services-grid-section { padding: 100px 0; }
                .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
                .service-card { background: #111; border-radius: 12px; overflow: hidden; border: 1px solid transparent; transition: 0.4s; }
                .service-card:hover { border-color: #B8960C; transform: translateY(-10px); }
                .service-card a { text-decoration: none; color: inherit; }
                
                .img-wrapper { position: relative; height: 250px; overflow: hidden; }
                .img-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: 0.6s; }
                .service-card:hover .img-wrapper img { transform: scale(1.1); }
                .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)); }
                
                .content { padding: 30px; }
                .content h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; margin-bottom: 15px; color: #B8960C; }
                .content p { color: #888; font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px; height: 3.2em; overflow: hidden; }
                .learn-more { display: flex; align-items: center; gap: 8px; color: #fff; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
                
                .cta-section { padding: 100px 0; background: #0a0a0a; border-top: 1px solid #222; }
                .cta-content { text-align: center; }
                .cta-content h2 { font-family: 'Cormorant Garamond', serif; font-size: 3rem; margin-bottom: 20px; }
                .cta-content p { color: #888; margin-bottom: 40px; font-size: 1.1rem; }
                .btns { display: flex; gap: 20px; justify-content: center; }
                .btn { padding: 15px 40px; border-radius: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; transition: 0.3s; text-decoration: none; }
                .btn-gold { background: #B8960C; color: #000; }
                .btn-gold:hover { background: #d4af37; transform: translateY(-3px); }
                .btn-outline { border: 1px solid #B8960C; color: #B8960C; }
                .btn-outline:hover { background: #B8960C; color: #000; transform: translateY(-3px); }
                
                @media (max-width: 992px) {
                    .services-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 600px) {
                    .services-grid { grid-template-columns: 1fr; }
                    .page-title { font-size: 3rem; }
                }
            `}} />
        </>
    );
};

export default Services;
