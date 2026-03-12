// Vercel Serverless Function: Single Property
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

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
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
    const data = await response.json();
    if (response.ok) return data;
    throw new Error(data.message || 'Supabase error');
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
            
            // Map location to area_full if it exists
            if (body.location && !body.area_full) {
                body.area_full = body.location;
            }

            // Columns that exist in the DB schema
            const validColumns = [
                'title', 'description', 'price', 'price_numeric', 'location', 'area_full', 
                'type', 'bedrooms', 'bathrooms', 'area', 'images', 'status', 'amenities', 
                'featured', 'developer', 'year_built', 'parking', 'furnished', 
                'floor_plan', 'google_maps_embed'
            ];

            // Sanitise body
            const cleanBody = {};
            validColumns.forEach(id => {
                if (body[id] !== undefined) cleanBody[id] = body[id];
            });

            const result = await supabaseCall(`properties?id.eq.${id}`, 'PATCH', cleanBody);
            return res.status(200).json(result);
        }

        if (req.method === 'DELETE') {
            await supabaseCall(`properties?id.eq.${id}`, 'DELETE');
            return res.status(204).send('');
        }

        const data = await supabaseCall(`properties?id.eq.${id}&select=*&limit=1`);
        
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        const property = data[0];
        
        // Increment views
        try {
            await supabaseCall(`properties?id.eq.${id}`, 'PATCH', {
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
