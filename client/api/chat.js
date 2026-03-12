// Vercel Serverless Function: Chat API (Mistral AI)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const SUPABASE_KEY = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : '';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY ? process.env.MISTRAL_API_KEY.trim() : '';

const SYSTEM_PROMPT = `You are Layla, a professional luxury real estate agent at Bin Thani Real Estate in Sharjah, UAE. You have 10 years of experience in UAE property market. You are warm, knowledgeable and professional.

Never reveal you are an AI. You are Layla from Bin Thani Real Estate.

1. MUST respond in English when the user writes in English.
2. MUST respond in Khaleeji Arabic when the user writes in Arabic. Never mix languages.
3. Be able to answer real questions about properties, developers, locations, and Bin Thani Real Estate services.
4. If a user needs to speak to a human being, ask for their name and phone number so a human agent can contact them.

You know everything about:
- Bin Thani Real Estate: founded by Eissa bin Rashid bin Thani, located in Muwaila Sharjah
- Key areas: Aljada, Al Mamsha, Maryam Island, Tilal City, Al Nahda, Muwaila
- Sharjah developers: Arada, Alef Group, Eagle Hills, Diamond Developers, BEEAH, Tiger Group
- UAE property laws: foreigners buy in freehold zones, 4% DLD fee, no property tax
- Off-plan: flexible payment plans, post-handover options available
- Contact: info@binthanirealestate.ae, +971 55 662 6912, +971 55 761 1400

Conversation flow:
1. Greet warmly and introduce yourself as Layla.
2. In the very first welcome message, match the user's language and ask for their info (name and phone number) at the beginning if they need a human being to talk to them, OR ask how you can help them with properties.
3. Ask about budget and preferred area if they are looking.
4. End with: "Thank you! I will personally follow up with you within 24 hours" if they provide contact info.`;

const FALLBACK_RESPONSES = {
    initial_ar: `مرحباً! أنا لَيلى من بن ثاني للعقارات في الشارقة 🇦🇪\n\nأهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟\n\nإذا كنت بحاجة للتحدث إلى أحد وكلائنا البشر، يرجى تزويدي باسمك ورقم هاتفك للاتصال بك.\n\nأو يمكنك إخباري، هل تبحث عن شراء، إيجار، أو استثمار عقاري؟`,
    initial_en: `Hello! I'm Layla from Bin Thani Real Estate in Sharjah 🏠\n\nWelcome! How can I help you today?\n\nIf you need to talk to a human agent, please provide your name and phone number so we can reach out.\n\nOtherwise, are you looking to Buy, Rent, or Invest in property?`,
    buy_en: `Wonderful! We have amazing properties available for sale in Sharjah's best locations.\n\nWhich area interests you? Aljada, Al Mamsha, Maryam Island, Tilal City, or maybe Muwaila?`,
    buy_ar: `ممتاز! لدينا عقارات مميزة للبيع في أفضل مواقع الشارقة.\n\nما المنطقة التي تهمك؟ الجداف، المامشة، جزيرة مريم، تيلال سيتي، أو مويلحة؟`,
    rent_en: `Great! We have premium rental properties across Sharjah and Dubai.\n\nWhich area would you prefer?`,
    rent_ar: `ممتاز! لدينا عقارات إيجارية مميزة في الشارقة ودبي.\n\nما المنطقة التي تفضلها؟`,
    invest_en: `Excellent choice! UAE real estate offers excellent investment opportunities with 6-9% rental yields.\n\nWhat is your budget range for investment?`,
    invest_ar: `خيار ممتاز! العقارات في الإمارات توفر عوائد استثمارية ممتازة (6-9%).\n\nما نطاق ميزانيتك للاستثمار؟`,
    name_en: `Thank you! May I have your full name please?`,
    name_ar: `شكراً لك! ما اسمك الكامل من فضلك؟`,
    phone_en: `Perfect! And what is your best contact number?`,
    phone_ar: `ممتاز! ما رقم هاتفك للتواصل؟`,
    closing_en: `Thank you! I will personally follow up with you within 24 hours.\n\nLooking forward to helping you find your dream property! 🏠`,
    closing_ar: `شكراً لك! أتابع معك شخصياً خلال 24 ساعة.\n\nأتطلع لمساعدتك في إيجاد عقارك المثالي! 🏠`
};

const ARABIC_TRIGGERS = ['مرحبا', 'اهلا', 'شكرا', 'ابحث', 'شراء', 'ايجار', 'استثمار', 'شقة', 'فلة', 'عقار', 'الامارات', 'الشارقة', 'سلام', 'اخ'];
const ENGLISH_TRIGGERS = ['hello', 'hi', 'thanks', 'buy', 'rent', 'invest', 'property', 'apartment', 'villa', 'dubai', 'sharjah', 'uae', 'good'];

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

function detectLanguage(message) {
    const msg = message.toLowerCase();
    const arabicScore = ARABIC_TRIGGERS.filter(t => msg.includes(t)).length;
    const englishScore = ENGLISH_TRIGGERS.filter(t => msg.includes(t)).length;
    return arabicScore > englishScore ? 'ar' : 'en';
}

function getFallbackResponse(message, lang, messageCount) {
    const msg = message.toLowerCase();
    
    if (messageCount === 0) {
        return lang === 'ar' ? FALLBACK_RESPONSES.initial_ar : FALLBACK_RESPONSES.initial_en;
    }
    
    if (msg.includes('buy') || msg.includes('purchase') || msg.includes('شراء')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.buy_ar : FALLBACK_RESPONSES.buy_en;
    } else if (msg.includes('rent') || msg.includes('ايجار')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.rent_ar : FALLBACK_RESPONSES.rent_en;
    } else if (msg.includes('invest') || msg.includes('استثمار')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.invest_ar : FALLBACK_RESPONSES.invest_en;
    } else if (messageCount >= 2 && (msg.includes('name') || msg.length > 3)) {
        return lang === 'ar' ? FALLBACK_RESPONSES.name_ar : FALLBACK_RESPONSES.name_en;
    } else if (messageCount >= 3 && (msg.includes('phone') || msg.includes('+971') || msg.includes('هاتف') || /^\+?[\d\s]{7,}$/.test(msg))) {
        return lang === 'ar' ? FALLBACK_RESPONSES.closing_ar : FALLBACK_RESPONSES.closing_en;
    }
    
    return lang === 'ar' ? FALLBACK_RESPONSES.initial_ar : FALLBACK_RESPONSES.initial_en;
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
        const { messages, sessionId } = req.body;
        const lastMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
        const messageCount = messages.filter(m => m.role === 'user').length;
        
        const lang = detectLanguage(lastMessage);
        let botResponse;

        if (MISTRAL_API_KEY) {
            try {
                const conversationMessages = [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages
                ];

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

                if (mistralRes.ok) {
                    const data = await mistralRes.json();
                    if (data.choices && data.choices[0]) {
                        botResponse = { content: data.choices[0].message.content };
                    }
                }
            } catch (mistralErr) {
                console.log('Mistral API error:', mistralErr.message);
            }
        }

        if (!botResponse) {
            botResponse = { content: getFallbackResponse(lastMessage, lang, messageCount) };
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

        return res.status(200).json(botResponse);
    } catch (err) {
        return res.status(200).json({ content: FALLBACK_RESPONSES.initial_en });
    }
}
