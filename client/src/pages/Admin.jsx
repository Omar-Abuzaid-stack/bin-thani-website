import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Check, Search, MapPin, Building, Home, Layout, List, Key, MoreHorizontal, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Admin.css';

const getApiUrl = (endpoint) => {
  if (import.meta.env.PROD) return `/api/${endpoint}`;
  const baseUrl = import.meta.env.VITE_API_URL;
  return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

const Admin = () => {
    const { t, language } = useLanguage();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [adminView, setAdminView] = useState('Properties'); // 'Properties' or 'Projects'
    
    const [formData, setFormData] = useState({
        title: '', title_ar: '',
        developer: '', developer_ar: '',
        location: '', location_ar: '',
        price: '', price_numeric: '',
        type: 'Apartment', // Default to Apartment for props
        bedrooms: '', bathrooms: '',
        area: '', status: 'Available',
        description: '', description_ar: '',
        amenities: '',
        images: '',
    });

    useEffect(() => {
        fetchData();
    }, [adminView]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const typeParam = adminView === 'Projects' ? 'Off-Plan Project' : '';
            const url = typeParam 
                ? `${getApiUrl('properties')}?type=${encodeURIComponent(typeParam)}`
                : getApiUrl('properties');
            
            const res = await axios.get(url);
            
            // If viewing properties, filter OUT projects
            const filtered = adminView === 'Properties' 
                ? res.data.filter(p => p.type !== 'Off-Plan Project')
                : res.data;
                
            setProperties(filtered);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                type: adminView === 'Projects' ? 'Off-Plan Project' : formData.type,
                price_numeric: parseInt(String(formData.price_numeric).replace(/[^0-9]/g, '')) || 0,
                amenities: typeof formData.amenities === 'string' ? JSON.stringify(formData.amenities.split(',').map(s => s.trim())) : formData.amenities,
                images: typeof formData.images === 'string' ? JSON.stringify(formData.images.split('\n').filter(url => url.trim() !== '')) : formData.images
            };

            if (editingProperty) {
                await axios.put(`${getApiUrl('property')}?id=${editingProperty.id}`, dataToSubmit);
                alert('Success: Updated!');
            } else {
                await axios.post(getApiUrl('properties'), dataToSubmit);
                alert('Success: Added!');
            }
            
            setShowForm(false);
            setEditingProperty(null);
            fetchData();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleEdit = (property) => {
        let ams = '';
        try { const a = typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities; ams = Array.isArray(a) ? a.join(', ') : ''; } catch(e) { ams = ''; }
        let imgs = '';
        try { const i = typeof property.images === 'string' ? JSON.parse(property.images) : property.images; imgs = Array.isArray(i) ? i.join('\n') : ''; } catch(e) { imgs = ''; }

        setFormData({
            ...property,
            amenities: ams,
            images: imgs
        });
        setEditingProperty(property);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this item?')) {
            try {
                await axios.delete(`${getApiUrl('property')}?id=${id}`);
                fetchData();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    return (
        <div className={`admin-page ${language === 'ar' ? 'rtl' : ''}`}>
            <div className="container">
                <header className="admin-header">
                    <div>
                        <h1>{language === 'ar' ? 'لوحة التحكم' : 'Bin Thani Admin'}</h1>
                        <p>{adminView === 'Properties' ? 'Managing Listings' : 'Managing Developer Projects'}</p>
                    </div>
                    <div className="admin-view-toggle">
                        <button 
                            className={`toggle-btn ${adminView === 'Properties' ? 'active' : ''}`}
                            onClick={() => setAdminView('Properties')}
                        >
                            Properties
                        </button>
                        <button 
                            className={`toggle-btn ${adminView === 'Projects' ? 'active' : ''}`}
                            onClick={() => setAdminView('Projects')}
                        >
                            Developer Projects
                        </button>
                    </div>
                    <button className="btn-add" onClick={() => { 
                        setEditingProperty(null); 
                        setFormData({
                            title: '', title_ar: '', developer: '', developer_ar: '',
                            location: '', location_ar: '', price: '', price_numeric: '',
                            type: adminView === 'Properties' ? 'Apartment' : 'Off-Plan Project',
                            bedrooms: '', bathrooms: '', area: '', status: 'Available',
                            description: '', description_ar: '', amenities: '', images: '',
                        });
                        setShowForm(true); 
                    }}>
                        <Plus size={20} /> Add {adminView === 'Projects' ? 'Project' : 'Property'}
                    </button>
                </header>

                {showForm && (
                    <div className="form-modal">
                        <div className="form-container">
                            <div className="form-header">
                                <h2>{editingProperty ? 'Edit' : 'Add New'} {adminView === 'Projects' ? 'Project' : 'Property'}</h2>
                                <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="property-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Name (English)</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Name (Arabic)</label>
                                        <input type="text" name="title_ar" value={formData.title_ar} onChange={handleInputChange} />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Developer (English)</label>
                                        <input type="text" name="developer" value={formData.developer} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Developer (Arabic)</label>
                                        <input type="text" name="developer_ar" value={formData.developer_ar} onChange={handleInputChange} />
                                    </div>

                                    <div className="form-group">
                                        <label>Location (English)</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Location (Arabic)</label>
                                        <input type="text" name="location_ar" value={formData.location_ar} onChange={handleInputChange} />
                                    </div>

                                    <div className="form-group">
                                        <label>Price Display (e.g. AED 1.2M)</label>
                                        <input type="text" name="price" value={formData.price} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Price Numeric (e.g. 1200000)</label>
                                        <input type="number" name="price_numeric" value={formData.price_numeric} onChange={handleInputChange} />
                                    </div>

                                    {adminView === 'Properties' && (
                                        <>
                                            <div className="form-group">
                                                <label>Property Type</label>
                                                <select name="type" value={formData.type} onChange={handleInputChange}>
                                                    <option value="Apartment">Apartment</option>
                                                    <option value="Villa">Villa</option>
                                                    <option value="Townhouse">Townhouse</option>
                                                    <option value="Penthouse">Penthouse</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Status</label>
                                                <select name="status" value={formData.status} onChange={handleInputChange}>
                                                    <option value="Available">Available</option>
                                                    <option value="Off-Plan">Off-Plan</option>
                                                    <option value="New">New</option>
                                                    <option value="Sold">Sold</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {adminView === 'Projects' && (
                                        <div className="form-group">
                                            <label>Project Status</label>
                                            <select name="status" value={formData.status} onChange={handleInputChange}>
                                                <option value="Available">Available</option>
                                                <option value="Off-Plan Project / Available">Off-Plan Project / Available</option>
                                                <option value="Under Construction">Under Construction</option>
                                                <option value="Upcoming">Upcoming</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Bedrooms</label>
                                        <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} />
                                    </div>
                                    {adminView === 'Properties' && (
                                        <div className="form-group">
                                            <label>Bathrooms</label>
                                            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="form-group full-width">
                                    <label>Description (English)</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label>Description (Arabic)</label>
                                    <textarea name="description_ar" value={formData.description_ar} onChange={handleInputChange} rows="3"></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label>Amenities (Comma separated)</label>
                                    <textarea name="amenities" value={formData.amenities} onChange={handleInputChange} placeholder="Gym, Pool, Security" rows="2"></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label>Images (One URL per line)</label>
                                    <textarea name="images" value={formData.images} onChange={handleInputChange} rows="3"></textarea>
                                </div>
                                
                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-submit">{editingProperty ? 'Update' : 'Save'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="admin-content">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <div className="inventory-list">
                            <div className="inventory-header">
                                <span>Item</span>
                                <span>Developer</span>
                                <span>Price</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>
                            {properties.map(prop => (
                                <div key={prop.id} className="inventory-item">
                                    <span className="prop-title">{prop.title}</span>
                                    <span>{prop.developer}</span>
                                    <span className="prop-price">{prop.price}</span>
                                    <span><span className={`status-pill ${prop.status.toLowerCase().split(' ')[0]}`}>{prop.status}</span></span>
                                    <div className="actions">
                                        <button className="edit-btn" onClick={() => handleEdit(prop)}><Edit2 size={16} /></button>
                                        <button className="delete-btn" onClick={() => handleDelete(prop.id)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
