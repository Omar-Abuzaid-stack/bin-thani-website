require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkDevelopersTable() {
    const { data, error } = await supabase.from('developers').select('*');
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Success! Data:", data);
    }
}
checkDevelopersTable();
