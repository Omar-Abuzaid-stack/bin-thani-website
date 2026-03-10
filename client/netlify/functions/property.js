// Netlify Function: Single Property
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

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const id = event.path.replace(/\/.netlify\/functions\/property\//, '');
        
        const data = await supabaseCall(`properties?id.eq.${id}&select=*&limit=1`);
        
        if (!data || data.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Property not found' })
            };
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
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(property)
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
