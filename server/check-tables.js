require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('🔍 Checking Supabase tables...');
    
    const tables = ['properties', 'developers', 'leads', 'chat_messages'];
    
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`❌ Table '${table}': ${error.message}`);
        } else {
            console.log(`✅ Table '${table}': OK`);
        }
    }
}

checkTables();
