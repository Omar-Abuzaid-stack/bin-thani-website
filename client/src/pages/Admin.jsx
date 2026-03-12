import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Check, Search, MapPin, Building, Home, Layout, List, Key, MoreHorizontal } from 'lucide-react';
import './Admin.css';

const getApiUrl = (endpoint) => {
  if (import.meta.env.PROD) return `/api/${endpoint}`;
  const baseUrl = import.meta.env.VITE_API_URL;
  return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

const Admin = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [adminStep, setAdminStep] = useState(1); // 1: Main (Buy/Rent), 2: Buy Options
    const [category, setCategory] = useState(''); // New state for category selection
    const [formData, setFormData] = useState({
        title: '',
        developer: '',
        project: '',
        location: '',
        price: '',
        price_numeric: '',
        type: 'Buy',
        bedrooms: '',
        bathrooms: '',
        area: '',
        status: 'Ready',
        description: '',
        amenities: '',
        images: '',
        payment_plan: ''
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const res = await axios.get(getApiUrl('properties'));
            setProperties(res.data);
        } catch (err) {
            console.error('Error fetching properties:', err);
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
                price_numeric: parseInt(formData.price.replace(/[^0-9]/g, '')) || 0,
                amenities: typeof formData.amenities === 'string' ? JSON.stringify(formData.amenities.split(',').map(s => s.trim())) : formData.amenities,
                images: typeof formData.images === 'string' ? JSON.stringify(formData.images.split('\n').filter(url => url.trim() !== '')) : formData.images
            };

            if (editingProperty) {
                await axios.put(`${getApiUrl('property')}?id=${editingProperty.id}`, dataToSubmit);
                alert('Property updated successfully!');
            } else {
                await axios.post(getApiUrl('properties'), dataToSubmit);
                alert('Property added successfully!');
            }
            
            setFormData({
                title: '', developer: '', project: '', location: '', price: '',
                price_numeric: '', type: 'Buy', bedrooms: '', bathrooms: '',
                area: '', status: 'Ready', description: '', amenities: '',
                images: '', payment_plan: ''
            });
            setShowForm(false);
            setEditingProperty(null);
            setCategory('');
            setAdminStep(1);
            fetchProperties();
        } catch (err) {
            console.error('Error saving property:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert(`Error saving property: ${errorMsg}`);
        }
    };

    const handleEdit = (property) => {
        let amenitiesStr = '';
        try {
            const amens = JSON.parse(property.amenities);
            amenitiesStr = Array.isArray(amens) ? amens.join(', ') : '';
        } catch (e) {
            amenitiesStr = property.amenities || '';
        }

        let imagesStr = '';
        try {
            const imgs = JSON.parse(property.images);
            imagesStr = Array.isArray(imgs) ? imgs.join('\n') : '';
        } catch (e) {
            imagesStr = property.images || '';
        }

        setFormData({
            title: property.title || '',
            developer: property.developer || '',
            project: property.project || '',
            location: property.location || '',
            price: property.price || '',
            price_numeric: property.price_numeric || '',
            type: property.type || 'Buy',
            bedrooms: property.bedrooms || '',
            bathrooms: property.bathrooms || '',
            area: property.area || '',
            status: property.status || 'Ready',
            description: property.description || '',
            amenities: amenitiesStr,
            images: imagesStr,
            payment_plan: property.payment_plan || ''
        });
        setEditingProperty(property);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                await axios.delete(`${getApiUrl('property')}?id=${id}`);
                fetchProperties();
            } catch (err) {
                console.error('Error deleting property:', err);
                alert('Error deleting property.');
            }
        }
    };

    return (
        <div className="admin-page">
            <div className="container">
                <header className="admin-header">
                    <div>
                        <h1>Property Management</h1>
                        <p>Total Properties: {properties.length}</p>
                    </div>
                    <button className="btn-add" onClick={() => {
                        setEditingProperty(null);
                        setCategory(''); // Reset category
                        setAdminStep(1); // Reset step
                        setFormData({
                            title: '', developer: '', project: '', location: '', price: '',
                            price_numeric: '', type: 'Buy', bedrooms: '', bathrooms: '',
                            area: '', status: 'Ready', description: '', amenities: '',
                            images: '', payment_plan: ''
                        });
                        setShowForm(true);
                    }}>
                        <Plus size={20} /> Add Property
                    </button>
                </header>

                {showForm && (
                    <div className="form-modal">
                        <div className="form-container">
                            <div className="form-header">
                                <h2>{editingProperty ? 'Edit Property' : 'Add New Property'}</h2>
                                <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
                            </div>
                            
                            {!category && !editingProperty ? (
                                <div className="category-selection">
                                    {adminStep === 1 ? (
                                        <>
                                            <h3>Choose Transaction Type</h3>
                                            <div className="category-buttons">
                                                <button className="cat-btn" onClick={() => { setAdminStep(2); }}>
                                                    <Home size={32} />
                                                    <span>Buy</span>
                                                </button>
                                                <button className="cat-btn" onClick={() => { 
                                                    setCategory('Rent'); 
                                                    setFormData({...formData, type: 'Rent', status: 'Ready'}); 
                                                }}>
                                                    <Key size={32} />
                                                    <span>Rent</span>
                                                </button>
                                                <button className="cat-btn" onClick={() => { 
                                                    setCategory('Others'); 
                                                    setFormData({...formData, type: 'Other', status: 'Ready'}); 
                                                }}>
                                                    <MoreHorizontal size={32} />
                                                    <span>Others</span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3>Choose Buy Option</h3>
                                            <div className="category-buttons">
                                                <button className="cat-btn" onClick={() => { 
                                                    setCategory('Buy Available'); 
                                                    setFormData({...formData, type: 'Buy', status: 'Ready'}); 
                                                }}>
                                                    <Check size={32} />
                                                    <span>Available (Ready)</span>
                                                </button>
                                                <button className="cat-btn" onClick={() => { 
                                                    setCategory('Off-Plan'); 
                                                    setFormData({...formData, type: 'Buy', status: 'Off-Plan'}); 
                                                }}>
                                                    <Building size={32} />
                                                    <span>Off-Plan</span>
                                                </button>
                                                <button className="back-btn" onClick={() => setAdminStep(1)}>Back</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="property-form">
                                    {(category || editingProperty) && (
                                        <div className="category-indicator">
                                            Category: <strong>{category || (editingProperty.status === 'Off-Plan' ? 'Off-Plan' : editingProperty.type === 'Rent' ? 'Rent' : 'Buy')}</strong>
                                            {!editingProperty && <button className="change-cat" onClick={() => { setCategory(''); setAdminStep(1); }}>Change</button>}
                                        </div>
                                    )}
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Property Name</label>
                                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Developer</label>
                                            <input type="text" name="developer" value={formData.developer} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Project</label>
                                            <input type="text" name="project" value={formData.project} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Location</label>
                                            <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Price (AED)</label>
                                            <input type="text" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g. AED 1,500,000" required />
                                        </div>

                                        <div className="form-group">
                                            <label>Bedrooms</label>
                                            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Bathrooms</label>
                                            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Square Footage (Area)</label>
                                            <input type="text" name="area" value={formData.area} onChange={handleInputChange} placeholder="e.g. 1,500 sqft" />
                                        </div>
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select name="status" value={formData.status} onChange={handleInputChange}>
                                                <option value="Ready">Ready</option>
                                                <option value="Off-Plan">Off-Plan</option>
                                                <option value="Under Construction">Under Construction</option>
                                                <option value="Sold">Sold</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4"></textarea>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Amenities (Comma separated)</label>
                                        <input type="text" name="amenities" value={formData.amenities} onChange={handleInputChange} placeholder="Gym, Pool, Parking..." />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Images (URLs, one per line)</label>
                                        <textarea name="images" value={formData.images} onChange={handleInputChange} rows="4"></textarea>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Payment Plan Details</label>
                                        <textarea name="payment_plan" value={formData.payment_plan} onChange={handleInputChange} rows="3"></textarea>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                                        <button type="submit" className="btn-submit">{editingProperty ? 'Update Property' : 'Add Property'}</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                <div className="admin-content">
                    {loading ? (
                        <div className="loading">Loading inventory...</div>
                    ) : properties.length === 0 ? (
                        <div className="empty-inventory">
                            <p>No properties in inventory. Click "Add Property" to begin.</p>
                        </div>
                    ) : (
                        <div className="inventory-list">
                            <div className="inventory-header">
                                <span>Title</span>
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
                                    <span><span className={`status-pill ${prop.status.toLowerCase().replace(' ', '-')}`}>{prop.status}</span></span>
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
