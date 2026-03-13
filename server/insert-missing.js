require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function insertMissing() {
    const missingProps = [
        {
            title: 'Joud Tower',
            developer: 'Albatha Real Estate',
            images: JSON.stringify(['https://keltandcorealty.com/wp-content/uploads/2025/11/Joud-Tower-at-Al-Mamzar-__Sharjah-Al-Batha-3-1.webp']),
            description: 'Premium tower living at Al Mamzar.',
            location: 'Al Mamzar, Sharjah',
            status: 'Available',
            price: 'Contact for Details'
        },
        {
            title: 'Sharjah Sustainable City Phase 2',
            developer: 'Diamond Developers',
            images: JSON.stringify(['https://www.mepmiddleeast.com/cloud/2026/01/20/Sharjah-Sustainable-City-II-1-scaled.jpg']),
            description: 'Phase 2 of the premier sustainable community in Sharjah.',
            location: 'Al Rahmaniyah, Sharjah',
            status: 'Off-Plan',
            price: 'Contact for Details'
        }
    ];

    for (const p of missingProps) {
        const { error } = await supabase.from('properties').insert([p]);
        if (error) {
            console.error(`Error inserting ${p.title}:`, error);
        } else {
            console.log(`Inserted ${p.title}`);
        }
    }
}

insertMissing();
