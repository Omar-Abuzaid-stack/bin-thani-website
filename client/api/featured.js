// Vercel Serverless Function: Featured Properties
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/[\r\n]/g, '');
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim().replace(/[\r\n]/g, '');

async function supabaseCall(endpoint) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    return await response.json();
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).send('');
    }

    try {
        const data = await supabaseCall('properties?select=*&featured.eq.true');
        return res.status(200).json(data || []);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
