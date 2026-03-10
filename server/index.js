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
        
        if (type) filters.push(`type.eq.${type}`);
        if (status) filters.push(`status.eq.${status}`);
        if (developer) filters.push(`developer.eq.${developer}`);
        if (bedrooms) filters.push(`bedrooms.gte.${bedrooms}`);
        if (location) filters.push(`or(location.ilike.*${location}*,area_full.ilike.*${location}*)`);
        
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
        const data = await supabaseCall(`properties?id.eq.${req.params.id}&select=*&limit=1`);
        
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        const property = data[0];
        
        // Increment views
        await supabaseCall(`properties?id.eq.${req.params.id}`, 'PATCH', {
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
        const data = await supabaseCall('properties?select=developer&developer.not.is.null');
        
        const developers = [...new Set(data.map(p => p.developer))].map(d => ({
            name: d,
            description: `${d} - Leading UAE developer`,
            projects_count: data.filter(p => p.developer === d).length
        }));
        
        res.json(developers);
    } catch (err) {
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
