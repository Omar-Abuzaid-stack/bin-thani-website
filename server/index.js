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
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
    const data = await response.json();
    if (response.ok) return data;
    throw new Error(data.message || 'Supabase error');
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
    const { name, email, phone, interest, area, budget, requirements, source } = req.body;
    
    try {
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
                                requirements || ''
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

// Get stats for admin
app.get('/api/admin/stats', async (req, res) => {
    try {
        const leads = await supabaseCall('leads?select=id');
        const properties = await supabaseCall('properties?select=views');
        
        const totalViews = properties?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
        
        res.json({
            totalLeads: leads?.length || 0,
            totalProperties: properties?.length || 0,
            totalViews
        });
    } catch (err) {
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
        
        try {
            await supabaseCall('chat_messages', 'POST', {
                session_id: sessionId || `session_${Date.now()}`,
                user_message: lastUserMessage,
                bot_response: botResponse.content
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

// Track page view
app.post('/api/track', (req, res) => {
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Using Supabase: ${SUPABASE_URL}`);
});
