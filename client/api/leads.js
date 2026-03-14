// Vercel Serverless Function: Leads API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/[\r\n]/g, '');
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim().replace(/[\r\n]/g, '');
const MISTRAL_API_KEY = (process.env.MISTRAL_API_KEY || '').trim().replace(/[\r\n]/g, '');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8730614252:AAGuV_V_iHfdmVrfiol_6fCuHCrTEboYyjw';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;



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

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).send('');
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, phone, interest, area, budget, message, requirements, source } = req.body;
        
        let finalMessage = 'Not provided';
        if (message && message.trim()) {
            finalMessage = message.trim();
        } else if (requirements && requirements.trim()) {
            finalMessage = requirements.trim();
        }

        const finalInterest = interest && interest !== 'Not provided' ? interest : 'General Enquiry';

        const leadData = {
            name: name || 'Not provided',
            email: email || 'Not provided',
            phone: phone || 'Not provided',
            interest: finalInterest,
            area: area || 'Not provided',
            budget: budget || 'Not provided',
            message: finalMessage,
            source: source || 'chatbot'
        };

        const data = await supabaseCall('leads', 'POST', leadData);

        return res.status(201).json({ id: data?.[0]?.id, success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
