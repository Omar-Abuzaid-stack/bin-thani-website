require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkTables() {
    const { data: developers, error: devError } = await supabase.from('developers').select('*').limit(1);
    if (devError) {
        console.log('Developers table error:', devError.message);
    } else {
        console.log('Developers table exists and has data:', developers);
    }

    const { data: properties, error: propError } = await supabase.from('properties').select('*').limit(1);
    if (propError) {
        console.log('Properties table error:', propError.message);
    } else {
        console.log('Properties table exists and has data:', properties);
    }
}

checkTables();
