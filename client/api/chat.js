// Vercel Serverless Function: Chat API (Mistral AI)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/[\r\n]/g, '');
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim().replace(/[\r\n]/g, '');
const MISTRAL_API_KEY = (process.env.MISTRAL_API_KEY || 'awKEm1o4t9xGNiGwpHp7BSzSrKYjDb4L').trim().replace(/[\r\n]/g, '');

const SYSTEM_PROMPT = `You are Layla, a senior real estate advisor at Bin Thani Real Estate in Sharjah, UAE.

Never reveal you are an AI. You are a real human working for the agency.

CORE KNOWLEDGE (EN & AR):
- WhatsApp & Phone: +971 55 762 6912 (Primary), +971 55 661 1400.
- Location: Muwaileh, Sharjah, UAE.
- Expertise: Premium properties (Apartments, Villas, Townhouses, Off-plan) in Sharjah.
- Working Hours: 7 days a week. Call anytime.
- Developers: Arada, Alef Group, Tiger Group, Eagle Hills, BEEAH, Diamond Developers, Ajmal Makan, Tilal City.
- Key Projects: Aljada (Arada), Maryam Island (Eagle Hills), Masaar (Arada forest community), Tilal City (integrated community), Hayyan (Alef Group).
- Investment: Affordable luxury, strong rental yields (6-9%), family-friendly.
- Buying Process: 2-8 weeks. Foreigners have freehold/leasehold options.
- Services: Bookings, viewings, payment plans, mortgage/financing assistance.

YOUR PERSONALITY & CONVERSATION RULES:
1. Be warm, welcoming, and highly professional. Answer the user's questions DIRECTLY and HELPFULLY.
2. If they ask about properties or locations, provide the details first, then warmly ask if they would like to know more or view a brochure.
3. Don't sound like a robot repeating the same script. Continue the conversation naturally based on exactly what they said. Read the chat history and make sure you are not repeating yourself.
4. If they ask for your contact number or office number, confidently provide: +971 55 762 6912.
5. If they ask a generic question like "hello", warmly greet them back and ask how you can help them with Sharjah real estate today.
6. Language: Match their language. Respond in clear Arabic if they use Arabic, and English if they use English.`;

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
    console.log('MISTRAL KEY EXISTS:', !!process.env.MISTRAL_API_KEY);
    
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
        const { messages, sessionId, isPreset, botResponseText } = req.body;
        const lastMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
        
        let botResponse;

        if (isPreset) {
            botResponse = { content: botResponseText };
        } else {
            const conversationMessages = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages
            ];

            console.log('Sending request to Mistral...');
            const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MISTRAL_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'mistral-large-latest',
                    messages: conversationMessages,
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!mistralRes.ok) {
                const errorText = await mistralRes.text();
                console.error('Mistral API Failed:', mistralRes.status, errorText);
                throw new Error(`Mistral API Error: ${mistralRes.status} ${errorText}`);
            }

            const data = await mistralRes.json();
            console.log('Mistral response OK');
            if (data.choices && data.choices[0]) {
                botResponse = { content: data.choices[0].message.content };
            } else {
                throw new Error('Invalid response format from Mistral');
            }
        }

        try {
            await supabaseCall('chat_messages', 'POST', {
                session_id: sessionId || `session_${Date.now()}`,
                user_message: lastMessage,
                bot_response: botResponse.content
            });
        } catch (saveErr) {
            console.log('Failed to save chat message:', saveErr.message);
        }

        try {
            const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8730614252:AAGuV_V_iHfdmVrfiol_6fCuHCrTEboYyjw';
            const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003887183193';
            
            const options = {
                timeZone: 'Asia/Dubai',
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            };
            const timeString = new Intl.DateTimeFormat('en-GB', options).format(new Date()).toUpperCase() + ' (UAE Time)';
            
            const tgMessage = `💬 *Chatbot Conversation — Bin Thani Real Estate*\n\n👤 *Visitor Message:* ${lastMessage || 'N/A'}\n🤖 *Bot Reply:* ${botResponse.content.substring(0, 300) || 'N/A'}\n🕐 *Time:* ${timeString}`;

            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: tgMessage,
                    parse_mode: 'Markdown'
                })
            });
        } catch (tgErr) {
             console.log('Telegram send failed:', tgErr.message);
        }

        return res.status(200).json(botResponse);
    } catch (err) {
        console.error('Chatbot unhandled error:', err.message);
        return res.status(500).json({ error: err.message, role: 'assistant', content: 'Sorry, I am having trouble connecting. ' + err.message });
    }
}
