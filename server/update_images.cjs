require('dotenv').config({ path: '../server/.env' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const SUPABASE_KEY = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateImages() {
    const updates = [
        { title: 'Al Mamsha', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80' },
        { title: 'Hayyan', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80' }, // Ultra luxury villa
        { title: 'Aljada', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80' },
        { title: 'Masaar', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80' }, // Dense forest background with modern architecture feel
        { title: 'Maryam Island', image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=1200&q=80' },
        { title: 'Tiger Sky Tower', image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?w=1200&q=80' }, // This one should work, let's try a different one if subagent found it broken
        { title: 'Waterfront City', image: 'https://images.unsplash.com/photo-1605276374104-dee2a093cb00?w=1200&q=80' },
        { title: 'Joud Tower', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80' },
        { title: 'Sharjah Sustainable City (Phase 2)', image: 'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=1200&q=80' },
        { title: 'Al Ghaf Tower', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80' },
        { title: 'Khalid Bin Sultan City', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80' }
    ];

    // Try to find direct URLs for some
    updates[0].image = 'https://www.alefgroup.ae/wp-content/uploads/2021/04/Al-Mamsha-Sharjah.jpg';
    updates[1].image = 'https://hayyanbyalef.ae/wp-content/uploads/2022/03/Hayyan-Sharjah.jpg';
    
    for (const update of updates) {
        const { error } = await supabase
            .from('properties')
            .update({ images: JSON.stringify([update.image]) })
            .eq('title', update.title);
        
        if (error) {
            console.error(`Error updating ${update.title}:`, error.message);
        } else {
            console.log(`Updated: ${update.title}`);
        }
    }

    console.log("Images updated.");
}

updateImages();
