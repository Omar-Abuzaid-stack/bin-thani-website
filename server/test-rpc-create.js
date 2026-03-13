require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testRPC() {
    const { data, error } = await supabase.rpc('create_developers_table', {});
    console.log("create_developers_table RPC:", error ? error.message : data);
}
testRPC();
