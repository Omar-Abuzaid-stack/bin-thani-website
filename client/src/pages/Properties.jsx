import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, Square, Filter, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Properties.css';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
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
    }, [filters]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            const res = await axios.get(`http://localhost:5001/api/properties?${params}`);
            setProperties(res.data);
        } catch (err) {
            console.error('Error fetching properties:', err);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
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

    const getStatusClass = (status) => {
        const statusMap = {
            'Available': 'status-available',
            'Sold': 'status-sold',
            'Off-Plan': 'status-offplan',
            'New': 'status-new',
            'Featured': 'status-featured'
        };
        return statusMap[status] || 'status-available';
    };

    return (
        <div className="properties-page">
            <div className="properties-hero">
                <h1>{t('findDreamProperty')}</h1>
                <p>{t('browseExclusive')}</p>
                
                <div className="quick-search">
                    <input 
                        type="text" 
                        placeholder={t('searchPlaceholder')} 
                        value={filters.location}
                        onChange={handleFilterChange}
                        name="location"
                    />
                    <button className="search-btn"><Search size={20} /> {t('properties')}</button>
                </div>
            </div>

            <div className="properties-container">
                <div className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={20} /> {showFilters ? 'Hide' : 'Show'} Filters
                </div>

                {showFilters && (
                    <div className="filters-panel">
                        <div className="filter-group">
                            <label>Property Type</label>
                            <select name="type" value={filters.type} onChange={handleFilterChange}>
                                <option value="">{t('allTypes')}</option>
                                <option value="Villa">Villa</option>
                                <option value="Apartment">Apartment</option>
                                <option value="Townhouse">Townhouse</option>
                                <option value="Penthouse">Penthouse</option>
                                <option value="Office">Office</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Location</label>
                            <select name="location" value={filters.location} onChange={handleFilterChange}>
                                <option value="">{t('allAreas')}</option>
                                <option value="Sharjah">Sharjah</option>
                                <option value="Dubai">Dubai</option>
                                <option value="Abu Dhabi">Abu Dhabi</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Bedrooms</label>
                            <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange}>
                                <option value="">{t('anyBedrooms')}</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                                <option value="4">4+</option>
                                <option value="5">5+</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Price Range (AED)</label>
                            <div className="price-inputs">
                                <input 
                                    type="number" 
                                    placeholder={t('minPrice')} 
                                    name="minPrice"
                                    value={filters.minPrice}
                                    onChange={handleFilterChange}
                                />
                                <span>-</span>
                                <input 
                                    type="number" 
                                    placeholder={t('maxPrice')} 
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="filter-group">
                            <label>Status</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange}>
                                <option value="">{t('allStatus')}</option>
                                <option value="Available">{t('available')}</option>
                                <option value="Off-Plan">{t('offPlan')}</option>
                                <option value="Sold">{t('sold')}</option>
                            </select>
                        </div>
                        <button className="clear-filters" onClick={clearFilters}>
                            <X size={16} /> {t('clearAll')}
                        </button>
                    </div>
                )}

                <div className="results-count">
                    {properties.length} {t('propertiesFound')}
                </div>

                {loading ? (
                    <div className="loading">Loading properties...</div>
                ) : (
                    <div className="properties-grid">
                        {properties.map(property => {
                            const images = property.images ? JSON.parse(property.images) : [];
                            return (
                                <Link to={`/property/${property.id}`} key={property.id} className="property-card">
                                    <div className="property-image">
                                        <img src={images[0] || 'https://via.placeholder.com/400x300'} alt={property.title} />
                                        <span className={`status-badge ${getStatusClass(property.status)}`}>
                                            {property.status}
                                        </span>
                                    </div>
                                    <div className="property-info">
                                        <h3>{property.title}</h3>
                                        <p className="location"><MapPin size={14} /> {property.location}</p>
                                        <div className="property-details">
                                            <span><Bed size={14} /> {property.bedrooms} {t('beds')}</span>
                                            <span><Bath size={14} /> {property.bathrooms} {t('baths')}</span>
                                            <span><Square size={14} /> {property.area}</span>
                                        </div>
                                        <div className="property-price">
                                            {property.price}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {properties.length === 0 && !loading && (
                    <div className="no-results">
                        <h3>{t('noPropertiesFound')}</h3>
                        <p>{t('tryAdjustingFilters')}</p>
                        <button onClick={clearFilters}>{t('clearAll')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Properties;
