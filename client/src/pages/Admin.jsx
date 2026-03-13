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
    const [adminStep, setAdminStep] = useState(1);
    const [category, setCategory] = useState('');
    
    const [formData, setFormData] = useState({
        title: '', title_ar: '',
        developer: '', developer_ar: '',
        project: '', project_ar: '',
        location: '', location_ar: '',
        price: '', price_numeric: '',
        type: 'Buy',
        bedrooms: '', bathrooms: '',
        area: '', status: 'Ready',
        description: '', description_ar: '',
        amenities: '',
        images: '',
        payment_plan: '', payment_plan_ar: '',
        rent_period: 'Yearly'
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
            let priceVal = formData.price.replace('AED', '').replace('/', '').trim();
            const formattedPrice = formData.type === 'Rent' ? `AED ${priceVal} / ${formData.rent_period}` : `AED ${priceVal}`;

            const dataToSubmit = {
                ...formData,
                price: formattedPrice,
                price_numeric: parseInt(priceVal.replace(/[^0-9]/g, '')) || 0,
                amenities: typeof formData.amenities === 'string' ? JSON.stringify(formData.amenities.split(',').map(s => s.trim())) : formData.amenities,
                images: typeof formData.images === 'string' ? JSON.stringify(formData.images.split('\n').filter(url => url.trim() !== '')) : formData.images
            };

            if (editingProperty) {
                await axios.put(`${getApiUrl('property')}?id=${editingProperty.id}`, dataToSubmit);
                alert(language === 'ar' ? 'تم تحديث العقار بنجاح!' : 'Property updated successfully!');
            } else {
                await axios.post(getApiUrl('properties'), dataToSubmit);
                alert(language === 'ar' ? 'تم إضافة العقار بنجاح!' : 'Property added successfully!');
            }
            
            setShowForm(false);
            setEditingProperty(null);
            fetchProperties();
        } catch (err) {
            alert(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving property');
        }
    };

    const handleEdit = (property) => {
        let ams = '';
        try { const a = JSON.parse(property.amenities); ams = Array.isArray(a) ? a.join(', ') : ''; } catch(e) { ams = property.amenities || ''; }
        let imgs = '';
        try { const i = JSON.parse(property.images); imgs = Array.isArray(i) ? i.join('\n') : ''; } catch(e) { imgs = property.images || ''; }

        setFormData({
            ...property,
            amenities: ams,
            images: imgs,
            price: (property.price || '').replace('AED', '').split('/')[0].trim()
        });
        setEditingProperty(property);
        setCategory(property.type);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العقار؟' : 'Are you sure you want to delete this property?')) {
            try {
                await axios.delete(`${getApiUrl('property')}?id=${id}`);
                fetchProperties();
            } catch (err) {
                alert(language === 'ar' ? 'خطأ في الحذف' : 'Error deleting property');
            }
        }
    };

    return (
        <div className={`admin-page ${language === 'ar' ? 'rtl' : ''}`}>
            <div className="container">
                <header className="admin-header">
                    <div>
                        <h1>{language === 'ar' ? 'إدارة العقارات' : 'Property Management'}</h1>
                        <p>{language === 'ar' ? 'إجمالي العقارات:' : 'Total Properties:'} {properties.length}</p>
                    </div>
                    <button className="btn-add" onClick={() => { setEditingProperty(null); setShowForm(true); }}>
                        <Plus size={20} /> {language === 'ar' ? 'إضافة عقار' : 'Add Property'}
                    </button>
                </header>

                {showForm && (
                    <div className="form-modal">
                        <div className="form-container">
                            <div className="form-header">
                                <h2>{editingProperty ? (language === 'ar' ? 'تعديل العقار' : 'Edit Property') : (language === 'ar' ? 'إضافة عقار جديد' : 'Add New Property')}</h2>
                                <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="property-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>{language === 'ar' ? 'اسم العقار (EN)' : 'Property Name (EN)'}</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>اسم العقار (AR)</label>
                                        <input type="text" name="title_ar" value={formData.title_ar} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>{language === 'ar' ? 'المطور (EN)' : 'Developer (EN)'}</label>
                                        <input type="text" name="developer" value={formData.developer} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>المطور (AR)</label>
                                        <input type="text" name="developer_ar" value={formData.developer_ar} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>{language === 'ar' ? 'الموقع (EN)' : 'Location (EN)'}</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>الموقع (AR)</label>
                                        <input type="text" name="location_ar" value={formData.location_ar} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>{language === 'ar' ? 'السعر (بالدرهم)' : 'Price (AED Numeric)'}</label>
                                        <input type="text" name="price" value={formData.price} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>{language === 'ar' ? 'النوع' : 'Type'}</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange}>
                                            <option value="Buy">{language === 'ar' ? 'للبيع' : 'Buy'}</option>
                                            <option value="Rent">{language === 'ar' ? 'للايجار' : 'Rent'}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{language === 'ar' ? 'الحالة' : 'Status'}</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange}>
                                            <option value="Ready">{language === 'ar' ? 'جاهز' : 'Ready'}</option>
                                            <option value="Off-Plan">{language === 'ar' ? 'على الخريطة' : 'Off-Plan'}</option>
                                            <option value="Sold">{language === 'ar' ? 'مباع' : 'Sold'}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>{language === 'ar' ? 'غرف النوم' : 'Bedrooms'}</label>
                                        <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} />
                                    </div>
                                </div>
                                
                                <div className="form-group full-width">
                                    <label>{language === 'ar' ? 'الوصف (EN)' : 'Description (EN)'}</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label>الوصف (AR)</label>
                                    <textarea name="description_ar" value={formData.description_ar} onChange={handleInputChange} rows="3"></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label>{language === 'ar' ? 'الصور (رابط واحد لكل سطر)' : 'Images (One URL per line)'}</label>
                                    <textarea name="images" value={formData.images} onChange={handleInputChange} rows="3"></textarea>
                                </div>
                                
                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                                    <button type="submit" className="btn-submit">{editingProperty ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'إضافة' : 'Add')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="admin-content">
                    {loading ? (
                        <div className="loading">{t('loadingProps')}</div>
                    ) : (
                        <div className="inventory-list">
                            <div className="inventory-header">
                                <span>{language === 'ar' ? 'العنوان' : 'Title'}</span>
                                <span>{language === 'ar' ? 'المطور' : 'Developer'}</span>
                                <span>{language === 'ar' ? 'السعر' : 'Price'}</span>
                                <span>{language === 'ar' ? 'الحالة' : 'Status'}</span>
                                <span>{language === 'ar' ? 'إجراءات' : 'Actions'}</span>
                            </div>
                            {properties.map(prop => (
                                <div key={prop.id} className="inventory-item">
                                    <span className="prop-title">{language === 'ar' ? (prop.title_ar || prop.title) : prop.title}</span>
                                    <span>{language === 'ar' ? (prop.developer_ar || prop.developer) : prop.developer}</span>
                                    <span className="prop-price">{prop.price ? prop.price.replace('AED', language === 'ar' ? 'د.إ' : 'AED') : ''}</span>
                                    <span><span className={`status-pill ${prop.status.toLowerCase()}`}>{language === 'ar' ? t(prop.status.toLowerCase()) || prop.status : prop.status}</span></span>
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
