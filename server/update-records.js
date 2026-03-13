require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProjects() {
    console.log("Updating projects...");

    const updates = [
        { title: "Aljada", image: "https://www.arada.com/wp-content/uploads/2023/05/arada-completes-the-boulevard-a-600-home-residential-complex-at-sharjah-megaproject-aljada-3.jpg" },
        { title: "Masaar", image: "https://mybayutcdn.bayut.com/mybayut/wp-content/uploads/Cover-Aerial-view-of-Masaar-ar29082021.jpg" },
        { title: "Antara", image: "https://aradawebcontent.blob.core.windows.net/arada-com/2024/05/Anantara-Residences-Sharjah-v28.jpg" },
        { title: "Al Mamsha", image: "https://www.alefgroup.ae/wp-content/uploads/2024/08/Al-Mamsha-web-banner.jpg" },
        { title: "Olfah", image: "https://www.alefgroup.ae/wp-content/uploads/2025/09/olfah-banner-web.jpg" },
        { title: "Maryam Island", image: "https://mybayutcdn.bayut.com/mybayut/wp-content/uploads/DOTM-Maryam-Island_Cover-28-SEP-2019.jpg" },
        { title: "Tiger Sky Tower", image: "https://s3.amazonaws.com/attachments.website.tigergroup.ae/5c5d546c-a0f6-43ba-90de-7cb2409baec1" },
        { title: "Joud Tower", image: "https://keltandcorealty.com/wp-content/uploads/2025/11/Joud-Tower-at-Al-Mamzar-__Sharjah-Al-Batha-3-1.webp" },
        { title: "Al Ghaf Tower", image: "https://admin.grandreverealty.com/wp-content/propertyimg/1520/Al-Ghaf-Tower-hero-image2-bMZfBQ.webp" },
        { title: "Khalid Bin Sultan City", image: "https://khalidbinsultancity.com/sites/default/files/2025-10/Khalid-Bin-Sultan-City_PhaseOne_1.jpg" },
        { title: "Sharjah Sustainable City Phase 2", image: "https://www.mepmiddleeast.com/cloud/2026/01/20/Sharjah-Sustainable-City-II-1-scaled.jpg" },
        { title: "WaterFront City", image: "https://ajmalmakan.com/wp-content/uploads/2024/11/resized_AJMAL-MAKAN-CITY-3D-111-scaled.jpg" }
    ];

    for (const update of updates) {
        // Find property
        const { data: props, error: getErr } = await supabase
            .from('properties')
            .select('*')
            .ilike('title', `%${update.title}%`);
            
        if (getErr) {
            console.error(`Error fetching ${update.title}:`, getErr);
            continue;
        }

        if (props && props.length > 0) {
            const prop = props[0];
            const { error: updErr } = await supabase
                .from('properties')
                .update({ images: JSON.stringify([update.image]) })
                .eq('id', prop.id);
            if (updErr) {
                console.error(`Failed to update ${update.title}:`, updErr);
            } else {
                console.log(`Updated images for ${update.title}`);
            }
        } else {
            console.log(`Property not found: ${update.title}`);
        }
    }

    console.log("Removing Hayyan Villas...");
    const { error: delErr } = await supabase
        .from('properties')
        .delete()
        .ilike('title', '%Hayyan%');
    
    if (delErr) {
        console.error("Failed to delete Hayyan:", delErr);
    } else {
        console.log("Deleted Hayyan Villas if it existed.");
    }
}

async function updateDevelopers() {
    console.log("Updating developers...");
    const devs = [
        {
            name: 'Shoumous',
            logo: 'https://www.shoumous.com/wp-content/uploads/2022/12/logo-HD1.png'
        },
        {
            name: 'Al Tay Hills',
            logo: 'https://static.tildacdn.one/tild3331-3630-4365-b834-663032323632/Al_Tay_Hills_Brochur.png'
        },
        {
            name: 'Manazil',
            logo: 'https://images.seeklogo.com/logo-png/49/2/manazel-logo-png_seeklogo-492290.png'
        },
        {
            name: 'Al Marwan',
            logo: 'https://www.palmera.realestate/wp-content/uploads/2025/06/Al-Marwan-Developments-Logo.png'
        }
    ];

    for (const dev of devs) {
        const { data: existing, error: err } = await supabase
            .from('developers')
            .select('*')
            .eq('name', dev.name);
            
        if (err) {
            console.log(`Table might not exist or error: ${err.message}`);
            return; // stop execution for developers if error
        }

        if (existing && existing.length > 0) {
            // update
            await supabase.from('developers').update({ logo: dev.logo }).eq('id', existing[0].id);
            console.log(`Updated developer ${dev.name}`);
        } else {
            // insert
            await supabase.from('developers').insert([dev]);
            console.log(`Inserted developer ${dev.name}`);
        }
    }
}

async function run() {
    await updateProjects();
    await updateDevelopers();
    console.log("Done");
}

run();
