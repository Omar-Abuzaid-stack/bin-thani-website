require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

const newProjects = [
    {
        title: "Antara",
        description: "Antara Residences by Arada is an exclusive waterfront development nestled along the stunning shores of Sharjah. Inspired by the legendary Arabian warrior poet, Antara offers a collection of beautifully designed apartments and residences that blend contemporary architecture with the natural beauty of the waterfront. Residents enjoy breathtaking sea views, world-class amenities, and a serene lifestyle in the heart of Sharjah's most sought-after coastal destination.",
        price: "Contact for Details",
        price_numeric: 0,
        location: "Sharjah Waterfront, Sharjah",
        area_full: "Sharjah Waterfront, Sharjah",
        type: "Off-Plan Project",
        bedrooms: 0,
        bathrooms: 0,
        area: "Various layouts",
        images: JSON.stringify(["https://aradawebcontent.blob.core.windows.net/arada-com/2024/05/Anantara-Residences-Sharjah-v28.jpg"]),
        status: "Available",
        amenities: JSON.stringify(["Swimming Pool", "Gym", "Waterfront Promenade", "Kids Play Area", "Retail Outlets", "Restaurants and Cafes", "24/7 Security", "Covered Parking", "Landscaped Gardens", "Community Clubhouse"]),
        featured: false,
        developer: "Arada"
    },
    {
        title: "Olfah",
        description: "Olfah by Alef Group is a thoughtfully designed residential community that celebrates the beauty of nature and togetherness. Located within the vibrant Al Mamsha development in Sharjah, Olfah offers a curated collection of modern apartments surrounded by lush green spaces, walking trails, and family-friendly amenities. Designed for those who value community, comfort, and a connection to nature, Olfah is the perfect place to call home.",
        price: "Contact for Details",
        price_numeric: 0,
        location: "Al Mamsha, Sharjah",
        area_full: "Al Mamsha, Sharjah",
        type: "Off-Plan Project",
        bedrooms: 0,
        bathrooms: 0,
        area: "Various layouts",
        images: JSON.stringify(["https://www.alefgroup.ae/wp-content/uploads/2025/09/olfah-banner-web.jpg"]),
        status: "Available",
        amenities: JSON.stringify(["Swimming Pool", "Gym", "Walking and Cycling Trails", "Kids Play Area", "Retail Outlets", "Restaurants and Cafes", "24/7 Security", "Covered Parking", "Landscaped Gardens", "Community Parks", "Pet Friendly Areas"]),
        featured: false,
        developer: "Alef Group"
    }
];

async function seed() {
    console.log("Inserting new projects...");
    const { error: insError } = await supabase.from('properties').insert(newProjects);
    if (insError) {
        console.error("Error inserting:", insError);
    } else {
        console.log("Successfully added new projects.");
    }
}
seed();
