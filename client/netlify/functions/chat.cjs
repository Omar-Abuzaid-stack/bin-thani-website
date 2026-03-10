// Netlify Function: Chat API (Mistral AI)
// Uses native fetch - available in Node 18+

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

// Fallback responses when Mistral API is unavailable
const FALLBACK_RESPONSES = {
    initial: "Welcome to Bin Thani Real Estate! 🏠\n\nI'm here to help you find your dream property in Sharjah, Dubai, and across the UAE.\n\nWhat are you looking for? (Buy / Rent / Invest)",
    buy: "Excellent choice! We have amazing properties available for purchase.\n\nWhich area interests you? (Sharjah, Dubai, Abu Dhabi, or other)",
    rent: "Great! We have premium rental properties across the UAE.\n\nWhich area would you prefer?",
    invest: "Wonderful! UAE real estate offers excellent investment opportunities with high rental yields.\n\nWhat is your budget range for investment?",
    budget: "Thank you! Now, may I have your full name so our specialist can assist you?",
    name: "Perfect! What is your best contact number?",
    phone: "Almost done! And what is your email address?",
    email: "Thank you! 🎉\n\nOne of our specialists from Bin Thani Real Estate will contact you within 24 hours.\n\nIn the meantime, feel free to browse our properties at https://binthani.netlify.app"
};

const SYSTEM_PROMPT = `You are a professional luxury real estate assistant for Bin Thani Real Estate in Sharjah, UAE. 

Your workflow:
1. Greet warmly and ask "What are you looking for? (Buy / Rent / Invest)"
2. Ask "Which area interests you?" 
3. Ask "What is your budget range?"
4. Ask "May I have your full name?"
5. Ask "What is your best contact number?"
6. Ask "And your email address?"
7. After collecting all details (name, phone, email, interest, area, budget), reply: "Thank you! One of our specialists from Bin Thani Real Estate will contact you within 24 hours."

Help users find properties, answer questions about the UAE real estate market (Sharjah, Dubai, Abu Dhabi), and provide expert advice. Be professional, warm, and respond in the same language the user writes in (Arabic or English).`;

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

// Simple state machine for collecting user info
function processFallback(userMessage) {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('buy') || msg.includes('purchase')) {
        return FALLBACK_RESPONSES.buy;
    } else if (msg.includes('rent')) {
        return FALLBACK_RESPONSES.rent;
    } else if (msg.includes('invest')) {
        return FALLBACK_RESPONSES.invest;
    } else if (msg.includes('budget') || msg.includes('price') || msg.includes(' AED') || msg.includes('dirham')) {
        return FALLBACK_RESPONSES.budget;
    } else if (msg.includes('name') || msg.length > 3) {
        return FALLBACK_RESPONSES.name;
    } else if (msg.includes('phone') || msg.includes('+971') || /^\+?[\d\s]{8,}$/.test(msg)) {
        return FALLBACK_RESPONSES.phone;
    } else if (msg.includes('email') || msg.includes('@')) {
        return FALLBACK_RESPONSES.email;
    }
    
    return null;
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
        const lastMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
        
        let botResponse;

        // Try Mistral API first
        if (MISTRAL_API_KEY) {
            try {
                const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'mistral-large-latest',
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            ...messages
                        ]
                    })
                });

                if (mistralResponse.ok) {
                    const mistralData = await mistralResponse.json();
                    if (mistralData.choices && mistralData.choices[0]) {
                        botResponse = { content: mistralData.choices[0].message.content };
                    }
                }
            } catch (mistralErr) {
                console.log('Mistral API error:', mistralErr.message);
            }
        }

        // Fallback to simple response if Mistral fails
        if (!botResponse) {
            const fallbackResponse = processFallback(lastMessage);
            if (fallbackResponse) {
                botResponse = { content: fallbackResponse };
            } else {
                botResponse = { content: FALLBACK_RESPONSES.initial };
            }
        }
        
        // Store chat message in database
        try {
            await supabaseCall('chat_messages', 'POST', {
                session_id: sessionId || `session_${Date.now()}`,
                user_message: lastMessage,
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
        // Return fallback response on any error
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ content: FALLBACK_RESPONSES.initial })
        };
    }
};
