require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testRPC() {
    const { data, error } = await supabase.rpc('exec_sql', { sql: "SELECT 1" });
    console.log("exec_sql RPC:", error ? error.message : data);
}
testRPC();
