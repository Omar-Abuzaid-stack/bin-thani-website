// Vercel Serverless Function: Developers
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const SUPABASE_KEY = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : '';

const DEVELOPER_META = {
    "Alef Group": { logo: "https://www.alefgroup.ae/wp-content/uploads/2022/11/alef-group-logo-white.png", tagline: "Building Premier Lifestyle Communities" },
    "Arada": { logo: "https://aradawebcontent.blob.core.windows.net/arada-com/2022/06/arada-logo.svg", tagline: "Transforming the Future of Sharjah" },
    "Maryam Island": { logo: "https://maryamisland.ae/wp-content/uploads/2023/09/Uplifted-MI-logo-01-02-white.png.webp", tagline: "Sharjah’s Premier Waterfront Destination" },
    "Eagle Hills": { logo: "https://maryamisland.ae/wp-content/uploads/2023/09/Uplifted-MI-logo-01-02-white.png.webp", tagline: "Pioneering Luxury Destinations" },
    "Diamond Developers": { logo: "https://sharjahsustainablecity.ae/wp-content/uploads/2021/04/SSC-Logo-White.png", tagline: "Pioneers in Sustainable Living" },
    "Tiger Group": { logo: "https://tigergroup.ae/wp-content/themes/tiger-group/assets/images/logo.png", tagline: "Iconic High-Rise Developments" },
    "BEEAH": { logo: "https://beeahgroup.com/wp-content/themes/beeah/assets/images/logo-white.svg", tagline: "Pioneering a Sustainable Quality of Life" },
    "Ajmal Makan": { logo: "https://ajmalmakan.com/wp-content/themes/ajmalmakan/assets/images/logo-white.svg", tagline: "Masters of Waterfront Living" },
    "Shoumous": { logo: "https://www.shoumous.com/wp-content/uploads/2021/04/Shoumous-logo.png", tagline: "Excellence in Community Living" },
    "Altay Hills": { logo: "https://www.altayhills.ae/wp-content/uploads/2023/06/Altay-Hills-Logo.png", tagline: "Luxury Forest Living" },
    "Manazil": { logo: "https://manazil-uae.com/wp-content/uploads/2021/04/Manazil-Logo.png", tagline: "Elevating Urban Living" },
    "Al Marwan": { logo: "https://almarwandevelopments.com/wp-content/uploads/2021/04/Al-Marwan-Logo.png", tagline: "Pioneering Infrastructure & Development" },
    "Tilal Properties": { logo: "https://tilaluae.com/wp-content/uploads/2021/04/Tilal-Logo.png", tagline: "Developing Sharjah's Vision" },
    "Emaar": { logo: "https://properties.emaar.com/wp-content/uploads/2018/11/emaar-logo.png", tagline: "Pioneering Global Lifestyles" },
    "Aldar": { logo: "https://www.aldar.com/assets/images/aldar-logo.svg", tagline: "Shape the Life You Want" },
    "Damac": { logo: "https://www.damacproperties.com/assets/images/damac-logo-white.svg", tagline: "Live the Luxury" },
    "Sobha Realty": { logo: "https://www.sobha.com/wp-content/themes/sobha/assets/images/logo.svg", tagline: "Passion for Perfection" },
    "Nakheel": { logo: "https://www.nakheel.com/images/nakheel-logo.svg", tagline: "Building Icons" }
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
