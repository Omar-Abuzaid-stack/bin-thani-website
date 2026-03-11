// Vercel Serverless Function: Developers
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const SUPABASE_KEY = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : '';

const DEVELOPER_META = {
    "Alef Group": { logo: "https://www.alefgroup.ae/wp-content/uploads/2022/11/alef-group-logo-white.png", tagline: "Building Premier Lifestyle Communities" },
    "Arada": { logo: "https://aradawebcontent.blob.core.windows.net/arada-com/2022/06/arada-logo.svg", tagline: "Transforming the Future of Sharjah" },
    "Maryam Island": { logo: null, tagline: "Sharjah’s Premier Waterfront Destination" },
    "Eagle Hills": { logo: "https://maryamisland.ae/wp-content/uploads/2023/09/Uplifted-MI-logo-01-02-white.png.webp", tagline: "Pioneering Luxury Destinations" },
    "Diamond Developers": { logo: null, tagline: "Pioneers in Sustainable Living" },
    "Tiger Group": { logo: null, tagline: "Iconic High-Rise Developments" },
    "BEEAH": { logo: null, tagline: "Pioneering a Sustainable Quality of Life" },
    "Ajmal Makan": { logo: null, tagline: "Masters of Waterfront Living" }
};

async function supabaseCall(endpoint) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    return await response.json();
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).send('');
    }

    try {
        const data = await supabaseCall('properties?select=*&type=eq.Off-Plan%20Project');
        
        // Group projects by developer
        const grouped = data.reduce((acc, project) => {
            const devName = project.developer || 'Other';
            if (!acc[devName]) acc[devName] = [];
            
            let parsedImages = [];
            if (project.images) {
                if (Array.isArray(project.images)) {
                    parsedImages = project.images;
                } else if (typeof project.images === 'string') {
                    try { parsedImages = JSON.parse(project.images); } catch(e) {}
                }
            }

            acc[devName].push({
                name: project.title,
                image: (parsedImages && parsedImages[0]) || null,
                location: project.location,
                gmaps: project.location ? project.location.replace(/\s+/g, '+') : 'Sharjah',
                type: project.type,
                status: project.status,
                price: project.price,
                bedrooms: project.bedrooms > 0 ? `${project.bedrooms} Bedrooms` : 'Various layouts',
                description: project.description,
                features: project.amenities || []
            });
            return acc;
        }, {});

        // Format for frontend
        const developers = Object.keys(grouped).map(devName => {
            const meta = DEVELOPER_META[devName] || { logo: null, tagline: "Premium Real Estate Development" };
            return {
                name: devName,
                logo: meta.logo,
                tagline: meta.tagline,
                projects: grouped[devName]
            };
        });
        
        return res.status(200).json(developers);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
