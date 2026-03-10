import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Bed, Bath, Square, Car, Calendar, MapPin, Phone, Mail, Send, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './PropertyDetail.css';

// Use VITE_API_URL if set, otherwise use Netlify functions path
const getApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  if (baseUrl) return `${baseUrl}/.netlify/functions/${endpoint}`;
  return `/.netlify/functions/${endpoint}`;
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
    const { t } = useLanguage();

    useEffect(() => {
        fetchProperty();
    }, [id]);

    useEffect(() => {
        if (property && property.price_numeric) {
            calculateMortgage();
        }
    }, [mortgage, property]);

    const fetchProperty = async () => {
        try {
            const res = await axios.get(getApiUrl('property') + `/${id}`);
            setProperty(res.data);
            setMortgage(prev => ({ ...prev, price: res.data.price_numeric || 0 }));
        } catch (err) {
            console.error('Error:', err);
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
                requirements: enquiryForm.message,
                interest: 'Buy',
                area: property?.location,
                budget: property?.price,
                source: 'property_enquiry'
            });
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting enquiry:', err);
        }
    };

    if (loading) return <div className="loading">Loading property...</div>;
    if (!property) return <div className="not-found">Property not found</div>;

    const images = property.images ? JSON.parse(property.images) : [];
    const amenities = property.amenities ? JSON.parse(property.amenities) : [];

    return (
        <div className="property-detail-page">
            <div className="detail-hero">
                <Link to="/properties" className="back-link">
                    <ArrowLeft size={20} /> {t('backToProperties')}
                </Link>
            </div>

            <div className="detail-container">
                <div className="detail-main">
                    <div className="image-gallery">
                        <div className="main-image">
                            <img src={images[activeImage] || 'https://via.placeholder.com/800x600'} alt={property.title} />
                            <span className={`status-tag ${property.status?.toLowerCase()}`}>{property.status}</span>
                        </div>
                        <div className="thumbnail-list">
                            {images.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    className={`thumbnail ${activeImage === idx ? 'active' : ''}`}
                                    onClick={() => setActiveImage(idx)}
                                >
                                    <img src={img} alt={`View ${idx + 1}`} />
                                </button>
                            ))}
                            {property.floor_plan && (
                                <button 
                                    className={`thumbnail ${activeImage === 'floorplan' ? 'active' : ''}`}
                                    onClick={() => setActiveImage('floorplan')}
                                >
                                    <img src={property.floor_plan} alt="Floor Plan" />
                                    <span>Floor Plan</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="property-header">
                        <div className="header-info">
                            <h1>{property.title}</h1>
                            <p className="location"><MapPin size={18} /> {property.location}</p>
                        </div>
                        <div className="property-price-detail">
                            {property.price}
                        </div>
                    </div>

                    <div className="property-features">
                        <div className="feature">
                            <Bed size={24} />
                            <span>{property.bedrooms} {t('beds')}</span>
                        </div>
                        <div className="feature">
                            <Bath size={24} />
                            <span>{property.bathrooms} {t('baths')}</span>
                        </div>
                        <div className="feature">
                            <Square size={24} />
                            <span>{property.area}</span>
                        </div>
                        <div className="feature">
                            <Car size={24} />
                            <span>{property.parking} Parking</span>
                        </div>
                        {property.year_built && (
                            <div className="feature">
                                <Calendar size={24} />
                                <span>Built in {property.year_built}</span>
                            </div>
                        )}
                    </div>

                    <div className="property-description">
                        <h2>{t('description')}</h2>
                        <p>{property.description}</p>
                    </div>

                    <div className="amenities-section">
                        <h2>{t('amenities')}</h2>
                        <div className="amenities-grid">
                            {amenities.map((amenity, idx) => (
                                <div key={idx} className="amenity-item">
                                    <Check size={16} /> {amenity}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="location-section">
                        <h2>{t('location')}</h2>
                        <div className="map-embed">
                            <iframe 
                                src={property.google_maps_embed} 
                                width="100%" 
                                height="400" 
                                style={{ border: 0, borderRadius: '15px' }}
                                allowFullScreen="" 
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>

                    <div className="mortgage-calculator">
                        <h2>{t('mortgageCalculator')}</h2>
                        <div className="calculator-grid">
                            <div className="calc-inputs">
                                <div className="calc-group">
                                    <label>{t('propertyPrice')}</label>
                                    <input 
                                        type="number" 
                                        value={mortgage.price}
                                        onChange={(e) => setMortgage({ ...mortgage, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="calc-group">
                                    <label>{t('downPayment')}</label>
                                    <input 
                                        type="range" 
                                        min="5" 
                                        max="50" 
                                        value={mortgage.downPayment}
                                        onChange={(e) => setMortgage({ ...mortgage, downPayment: Number(e.target.value) })}
                                    />
                                    <span>{mortgage.downPayment}%</span>
                                </div>
                                <div className="calc-group">
                                    <label>{t('interestRate')}</label>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="10" 
                                        step="0.1"
                                        value={mortgage.interestRate}
                                        onChange={(e) => setMortgage({ ...mortgage, interestRate: Number(e.target.value) })}
                                    />
                                    <span>{mortgage.interestRate}%</span>
                                </div>
                                <div className="calc-group">
                                    <label>{t('loanTerm')}</label>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="30" 
                                        value={mortgage.years}
                                        onChange={(e) => setMortgage({ ...mortgage, years: Number(e.target.value) })}
                                    />
                                    <span>{mortgage.years} years</span>
                                </div>
                            </div>
                            <div className="calc-result">
                                <div className="monthly-payment">
                                    <span className="label">{t('monthlyPayment')}</span>
                                    <span className="amount">AED {Math.round(monthlyPayment).toLocaleString()}</span>
                                </div>
                                <div className="payment-breakdown">
                                    <div className="breakdown-item">
                                        <span>{t('downPayment')}</span>
                                        <span>AED {Math.round(mortgage.price * mortgage.downPayment / 100).toLocaleString()}</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>{t('loanAmount')}</span>
                                        <span>AED {Math.round(mortgage.price * (1 - mortgage.downPayment / 100)).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="enquiry-card">
                        <h3>{t('interestedProperty')}</h3>
                        <p>{t('getInTouch')}</p>
                        
                        {!showEnquiry ? (
                            <button className="enquiry-btn" onClick={() => setShowEnquiry(true)}>
                                <Send size={18} /> {t('requestDetails')}
                            </button>
                        ) : submitted ? (
                            <div className="success-message">
                                <Check size={40} />
                                <h4>Thank You!</h4>
                                <p>We'll contact you shortly</p>
                            </div>
                        ) : (
                            <form className="enquiry-form" onSubmit={handleEnquirySubmit}>
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
                    </div>

                    <div className="developer-card">
                        <h4>{t('developer')}</h4>
                        <p>{property.developer || 'N/A'}</p>
                    </div>

                    <div className="contact-card">
                        <h4>{t('contactUs')}</h4>
                        <p><Phone size={16} /> +971 6 XXX XXXX</p>
                        <p><Mail size={16} /> info@binthani.ae</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetail;
