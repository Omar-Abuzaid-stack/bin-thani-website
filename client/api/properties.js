// Vercel Serverless Function: Properties API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const SUPABASE_KEY = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : '';

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
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
    
    const text = await response.text();
    let data = {};
    if (text) {
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: text };
        }
    }
    
    if (response.ok) return data;
    throw new Error(data.message || data.error_description || 'Supabase error');
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
            
            // Map location to area_full if it exists for better searching
            if (body.location && !body.area_full) {
                body.area_full = body.location;
            }

            // Preservation: If project or payment_plan are present, append them to description 
            // since they don't have columns yet.
            let extraInfo = '';
            if (body.project) extraInfo += `Project: ${body.project}\n`;
            if (body.payment_plan) extraInfo += `Payment Plan: ${body.payment_plan}\n`;
            
            if (extraInfo) {
                body.description = `${extraInfo}\n${body.description || ''}`;
            }

            // Columns that exist in the DB schema
            const validColumns = [
                'title', 'description', 'price', 'price_numeric', 'location', 'area_full', 
                'type', 'bedrooms', 'bathrooms', 'area', 'images', 'status', 'amenities', 
                'featured', 'developer', 'year_built', 'parking', 'furnished', 
                'floor_plan', 'google_maps_embed'
            ];

            // Sanitise body: only keep columns that exist in DB
            const cleanBody = {};
            validColumns.forEach(id => {
                if (body[id] !== undefined) cleanBody[id] = body[id];
            });

            const result = await supabaseCall('properties', 'POST', cleanBody);
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
        
        if (type) filters.push(`type.eq.${type}`);
        if (status) filters.push(`status.eq.${status}`);
        if (developer) filters.push(`developer.eq.${developer}`);
        if (bedrooms) filters.push(`bedrooms.gte.${bedrooms}`);
        if (location) filters.push(`or(location.ilike.*${location}*,area_full.ilike.*${location}*)`);
        
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
