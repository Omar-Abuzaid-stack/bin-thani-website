require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkProps() {
    const { data, error } = await supabase.from('properties').select('id, title, developer');
    if (error) {
        console.error(error);
        return;
    }
    console.log(data);
}

checkProps();
