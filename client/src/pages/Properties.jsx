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
    const { t } = useLanguage();

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

        // 1. Try Fuzzy Search first
        const fuse = new Fuse(properties, fuseOptions);
        const fuzzyResults = fuse.search(term).map(res => res.item);

        if (fuzzyResults.length > 0) return fuzzyResults;

        // 2. Fallback to Translation-aware Substring Match (for specific area names)
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
                <title>Properties - Bin Thani Real Estate</title>
                <meta name="description" content="Browse luxury properties across UAE" />
            </Helmet>
            
            <div className="properties-page">
                {/* Hero Section */}
                <section className="page-hero">
                    <div className="page-hero-bg" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80)'}}></div>
                    <div className="page-hero-overlay"></div>
                    <div className="container">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="page-title">
                                {filters.status === 'Off-Plan' ? 'Off-Plan Projects' : 
                                 filters.type === 'Rent' ? 'Properties for Rent' : 
                                 filters.type === 'Buy' ? 'Properties for Sale' : 'Our Properties'}
                            </h1>
                            <p className="page-subtitle">
                                {filters.status === 'Off-Plan' ? 'Exclusive Upcoming Developments' : 
                                 filters.type === 'Rent' ? 'Long-term and Short-term Luxury Leases' : 
                                 filters.type === 'Buy' ? 'Premium Homes Available for Purchase' : 'Discover Your Dream Home'}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Filters */}
                <section className="filters-section">
                    <div className="container">
                        <div className="filters-bar">
                            <div className="search-box">
                                <Search size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search by area, project, or property name..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <button 
                                className="filter-toggle"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={18} />
                                Filters
                            </button>
                        </div>
                        
                        {showFilters && (
                            <motion.div 
                                className="filters-panel"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div className="filter-group">
                                    <label>Property Type</label>
                                    <select name="type" value={filters.type} onChange={handleFilterChange}>
                                        <option value="">All Types</option>
                                        <option value="Buy">Buy</option>
                                        <option value="Rent">Rent</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Bedrooms</label>
                                    <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange}>
                                        <option value="">Any</option>
                                        <option value="1">1 Bedroom</option>
                                        <option value="2">2 Bedrooms</option>
                                        <option value="3">3 Bedrooms</option>
                                        <option value="4">4 Bedrooms</option>
                                        <option value="5">5+ Bedrooms</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Status</label>
                                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                                        <option value="">All</option>
                                        <option value="Off-Plan">Off-Plan</option>
                                        <option value="Ready">Ready</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Min Price (AED)</label>
                                    <select name="minPrice" value={filters.minPrice} onChange={handleFilterChange}>
                                        <option value="">Any</option>
                                        <option value="500000">500,000</option>
                                        <option value="1000000">1,000,000</option>
                                        <option value="2000000">2,000,000</option>
                                        <option value="5000000">5,000,000</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Max Price (AED)</label>
                                    <select name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange}>
                                        <option value="">Any</option>
                                        <option value="1000000">1,000,000</option>
                                        <option value="2000000">2,000,000</option>
                                        <option value="5000000">5,000,000</option>
                                        <option value="10000000">10,000,000+</option>
                                    </select>
                                </div>
                                <button className="clear-filters" onClick={clearFilters}>
                                    <X size={16} /> Clear
                                </button>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* Properties Grid */}
                <section className="properties-grid-section">
                    <div className="container">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Loading properties...</p>
                            </div>
                        ) : filteredProperties.length === 0 ? (
                            <div className="empty-state">
                                <Search size={48} className="empty-icon" />
                                <h3>No Properties Found</h3>
                                <p>We couldn't find any properties matching "{searchTerm}". Try different keywords or adjust your filters.</p>
                                <button className="btn-clear-search" onClick={() => setSearchTerm('')}>Clear Search</button>
                            </div>
                        ) : (
                            <div className="properties-grid">
                                {filteredProperties.map((property, index) => (
                                    <motion.div 
                                        key={property.id}
                                        className="property-card"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link to={`/property/${property.id}`}>
                                            <div className="property-image">
                                                <img 
                                                    src={getPropertyImage(property, index)} 
                                                    alt={property.title}
                                                />
                                                {property.status === 'Off-Plan' && (
                                                    <span className="property-badge">Off-Plan</span>
                                                )}
                                                {property.status === 'Ready' && property.type === 'Buy' && (
                                                    <span className="property-badge ready">For Sale</span>
                                                )}
                                                {property.type === 'Rent' && (
                                                    <span className="property-badge rent">For Rent</span>
                                                )}
                                            </div>
                                            <div className="property-info">
                                                <div className="property-price">{property.price}</div>
                                                <h3 className="property-title">{property.title}</h3>
                                                <div className="property-location">
                                                    <MapPin size={14} />
                                                    <span>{property.location}</span>
                                                </div>
                                                <div className="property-details">
                                                    {property.bedrooms > 0 && (
                                                        <span className="property-detail">
                                                            <Bed size={14} /> {property.bedrooms} Beds
                                                        </span>
                                                    )}
                                                    {property.bathrooms > 0 && (
                                                        <span className="property-detail">
                                                            <Bath size={14} /> {property.bathrooms} Baths
                                                        </span>
                                                    )}
                                                    <span className="property-detail">
                                                        <Square size={14} /> {property.area}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <style>{`
                .properties-page {
                    padding-top: 45px;
                }
                
                /* Page Hero */
                .page-hero {
                    position: relative;
                    height: 50vh;
                    min-height: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                
                .page-hero-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                }
                
                .page-hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(180deg, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.9) 100%);
                }
                
                .page-hero .container {
                    position: relative;
                    z-index: 10;
                }
                
                .page-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 4.5rem;
                    font-weight: 300;
                    color: #fff;
                    margin-bottom: 20px;
                    letter-spacing: 0.05em;
                }
                
                .page-subtitle {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 1rem;
                    color: #A8A8A8;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                }
                
                /* Filters */
                .filters-section {
                    background: #0a0a0a;
                    padding: 30px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .filters-bar {
                    display: flex;
                    gap: 15px;
                }
                
                .search-box {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 20px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                }
                
                .search-box svg {
                    color: #B8960C;
                }
                
                .search-box input {
                    flex: 1;
                    background: none;
                    border: none;
                    outline: none;
                    color: #fff;
                    font-size: 1rem;
                }
                
                .search-box input::placeholder {
                    color: #666;
                }
                
                .filter-toggle {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 25px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .filter-toggle:hover {
                    border-color: #B8960C;
                }
                
                .filters-panel {
                    display: flex;
                    gap: 20px;
                    margin-top: 20px;
                    padding: 25px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 12px;
                    flex-wrap: wrap;
                }
                
                .filter-group {
                    flex: 1;
                    min-width: 150px;
                }
                
                .filter-group label {
                    display: block;
                    font-size: 11px;
                    color: #A8A8A8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
                
                .filter-group select {
                    width: 100%;
                    padding: 12px 15px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 6px;
                    color: #fff;
                    font-size: 0.95rem;
                    cursor: pointer;
                }
                
                .filter-group select:focus {
                    outline: none;
                    border-color: #B8960C;
                }
                
                .clear-filters {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    background: none;
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 6px;
                    color: #A8A8A8;
                    cursor: pointer;
                    align-self: flex-end;
                }
                
                .clear-filters:hover {
                    color: #fff;
                    border-color: #fff;
                }
                
                /* Properties Grid */
                .properties-grid-section {
                    padding: 60px 0;
                    background: #080808;
                    min-height: 60vh;
                }
                
                .properties-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 30px;
                }
                
                .property-card {
                    background: #111111;
                    border: 1px solid transparent;
                    overflow: hidden;
                    transition: all 0.4s ease;
                }
                
                .property-card:hover {
                    border-color: #B8960C;
                    transform: translateY(-10px);
                }
                
                .property-image {
                    position: relative;
                    height: 260px;
                    overflow: hidden;
                }
                
                .property-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s ease;
                }
                
                .property-card:hover .property-image img {
                    transform: scale(1.08);
                }
                
                .property-badge {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: #B8960C;
                    color: #080808;
                    padding: 6px 14px;
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                
                .property-badge.ready {
                    background: #22c55e;
                    color: #fff;
                }

                .property-badge.rent {
                    background: #3b82f6;
                    color: #fff;
                }
                
                .property-info {
                    padding: 28px;
                }
                
                .property-price {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.6rem;
                    font-weight: 500;
                    color: #B8960C;
                    margin-bottom: 8px;
                }
                
                .property-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.2rem;
                    font-weight: 400;
                    color: #fff;
                    margin-bottom: 10px;
                    line-height: 1.4;
                }
                
                .property-location {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #888;
                    font-size: 13px;
                    margin-bottom: 18px;
                }
                
                .property-details {
                    display: flex;
                    gap: 20px;
                    padding-top: 18px;
                    border-top: 1px solid rgba(255,255,255,0.08);
                }
                
                .property-detail {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #888;
                    font-size: 12px;
                }
                
                /* Loading */
                .loading-state, .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                }
                
                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 2px solid rgba(184,150,12,0.2);
                    border-top-color: #B8960C;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .loading-state p, .empty-state p {
                    color: #888;
                }
                
                .empty-state h3 {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.8rem;
                    color: #fff;
                    margin-bottom: 10px;
                }
                
                @media (max-width: 1024px) {
                    .properties-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (max-width: 600px) {
                    .properties-grid {
                        grid-template-columns: 1fr;
                    }
                    .page-title {
                        font-size: 3rem;
                    }
                }
                .empty-icon {
                    color: #444;
                    margin-bottom: 20px;
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
            `}</style>
        </>
    );
};

export default Properties;
