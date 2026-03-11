require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const projects = [
    {
        title: "Joud Tower",
        description: "Waterfront Luxury Skyline living featuring smart homes overlooking Al Mamzar & Al Khan lakes. A towering 55-floor masterclass in waterfront architecture.",
        price: "Contact for Details",
        price_numeric: 0,
        location: "Al Khan, Sharjah",
        area_full: "Al Khan, Sharjah",
        type: "Off-Plan Project",
        bedrooms: 0,
        bathrooms: 0,
        area: "Various layouts",
        images: JSON.stringify(["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"]),
        status: "Available",
        amenities: JSON.stringify(["Waterfront Views", "Smart Homes", "Premium Gym", "Infinity Pool", "Concierge"]),
        featured: false,
        developer: "Tiger Group"
    },
    {
        title: "Sharjah Sustainable City (Phase 2)",
        description: "Zero Costs living focusing on 0% service fees for 3 years and integrated solar energy. A fully sustainable community designed for conscious, luxury family living.",
        price: "Contact for Details",
        price_numeric: 0,
        location: "Al Rahmaniya, Sharjah",
        area_full: "Al Rahmaniya, Sharjah",
        type: "Off-Plan Project",
        bedrooms: 0,
        bathrooms: 0,
        area: "Various layouts",
        images: JSON.stringify(["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]),
        status: "Available",
        amenities: JSON.stringify(["Solar Power", "Urban Farms", "Smart Villas", "Zero Service Fees", "Parks"]),
        featured: false,
        developer: "Diamond Developers"
    },
    {
        title: "Al Ghaf Tower",
        description: "Beachside Investment at Al Khan beach offering fully furnished units with exceptionally high rental yields. Handover in Q1 2029.",
        price: "Contact for Details",
        price_numeric: 0,
        location: "Al Khan, Sharjah",
        area_full: "Al Khan, Sharjah",
        type: "Off-Plan Project",
        bedrooms: 0,
        bathrooms: 0,
        area: "Various layouts",
        images: JSON.stringify(["https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800"]),
        status: "Available",
        amenities: JSON.stringify(["Beach Access", "Fully Furnished", "High ROI", "Retail Shops", "Pool"]),
        featured: false,
        developer: "Tiger Group"
    },
    {
        title: "Maryam Island",
        description: "The 'Downtown' Waterfront experience boasting a high-end retail promenade and low-rise luxury villages. An AED 4.5B premier mixed-use destination.",
        price: "Contact for Details",
        price_numeric: 0,
        location: "Al Khan, Sharjah",
        area_full: "Al Khan, Sharjah",
        type: "Off-Plan Project",
        bedrooms: 0,
        bathrooms: 0,
        area: "Various layouts",
        images: JSON.stringify(["https://images.unsplash.com/photo-1493246318656-5bfd4cfb29b8?w=800"]),
        status: "Available",
        amenities: JSON.stringify(["Retail Promenade", "Beachfront", "Low-rise Villages", "Boutique Dining", "Marina Access"]),
        featured: false,
        developer: "Eagle Hills"
    },
    {
        title: "Khalid Bin Sultan City",
        description: "An Architectural Icon designed by Zaha Hadid. Sharjah’s first Net-Zero ready city redefining luxury sustainability and community living.",
        price: "Contact for Details",
        price_numeric: 0,
        location: "Sharjah",
        area_full: "Sharjah",
        type: "Off-Plan Project",
        bedrooms: 0,
        bathrooms: 0,
        area: "Various layouts",
        images: JSON.stringify(["https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800"]),
        status: "Under Construction",
        amenities: JSON.stringify(["Zaha Hadid Design", "Net-Zero Ready", "Smart Tech", "Parks", "Retail Hub"]),
        featured: false,
        developer: "BEEAH"
    }
];

async function seed() {
    console.log("Deleting existing Off-Plan Projects...");
    const { error: delError } = await supabase.from('properties').delete().eq('type', 'Off-Plan Project');
    if (delError) console.error("Error deleting:", delError);
    
    console.log("Inserting verified user marketing projects...");
    const { error: insError } = await supabase.from('properties').insert(projects);
    if (insError) {
        console.error("Error inserting:", insError);
    } else {
        console.log("Successfully seeded dynamic developer projects.");
    }
}

seed();
