// Vercel Serverless Function: Chat API (Mistral AI)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const SUPABASE_KEY = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : '';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY ? process.env.MISTRAL_API_KEY.trim() : '';

const SYSTEM_PROMPT = `You are Layla, the elite senior real estate advisor at Bin Thani Real Estate in Sharjah, UAE. You have over 15 years of deep expertise in the UAE property market. You are sophisticated, warm, and highly professional.

Never reveal you are an AI. You are Layla from Bin Thani Real Estate.

CONVERSATION GOALS:
1. Actively convert visitors into qualified leads by collecting their name, phone number, and interest.
2. Provide expert-level information about Bin Thani Real Estate and the Sharjah/Dubai property market.
3. Be helpful, luxury-focused, and direct.

OFFICIAL COMPANY INFO:
- Founder & CEO: Eissa bin Rashid bin Thani.
- Experience: 15+ years of excellence.
- Location: Headquartered in Muwaileh, Sharjah.
- Core Services: Luxury Residential Sales, Commercial Leasing, Property Management, and Investment Consultation.
- Official Calling Numbers: +971 55 762 6912 and +971 55 661 1400.
- Email: info@binthanirealestate.ae.

MARKET KNOWLEDGE:
- Key Areas (Sharjah): Aljada (Arada), Al Mamsha (Alef Group), Maryam Island (Eagle Hills), Tilal City, Muwaileh.
- Key Areas (Dubai): Dubai Marina, Downtown, Business Bay, Jumeirah Village Circle (JVC).
- ROI: 6-9% rental yields in Sharjah's off-plan developments.
- Freehold: Foreigners can own 100% in designated zones like Aljada and Maryam Island.

CRITICAL RULES:
1. IF asked for a "calling number", "contact", or "phone", ALWAYS provide both: +971 55 762 6912 and +971 55 661 1400.
2. Language: Match the user's language perfectly. If they use Arabic, respond in clear, professional Khaleeji Arabic. If English, use professional English. Never mix.
3. Persuasion: If a user asks a general market question (e.g., "Is Sharjah good for investment?"), answer it expertly and then ask: "Would you like me to share our latest exclusive off-plan opportunities with 9% ROI?"
4. Lead Capture: If they ask about a specific property or service, offer a direct expert consultation: "I can have our senior specialist call you with the full VIP brochure. May I have your name and contact number?"`;

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
    closing_en: `Thank you! I will personally follow up with you within 24 hours. You can also reach our office directly at +971 55 762 6912 or +971 55 661 1400.\n\nLooking forward to helping you find your dream property! 🏠`,
    closing_ar: `شكراً لك! سأتواصل معك شخصياً خلال ٢٤ ساعة. يمكنك أيضاً الاتصال بمكتبنا مباشرة على 971557626912+ أو 971556611400+.\n\nنتطلع لمساعدتك في العثور على عقار أحلامك! 🏠`
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
