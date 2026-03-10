// Netlify Function: Properties API
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
            'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
    const data = await response.json();
    if (response.ok) return data;
    throw new Error(data.message || 'Supabase error');
}

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { type, minPrice, maxPrice, bedrooms, location, status, developer } = event.queryStringParameters;
        
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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(properties)
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
