const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Supabase Config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Telegram Config
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8730614252:AAGuV_V_iHfdmVrfiol_6fCuHCrTEboYyjw';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Helper function to send Telegram notification
async function sendTelegramNotification(lead) {
    if (!TELEGRAM_CHAT_ID) {
        console.log('⚠️ TELEGRAM_CHAT_ID not set, skipping notification');
        return;
    }

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
        console.log('✅ Telegram notification sent');
    } catch (err) {
        console.error('❌ Failed to send Telegram notification:', err.message);
    }
}

// Helper function for Supabase REST calls
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
    
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) return data;
    
    console.error(`❌ Supabase Error (${method} ${endpoint}):`, JSON.stringify(data, null, 2));
    throw new Error(data.message || data.error_description || 'Supabase error');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- API Routes ---

// Get all properties with advanced filtering
app.get('/api/properties', async (req, res) => {
    const { type, minPrice, maxPrice, bedrooms, location, status, developer } = req.query;
    
    try {
        let query = 'properties?select=*&order=created_at.desc';
        const filters = [];
        
        if (type) filters.push(`type=eq.${type}`);
        if (status) filters.push(`status=eq.${status}`);
        if (developer) filters.push(`developer=eq.${developer}`);
        if (bedrooms) filters.push(`bedrooms=gte.${bedrooms}`);
        if (location) filters.push(`or=(location.ilike.*${location}*,area_full.ilike.*${location}*)`);
        
        if (filters.length > 0) query += '&' + filters.join('&');
        
        let properties = await supabaseCall(query);
        
        // Filter by price
        if (minPrice) {
            properties = properties.filter(p => (p.price_numeric || 0) >= parseInt(minPrice));
        }
        if (maxPrice) {
            properties = properties.filter(p => (p.price_numeric || 0) <= parseInt(maxPrice));
        }

        res.json(properties);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get featured properties
app.get('/api/properties/featured', async (req, res) => {
    try {
        const data = await supabaseCall('properties?select=*&featured.eq.true');
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
    try {
        const data = await supabaseCall(`properties?id=eq.${req.params.id}&select=*&limit=1`);
        
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        const property = data[0];
        
        // Increment views
        await supabaseCall(`properties?id=eq.${req.params.id}`, 'PATCH', {
            views: (property.views || 0) + 1
        });
        
        res.json(property);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all developers
app.get('/api/developers', async (req, res) => {
    try {
        // 1. Try to fetch developer metadata from 'developers' table
        let developerMetadata = [];
        try {
            developerMetadata = await supabaseCall('developers?select=*');
        } catch (e) {
            console.log('Developers table not found, using fallback metadata');
            // Fallback metadata for major developers
            developerMetadata = [
                { name: 'Arada', name_ar: 'أراداء', logo: 'https://arada.com/assets/images/logo.svg', tagline: 'Building cities of the future', tagline_ar: 'بناء مدن المستقبل' },
                { name: 'Alef Group', name_ar: 'مجموعة ألف', logo: 'https://www.alefgroup.ae/wp-content/themes/alef-group/assets/images/logo.svg', tagline: 'Premier lifestyle developer', tagline_ar: 'مطور نمط الحياة المميز' },
                { name: 'Tiger Group', name_ar: 'مجموعة تايجر', logo: 'https://tigergroup.ae/wp-content/uploads/2024/05/logo-tiger.png', tagline: 'Excellence in construction', tagline_ar: 'التميز في الإنشاءات' },
                { name: 'Eagle Hills', name_ar: 'إيجل هيلز', logo: 'https://www.eaglehills.com/wp-content/themes/eaglehills/assets/images/logo.svg', tagline: 'Global real estate excellence', tagline_ar: 'التميز العالمي في العقارات' },
                { name: 'Shoumous', name_ar: 'شموس', logo: 'https://www.shoumous.com/wp-content/uploads/2022/12/logo-HD1.png', tagline: 'Luxury living in Sharjah', tagline_ar: 'حياة فاخرة في الشارقة' },
                { name: 'Al Tay Hills', name_ar: 'تلال الطي', logo: 'https://static.tildacdn.one/tild3331-3630-4365-b834-663032323632/Al_Tay_Hills_Brochur.png', tagline: 'Premium suburban villas', tagline_ar: 'فلل سكنية فاخرة' },
                { name: 'Manazil', name_ar: 'منازل', logo: 'https://images.seeklogo.com/logo-png/49/2/manazel-logo-png_seeklogo-492290.png', tagline: 'Quality community homes', tagline_ar: 'منازل مجتمعية عالية الجودة' },
                { name: 'Al Marwan', name_ar: 'المروان', logo: 'https://www.palmera.realestate/wp-content/uploads/2025/06/Al-Marwan-Developments-Logo.png', tagline: 'Master-planned perfection', tagline_ar: 'إتقان في المخططات الشاملة' }
            ];
        }

        // 2. Fetch all properties to group by developer
        const properties = await supabaseCall('properties?select=id,title,title_ar,developer,project,location,location_ar,status,status_ar,description,description_ar,images,bedrooms,bathrooms,price');
        
        // 3. Combine metadata with projects
        const developers = developerMetadata.map(dev => {
            const devProjects = properties
                .filter(p => p.developer && p.developer.toLowerCase().includes(dev.name.toLowerCase()))
                .map(p => ({
                    id: p.id,
                    name: p.title,
                    name_ar: p.title_ar,
                    location: p.location,
                    location_ar: p.location_ar,
                    status: p.status,
                    status_ar: p.status_ar,
                    image: (() => {
                        try {
                            const imgs = JSON.parse(p.images);
                            return Array.isArray(imgs) ? imgs[0] : null;
                        } catch(e) { return null; }
                    })(),
                    description: p.description,
                    description_ar: p.description_ar,
                    bedrooms: p.bedrooms,
                    price: p.price
                }));

            return {
                ...dev,
                projects: devProjects,
                projects_count: devProjects.length
            };
        });

        // Add developers from properties that aren't in metadata
        const metadataNames = developerMetadata.map(d => d.name.toLowerCase());
        const otherDevNames = [...new Set(properties.map(p => p.developer))]
            .filter(name => name && !metadataNames.some(m => name.toLowerCase().includes(m)));

        otherDevNames.forEach(name => {
            const devProjects = properties
                .filter(p => p.developer === name)
                .map(p => ({
                    id: p.id,
                    name: p.title,
                    name_ar: p.title_ar,
                    location: p.location,
                    location_ar: p.location_ar,
                    status: p.status,
                    status_ar: p.status_ar,
                    image: (() => {
                        try {
                            const imgs = JSON.parse(p.images);
                            return Array.isArray(imgs) ? imgs[0] : null;
                        } catch(e) { return null; }
                    })(),
                    description: p.description,
                    description_ar: p.description_ar,
                    bedrooms: p.bedrooms,
                    price: p.price
                }));

            developers.push({
                name: name,
                name_ar: name, // Fallback
                logo: null,
                tagline: `${name} - Leading Developer`,
                tagline_ar: `${name} - مطور رائد`,
                projects: devProjects,
                projects_count: devProjects.length
            });
        });
        
        // Filter out developers with no projects if needed, or keep for list
        res.json(developers.filter(d => d.projects_count > 0 || d.logo));
    } catch (err) {
        console.error('Developers API error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Post Lead
app.post('/api/leads', async (req, res) => {
    // Robustly handle different field names (message vs requirements)
    const { name, email, phone, interest, area, budget, message, requirements, source } = req.body;
    const finalMessage = message || requirements || 'Not provided';
    
    try {
        const leadData = {
            name: name || 'Not provided',
            email: email || 'Not provided',
            phone: phone || 'Not provided',
            interest: interest || 'Not provided',
            area: area || 'Not provided',
            budget: budget || 'Not provided',
            message: finalMessage,
            source: source || 'Website'
        };

        console.log('📤 Sending Lead to Supabase:', JSON.stringify(leadData, null, 2));

        const data = await supabaseCall('leads', 'POST', leadData);
        
        // Telegram notifications are now handled directly by Supabase triggers for 24/7 reliability.
        
        // Also try Google Sheets if configured
        try {
            if (process.env.GOOGLE_SHEET_ID) {
                const fs = require('fs');
                if (fs.existsSync('./credentials.json')) {
                    const { google } = require('googleapis');
                    const credentials = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
                    const auth = new google.auth.GoogleAuth({
                        credentials,
                        scopes: ['https://www.googleapis.com/auth/spreadsheets']
                    });
                    const sheetsClient = google.sheets({ version: 'v4', auth });
                    
                    await sheetsClient.spreadsheets.values.append({
                        spreadsheetId: process.env.GOOGLE_SHEET_ID,
                        range: 'Sheet1!A:H',
                        valueInputOption: 'USER_ENTERED',
                        requestBody: {
                            values: [[
                                new Date().toISOString(),
                                name,
                                email,
                                phone,
                                interest,
                                area,
                                budget,
                                finalMessage
                            ]]
                        }
                    });
                }
            }
        } catch (sheetErr) {
            console.log('Google Sheets error:', sheetErr.message);
        }

        res.status(201).json({ id: data?.[0]?.id, success: true });
    } catch (err) {
        console.error('Lead error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get all leads (for admin)
app.get('/api/admin/leads', async (req, res) => {
    try {
        const data = await supabaseCall('leads?select=*&order=created_at.desc');
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get chat logs (for admin)
app.get('/api/admin/chats', async (req, res) => {
    try {
        const data = await supabaseCall('chat_messages?select=*&order=created_at.desc');
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get visitor logs (for admin)
app.get('/api/admin/visitors', async (req, res) => {
    try {
        const data = await supabaseCall('visitor_logs?select=*&order=created_at.desc&limit=100');
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stats for admin
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [leads, properties, visitors] = await Promise.all([
            supabaseCall('leads?select=id'),
            supabaseCall('properties?select=views'),
            supabaseCall('visitor_logs?select=id')
        ]);
        
        const totalViews = properties?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
        
        res.json({
            totalLeads: leads?.length || 0,
            totalProperties: properties?.length || 0,
            totalVisitors: visitors?.length || 0,
            totalViews
        });
    } catch (err) {
        console.error('Stats error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Chat with Mistral
app.post('/api/chat', async (req, res) => {
    const { messages, sessionId } = req.body;
    
    try {
        const axios = require('axios');
        const response = await axios.post('https://api.mistral.ai/v1/chat/completions', {
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
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const botResponse = response.data.choices[0].message;
        
        // Store chat message in database
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
        const { userName, userEmail, userPhone } = req.body;
        
        try {
            await supabaseCall('chat_messages', 'POST', {
                session_id: sessionId || `session_${Date.now()}`,
                user_message: lastUserMessage,
                bot_response: botResponse.content,
                user_name: userName || null,
                user_email: userEmail || null,
                user_phone: userPhone || null
            });
            console.log('Chat message saved to database');
        } catch (saveErr) {
            console.log('Failed to save chat message:', saveErr.message);
        }

        res.json(botResponse);
    } catch (err) {
        console.error('Mistral API Error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Chatbot service unavailable' });
    }
});

// Create new property
app.post('/api/properties', async (req, res) => {
    try {
        const data = await supabaseCall('properties', 'POST', req.body);
        res.status(201).json(data?.[0] || { success: true });
    } catch (err) {
        console.error('Create property error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update property
app.put('/api/property', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    
    try {
        const data = await supabaseCall(`properties?id=eq.${id}`, 'PATCH', req.body);
        res.json(data?.[0] || { success: true });
    } catch (err) {
        console.error('Update property error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Delete property
app.delete('/api/property', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    
    try {
        await supabaseCall(`properties?id=eq.${id}`, 'DELETE');
        res.json({ success: true });
    } catch (err) {
        console.error('Delete property error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Create new developer
app.post('/api/developers', async (req, res) => {
    try {
        const data = await supabaseCall('developers', 'POST', req.body);
        res.status(201).json(data?.[0] || { success: true });
    } catch (err) {
        console.error('Create developer error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update developer
app.put('/api/developers', async (req, res) => {
    const { id, name } = req.query;
    if (!id && !name) return res.status(400).json({ error: 'ID or Name is required' });
    
    try {
        const query = id ? `developers?id=eq.${id}` : `developers?name=eq.${name}`;
        const data = await supabaseCall(query, 'PATCH', req.body);
        res.json(data?.[0] || { success: true });
    } catch (err) {
        console.error('Update developer error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Delete developer
app.delete('/api/developers', async (req, res) => {
    const { id, name } = req.query;
    if (!id && !name) return res.status(400).json({ error: 'ID or Name is required' });
    
    try {
        // If deleting by name, also delete associated properties? 
        // Or just let the database foreign keys handle it if configured (they aren't in this schema).
        // Let's just delete the developer metadata.
        const query = id ? `developers?id=eq.${id}` : `developers?name=eq.${name}`;
        await supabaseCall(query, 'DELETE');
        res.json({ success: true });
    } catch (err) {
        console.error('Delete developer error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Track page view
app.post('/api/track', async (req, res) => {
    const { path, referrer } = req.body;
    const userAgent = req.headers['user-agent'];
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        await supabaseCall('visitor_logs', 'POST', {
            page_path: path || 'unknown',
            user_agent: userAgent,
            ip_address: ip,
            referrer: referrer || 'direct'
        });
        res.json({ success: true });
    } catch (err) {
        console.log('Failed to track visitor:', err.message);
        res.json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Using Supabase: ${SUPABASE_URL}`);
});
