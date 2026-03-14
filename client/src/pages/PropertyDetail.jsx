import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Bed, Bath, Square, Car, Calendar, MapPin, Phone, Mail, Send, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './PropertyDetail.css';

// Use VITE_API_URL if set, otherwise use Vercel /api/ path
const getApiUrl = (endpoint) => {
  if (import.meta.env.PROD) return `/api/${endpoint}`;
  const baseUrl = import.meta.env.VITE_API_URL;
  return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

const PropertyDetail = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [showEnquiry, setShowEnquiry] = useState(false);
    const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [mortgage, setMortgage] = useState({ price: 0, downPayment: 20, interestRate: 4.5, years: 25 });
    const [monthlyPayment, setMonthlyPayment] = useState(0);
    const { t, language, getContent } = useLanguage();

    useEffect(() => {
        fetchProperty();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (property && property.price_numeric) {
            calculateMortgage();
        }
    }, [mortgage, property]);

    const fetchProperty = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${getApiUrl('property')}?id=${id}`);
            if (res.data && !res.data.error) {
                setProperty(res.data);
                setMortgage(prev => ({ ...prev, price: res.data.price_numeric || 0 }));
            } else {
                setProperty(null);
            }
        } catch (err) {
            console.error('Error:', err);
            setProperty(null);
        }
        setLoading(false);
    };

    const calculateMortgage = () => {
        const principal = mortgage.price * (1 - mortgage.downPayment / 100);
        const monthlyRate = mortgage.interestRate / 100 / 12;
        const payments = mortgage.years * 12;
        
        if (monthlyRate === 0) {
            setMonthlyPayment(principal / payments);
            return;
        }
        
        const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
                       (Math.pow(1 + monthlyRate, payments) - 1);
        setMonthlyPayment(payment);
    };

    const handleEnquirySubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(getApiUrl('leads'), {
                name: enquiryForm.name,
                email: enquiryForm.email,
                phone: enquiryForm.phone,
                message: enquiryForm.message,
                interest: property?.title ? `Interest in: ${property.title}` : 'Buy',
                area: property?.location,
                budget: property?.price,
                source: 'property_enquiry'
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting enquiry:', err);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t('loadingProps')}</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="not-found-container">
                <h2>{t('propertyNotFound')}</h2>
                <Link to="/properties" className="btn-primary">{t('backToProperties')}</Link>
            </div>
        );
    }

    let images = [];
    if (property.images) {
        try {
            images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
        } catch (e) {
            images = [property.images];
        }
    }
    if (images.length === 0) images = ['https://via.placeholder.com/800x600?text=No+Image'];

    let amenities = [];
    if (property.amenities) {
        try {
            amenities = typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities;
        } catch (e) {
            amenities = property.amenities.split(',').map(s => s.trim());
        }
    }

    return (
        <div className={`property-detail-page ${language === 'ar' ? 'rtl' : ''}`}>
            <Helmet>
                <title>{getContent(property, 'title')} | {language === 'ar' ? 'بن ثاني للعقارات' : 'Bin Thani Real Estate'}</title>
            </Helmet>

            <div className="detail-hero-nav">
                <div className="container">
                    <Link to="/properties" className="back-link">
                        <ArrowLeft size={20} /> {t('backToProperties')}
                    </Link>
                </div>
            </div>

            <div className="container">
                <div className="detail-grid">
                    <div className="detail-main">
                        <div className="image-gallery">
                            <div className="main-image">
                                <img src={images[activeImage]} alt={getContent(property, 'title')} />
                                <span className={`status-badge ${property.status?.toLowerCase()}`}>
                                    {getContent(property, 'status')}
                                </span>
                            </div>
                            {images.length > 1 && (
                                <div className="thumbnail-grid">
                                    {images.map((img, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`thumbnail-item ${activeImage === idx ? 'active' : ''}`}
                                            onClick={() => setActiveImage(idx)}
                                        >
                                            <img src={img} alt="" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="property-info-card">
                            <div className="info-header">
                                <div className="left">
                                    <h1>{getContent(property, 'title')}</h1>
                                    <div className="location">
                                        <MapPin size={18} />
                                        <span>{getContent(property, 'location')}</span>
                                    </div>
                                </div>
                                <div className="right">
                                    <div className="price">
                                        {property.price_numeric > 0 
                                            ? `${language === 'ar' ? 'د.إ ' : 'AED '} ${property.price_numeric.toLocaleString()}`
                                            : (language === 'ar' ? 'تواصل لمعرفة السعر' : 'Contact for Details')
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="specs-grid">
                                <div className="spec">
                                    <Bed size={22} />
                                    <span>{property.bedrooms} {t('beds')}</span>
                                </div>
                                <div className="spec">
                                    <Bath size={22} />
                                    <span>{property.bathrooms} {t('baths')}</span>
                                </div>
                                <div className="spec">
                                    <Square size={22} />
                                    <span>{property.area ? property.area.replace(/sqft/i, t('sqft')) : ''}</span>
                                </div>
                                {property.parking > 0 && (
                                    <div className="spec">
                                        <Car size={22} />
                                        <span>{property.parking} {t('parking')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="description">
                                <h2>{t('description')}</h2>
                                <p>{getContent(property, 'description')}</p>
                            </div>

                            {amenities.length > 0 && (
                                <div className="amenities">
                                    <h2>{t('amenities')}</h2>
                                    <div className="amenities-list">
                                        {amenities.map((item, idx) => (
                                            <div key={idx} className="amenity">
                                                <Check size={16} />
                                                <span>{language === 'ar' ? t(item?.toLowerCase()) || item : item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {property.google_maps_embed && (
                            <div className="map-section">
                                <h2>{t('locationOnMap')}</h2>
                                <div className="map-wrapper">
                                    <iframe 
                                        src={property.google_maps_embed} 
                                        width="100%" 
                                        height="400" 
                                        style={{ border: 0 }} 
                                        allowFullScreen="" 
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        <div className="mortgage-calc">
                            <h2>{t('mortgageCalculator')}</h2>
                            <div className="calc-flex">
                                <div className="inputs">
                                    <div className="input-group">
                                        <label>{t('propertyPrice')}</label>
                                        <input 
                                            type="number" 
                                            value={mortgage.price}
                                            onChange={(e) => setMortgage({ ...mortgage, price: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="input-row">
                                        <div className="input-group">
                                            <label>{t('downPayment')} (%)</label>
                                            <input 
                                                type="number" 
                                                value={mortgage.downPayment}
                                                onChange={(e) => setMortgage({ ...mortgage, downPayment: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>{t('interestRate')} (%)</label>
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                value={mortgage.interestRate}
                                                onChange={(e) => setMortgage({ ...mortgage, interestRate: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>{t('loanTerm')} ({t('loanTerm')})</label>
                                        <input 
                                            type="number" 
                                            value={mortgage.years}
                                            onChange={(e) => setMortgage({ ...mortgage, years: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="result-card">
                                    <div className="monthly">
                                        <span className="label">{t('monthlyPayment')}</span>
                                        <span className="value">{language === 'ar' ? 'د.إ' : 'AED'} {Math.round(monthlyPayment).toLocaleString()}</span>
                                    </div>
                                    <div className="stats">
                                        <div className="stat">
                                            <span>{t('downPayment')}</span>
                                            <span>{language === 'ar' ? 'د.إ' : 'AED'} {Math.round(mortgage.price * mortgage.downPayment / 100).toLocaleString()}</span>
                                        </div>
                                        <div className="stat">
                                            <span>{t('loanAmount')}</span>
                                            <span>{language === 'ar' ? 'د.إ' : 'AED'} {Math.round(mortgage.price * (1 - mortgage.downPayment / 100)).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-sidebar">
                        <div className="contact-card">
                            <h3>{t('interestedProperty')}</h3>
                            <p>{t('getInTouch')}</p>
                            
                            {submitted ? (
                                <div className="success-msg">
                                    <Check size={40} />
                                    <p>{t('successMsg')}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleEnquirySubmit}>
                                    <input 
                                        type="text" 
                                        placeholder={t('yourName')} 
                                        required
                                        value={enquiryForm.name}
                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                                    />
                                    <input 
                                        type="tel" 
                                        placeholder={t('phoneNumber')} 
                                        required
                                        value={enquiryForm.phone}
                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                                    />
                                    <input 
                                        type="email" 
                                        placeholder={t('emailAddress')} 
                                        required
                                        value={enquiryForm.email}
                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                                    />
                                    <textarea 
                                        placeholder={t('yourMessage')}
                                        value={enquiryForm.message}
                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                                    ></textarea>
                                    <button type="submit" className="submit-btn">{t('sendEnquiry')}</button>
                                </form>
                            )}
                            
                            <div className="direct-contact">
                                <a href="tel:+971557626912" className="contact-link">
                                    <Phone size={18} />
                                    <span>+971 55 762 6912</span>
                                </a>
                                <a href="mailto:info@binthanirealestate.ae" className="contact-link">
                                    <Mail size={18} />
                                    <span>info@binthanirealestate.ae</span>
                                </a>
                            </div>
                        </div>

                        <div className="developer-info">
                            <h4>{t('developer')}</h4>
                            <p>{property.developer ? getContent(property, 'developer') : (language === 'ar' ? 'بن ثاني للعقارات' : 'Bin Thani Real Estate')}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .property-detail-page { padding-bottom: 80px; background: #080808; color: #fff; }
                .rtl { direction: rtl; }
                .detail-hero-nav { padding: 20px 0; border-bottom: 1px solid #222; margin-bottom: 30px; }
                .back-link { display: flex; align-items: center; gap: 8px; color: #B8960C; text-decoration: none; font-size: 0.9rem; }
                .detail-grid { display: grid; grid-template-columns: 1fr 380px; gap: 40px; }
                
                .image-gallery { margin-bottom: 40px; }
                .main-image { position: relative; width: 100%; height: 500px; border-radius: 12px; overflow: hidden; margin-bottom: 15px; }
                .main-image img { width: 100%; height: 100%; object-fit: cover; }
                .status-badge { position: absolute; top: 20px; left: 20px; background: #B8960C; color: #000; padding: 6px 15px; border-radius: 4px; font-weight: 600; font-size: 12px; }
                
                .thumbnail-grid { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; }
                .thumbnail-item { width: 100px; height: 70px; border-radius: 6px; overflow: hidden; cursor: pointer; flex-shrink: 0; opacity: 0.6; transition: 0.3s; border: 2px solid transparent; }
                .thumbnail-item.active { opacity: 1; border-color: #B8960C; }
                .thumbnail-item img { width: 100%; height: 100%; object-fit: cover; }
                
                .info-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
                .info-header h1 { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; margin-bottom: 10px; }
                .location { display: flex; align-items: center; gap: 8px; color: #888; }
                .price { font-size: 2rem; color: #B8960C; font-weight: 600; }
                
                .specs-grid { display: flex; gap: 30px; margin-bottom: 40px; padding: 25px; background: #111; border-radius: 12px; }
                .spec { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #888; }
                .spec span { color: #fff; font-size: 0.9rem; }
                .spec svg { color: #B8960C; }
                
                .description h2, .amenities h2, .map-section h2, .mortgage-calc h2 { font-size: 1.5rem; margin-bottom: 20px; color: #B8960C; border-bottom: 1px solid #222; padding-bottom: 10px; }
                .description p { line-height: 1.8; color: #ccc; margin-bottom: 40px; white-space: pre-line; }
                
                .amenities-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; margin-bottom: 40px; }
                .amenity { display: flex; align-items: center; gap: 10px; color: #ccc; }
                .amenity svg { color: #B8960C; }
                
                .map-wrapper { border-radius: 12px; overflow: hidden; margin-bottom: 40px; background: #111; }
                
                .calc-flex { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; background: #111; padding: 30px; border-radius: 12px; }
                .input-group { margin-bottom: 20px; }
                .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .input-group label { display: block; font-size: 12px; color: #888; margin-bottom: 8px; }
                .input-group input { width: 100%; padding: 12px; background: #222; border: 1px solid #333; color: #fff; border-radius: 6px; }
                .result-card { background: #B8960C; border-radius: 8px; padding: 30px; color: #000; display: flex; flex-direction: column; justify-content: center; }
                .monthly .label { display: block; font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px; }
                .monthly .value { font-size: 2.2rem; font-weight: 700; display: block; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 15px; margin-bottom: 15px; }
                .stats { display: flex; flex-direction: column; gap: 10px; }
                .stat { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 500; }
                
                .contact-card { background: #111; padding: 30px; border-radius: 12px; position: sticky; top: 100px; }
                .contact-card h3 { font-size: 1.3rem; margin-bottom: 10px; }
                .contact-card p { color: #888; font-size: 0.9rem; margin-bottom: 25px; }
                .contact-card form { display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px; }
                .contact-card input, .contact-card textarea { width: 100%; padding: 12px; background: #222; border: 1px solid #333; color: #fff; border-radius: 6px; }
                .contact-card textarea { height: 100px; resize: none; }
                .submit-btn { background: #B8960C; color: #000; padding: 14px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.3s; }
                .submit-btn:hover { background: #d4af37; transform: translateY(-2px); }
                .direct-contact { display: flex; flex-direction: column; gap: 15px; padding-top: 25px; border-top: 1px solid #222; }
                .contact-link { display: flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; font-size: 0.9rem; }
                .contact-link:hover { color: #B8960C; }
                
                .developer-info { margin-top: 20px; padding: 20px; background: rgba(184,150,12,0.05); border: 1px dashed rgba(184,150,12,0.3); border-radius: 8px; }
                .developer-info h4 { font-size: 0.8rem; text-transform: uppercase; color: #B8960C; margin-bottom: 5px; }
                .developer-info p { font-weight: 500; }
                
                .success-msg { text-align: center; padding: 30px 0; color: #22c55e; }
                
                @media (max-width: 992px) {
                    .detail-grid { grid-template-columns: 1fr; }
                    .detail-sidebar { order: 2; }
                    .calc-flex { grid-template-columns: 1fr; }
                    .main-image { height: 350px; }
                }
                
                @media (max-width: 600px) {
                    .info-header { flex-direction: column; gap: 15px; }
                    .price { font-size: 1.5rem; }
                    .specs-grid { flex-wrap: wrap; justify-content: space-around; }
                    .spec { min-width: 80px; }
                }
                
                .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #080808; color: #fff; }
                .loading-spinner { width: 50px; height: 50px; border: 3px solid rgba(184,150,12,0.2); border-top-color: #B8960C; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default PropertyDetail;
