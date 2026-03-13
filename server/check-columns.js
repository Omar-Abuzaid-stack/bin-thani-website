require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('🔍 Checking columns in properties table...');
    const { data, error } = await supabase.from('properties').select('*').limit(1);
    if (data && data[0]) {
        console.log('Columns found:', Object.keys(data[0]).join(', '));
    } else {
        console.log('No data found or error:', error?.message);
    }
}

checkColumns();
