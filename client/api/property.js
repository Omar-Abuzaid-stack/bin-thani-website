// Vercel Serverless Function: Single Property
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
            'Prefer': method === 'PATCH' ? 'return=representation' : 'return=minimal'
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

    try {
        const { id } = req.query;
        
        if (!id) {
            return res.status(400).json({ error: 'Property ID required' });
        }

        if (req.method === 'PUT') {
            const body = { ...req.body };
            
            // Clean numeric fields
            if (body.price_numeric !== undefined) body.price_numeric = parseInt(String(body.price_numeric || '0').replace(/[^0-9]/g, '')) || 0;
            if (body.bedrooms !== undefined) body.bedrooms = parseInt(body.bedrooms) || 0;
            if (body.bathrooms !== undefined) body.bathrooms = parseInt(body.bathrooms) || 0;
            if (body.parking !== undefined) body.parking = parseInt(body.parking) || 0;
            if (body.year_built !== undefined) body.year_built = parseInt(body.year_built) || null;

            // Ensure JSON fields are parsed objects (if they came as strings)
            ['images', 'amenities', 'features'].forEach(field => {
                if (typeof body[field] === 'string' && body[field].startsWith('[')) {
                    try { body[field] = JSON.parse(body[field]); } catch(e) {}
                }
            });

            // Map location to area_full if it exists
            if (body.location && !body.area_full) {
                body.area_full = body.location;
            }

            const result = await supabaseCall(`properties?id=eq.${id}`, 'PATCH', body);
            return res.status(200).json(result);
        }

        if (req.method === 'DELETE') {
            await supabaseCall(`properties?id=eq.${id}`, 'DELETE');
            return res.status(204).send('');
        }

        const data = await supabaseCall(`properties?id=eq.${id}&select=*&limit=1`);
        
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        const property = data[0];
        
        // Increment views
        try {
            await supabaseCall(`properties?id=eq.${id}`, 'PATCH', {
                views: (property.views || 0) + 1
            });
        } catch (e) {
            console.log('View increment error:', e.message);
        }
        
        return res.status(200).json(property);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
