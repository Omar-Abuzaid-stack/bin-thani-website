require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDatabase() {
    console.log('🔧 Updating Supabase database...\n');
    let hasError = false;

    // 1. Update Maryam Island
    const { error: err1 } = await supabase
        .from('properties')
        .update({ 
            developer: 'Eagle Hills', 
            location: 'Al Khan, Sharjah', 
            status: 'Off-Plan / Available' 
        })
        .ilike('title', '%Maryam Island%');

    if (err1) { console.error('Error Maryam Island:', err1); hasError=true; }
    else console.log('✅ Updated Maryam Island to Eagle Hills & Al Khan, Sharjah');

    // 2. Fix Joud Tower, Tiger Sky Tower, Al Ghaf Tower to Tiger Group
    const tigerProjects = ['Joud Tower', 'Tiger Sky Tower', 'Al Ghaf Tower'];
    for (const project of tigerProjects) {
        const { error: err2 } = await supabase
            .from('properties')
            .update({ developer: 'Tiger Group' })
            .ilike('title', `%${project}%`);
        if (err2) { console.error(`Error ${project}:`, err2); hasError=true; }
        else console.log(`✅ Updated ${project} developer to Tiger Group`);
    }

    if (!hasError) {
        console.log('\nAll Supabase database records synchronized successfully!');
    }
}

updateDatabase();
