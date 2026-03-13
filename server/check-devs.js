require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkDevelopers() {
    const { data, error } = await supabase.from('properties').select('developer');
    if (error) {
        console.error(error);
        return;
    }
    const developers = [...new Set(data.map(p => p.developer))];
    console.log(developers);
}

checkDevelopers();
