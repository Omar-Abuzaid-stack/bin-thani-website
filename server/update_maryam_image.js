require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function updateMaryamIsland() {
    const newImage = JSON.stringify(["https://cdn.emrbz.com/d/d154febef612a5c0bdb8617f77bb1c02dd68acbd/70/608x405%5E/image"]);
    
    // Update by title match
    const { data, error } = await supabase
        .from('properties')
        .update({ images: newImage })
        .ilike('title', '%Maryam Island%');

    if (error) {
        console.error("Error updating Maryam Island image:", error.message);
    } else {
        console.log("Successfully updated Maryam Island image.");
    }
}

updateMaryamIsland();
