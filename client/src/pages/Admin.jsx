import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Check, Search, MapPin, Building, Home, Layout, List, Key, MoreHorizontal, Globe, Eye, EyeOff, LogOut, Users, Activity, MessageSquare, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Admin.css';

const getApiUrl = (endpoint) => {
  if (import.meta.env.PROD) return `/api/${endpoint}`;
  const baseUrl = import.meta.env.VITE_API_URL;
  return baseUrl ? `${baseUrl}/api/${endpoint}` : `/api/${endpoint}`;
};

const Admin = () => {
    const { t, language } = useLanguage();
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('adminAuth') === 'true');
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [adminView, setAdminView] = useState('Properties'); // 'Properties', 'Projects', 'Developers', 'Leads', 'Chats', 'Visitors'
    const [propertyTab, setPropertyTab] = useState('buy'); // 'buy' or 'rent'
    const [developers, setDevelopers] = useState([]);
    const [schemaError, setSchemaError] = useState(null);
    
    // New Features
    const [leads, setLeads] = useState([]);
    const [chats, setChats] = useState([]);
    const [visitors, setVisitors] = useState([]);
    const [stats, setStats] = useState({ totalLeads: 0, totalProperties: 0, totalVisitors: 0, totalViews: 0 });
    
    const [formData, setFormData] = useState({
        title: '', title_ar: '',
        developer: '', developer_ar: '',
        location: '', location_ar: '',
        price: '', price_numeric: '',
        listing_type: 'buy', // 'buy' or 'rent'
        price_per: 'total', // 'total', 'yearly', 'monthly'
        type: 'Apartment', // Default to Apartment for props
        bedrooms: '', bathrooms: '',
        area: '', status: 'Available',
        description: '', description_ar: '',
        amenities: '',
        images: '',
        visible: true,
    });

    const [devFormData, setDevFormData] = useState({
        name: '', name_ar: '',
        logo: '', tagline: '', tagline_ar: '',
        visible: true
    });
    const [editingDeveloper, setEditingDeveloper] = useState(null);

    useEffect(() => {
        fetchStats();
        if (adminView === 'Developers') {
            fetchDevelopers();
        } else if (adminView === 'Leads') {
            fetchLeads();
        } else if (adminView === 'Chats') {
            fetchChats();
        } else if (adminView === 'Visitors') {
            fetchVisitors();
        } else {
            fetchData();
            fetchDevelopers(); // Also fetch devs for dropdowns
        }
    }, [adminView, propertyTab]);

    const fetchStats = async () => {
        try {
            const res = await axios.get(getApiUrl('admin/stats'));
            setStats(res.data);
        } catch (err) { }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await axios.get(getApiUrl('admin/leads'));
            setLeads(res.data);
        } catch (err) { }
        setLoading(false);
    };

    const fetchChats = async () => {
        setLoading(true);
        try {
            const res = await axios.get(getApiUrl('admin/chats'));
            setChats(res.data);
        } catch (err) { }
        setLoading(false);
    };

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            const res = await axios.get(getApiUrl('admin/visitors'));
            setVisitors(res.data);
        } catch (err) { }
        setLoading(false);
    };

    const fetchDevelopers = async () => {
        try {
            const res = await axios.get(getApiUrl('developers'));
            setDevelopers(res.data);
            setSchemaError(null);
        } catch (err) {
            console.error('Error fetching developers:', err);
            if (err.response?.data?.error?.includes('PGRST205')) {
                setSchemaError('Missing developers table');
            }
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const typeParam = adminView === 'Projects' ? 'Off-Plan Project' : '';
            const url = typeParam 
                ? `${getApiUrl('properties')}?type=${encodeURIComponent(typeParam)}`
                : getApiUrl('properties');
            
            const res = await axios.get(url);
            
            // Filter by type
            let filtered = res.data;
            if (adminView === 'Properties') {
                // off-plan tab → listing_type='off-plan'
                // buy/rent tabs → match listing_type, exclude Off-Plan Project type
                filtered = res.data.filter(p => {
                    if (p.type === 'Off-Plan Project') return false; // those live in Projects section
                    const lt = p.listing_type || 'buy';
                    return lt === propertyTab;
                });
            } else if (adminView === 'Projects') {
                filtered = res.data.filter(p => p.type === 'Off-Plan Project');
            }
                
            setProperties(filtered);
            setSchemaError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            // Detect missing table error
            if (err.response?.status === 500 || err.message.includes('500') || err.message.includes('code 404')) {
                setSchemaError('Database Connection Error - Schema mismatch detected.');
            }
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
                bedrooms: parseInt(formData.bedrooms) || 0,
                bathrooms: parseInt(formData.bathrooms) || 0,
                amenities: typeof formData.amenities === 'string' ? formData.amenities.split(',').map(s => s.trim()).filter(a => a) : formData.amenities,
                images: typeof formData.images === 'string' ? formData.images.split('\n').filter(url => url.trim() !== '') : formData.images
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
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            alert('Error: ' + errorMsg);
        }
    };

    const toggleVisibility = async (item, type) => {
        try {
            const newVisibility = item.visible === false ? true : false;
            const endpoint = type === 'developer' ? 'developers' : 'property';
            const url = `${getApiUrl(endpoint)}?id=${item.id}`;
            
            await axios.put(url, { visible: newVisibility });
            
            if (type === 'developer') {
                setDevelopers(prev => prev.map(d => d.id === item.id ? { ...d, visible: newVisibility } : d));
            } else {
                setProperties(prev => prev.map(p => p.id === item.id ? { ...p, visible: newVisibility } : p));
            }
        } catch (err) {
            alert('Visibility toggle failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDevSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDeveloper && editingDeveloper.id) {
                await axios.put(`${getApiUrl('developers')}?id=${editingDeveloper.id}`, devFormData);
                alert('Developer updated successfully!');
            } else {
                await axios.post(getApiUrl('developers'), devFormData);
                alert('Developer saved successfully!');
            }
            setDevFormData({ name: '', name_ar: '', logo: '', tagline: '', tagline_ar: '' });
            setEditingDeveloper(null);
            setShowForm(false);
            fetchDevelopers();
        } catch (err) {
            alert('Error saving developer: ' + (err.response?.data?.error || err.message));
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
                setProperties(prev => prev.filter(p => p.id !== id));
                alert('Success: Item removed.');
            } catch (err) {
                console.error('Delete error:', err);
                alert('Delete failed: ' + (err.response?.data?.error || err.message));
                fetchData(); // Refresh if failed
            }
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (passwordInput === 'BinThani2024') {
            localStorage.setItem('adminAuth', 'true');
            setIsAuthenticated(true);
            setLoginError('');
            setPasswordInput('');
        } else {
            setLoginError('Invalid password');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return (
            <div className={`admin-page login-page ${language === 'ar' ? 'rtl' : ''}`}>
                <div className="login-container">
                    <h1>Admin Login</h1>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                value={passwordInput} 
                                onChange={(e) => setPasswordInput(e.target.value)} 
                                required 
                                autoFocus
                            />
                        </div>
                        {loginError && <div className="error-message">{loginError}</div>}
                        <button type="submit" className="btn-submit">Login</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={`admin-page ${language === 'ar' ? 'rtl' : ''}`}>
            <div className="container">
                <div className="admin-stats-overview">
                    <div className="stat-card">
                        <Users size={20} />
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalLeads}</span>
                            <span className="stat-label">Leads</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Home size={20} />
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalProperties}</span>
                            <span className="stat-label">Properties</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Activity size={20} />
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalVisitors}</span>
                            <span className="stat-label">Visitors</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Eye size={20} />
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalViews}</span>
                            <span className="stat-label">Views</span>
                        </div>
                    </div>
                </div>

                {schemaError && (
                    <div className="schema-warning">
                        <div className="warning-content">
                            <h3>⚠️ Database Configuration Required</h3>
                            <p>It looks like your Supabase database is not fully set up. Adding or deleting properties/developers will not work until the schema is updated.</p>
                            <p className="sql-instruction">Please copy the SQL script from the chat and run it in your <strong>Supabase SQL Editor</strong>.</p>
                            <button className="btn-small" onClick={() => setSchemaError(null)}>I understand, show me anyway</button>
                        </div>
                    </div>
                )}

                <header className="admin-header">
                    <div>
                        <h1>{language === 'ar' ? 'لوحة التحكم' : 'Bin Thani Admin'}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <p style={{ margin: 0 }}>
                                {adminView === 'Properties' ? 'Managing Property Listings' : 
                                 adminView === 'Projects' ? 'Managing Off-Plan Projects' : 
                                 adminView === 'Developers' ? 'Managing Developer Partners' :
                                 adminView + ' Management'}
                            </p>
                            <button onClick={handleLogout} className="btn-logout" title="Logout">
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
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
                            Projects
                        </button>
                        <button 
                            className={`toggle-btn ${adminView === 'Developers' ? 'active' : ''}`}
                            onClick={() => setAdminView('Developers')}
                        >
                            Developers
                        </button>
                        <button 
                            className={`toggle-btn ${adminView === 'Leads' ? 'active' : ''}`}
                            onClick={() => setAdminView('Leads')}
                        >
                            Leads
                        </button>
                        <button 
                            className={`toggle-btn ${adminView === 'Chats' ? 'active' : ''}`}
                            onClick={() => setAdminView('Chats')}
                        >
                            Chats
                        </button>
                        <button 
                            className={`toggle-btn ${adminView === 'Visitors' ? 'active' : ''}`}
                            onClick={() => setAdminView('Visitors')}
                        >
                            Activity
                        </button>
                    </div>

                    {adminView === 'Properties' && (
                        <div className="admin-sub-tabs">
                            <button 
                                className={`sub-tab ${propertyTab === 'buy' ? 'active' : ''}`}
                                onClick={() => setPropertyTab('buy')}
                            >
                                🏠 Buy
                            </button>
                            <button 
                                className={`sub-tab ${propertyTab === 'rent' ? 'active' : ''}`}
                                onClick={() => setPropertyTab('rent')}
                            >
                                🔑 Rent
                            </button>
                            <button 
                                className={`sub-tab offplan ${propertyTab === 'off-plan' ? 'active' : ''}`}
                                onClick={() => setPropertyTab('off-plan')}
                            >
                                🏗️ Off-Plan
                            </button>
                        </div>
                    )}

                    {(adminView === 'Properties' || adminView === 'Projects' || adminView === 'Developers') && (
                        <button className="btn-add" onClick={() => { 
                            if (adminView === 'Developers') {
                            setEditingDeveloper(null);
                            setDevFormData({ name: '', name_ar: '', logo: '', tagline: '', tagline_ar: '', visible: true });
                            setShowForm(true);
                            return;
                        }
                        setEditingProperty(null); 
                        setFormData({
                            title: '', title_ar: '', developer: '', developer_ar: '',
                            location: '', location_ar: '', price: '', price_numeric: '',
                            listing_type: propertyTab, // pre-fill from current tab (buy | rent | off-plan)
                            price_per: propertyTab === 'rent' ? 'yearly' : 'total',
                            type: adminView === 'Properties' ? 'Apartment' : 'Off-Plan Project',
                            bedrooms: '', bathrooms: '', area: '', status: 'Available',
                            description: '', description_ar: '', amenities: '', images: '',
                            visible: true,
                        });
                        setShowForm(true); 
                    }}>
                        <Plus size={20} /> Add {adminView === 'Projects' ? 'Project' : adminView === 'Properties' ? 'Property' : 'Developer'}
                    </button>
                    )}
                </header>

                {showForm && (
                    <div className="form-modal">
                        <div className="form-container">
                            <div className="form-header">
                                <h2>{editingProperty || editingDeveloper ? 'Edit' : 'Add New'} {adminView === 'Projects' ? 'Project' : adminView === 'Properties' ? 'Property' : 'Developer'}</h2>
                                <button className="close-btn" onClick={() => {
                                    setShowForm(false);
                                    setEditingProperty(null);
                                    setEditingDeveloper(null);
                                }}><X size={24} /></button>
                            </div>
                            
                            {adminView === 'Developers' ? (
                                <form onSubmit={handleDevSubmit} className="property-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Developer Name (English)</label>
                                            <input type="text" value={devFormData.name} onChange={(e) => setDevFormData({...devFormData, name: e.target.value})} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Developer Name (Arabic)</label>
                                            <input type="text" value={devFormData.name_ar} onChange={(e) => setDevFormData({...devFormData, name_ar: e.target.value})} />
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Logo URL</label>
                                            <div className="logo-input-group">
                                                <input type="text" value={devFormData.logo} onChange={(e) => setDevFormData({...devFormData, logo: e.target.value})} placeholder="https://example.com/logo.png" style={{ flex: 1 }} />
                                                {devFormData.logo && (
                                                    <div className="logo-preview-box">
                                                        <img src={devFormData.logo} alt="Preview" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Tagline (English)</label>
                                            <input type="text" value={devFormData.tagline} onChange={(e) => setDevFormData({...devFormData, tagline: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Tagline (Arabic)</label>
                                            <input type="text" value={devFormData.tagline_ar} onChange={(e) => setDevFormData({...devFormData, tagline_ar: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input type="checkbox" checked={devFormData.visible} onChange={(e) => setDevFormData({...devFormData, visible: e.target.checked})} />
                                                Visible on Website
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                                        <button type="submit" className="btn-submit">Save Developer</button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmit} className="property-form">
                                {adminView === 'Properties' && (
                                    <div className="form-question">
                                        <h3>Listing Type</h3>
                                        <div className="question-options">
                                            <button 
                                                type="button" 
                                                className={`option-btn ${formData.listing_type === 'buy' ? 'active' : ''}`}
                                                onClick={() => setFormData({...formData, listing_type: 'buy', price_per: 'total'})}
                                            >
                                                🏠 For Sale (Buy)
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`option-btn ${formData.listing_type === 'rent' ? 'active' : ''}`}
                                                onClick={() => setFormData({...formData, listing_type: 'rent', price_per: 'yearly'})}
                                            >
                                                🔑 For Rent
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`option-btn offplan ${formData.listing_type === 'off-plan' ? 'active' : ''}`}
                                                onClick={() => setFormData({...formData, listing_type: 'off-plan', price_per: 'total'})}
                                            >
                                                🏗️ Off-Plan
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                                        <label>Developer</label>
                                        <select 
                                            name="developer" 
                                            value={formData.developer} 
                                            onChange={(e) => {
                                                const dev = developers.find(d => d.name === e.target.value);
                                                setFormData({
                                                    ...formData,
                                                    developer: e.target.value,
                                                    developer_ar: dev ? dev.name_ar : formData.developer_ar
                                                });
                                            }}
                                            required
                                        >
                                            <option value="">Select Developer</option>
                                            {developers.map(dev => (
                                                <option key={dev.id || dev.name} value={dev.name}>{dev.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Developer (Arabic Display)</label>
                                        <input type="text" name="developer_ar" value={formData.developer_ar} onChange={handleInputChange} readOnly />
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
                                        <label>Price Display (Auto-formatted)</label>
                                        <input 
                                            type="text" 
                                            placeholder={formData.listing_type === 'rent' ? 'e.g. 50,000/yr' : 'e.g. 1.2M'}
                                            name="price" 
                                            value={formData.price} 
                                            onChange={handleInputChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price Numeric</label>
                                        <input type="number" name="price_numeric" value={formData.price_numeric} onChange={handleInputChange} />
                                    </div>

                                    {formData.listing_type === 'rent' && (
                                        <div className="form-group">
                                            <label>Rental Period</label>
                                            <select name="price_per" value={formData.price_per} onChange={handleInputChange}>
                                                <option value="yearly">Yearly (/yr)</option>
                                                <option value="monthly">Monthly (/mo)</option>
                                            </select>
                                        </div>
                                    )}

                                    {adminView === 'Properties' && (
                                        <>
                                    <div className="form-group">
                                        <label>Property Type</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange}>
                                            <option value="Apartment">Apartment</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Townhouse">Townhouse</option>
                                            <option value="Penthouse">Penthouse</option>
                                            <option value="Mixed Use">Mixed Use</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange}>
                                            <option value="Available">Available</option>
                                            <option value="Off-Plan">Off-Plan</option>
                                            <option value="Under Construction">Under Construction</option>
                                            <option value="Upcoming">Upcoming</option>
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
                                            <option value="Off-Plan">Off-Plan</option>
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
                                
                                <div className="form-group full-width">
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="visible" checked={formData.visible} onChange={(e) => setFormData({...formData, visible: e.target.checked})} />
                                        Visible on Website
                                    </label>
                                </div>
                                
                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-submit">{editingProperty ? 'Update' : 'Save'}</button>
                                </div>
                            </form>
                            )}
                        </div>
                    </div>
                )}

                <div className="admin-content">
                    {loading && adminView !== 'Developers' && adminView !== 'Leads' && adminView !== 'Chats' && adminView !== 'Visitors' ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <div className="inventory-list">
                            {adminView === 'Leads' ? (
                                <>
                                    <div className="inventory-header" style={{ gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr' }}>
                                        <span>Name</span>
                                        <span>Contact Info</span>
                                        <span>Interest</span>
                                        <span>Source</span>
                                        <span>Date</span>
                                    </div>
                                    {leads.map(lead => (
                                        <div key={lead.id} className="inventory-item" style={{ gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr' }}>
                                            <span className="prop-title">{lead.name}</span>
                                            <span className="contact-info-cell">
                                                <div><Mail size={12} style={{marginRight: 5}} />{lead.email}</div>
                                                <div style={{ opacity: 0.7 }}><Phone size={12} style={{marginRight: 5}} />{lead.phone}</div>
                                            </span>
                                            <span style={{ fontSize: '0.9rem' }}>{lead.interest || lead.message}</span>
                                            <span className="source-badge">{lead.source}</span>
                                            <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </>
                            ) : adminView === 'Chats' ? (
                                <>
                                    <div className="inventory-header" style={{ gridTemplateColumns: '1fr 2fr 2fr 1fr' }}>
                                        <span>Session</span>
                                        <span>User Message</span>
                                        <span>Bot Response</span>
                                        <span>Time</span>
                                    </div>
                                    {chats.map(chat => (
                                        <div key={chat.id} className="inventory-item" style={{ gridTemplateColumns: '1fr 2fr 2fr 1fr' }}>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{chat.session_id?.substring(0, 8)}...</span>
                                            <span className="user-msg">{chat.user_message}</span>
                                            <span className="bot-msg">{chat.bot_response}</span>
                                            <span>{new Date(chat.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                </>
                            ) : adminView === 'Visitors' ? (
                                <>
                                    <div className="inventory-header" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr' }}>
                                        <span>Page Path</span>
                                        <span>IP Address</span>
                                        <span>Referrer</span>
                                        <span>Time</span>
                                    </div>
                                    {visitors.map(v => (
                                        <div key={v.id} className="inventory-item" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr' }}>
                                            <span className="prop-title" style={{ fontSize: '0.9rem' }}>{v.page_path}</span>
                                            <span>{v.ip_address}</span>
                                            <span style={{ opacity: 0.6 }}>{v.referrer}</span>
                                            <span>{new Date(v.created_at).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </>
                            ) : adminView === 'Developers' ? (
                                <>
                                    <div className="inventory-header" style={{ gridTemplateColumns: '80px 2fr 2fr 1fr 120px' }}>
                                        <span>Logo</span>
                                        <span>Name</span>
                                        <span>Tagline</span>
                                        <span>Projects</span>
                                        <span>Actions</span>
                                    </div>
                                    {developers.map(dev => (
                                        <div key={dev.id || dev.name} className="inventory-item" style={{ gridTemplateColumns: '80px 2fr 2fr 1fr 120px' }}>
                                            <span data-label="Logo" className="dev-logo-cell">
                                                {dev.logo ? <img src={dev.logo} alt={dev.name} className="admin-list-logo" /> : <div className="no-logo-placeholder">No Logo</div>}
                                            </span>
                                            <span className="prop-title" data-label="Name">
                                                {dev.name}
                                                {!dev.id && <span className="local-badge" title="This developer exists in properties but hasn't been added to the developer database yet.">Local Only</span>}
                                            </span>
                                            <span data-label="Tagline">{dev.tagline}</span>
                                            <span data-label="Projects">{dev.projects_count || 0}</span>
                                            <div className="actions">
                                                {dev.id ? (
                                                    <>
                                                        <button 
                                                            className={`visibility-btn ${dev.visible === false ? 'hidden' : ''}`} 
                                                            onClick={() => toggleVisibility(dev, 'developer')}
                                                            title={dev.visible === false ? 'Make Visible' : 'Hide from Website'}
                                                        >
                                                            {dev.visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                        <button className="edit-btn" title="Edit Developer" onClick={() => {
                                                            setEditingDeveloper(dev);
                                                            setDevFormData({
                                                                name: dev.name || '',
                                                                name_ar: dev.name_ar || '',
                                                                logo: dev.logo || '',
                                                                tagline: dev.tagline || '',
                                                                tagline_ar: dev.tagline_ar || '',
                                                                visible: dev.visible !== false
                                                            });
                                                            setShowForm(true);
                                                        }}><Edit2 size={16} /></button>
                                                        
                                                        <button className="delete-btn" title="Delete Developer" onClick={async () => {
                                                            const isLocal = !dev.id;
                                                            const msg = isLocal 
                                                                ? `Delete ALL properties and projects associated with ${dev.name}?`
                                                                : `Delete ${dev.name}? This will remove their info and all their linked properties.`;
                                                            
                                                            if (window.confirm(msg)) {
                                                                try {
                                                                    const url = isLocal 
                                                                        ? `${getApiUrl('developers')}?name=${encodeURIComponent(dev.name)}`
                                                                        : `${getApiUrl('developers')}?id=${dev.id}&name=${encodeURIComponent(dev.name)}`;
                                                                    
                                                                    await axios.delete(url);
                                                                    setDevelopers(prev => prev.filter(d => d.name !== dev.name));
                                                                    alert('Developer and all associated items removed.');
                                                                    fetchData(); 
                                                                } catch (err) {
                                                                    alert('Delete failed: ' + (err.response?.data?.error || err.message));
                                                                }
                                                            }
                                                        }}><Trash2 size={16} /></button>
                                                    </>
                                                ) : (
                                                    <button className="delete-btn" title="Delete Local Developer" onClick={async () => {
                                                        if (window.confirm(`Delete ALL properties and projects associated with ${dev.name}?`)) {
                                                            try {
                                                                const url = `${getApiUrl('developers')}?name=${encodeURIComponent(dev.name)}`;
                                                                await axios.delete(url);
                                                                setDevelopers(prev => prev.filter(d => d.name !== dev.name));
                                                                alert('Developer removed.');
                                                                fetchData();
                                                            } catch (err) {
                                                                alert('Delete failed: ' + (err.response?.data?.error || err.message));
                                                            }
                                                        }
                                                    }}><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <div className="inventory-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 120px' }}>
                                        <span>Item</span>
                                        <span>Developer</span>
                                        <span>Price</span>
                                        <span>Status</span>
                                        <span>Actions</span>
                                    </div>
                                    {properties.map(prop => {
                                        const dev = developers.find(d => d.name === prop.developer);
                                        return (
                                            <div key={prop.id} className="inventory-item" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 120px' }}>
                                                <span className="prop-title" data-label="Title">{prop.title}</span>
                                                <span data-label="Developer" className="prop-dev-cell">
                                                    {dev?.logo && <img src={dev.logo} alt="" className="admin-list-logo-mini" />}
                                                    {prop.developer}
                                                </span>
                                                <span className="prop-price" data-label="Price">
                                                    {prop.listing_type === 'rent' 
                                                       ? `AED ${parseInt(prop.price_numeric || 0).toLocaleString()}/${prop.price_per === 'monthly' ? 'mo' : 'yr'}`
                                                       : `AED ${parseInt(prop.price_numeric || 0).toLocaleString()}`
                                                    }
                                                </span>
                                                <span data-label="Status"><span className={`status-pill ${prop.status.toLowerCase().split(' ')[0]}`}>{prop.status}</span></span>
                                                <div className="actions">
                                                    <button 
                                                        className={`visibility-btn ${prop.visible === false ? 'hidden' : ''}`} 
                                                        onClick={() => toggleVisibility(prop, 'property')}
                                                        title={prop.visible === false ? 'Make Visible' : 'Hide from Website'}
                                                    >
                                                        {prop.visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button className="edit-btn" onClick={() => handleEdit(prop)}><Edit2 size={16} /></button>
                                                    <button className="delete-btn" onClick={() => handleDelete(prop.id)}><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
