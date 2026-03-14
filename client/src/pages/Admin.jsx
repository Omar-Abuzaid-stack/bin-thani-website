import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Check, Search, MapPin, Building, Home, Layout, List, Key, MoreHorizontal, Globe, Eye, EyeOff, MessageSquare, Users, Activity, ExternalLink, Mail, Phone } from 'lucide-react';
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
    const [adminView, setAdminView] = useState('Properties'); // 'Properties', 'Projects', 'Developers', 'Leads', 'Chats', 'Visitors'
    const [propertyTab, setPropertyTab] = useState('buy'); // 'buy' or 'rent'
    const [developers, setDevelopers] = useState([]);
    const [leads, setLeads] = useState([]);
    const [chats, setChats] = useState([]);
    const [visitors, setVisitors] = useState([]);
    const [stats, setStats] = useState({ totalLeads: 0, totalProperties: 0, totalVisitors: 0, totalViews: 0 });
    const [schemaError, setSchemaError] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '', title_ar: '',
        developer: '', developer_ar: '',
        location: '', location_ar: '',
        price: '', price_numeric: '',
        listing_type: 'buy',
        price_per: 'total',
        type: 'Apartment',
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
            fetchDevelopers();
        }
    }, [adminView, propertyTab]);

    const fetchStats = async () => {
        try {
            const res = await axios.get(getApiUrl('admin/stats'));
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await axios.get(getApiUrl('admin/leads'));
            setLeads(res.data);
        } catch (err) {
            console.error('Error fetching leads:', err);
        }
        setLoading(false);
    };

    const fetchChats = async () => {
        setLoading(true);
        try {
            const res = await axios.get(getApiUrl('admin/chats'));
            setChats(res.data);
        } catch (err) {
            console.error('Error fetching chats:', err);
        }
        setLoading(false);
    };

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            const res = await axios.get(getApiUrl('admin/visitors'));
            setVisitors(res.data);
        } catch (err) {
            console.error('Error fetching visitors:', err);
        }
        setLoading(false);
    };

    const fetchDevelopers = async () => {
        try {
            const res = await axios.get(getApiUrl('developers'));
            setDevelopers(res.data);
            setSchemaError(null);
        } catch (err) {
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
            let filtered = res.data;
            if (adminView === 'Properties') {
                filtered = res.data.filter(p => {
                    if (p.type === 'Off-Plan Project') return false;
                    const lt = p.listing_type || 'buy';
                    return lt === propertyTab;
                });
            } else if (adminView === 'Projects') {
                filtered = res.data.filter(p => p.type === 'Off-Plan Project');
            }
            setProperties(filtered);
            setSchemaError(null);
        } catch (err) {
            if (err.response?.status === 500 || err.message.includes('500')) {
                setSchemaError('Database Connection Error');
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
            } else {
                await axios.post(getApiUrl('properties'), dataToSubmit);
            }
            setShowForm(false);
            setEditingProperty(null);
            fetchData();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const toggleVisibility = async (item, type) => {
        try {
            const newVisibility = item.visible === false ? true : false;
            const endpoint = type === 'developer' ? 'developers' : 'property';
            await axios.put(`${getApiUrl(endpoint)}?id=${item.id}`, { visible: newVisibility });
            
            if (type === 'developer') {
                setDevelopers(prev => prev.map(d => d.id === item.id ? { ...d, visible: newVisibility } : d));
            } else {
                setProperties(prev => prev.map(p => p.id === item.id ? { ...p, visible: newVisibility } : p));
            }
        } catch (err) {
            alert('Visibility toggle failed');
        }
    };

    const handleDevSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDeveloper && editingDeveloper.id) {
                await axios.put(`${getApiUrl('developers')}?id=${editingDeveloper.id}`, devFormData);
            } else {
                await axios.post(getApiUrl('developers'), devFormData);
            }
            setDevFormData({ name: '', name_ar: '', logo: '', tagline: '', tagline_ar: '', visible: true });
            setShowForm(false);
            fetchDevelopers();
        } catch (err) {
            alert('Error saving developer');
        }
    };

    const handleEdit = (property) => {
        setFormData({ ...property });
        setEditingProperty(property);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this item?')) {
            try {
                await axios.delete(`${getApiUrl('property')}?id=${id}`);
                setProperties(prev => prev.filter(p => p.id !== id));
            } catch (err) {
                fetchData();
            }
        }
    };

    const renderView = () => {
        if (adminView === 'Developers') {
            return (
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
                            <span className="dev-logo-cell">
                                {dev.logo ? <img src={dev.logo} alt="" className="admin-list-logo" /> : 'No Logo'}
                            </span>
                            <span className="prop-title">{dev.name}</span>
                            <span>{dev.tagline}</span>
                            <span>{dev.projects_count || 0}</span>
                            <div className="actions">
                                {dev.id && (
                                    <>
                                        <button className={`visibility-btn ${dev.visible === false ? 'hidden' : ''}`} onClick={() => toggleVisibility(dev, 'developer')}>
                                            {dev.visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button className="edit-btn" onClick={() => {
                                            setEditingDeveloper(dev);
                                            setDevFormData({...dev, visible: dev.visible !== false});
                                            setShowForm(true);
                                        }}><Edit2 size={16} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </>
            );
        } else if (adminView === 'Leads') {
            return (
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
            );
        } else if (adminView === 'Chats') {
            return (
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
            );
        } else if (adminView === 'Visitors') {
            return (
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
            );
        } else {
            return (
                <>
                    <div className="inventory-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 120px' }}>
                        <span>Item</span>
                        <span>Developer</span>
                        <span>Price</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>
                    {properties.map(prop => (
                        <div key={prop.id} className="inventory-item" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 120px' }}>
                            <span className="prop-title">{prop.title}</span>
                            <span>{prop.developer}</span>
                            <span className="prop-price">
                                {prop.listing_type === 'rent' ? `AED ${prop.price_numeric?.toLocaleString()}/${prop.price_per === 'monthly' ? 'mo' : 'yr'}` : `AED ${prop.price_numeric?.toLocaleString()}`}
                            </span>
                            <span><span className={`status-pill ${prop.status?.toLowerCase().split(' ')[0]}`}>{prop.status}</span></span>
                            <div className="actions">
                                <button className={`visibility-btn ${prop.visible === false ? 'hidden' : ''}`} onClick={() => toggleVisibility(prop, 'property')}>
                                    {prop.visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button className="edit-btn" onClick={() => handleEdit(prop)}><Edit2 size={16} /></button>
                                <button className="delete-btn" onClick={() => handleDelete(prop.id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </>
            );
        }
    };

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

                <header className="admin-header">
                    <div>
                        <h1>Admin Panel</h1>
                        <p>{adminView} Management</p>
                    </div>
                    <div className="admin-view-toggle">
                        <button className={`toggle-btn ${adminView === 'Properties' ? 'active' : ''}`} onClick={() => setAdminView('Properties')}>Properties</button>
                        <button className={`toggle-btn ${adminView === 'Projects' ? 'active' : ''}`} onClick={() => setAdminView('Projects')}>Projects</button>
                        <button className={`toggle-btn ${adminView === 'Developers' ? 'active' : ''}`} onClick={() => setAdminView('Developers')}>Developers</button>
                        <button className={`toggle-btn ${adminView === 'Leads' ? 'active' : ''}`} onClick={() => setAdminView('Leads')}>Leads</button>
                        <button className={`toggle-btn ${adminView === 'Chats' ? 'active' : ''}`} onClick={() => setAdminView('Chats')}>Chats</button>
                        <button className={`toggle-btn ${adminView === 'Visitors' ? 'active' : ''}`} onClick={() => setAdminView('Visitors')}>Activity</button>
                    </div>

                    {adminView === 'Properties' && (
                        <div className="admin-sub-tabs">
                            <button className={`sub-tab ${propertyTab === 'buy' ? 'active' : ''}`} onClick={() => setPropertyTab('buy')}>🏠 Buy</button>
                            <button className={`sub-tab ${propertyTab === 'rent' ? 'active' : ''}`} onClick={() => setPropertyTab('rent')}>🔑 Rent</button>
                            <button className={`sub-tab offplan ${propertyTab === 'off-plan' ? 'active' : ''}`} onClick={() => setPropertyTab('off-plan')}>🏗️ Off-Plan</button>
                        </div>
                    )}

                    {(adminView === 'Properties' || adminView === 'Projects' || adminView === 'Developers') && (
                        <button className="btn-add" onClick={() => {
                            if (adminView === 'Developers') {
                                setEditingDeveloper(null);
                                setDevFormData({ name: '', name_ar: '', logo: '', tagline: '', tagline_ar: '', visible: true });
                            } else {
                                setEditingProperty(null);
                                setFormData({ ...formData, listing_type: propertyTab });
                            }
                            setShowForm(true);
                        }}>
                            <Plus size={20} /> Add New
                        </button>
                    )}
                </header>

                <div className="admin-content">
                    {loading && adminView !== 'Developers' && adminView !== 'Leads' && adminView !== 'Chats' && adminView !== 'Visitors' ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <div className="inventory-list">
                            {renderView()}
                        </div>
                    )}
                </div>

                {showForm && (
                    <div className="form-modal">
                        <div className="form-container">
                            <div className="form-header">
                                <h2>{editingProperty || editingDeveloper ? 'Edit' : 'Add New'}</h2>
                                <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
                            </div>
                            {adminView === 'Developers' ? (
                                <form onSubmit={handleDevSubmit} className="property-form">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input type="text" value={devFormData.name} onChange={(e) => setDevFormData({...devFormData, name: e.target.value})} required />
                                    </div>
                                    <button type="submit" className="btn-submit">Save</button>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmit} className="property-form">
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                                    </div>
                                    <button type="submit" className="btn-submit">Save</button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
