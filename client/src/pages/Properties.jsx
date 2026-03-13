import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Bed, Bath, Square, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import './Properties.css';

// Use VITE_API_URL if set, otherwise use Vercel /api/ path
const getApiUrl = (endpoint) => {
  if (import.meta.env.PROD) return `/api/${endpoint}`;
  const baseUrl = import.meta.env.VITE_API_URL;
  return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

// Default luxury property images
const defaultImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'
];

const getPropertyImage = (property, index) => {
    if (property.images) {
        try {
            const images = JSON.parse(property.images);
            if (images && images[0]) return images[0];
        } catch (e) {
            // Use default
        }
    }
    return defaultImages[index % defaultImages.length];
};

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { t, language, getContent } = useLanguage();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const [filters, setFilters] = useState({
        type: '',
        location: '',
        bedrooms: '',
        minPrice: '',
        maxPrice: '',
        status: '',
        developer: ''
    });
    const [showFilters, setShowFilters] = useState(false);
 
    useEffect(() => {
        fetchProperties();
    }, [filters, debouncedSearch]);

    // Parse query params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setFilters(prev => ({
            ...prev,
            type: params.get('type') || '',
            status: params.get('status') || '',
            developer: params.get('developer') || ''
        }));
        setSearchTerm(params.get('location') || params.get('search') || '');
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value && key !== 'location') params.append(key, value);
            });
            
            // Add search term to backend query if any
            if (debouncedSearch) {
                params.append('location', debouncedSearch);
            }
            
            const res = await axios.get(getApiUrl('properties') + `?${params}`);
            setProperties(res.data);
        } catch (err) {
            console.error('Error fetching properties:', err);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Common area translations to help search work better in both languages
    const areaMap = {
        'sharjah': 'الشارقة',
        'dubai': 'دبي',
        'aljada': 'الجادة',
        'masaar': 'مسار',
        'maryam island': 'جزيرة مريم',
        'muwaileh': 'مويلحة',
        'muwaila': 'مويلحة',
        'tilal': 'تلال',
        'al mamsha': 'الممشى',
        'hayyan': 'حيان',
        'ready': 'جاهز',
        'off-plan': 'على الخريطة',
        'palm jumeirah': 'نخلة جميرا',
        'jumeirah': 'جميرا',
        'dubai marina': 'دبي مارينا',
        'business bay': 'الخليج التجاري'
    };

    // Fuse.js configuration for smart/fuzzy search
    const fuseOptions = {
        keys: ['title', 'location', 'description', 'developer', 'project'],
        threshold: 0.4, // Lower score is better match (0.0 is perfect, 1.0 is no match)
        distance: 100,
        includeScore: true,
        useExtendedSearch: true
    };

    // Instant smart fuzzy filtering
    const filteredProperties = React.useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return properties;

        const fuse = new Fuse(properties, fuseOptions);
        const fuzzyResults = fuse.search(term).map(res => res.item);

        if (fuzzyResults.length > 0) return fuzzyResults;

        let translatedTerm = '';
        for (const [en, ar] of Object.entries(areaMap)) {
            if (term.includes(en.toLowerCase())) translatedTerm = ar;
            if (term.includes(ar)) translatedTerm = en;
        }

        return properties.filter(p => {
            const matches = (text) => {
                if (!text) return false;
                const content = text.toLowerCase();
                return content.includes(term) || (translatedTerm && content.includes(translatedTerm.toLowerCase()));
            };

            return (
                matches(p.title) ||
                matches(p.location) ||
                matches(p.description) ||
                matches(p.developer) ||
                matches(p.project)
            );
        });
    }, [properties, searchTerm]);

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            type: '',
            location: '',
            bedrooms: '',
            minPrice: '',
            maxPrice: '',
            status: '',
            developer: ''
        });
    };

    return (
        <>
            <Helmet>
                <title>{language === 'ar' ? 'العقارات | بن ثاني للعقارات' : 'Properties | Bin Thani Real Estate'}</title>
            </Helmet>

            <div className={`properties-page ${language === 'ar' ? 'rtl' : ''}`}>
                <div className="properties-hero">
                    <div className="container">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {t('findDreamProperty')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {t('browseExclusive')}
                        </motion.p>
                    </div>
                </div>

                <div className="container">
                    <div className="properties-content">
                        {/* Search and Filter Bar */}
                        <div className="search-filter-bar">
                            <div className="search-box">
                                <Search size={20} />
                                <input 
                                    type="text" 
                                    placeholder={t('searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <button 
                                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={20} />
                                <span>{language === 'ar' ? 'تصفية' : 'Filters'}</span>
                            </button>
                        </div>

                        {/* Expandable Filters */}
                        <motion.div 
                            className="filters-panel"
                            initial={false}
                            animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="filters-grid">
                                <div className="filter-group">
                                    <label>{language === 'ar' ? 'النوع' : 'Property Type'}</label>
                                    <select name="type" value={filters.type} onChange={handleFilterChange}>
                                        <option value="">{t('allTypes')}</option>
                                        <option value="Buy">{language === 'ar' ? 'شراء' : 'Buy'}</option>
                                        <option value="Rent">{language === 'ar' ? 'إيجار' : 'Rent'}</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>{language === 'ar' ? 'الحالة' : 'Status'}</label>
                                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                                        <option value="">{t('allStatus')}</option>
                                        <option value="Ready">{t('available')}</option>
                                        <option value="Off-Plan">{t('offPlan')}</option>
                                        <option value="Sold">{t('sold')}</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>{language === 'ar' ? 'غرف النوم' : 'Bedrooms'}</label>
                                    <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange}>
                                        <option value="">{t('anyBedrooms')}</option>
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <option key={num} value={num}>{num}+</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>{t('minPrice')}</label>
                                    <input type="number" name="minPrice" placeholder="0" value={filters.minPrice} onChange={handleFilterChange} />
                                </div>
                                <div className="filter-group">
                                    <label>{t('maxPrice')}</label>
                                    <input type="number" name="maxPrice" placeholder={language === 'ar' ? 'أي' : 'Any'} value={filters.maxPrice} onChange={handleFilterChange} />
                                </div>
                                <button className="clear-all" onClick={clearFilters}>
                                    <X size={16} /> {t('clearAll')}
                                </button>
                            </div>
                        </motion.div>

                        <div className="results-header">
                            <p>{filteredProperties.length} {t('propertiesFound')}</p>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>{t('loadingProps')}</p>
                            </div>
                        ) : filteredProperties.length === 0 ? (
                            <div className="empty-state">
                                <Search size={48} className="empty-icon" />
                                <h3>{t('noPropertiesFound')}</h3>
                                <p>{t('noMatchFor')} "{searchTerm}". {t('adjustFilters')}</p>
                                <button className="btn-clear-search" onClick={() => setSearchTerm('')}>{t('clearSearch')}</button>
                            </div>
                        ) : (
                            <div className="properties-grid">
                                {filteredProperties.map((property, index) => (
                                    <motion.div 
                                        key={property.id}
                                        className="property-card"
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <Link to={`/property/${property.id}`}>
                                            <div className="property-image">
                                                <img src={getPropertyImage(property, index)} alt={getContent(property, 'title')} />
                                                <span className={`property-badge ${property.status?.toLowerCase()}`}>
                                                    {getContent(property, 'status')}
                                                </span>
                                            </div>
                                            <div className="property-info">
                                                <div className="property-price">
                                                    {property.price_numeric > 0 
                                                        ? `${language === 'ar' ? 'د.إ ' : 'AED '} ${property.price_numeric.toLocaleString()}`
                                                        : (language === 'ar' ? 'تواصل لمعرفة السعر' : 'Contact for Details')
                                                    }
                                                </div>
                                                <h3 className="property-title">{getContent(property, 'title')}</h3>
                                                <div className="property-location">
                                                    <MapPin size={16} />
                                                    <span>{getContent(property, 'location')}</span>
                                                </div>
                                                <div className="property-features">
                                                    {property.bedrooms > 0 && (
                                                        <div className="feature">
                                                            <Bed size={16} />
                                                            <span>{property.bedrooms} {t('beds')}</span>
                                                        </div>
                                                    )}
                                                    {property.bathrooms > 0 && (
                                                        <div className="feature">
                                                            <Bath size={16} />
                                                            <span>{property.bathrooms} {t('baths')}</span>
                                                        </div>
                                                    )}
                                                    <div className="feature">
                                                        <Square size={16} />
                                                        <span>{property.area ? property.area.replace(/sqft/i, t('sqft')) : ''}</span>
                                                    </div>
                                                </div>
                                                <button className="view-btn">{t('viewDetails')}</button>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .properties-page.rtl {
                    direction: rtl;
                }
                .empty-icon {
                    color: #444;
                    margin-bottom: 20px;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
                .btn-clear-search {
                    margin-top: 20px;
                    background: none;
                    border: 1px solid #B8960C;
                    color: #B8960C;
                    padding: 10px 25px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }
                .btn-clear-search:hover {
                    background: #B8960C;
                    color: #080808;
                }
                .filters-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    background: rgba(255,255,255,0.02);
                    padding: 20px;
                    border-radius: 12px;
                    align-items: flex-end;
                }
                .filter-group {
                    flex: 1;
                    min-width: 150px;
                }
                .filter-group label {
                    display: block;
                    font-size: 12px;
                    color: #888;
                    margin-bottom: 8px;
                }
                .filter-group select, .filter-group input {
                    width: 100%;
                    padding: 10px;
                    background: #222;
                    border: 1px solid #333;
                    color: #fff;
                    border-radius: 6px;
                }
                .clear-all {
                    padding: 10px 20px;
                    background: none;
                    border: 1px solid #444;
                    color: #888;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .clear-all:hover {
                    color: #fff;
                    border-color: #666;
                }
            `}} />
        </>
    );
};

export default Properties;
