// Netlify Function: Chat API (Mistral AI)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

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
        const { messages, sessionId } = JSON.parse(event.body);
        
        // Call Mistral API
        const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistral-large-latest',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional luxury real estate assistant for Bin Thani Real Estate in Sharjah, UAE. 
                        
Your workflow:
1. Greet warmly and ask "What are you looking for? (Buy / Rent / Invest)"
2. Ask "Which area interests you?" 
3. Ask "What is your budget range?"
4. Ask "May I have your full name?"
5. Ask "What is your best contact number?"
6. Ask "And your email address?"
7. After collecting all details (name, phone, email, interest, area, budget), reply: "Thank you! One of our specialists from Bin Thani Real Estate will contact you within 24 hours. 🏠✨"

Help users find properties, answer questions about the UAE real estate market (Sharjah, Dubai, Abu Dhabi), and provide expert advice. Be professional, warm, and respond in the same language the user writes in (Arabic or English).`
                    },
                    ...messages
                ]
            })
        });

        const mistralData = await mistralResponse.json();
        
        if (!mistralResponse.ok) {
            throw new Error(mistralData.message || 'Mistral API error');
        }

        const botResponse = mistralData.choices[0].message;
        
        // Store chat message in database
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
        
        try {
            await supabaseCall('chat_messages', 'POST', {
                session_id: sessionId || `session_${Date.now()}`,
                user_message: lastUserMessage,
                bot_response: botResponse.content
            });
        } catch (saveErr) {
            console.log('Failed to save chat message:', saveErr.message);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(botResponse)
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message || 'Chatbot service unavailable' })
        };
    }
};
