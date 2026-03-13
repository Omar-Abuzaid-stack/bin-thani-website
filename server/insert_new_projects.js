require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const projects = [
    {
        title: "Sharjah Garden City",
        developer: "Shoumous",
        location: "Al Belaida, Sharjah",
        status: "Off-Plan Project / Available",
        type: "Off-Plan Project",
        description: "Sharjah Garden City by Shoumous is an exclusive gated villa community nestled in the heart of Al Belaida, Sharjah. Offering a collection of beautifully designed 3 to 5 bedroom villas, this development blends modern architecture with lush green surroundings to create a serene and private lifestyle. Sharjah Garden City is the perfect retreat for families seeking luxury, space, and tranquility away from the city hustle.",
        amenities: ["Swimming Pool", "Gym", "Gated Community", "Kids Play Area", "Landscaped Gardens", "Walking Trails", "24/7 Security", "Covered Parking", "Community Clubhouse", "Mosque"],
        images: ["https://selecthouse.co/uae/wp-content/uploads/2023/11/Sharjah-Garden-City.webp"]
    },
    {
        title: "Al Tay Hills",
        developer: "Al Tay Hills",
        location: "Al Tay, Sharjah",
        status: "Off-Plan Project / Available",
        type: "Off-Plan Project",
        description: "Al Tay Hills is a landmark master-planned community by Kuwait Real Estate Company (AQARAT) and IFA Hotels and Resorts, stretching across the scenic hills of Sharjah. Home to over 1,110 villas and townhouses with 3 to 6 bedrooms, Al Tay Hills is centred around the UAE's longest green river spanning 2.5 kilometres. This extraordinary development offers residents an unmatched lifestyle combining nature, luxury, and world-class amenities in one breathtaking destination.",
        amenities: ["2.5km Green River", "Swimming Pools", "Gym", "Golf Course", "Kids Play Areas", "Retail Outlets", "Restaurants and Cafes", "24/7 Security", "Covered Parking", "Landscaped Gardens", "Walking and Cycling Trails", "Community Clubhouse", "Hotel and Hospitality"],
        images: ["https://www.altayhills.ae/wp-content/uploads/2025/01/Mask-group-3.webp"]
    },
    {
        title: "Qasba Mall & Towers",
        developer: "Manazil",
        location: "Qasba Canal, Sharjah",
        status: "Available",
        type: "Off-Plan Project", 
        description: "Qasba Mall and Towers by Manazil is a vibrant mixed-use development situated along the iconic Qasba Canal in Sharjah. Offering a stunning collection of 1 to 3 bedroom apartments, the towers provide residents with breathtaking canal views and direct access to one of Sharjah's most beloved lifestyle destinations. With retail, dining, and entertainment at your doorstep, Qasba Mall and Towers redefines urban waterfront living.",
        amenities: ["Swimming Pool", "Gym", "Canal Views", "Retail Outlets", "Restaurants and Cafes", "24/7 Security", "Covered Parking", "Landscaped Gardens", "Kids Play Area", "Direct Canal Access"],
        images: ["https://manazil-uae.com/wp-content/uploads/elementor/thumbs/mall-canal-pictures-01-1-r5p485uvxrorqarnioqg2fpn1mxktw2fzk7xob08pm.png"]
    },
    {
        title: "Hawa Residence",
        developer: "Al Marwan",
        location: "Tilal City, Sharjah",
        status: "Off-Plan Project / Available",
        type: "Off-Plan Project",
        description: "Hawa Residence by Al Marwan is a modern residential development located within the master-planned Tilal City community in Sharjah. Offering 268 thoughtfully designed units ranging from studios to 3 bedroom apartments, Hawa Residence combines contemporary design with a vibrant community lifestyle. Residents benefit from seamless connectivity, premium amenities, and the dynamic energy of one of Sharjah's fastest growing urban destinations.",
        amenities: ["Swimming Pool", "Gym", "Kids Play Area", "Retail Outlets", "Restaurants and Cafes", "24/7 Security", "Covered Parking", "Landscaped Gardens", "Community Parks", "Smart Home Features"],
        images: ["https://www.travelsdubai.com/digital_images/large/2025-04-11/al-marwan-development-advances-its-flagship-hawa-residence-in-tilal-city-sharjah-setting-benchmarks--1744360774-5973.jpg"]
    },
    {
        title: "District 11",
        developer: "Al Marwan",
        location: "Sheikh Mohammed bin Zayed Road, Sharjah",
        status: "Off-Plan Project / Upcoming",
        type: "Off-Plan Project",
        description: "District 11 by Al Marwan is a groundbreaking mixed-use development and the UAE's first AI-designed business complex, located on Sheikh Mohammed bin Zayed Road in Sharjah. This visionary project seamlessly blends cutting-edge technology with premium commercial and residential spaces, setting a new standard for intelligent urban development in the region. District 11 is designed for forward-thinking businesses and residents who demand innovation, connectivity, and excellence.",
        amenities: ["AI-Integrated Smart Systems", "Business Offices", "Retail Outlets", "Restaurants and Cafes", "24/7 Security", "Covered Parking", "Landscaped Gardens", "Conference Facilities", "High Speed Connectivity", "Community Spaces"],
        images: ["https://offplanbazaar.ae/wp-content/uploads/2025/09/DISTRICT11-BY-ntytyn.webp"]
    }
];

async function insertProjects() {
    for (const project of projects) {
        const projectToInsert = {
            ...project,
            images: JSON.stringify(project.images),
            amenities: JSON.stringify(project.amenities)
        };

        const { data, error } = await supabase.from('properties').insert([projectToInsert]);
        if (error) {
            console.error(`Error inserting ${project.title}:`, error.message);
        } else {
            console.log(`Successfully inserted ${project.title}`);
        }
    }
}

insertProjects();
