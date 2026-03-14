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
    
    if (msg.includes('buy') || msg.includes('purchase') || msg.includes('شراء')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.buy_ar : FALLBACK_RESPONSES.buy_en;
    } else if (msg.includes('rent') || msg.includes('ايجار')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.rent_ar : FALLBACK_RESPONSES.rent_en;
    } else if (msg.includes('invest') || msg.includes('استثمار')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.invest_ar : FALLBACK_RESPONSES.invest_en;
    } else if (msg.includes('phone') || msg.includes('number') || msg.includes('call') || msg.includes('رقم') || msg.includes('هاتف')) {
        return lang === 'ar' ? 'يمكنك التواصل معنا عبر الهاتف أو الواتساب على 971557626912+' : 'You can contact us via phone or WhatsApp at +971 55 762 6912.';
    } else {
        return lang === 'ar' ? 'شكراً لرسالتك! لمزيد من التفاصيل، يرجى تزويدنا برقم هاتفك أو الاتصال بنا مباشرة على 971557626912+.' : 'Thank you for your message! For more details, please provide your phone number or call us directly at +971 55 762 6912.';
    }
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
        return res.status(200).json({ content: FALLBACK_RESPONSES.initial_en });
    }
}
