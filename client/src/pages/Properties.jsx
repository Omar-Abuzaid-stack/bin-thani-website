import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Bed, Bath, Square, X } from 'lucide-react';
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
        } catch (e) { /* use default */ }
    }
    return defaultImages[index % defaultImages.length];
};

/**
 * Format price by listing_type:
 *   buy      → AED 1,200,000
 *   off-plan → AED 1,200,000  (same as buy — total price)
 *   rent/yr  → AED 50,000/yr
 *   rent/mo  → AED 4,200/mo
 */
const formatPrice = (property, language) => {
    const num  = property.price_numeric;
    const pfx  = language === 'ar' ? 'د.إ ' : 'AED ';

    if (!num || num === 0) {
        return language === 'ar' ? 'تواصل لمعرفة السعر' : 'Contact for Details';
    }

    const fmt = Number(num).toLocaleString();

    if (property.listing_type === 'rent') {
        const sfx   = property.price_per === 'monthly' ? '/mo'  : '/yr';
        const sfxAr = property.price_per === 'monthly' ? '/شهر' : '/سنة';
        return `${pfx}${fmt}${language === 'ar' ? sfxAr : sfx}`;
    }

    // buy OR off-plan → plain total price
    return `${pfx}${fmt}`;
};

// Tab definitions
const TABS = [
    { key: 'buy',      label: '🏠 Buy',      labelAr: '🏠 للبيع',      badge: 'buy'     },
    { key: 'rent',     label: '🔑 Rent',     labelAr: '🔑 للإيجار',   badge: 'rent'    },
    { key: 'off-plan', label: '🏗️ Off-Plan', labelAr: '🏗️ على الخارطة', badge: 'offplan' },
];

const Properties = () => {
    const [properties, setProperties]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [listingTab, setListingTab]   = useState('buy');
    const [searchTerm, setSearchTerm]   = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { t, language, getContent }   = useLanguage();

    // Debounce search
    useEffect(() => {
        const h = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(h);
    }, [searchTerm]);

    const [filters, setFilters] = useState({
        type: '', location: '', bedrooms: '',
        minPrice: '', maxPrice: '', developer: ''
    });

    // Re-fetch whenever filters, search, or tab change
    useEffect(() => { fetchProperties(); }, [filters, debouncedSearch, listingTab]);

    // Parse query params on mount
    useEffect(() => {
        const p = new URLSearchParams(window.location.search);
        setFilters(prev => ({
            ...prev,
            type:      p.get('type')      || '',
            developer: p.get('developer') || ''
        }));
        setSearchTerm(p.get('location') || p.get('search') || '');
        if (p.get('listing') === 'rent')     setListingTab('rent');
        if (p.get('listing') === 'off-plan') setListingTab('off-plan');
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => {
                if (v && k !== 'location') params.append(k, v);
            });
            if (debouncedSearch) params.append('location', debouncedSearch);

            const res = await axios.get(getApiUrl('properties') + `?${params}`);

            // STRICT filtering:
            // 1. Never show Off-Plan Project type (those are in Developers/Projects section)
            // 2. Show only properties whose listing_type matches current tab
            //    Legacy properties (no listing_type) default to 'buy'
            const filtered = res.data.filter(p => {
                if (p.type === 'Off-Plan Project') return false; // ← Project section only
                const lt = p.listing_type || 'buy';
                return lt === listingTab;
            });
            setProperties(filtered);
        } catch (err) {
            console.error('Error fetching properties:', err);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ type: '', location: '', bedrooms: '', minPrice: '', maxPrice: '', developer: '' });
    };

    // Bilingual area map for fuzzy search
    const areaMap = {
        'sharjah': 'الشارقة', 'dubai': 'دبي', 'aljada': 'الجادة', 'masaar': 'مسار',
        'maryam island': 'جزيرة مريم', 'muwaileh': 'مويلحة', 'muwaila': 'مويلحة',
        'tilal': 'تلال', 'al mamsha': 'الممشى', 'hayyan': 'حيان', 'ready': 'جاهز',
        'off-plan': 'على الخريطة', 'palm jumeirah': 'نخلة جميرا', 'jumeirah': 'جميرا',
        'dubai marina': 'دبي مارينا', 'business bay': 'الخليج التجاري'
    };

    const fuseOptions = {
        keys: ['title', 'location', 'description', 'developer', 'project'],
        threshold: 0.4, distance: 100, includeScore: true, useExtendedSearch: true
    };

    const filteredProperties = React.useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return properties;

        const fuse = new Fuse(properties, fuseOptions);
        const fuzzy = fuse.search(term).map(r => r.item);
        if (fuzzy.length > 0) return fuzzy;

        let translated = '';
        for (const [en, ar] of Object.entries(areaMap)) {
            if (term.includes(en.toLowerCase())) translated = ar;
            if (term.includes(ar)) translated = en;
        }

        return properties.filter(p => {
            const m = (txt) => txt && (txt.toLowerCase().includes(term) || (translated && txt.toLowerCase().includes(translated.toLowerCase())));
            return m(p.title) || m(p.location) || m(p.description) || m(p.developer) || m(p.project);
        });
    }, [properties, searchTerm]);

    // Badge config per listing_type
    const getBadge = (lt) => {
        if (lt === 'rent')     return { cls: 'rent',    label: language === 'ar' ? 'إيجار'      : 'Rent'     };
        if (lt === 'off-plan') return { cls: 'offplan', label: language === 'ar' ? 'على الخارطة': 'Off-Plan' };
        return                        { cls: 'buy',     label: language === 'ar' ? 'بيع'        : 'Buy'      };
    };

    const currentTab = TABS.find(t => t.key === listingTab);

    return (
        <>
            <Helmet>
                <title>{language === 'ar' ? 'العقارات | بن ثاني للعقارات' : 'Properties | Bin Thani Real Estate'}</title>
            </Helmet>

            <div className={`properties-page ${language === 'ar' ? 'rtl' : ''}`}>
                <div className="properties-hero">
                    <div className="container">
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            {t('findDreamProperty')}
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            {t('browseExclusive')}
                        </motion.p>
                    </div>
                </div>

                <div className="container">
                    <div className="properties-content">

                        {/* ── Buy / Rent / Off-Plan Toggle ── */}
                        <div className="listing-type-toggle">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    id={`listing-tab-${tab.key}`}
                                    className={`listing-tab-btn ${tab.key === 'off-plan' ? 'offplan' : ''} ${listingTab === tab.key ? 'active' : ''}`}
                                    onClick={() => setListingTab(tab.key)}
                                >
                                    {language === 'ar' ? tab.labelAr : tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Search & Filters ── */}
                        <div className="luxury-search-container">
                            <div className="search-bar-wrapper">
                                <div className="search-input-box">
                                    <Search className="search-icon" size={20} />
                                    <input
                                        type="text"
                                        placeholder={language === 'ar' ? 'بحث عن طريق المنطقة، المشروع أو اسم العقار...' : 'Search by area, project or property name...'}
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                    <button className="gold-search-btn" onClick={fetchProperties}>
                                        {language === 'ar' ? 'بحث' : 'Search'}
                                    </button>
                                </div>
                            </div>

                            <div className="luxury-filters-container">
                                <div className="filters-row">
                                    <div className="filter-item">
                                        <select name="developer" value={filters.developer} onChange={handleFilterChange}>
                                            <option value="">{language === 'ar' ? 'المطور' : 'Developer'}</option>
                                            <option value="Arada">Arada</option>
                                            <option value="Alef Group">Alef Group</option>
                                            <option value="Eagle Hills">Eagle Hills</option>
                                            <option value="Tiger Group">Tiger Group</option>
                                            <option value="Shoumous">Shoumous</option>
                                            <option value="Al Tay Hills">Al Tay Hills</option>
                                            <option value="Manazil">Manazil</option>
                                            <option value="Al Marwan">Al Marwan</option>
                                            <option value="Diamond Developers">Diamond Developers</option>
                                            <option value="Ajmal Makan">Ajmal Makan</option>
                                            <option value="BEEAH">BEEAH</option>
                                        </select>
                                    </div>
                                    <div className="filter-item">
                                        <select name="type" value={filters.type} onChange={handleFilterChange}>
                                            <option value="">{language === 'ar' ? 'نوع العقار' : 'Property Type'}</option>
                                            <option value="Apartment">{language === 'ar' ? 'شقة' : 'Apartment'}</option>
                                            <option value="Villa">{language === 'ar' ? 'فيلا' : 'Villa'}</option>
                                            <option value="Townhouse">{language === 'ar' ? 'تاون هاوس' : 'Townhouse'}</option>
                                            <option value="Penthouse">{language === 'ar' ? 'بنتهاوس' : 'Penthouse'}</option>
                                        </select>
                                    </div>
                                    <div className="filter-item">
                                        <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange}>
                                            <option value="">{language === 'ar' ? 'غرف النوم' : 'Bedrooms'}</option>
                                            <option value="0">{language === 'ar' ? 'ستوديو' : 'Studio'}</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5+</option>
                                        </select>
                                    </div>
                                    <div className="filter-item">
                                        <input type="number" name="minPrice" placeholder={language === 'ar' ? 'أقل سعر (د.إ)' : 'Min Price (AED)'} value={filters.minPrice} onChange={handleFilterChange} />
                                    </div>
                                    <div className="filter-item">
                                        <input type="number" name="maxPrice" placeholder={language === 'ar' ? 'أقصى سعر (د.إ)' : 'Max Price (AED)'} value={filters.maxPrice} onChange={handleFilterChange} />
                                    </div>
                                    <button className="clear-filters-btn" onClick={clearFilters}>
                                        <X size={16} /> {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                                    </button>
                                </div>
                            </div>
                        </div>

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
                                <p>
                                    {searchTerm
                                        ? `${t('noMatchFor')} "${searchTerm}". ${t('adjustFilters')}`
                                        : (language === 'ar'
                                            ? `لا توجد عقارات ${listingTab === 'rent' ? 'للإيجار' : listingTab === 'off-plan' ? 'على الخارطة' : 'للبيع'} في الوقت الحالي.`
                                            : `No ${listingTab === 'rent' ? 'rental' : listingTab === 'off-plan' ? 'off-plan' : 'sale'} properties listed yet.`)
                                    }
                                </p>
                                {searchTerm && <button className="btn-clear-search" onClick={() => setSearchTerm('')}>{t('clearSearch')}</button>}
                            </div>
                        ) : (
                            <div className="properties-grid">
                                {filteredProperties.map((property, index) => {
                                    const badge = getBadge(property.listing_type);
                                    return (
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
                                                    <span className={`property-badge ${property.status?.toLowerCase().replace(' ', '-')}`}>
                                                        {getContent(property, 'status')}
                                                    </span>
                                                    <span className={`listing-type-badge ${badge.cls}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <div className="property-info">
                                                    <div className="property-price">
                                                        {formatPrice(property, language)}
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
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .properties-page.rtl { direction: rtl; }
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
                    border: 1px solid #c9a84c;
                    color: #c9a84c;
                    padding: 10px 25px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }
                .btn-clear-search:hover {
                    background: #c9a84c;
                    color: #080808;
                }
            `}} />
        </>
    );
};

export default Properties;
