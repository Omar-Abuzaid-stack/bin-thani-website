require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addVisibilityColumn() {
    console.log('🔧 Adding visibility column to tables...');

    // Add to properties
    const { error: propError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE properties ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;'
    });
    if (propError) {
        console.log('⚠️ Failed to add visible to properties (RPC):', propError.message);
    } else {
        console.log('✅ Added visible column to properties');
    }

    // Add to developers
    const { error: devError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE developers ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;'
    });
    if (devError) {
        console.log('⚠️ Failed to add visible to developers (RPC):', devError.message);
    } else {
        console.log('✅ Added visible column to developers');
    }
    
    console.log('\n👉 IF THE ABOVE FAILED, RUN THIS IN SUPABASE SQL EDITOR:');
    console.log(`
        ALTER TABLE properties ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;
        ALTER TABLE developers ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;
    `);
}

addVisibilityColumn();
