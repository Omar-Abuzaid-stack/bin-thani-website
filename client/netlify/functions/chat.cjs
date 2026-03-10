// Netlify Function: Chat API (Mistral AI)
// Uses native fetch - available in Node 18+

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

// Expert system prompt with comprehensive Bin Thani Real Estate knowledge
const SYSTEM_PROMPT = `You are the official AI assistant for Bin Thani Real Estate, a luxury real estate agency based in Sharjah, United Arab Emirates.

ABOUT BIN THANI REAL ESTATE:
- Established: Over 15 years of experience in UAE real estate
- Location: Sharjah, United Arab Emirates  
- Specializations: Buying, selling, renting, and off-plan properties
- Services: Property sales, rentals, investment advisory, property management, mortgage assistance
- Contact: info@binthanirealestate.ae | +971 55 762 6912
- Website: binthani.netlify.app

SHARJAH REAL ESTATE MARKET:
- More affordable than Dubai while still offering excellent ROI
- Popular areas: Aljada, Al Mamsha, Maryam Island, Tilal City, Al Nahda, Al Khan, Muwaileh
- Freehold zones available for foreigners
- Rental yields: 6-9% annually (higher than Dubai)
- No property tax in UAE

UAE PROPERTY LAWS:
- Foreigners can buy in designated freehold zones
- DLD (Dubai Land Department) transfer fee: 4% of property value
- No property tax in UAE
- Golden Visa available for property investors (AED 2M+)
- Off-plan purchases protected by RERA escrow accounts

OFF-PLAN BENEFITS:
- Flexible payment plans (post-handover, construction-linked)
- Lower entry price than completed properties
- High capital appreciation potential
- Choice of units and views

MORTGAGE INFORMATION:
- UAE residents: Up to 80% LTV (Loan-to-Value)
- Non-residents: Up to 50% LTV
- Maximum term: 25 years
- Interest rates: Starting from 4-5% (variable)
- Required documents: Passport, visa, salary certificate, bank statements

PREMIER SHARJAH DEVELOPERS:
- Arada (Aljada, Theicket, Furnipol)
- Alef Group (Alef Al Mamsha)
- Eagle Hills (Maryam Island)
- Sharjah Waterfront City
- Sobha Realty
- Reportage Properties
- Bloom Living
- RAK Properties

CONVERSATION STYLE:
- Be warm, professional, and human-like
- Use the user's language (Arabic or English)
- Ask one question at a time
- After understanding their needs, provide 2-3 specific property recommendations
- Be knowledgeable - answer questions about UAE real estate confidently
- End conversations: "Thank you [name]! A Bin Thani specialist will contact you within 24 hours at [phone]. Visit binthani.netlify.app to explore our listings."

YOUR GOALS:
1. Greet warmly in the user's language
2. Ask: "What are you looking for? (Buy / Rent / Invest)"
3. Ask about budget and preferred area
4. Give personalized property recommendations
5. Answer any real estate questions with expert knowledge
6. After 3 messages, collect: name, phone, email
7. Always end with the closing message above`;

// Fallback responses when Mistral API is unavailable
const FALLBACK_RESPONSES = {
    initial: `مرحباً بك في بن ثاني للعقارات! 🏠\n\nأنا هنا لمساعدتك في إيجاد العقار المثالي في الشارقة والإمارات.\n\nما الذي تبحث عنه؟ (شراء / إيجار / استثمار)`,
    
    initial_en: `Welcome to Bin Thani Real Estate! 🏠\n\nI'm here to help you find your dream property in Sharjah and across the UAE.\n\nWhat are you looking for? (Buy / Rent / Invest)`,
    
    buy_en: `Excellent choice! We have amazing properties for sale in Sharjah's best locations.\n\nWhich area interests you? (Aljada, Al Mamsha, Maryam Island, Tilal City, or other)`,
    
    buy_ar: `خيار ممتاز! لدينا عقارات مميزة للبيع في أفضل مواقع الشارقة.\n\nما المنطقة التي تهمك؟ (الجداف، المامشة، جزيرة مريم، تيلال سيتي، أو غيرها)`,
    
    rent_en: `Great! We have premium rental properties across Sharjah and Dubai.\n\nWhich area would you prefer?`,
    
    rent_ar: `ممتاز! لدينا عقارات إيجارية مميزة في الشارقة ودبي.\n\nما المنطقة التي تفضلها؟`,
    
    invest_en: `Wonderful! UAE real estate offers excellent investment opportunities with 6-9% rental yields.\n\nWhat is your budget range for investment?`,
    
    invest_ar: `ممتاز! العقارات في الإمارات توفر عوائد استثمارية ممتازة (6-9%).\n\nما نطاق ميزانيتك للاستثمار؟`,
    
    budget_en: `Thank you! Now, may I have your full name?`,
    
    budget_ar: `شكراً لك! ما اسمك الكامل من فضلك؟`,
    
    name_en: `Perfect! What is your best contact number?`,
    
    name_ar: `ممتاز! ما رقم هاتفك للتواصل؟`,
    
    phone_en: `Almost done! And what is your email address?`,
    
    phone_ar: `almost done! ما بريدك الإلكتروني من فضلك؟`,
    
    email_thanks_en: `Thank you! 🎉\n\nOne of our specialists from Bin Thani Real Estate will contact you within 24 hours.\n\nIn the meantime, visit binthani.netlify.app to explore our exclusive listings.`,
    
    email_thanks_ar: `شكراً لك! 🎉\n\nسيتواصل معك أحد متخصصي بن ثاني للعقارات خلال 24 ساعة.\n\nفي الأثناء، قم بزيارة binthani.netlify.app لاستعراض عقاراتنا الحصرية.`
};

const ARABIC_TRIGGERS = ['مرحبا', 'اهلا', 'شكرا', 'ابحث', 'شراء', 'ايجار', 'استثمار', 'شقة', 'فلة', 'عقار', 'الامارات', 'الشارقة'];
const ENGLISH_TRIGGERS = ['hello', 'hi', 'thanks', 'buy', 'rent', 'invest', 'property', 'apartment', 'villa', 'dubai', 'sharjah', 'uae'];

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

function getFallbackResponse(message, lang) {
    const msg = message.toLowerCase();
    
    if (msg.includes('buy') || msg.includes('purchase') || msg.includes('شراء') || msg.includes('شراء')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.buy_ar : FALLBACK_RESPONSES.buy_en;
    } else if (msg.includes('rent') || msg.includes('ايجار') || msg.includes('تأجير')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.rent_ar : FALLBACK_RESPONSES.rent_en;
    } else if (msg.includes('invest') || msg.includes('استثمار')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.invest_ar : FALLBACK_RESPONSES.invest_en;
    } else if (msg.includes('budget') || msg.includes('price') || msg.includes('aed') || msg.includes('ميزانية') || msg.includes('سعر')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.budget_ar : FALLBACK_RESPONSES.budget_en;
    } else if (msg.includes('name') || msg.length > 4) {
        return lang === 'ar' ? FALLBACK_RESPONSES.name_ar : FALLBACK_RESPONSES.name_en;
    } else if (msg.includes('phone') || msg.includes('+971') || msg.includes('tel') || msg.includes('هاتف') || msg.includes('جوال')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.phone_ar : FALLBACK_RESPONSES.phone_en;
    } else if (msg.includes('email') || msg.includes('@') || msg.includes('بريد')) {
        return lang === 'ar' ? FALLBACK_RESPONSES.email_thanks_ar : FALLBACK_RESPONSES.email_thanks_en;
    }
    
    return lang === 'ar' ? FALLBACK_RESPONSES.initial : FALLBACK_RESPONSES.initial_en;
}

exports.handler = async (event, context) => {
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
        
        // Detect language from user message
        const lang = detectLanguage(lastMessage);
        
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
            botResponse = { content: getFallbackResponse(lastMessage, lang) };
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
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ content: FALLBACK_RESPONSES.initial_en })
        };
    }
};
