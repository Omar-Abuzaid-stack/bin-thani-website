// Vercel Serverless Function: Developers API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/[\r\n]/g, '');
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim().replace(/[\r\n]/g, '');

async function supabaseCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': (method === 'POST' || method === 'PATCH') ? 'return=representation' : 'return=minimal'
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
    const text = await response.text();
    let data = [];
    if (text) {
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: text };
        }
    }
    
    if (response.ok) return data;
    throw new Error(JSON.stringify(data) || 'Supabase error');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).send('');
    }

    // CREATE Developer
    if (req.method === 'POST') {
        try {
            const result = await supabaseCall('developers', 'POST', req.body);
            return res.status(201).json(result?.[0] || { success: true });
        } catch (err) {
            console.error('Create developer error:', err.message);
            return res.status(500).json({ error: err.message });
        }
    }

    // UPDATE Developer
    if (req.method === 'PUT') {
        try {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID is required' });
            const result = await supabaseCall(`developers?id=eq.${id}`, 'PATCH', req.body);
            return res.status(200).json(result?.[0] || { success: true });
        } catch (err) {
            console.error('Update developer error:', err.message);
            return res.status(500).json({ error: err.message });
        }
    }

    // DELETE Developer
    if (req.method === 'DELETE') {
        try {
            const { id, name } = req.query;
            
            if (id) {
                await supabaseCall(`developers?id=eq.${id}`, 'DELETE');
            }
            
            if (name) {
                // 1. Delete all properties associated with this developer
                await supabaseCall(`properties?developer=eq.${encodeURIComponent(name)}`, 'DELETE');
                
                // 2. Also try to delete from developers metadata table if it exists
                try {
                    await supabaseCall(`developers?name=eq.${encodeURIComponent(name)}`, 'DELETE');
                } catch (e) {
                    // Ignore error if profile didn't exist in metadata table
                }
            }
            
            if (!id && !name) return res.status(400).json({ error: 'ID or Name is required' });
            return res.status(204).send('');
        } catch (err) {
            console.error('Delete developer error:', err.message);
            return res.status(500).json({ error: err.message });
        }
    }

    // GET Developers (with projects)
    try {
        // 1. Fetch metadata from DB
        let developerMetadata = [];
        try {
            developerMetadata = await supabaseCall('developers?select=*&order=name.asc');
        } catch (e) {
            console.log('Developers table error:', e.message);
        }

        // 2. Fetch all properties to group by developer
        const properties = await supabaseCall('properties?select=*');
        
        // 3. Combine metadata with projects
        const developersMap = new Map();

        // Initialize with metadata
        developerMetadata.forEach(dev => {
            developersMap.set(dev.name.toLowerCase(), {
                ...dev,
                projects: [],
                projects_count: 0
            });
        });

        // Group projects
        properties.forEach(p => {
            if (!p.developer) return;
            const devKey = p.developer.toLowerCase();
            
            // Auto-create developer entry if not in metadata
            if (!developersMap.has(devKey)) {
                developersMap.set(devKey, {
                    name: p.developer,
                    name_ar: p.developer_ar || p.developer,
                    logo: null,
                    tagline: `${p.developer} - Leading Developer`,
                    projects: [],
                    projects_count: 0
                });
            }

            const dev = developersMap.get(devKey);
            
            // Only include in project list if it's an "Off-Plan Project" or regular property matching dev
            // The original logic was strict: project.type === 'Off-Plan Project'
            // We'll keep that for the "Projects" sub-list to match website expectations
            if (p.type === 'Off-Plan Project') {
                dev.projects.push({
                    id: p.id,
                    name: p.title,
                    name_ar: p.title_ar,
                    location: p.location,
                    image: (() => {
                        try {
                            const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                            return Array.isArray(imgs) ? imgs[0] : null;
                        } catch(e) { return null; }
                    })(),
                    status: p.status,
                    price: p.price
                });
                dev.projects_count++;
            }
        });

        const result = Array.from(developersMap.values());
        return res.status(200).json(result);
    } catch (err) {
        console.error('Get developers error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
