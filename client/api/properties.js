// Vercel Serverless Function: Properties API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/[\r\n]/g, '');
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim().replace(/[\r\n]/g, '');

async function supabaseCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const response = await fetch(url, options);
    const text = await response.text();
    let data = {};
    if (text) {
        try { data = JSON.parse(text); } catch (e) { data = { message: text }; }
    }
    
    if (response.ok) return data;
    
    console.error(`❌ DB Error (${method} ${endpoint}):`, JSON.stringify(data, null, 2));
    throw new Error(data.message || data.error_description || JSON.stringify(data));
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).send('');
    }

    if (req.method === 'POST') {
        try {
            const body = { ...req.body };
            
            // Clean numeric fields
            body.price_numeric = parseInt(String(body.price_numeric || '0').replace(/[^0-9]/g, '')) || 0;
            body.bedrooms = parseInt(body.bedrooms) || 0;
            body.bathrooms = parseInt(body.bathrooms) || 0;
            body.parking = parseInt(body.parking) || 0;
            body.year_built = parseInt(body.year_built) || null;

            // Ensure JSON fields are parsed objects (if they came as strings)
            if (typeof body.images === 'string' && body.images.startsWith('[')) {
                try { body.images = JSON.parse(body.images); } catch(e) {}
            }
            if (typeof body.amenities === 'string' && body.amenities.startsWith('[')) {
                try { body.amenities = JSON.parse(body.amenities); } catch(e) {}
            }
            if (typeof body.features === 'string' && body.features.startsWith('[')) {
                try { body.features = JSON.parse(body.features); } catch(e) {}
            }

            // Map location to area_full if it exists for better searching
            if (body.location && !body.area_full) {
                body.area_full = body.location;
            }

            const result = await supabaseCall('properties', 'POST', body);
            return res.status(201).json(result);
        } catch (err) {
            console.error('API Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
    }

    try {
        const { type, minPrice, maxPrice, bedrooms, location, status, developer } = req.query;
        
        let query = 'properties?select=*&order=created_at.desc';
        const filters = [];
        
        if (type) filters.push(`type=eq.${encodeURIComponent(type)}`);
        if (status) filters.push(`status=eq.${encodeURIComponent(status)}`);
        if (developer) filters.push(`developer=eq.${encodeURIComponent(developer)}`);
        if (bedrooms) filters.push(`bedrooms=gte.${bedrooms}`);
        if (location) {
            const search = decodeURIComponent(location);
            filters.push(`or=(location.ilike.*${search}*,area_full.ilike.*${search}*,title.ilike.*${search}*,description.ilike.*${search}*,developer.ilike.*${search}*,project.ilike.*${search}*)`);
        }
        
        if (filters.length > 0) query += '&' + filters.join('&');
        
        let properties = await supabaseCall(query);
        
        // Filter by price
        if (minPrice) {
            properties = properties.filter(p => (p.price_numeric || 0) >= parseInt(minPrice));
        }
        if (maxPrice) {
            properties = properties.filter(p => (p.price_numeric || 0) <= parseInt(maxPrice));
        }

        return res.status(200).json(properties);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
