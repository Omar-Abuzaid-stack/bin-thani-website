// Netlify Function: Developers
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function supabaseCall(endpoint) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    return await response.json();
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
        const data = await supabaseCall('properties?select=developer&developer.not.is.null');
        
        const developers = [...new Set(data.map(p => p.developer))].map(d => ({
            name: d,
            description: `${d} - Leading UAE developer`,
            projects_count: data.filter(p => p.developer === d).length
        }));
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(developers)
        };
    } catch (err) {
        return {
            statusCode: 500,            body: JSON.stringify({ error: err.message })
        };
    }
};
