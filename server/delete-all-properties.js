require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllProperties() {
    console.log('🗑️ Deleting all properties from Supabase...');
    
    // Delete all rows where id is not null (should be all rows)
    const { error } = await supabase
        .from('properties')
        .delete()
        .not('id', 'is', null);

    if (error) {
        console.error('❌ Error deleting properties:', error.message);
    } else {
        console.log('✅ Successfully deleted all property listings.');
    }
}

deleteAllProperties();
