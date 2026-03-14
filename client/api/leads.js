// Vercel Serverless Function: Leads API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/[\r\n]/g, '');
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim().replace(/[\r\n]/g, '');
const MISTRAL_API_KEY = (process.env.MISTRAL_API_KEY || '').trim().replace(/[\r\n]/g, '');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8730614252:AAGuV_V_iHfdmVrfiol_6fCuHCrTEboYyjw';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramNotification(lead) {
    if (!TELEGRAM_CHAT_ID) return;

    const message = `
🏠 *New Lead Received!*
👤 *Name:* ${lead.name || 'N/A'}
📞 *Phone:* ${lead.phone || 'N/A'}
📧 *Email:* ${lead.email || 'N/A'}
🎯 *Interest:* ${lead.interest || 'N/A'}
📍 *Area:* ${lead.area || 'N/A'}
💰 *Budget:* ${lead.budget || 'N/A'}
💬 *Message:* ${lead.message || 'N/A'}
🌐 *Source:* ${lead.source || 'Website'}
`.trim();

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
    } catch (err) {
        console.error('Telegram Error:', err.message);
    }
}

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
        const { name, email, phone, interest, area, budget, requirements, source } = req.body;
        
        const leadData = {
            name,
            email,
            phone,
            interest,
            area,
            budget,
            message: requirements,
            source: source || 'chatbot'
        };

        const data = await supabaseCall('leads', 'POST', leadData);

        // Send Telegram Notification
        await sendTelegramNotification(leadData);

        return res.status(201).json({ id: data?.[0]?.id, success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
