// Vercel Serverless Function: Developers
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SUPABASE_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const SUPABASE_KEY = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : '';

const DEVELOPER_META = {
    "Alef Group": { logo: "https://www.alefgroup.ae/wp-content/uploads/2022/11/alef-group-logo-white.png", tagline: "Building Premier Lifestyle Communities" },
    "Arada": { logo: "https://aradawebcontent.blob.core.windows.net/arada-com/2022/06/arada-logo.svg", tagline: "Transforming the Future of Sharjah" },
    "Eagle Hills": { logo: "https://primepalaces.com/uploads/developers/eagle-hills-0EhBhtWNL0.png", tagline: "Pioneering Luxury Destinations" },
    "Diamond Developers": { logo: "https://megapolis.ae/_next/image?url=https%3A%2F%2Fadmin.megapolis.ae%2Fuploads%2FDiamond_Developers_976e983696.webp&w=750&q=75", tagline: "Pioneers in Sustainable Living" },
    "Tiger Group": { logo: "https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/l3fff94wkmjmzxrlvslh?ik-sanitizeSvg=true", tagline: "Iconic High-Rise Developments" },
    "BEEAH": { logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs8v9v-qdEmtWhcfCWFmylvhkrpuxpCH3Ngw&s", tagline: "Pioneering a Sustainable Quality of Life" },
    "Ajmal Makan": { logo: "https://manage.tanamiproperties.com/Developer/Developer_Logo/148/Thumb/148.png", tagline: "Masters of Waterfront Living" },
    "Shoumous": { logo: "https://www.shoumous.com/wp-content/uploads/2022/12/logo-HD1.png", tagline: "Excellence in Community Living" },
    "Altay Hills": { logo: "https://static.tildacdn.one/tild3331-3630-4365-b834-663032323632/Al_Tay_Hills_Brochur.png", tagline: "Luxury Forest Living" },
    "Al Tay Hills": { logo: "https://static.tildacdn.one/tild3331-3630-4365-b834-663032323632/Al_Tay_Hills_Brochur.png", tagline: "Luxury Forest Living" },
    "Manazil": { logo: "https://images.seeklogo.com/logo-png/49/2/manazel-logo-png_seeklogo-492290.png", tagline: "Elevating Urban Living" },
    "Al Marwan": { logo: "https://www.palmera.realestate/wp-content/uploads/2025/06/Al-Marwan-Developments-Logo.png", tagline: "Pioneering Infrastructure & Development" },
    "Tilal Properties": { logo: "https://tilaluae.com/wp-content/uploads/2021/04/Tilal-Logo.png", tagline: "Developing Sharjah's Vision" },
    "Emaar": { logo: "https://properties.emaar.com/wp-content/uploads/2018/11/emaar-logo.png", tagline: "Pioneering Global Lifestyles" },
    "Aldar": { logo: "https://www.aldar.com/assets/images/aldar-logo.svg", tagline: "Shape the Life You Want" },
    "Damac": { logo: "https://www.damacproperties.com/assets/images/damac-logo-white.svg", tagline: "Live the Luxury" },
    "Sobha Realty": { logo: "https://www.sobha.com/wp-content/themes/sobha/assets/images/logo.svg", tagline: "Passion for Perfection" },
    "Nakheel": { logo: "https://www.nakheel.com/images/nakheel-logo.svg", tagline: "Building Icons" }
};

const ALLOWED_DEVELOPERS = ["Arada", "Eagle Hills", "Tiger Group", "Ajmal Makan", "Alef Group", "BEEAH", "Shoumous", "Al Tay Hills", "Altay Hills", "Manazil", "Al Marwan"];

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
        const data = await supabaseCall('properties?select=*');
        
        // Group projects by developer
        const grouped = data.reduce((acc, project) => {
            let devName = project.developer ? project.developer.trim() : 'Other';
            if (devName.toLowerCase().includes('maryam island')) {
                devName = 'Eagle Hills';
                project.title = 'Maryam Island';
                project.location = 'Al Khan, Sharjah';
            } else if (project.title && project.title.toLowerCase().includes('maryam island')) {
                devName = 'Eagle Hills';
                project.title = 'Maryam Island';
                project.location = 'Al Khan, Sharjah';
            }

            if (!ALLOWED_DEVELOPERS.includes(devName)) return acc;

            if (!acc[devName]) acc[devName] = [];
            
            let parsedImages = [];
            if (project.images) {
                if (Array.isArray(project.images)) {
                    parsedImages = project.images;
                } else if (typeof project.images === 'string') {
                    try { parsedImages = JSON.parse(project.images); } catch(e) {}
                }
            }

            let parsedAmenities = [];
            if (project.amenities) {
                if (Array.isArray(project.amenities)) {
                    parsedAmenities = project.amenities;
                } else if (typeof project.amenities === 'string') {
                    try { 
                        parsedAmenities = JSON.parse(project.amenities); 
                    } catch(e) {
                        parsedAmenities = project.amenities.split(',').map(s => s.trim());
                    }
                }
            }

            const newProject = {
                name: project.title,
                image: (parsedImages && parsedImages[0]) || null,
                location: project.location,
                gmaps: project.location ? project.location.replace(/\s+/g, '+') : 'Sharjah',
                type: project.type,
                status: project.status,
                price: project.price,
                bedrooms: project.bedrooms > 0 ? `${project.bedrooms} Bedrooms` : 'Various layouts',
                description: project.description,
                features: parsedAmenities
            };
            
            // Deduplicate Maryam Island exactly
            if (newProject.name === 'Maryam Island') {
                const existing = acc[devName].find(p => p.name === 'Maryam Island');
                if (!existing) {
                    acc[devName].push(newProject);
                }
            } else {
                acc[devName].push(newProject);
            }
            return acc;
        }, {});

        // Format for frontend
        const developers = ALLOWED_DEVELOPERS.map(devName => {
            const meta = DEVELOPER_META[devName] || { logo: null, tagline: "Premium Real Estate Development" };
            return {
                name: devName,
                logo: meta.logo,
                tagline: meta.tagline,
                projects: grouped[devName] || []
            };
        }).filter(dev => dev.projects.length > 0 || ["Shoumous", "Al Tay Hills", "Manazil", "Al Marwan"].includes(dev.name));
        
        return res.status(200).json(developers);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
