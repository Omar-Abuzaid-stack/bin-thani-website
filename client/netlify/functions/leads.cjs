// Netlify Function: Leads API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
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

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { name, email, phone, interest, area, budget, requirements, source } = JSON.parse(event.body);
        
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

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ id: data?.[0]?.id, success: true })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
};
