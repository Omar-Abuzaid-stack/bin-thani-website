require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
    const title = 'Al Mamsha';
    const image = 'https://www.alefgroup.ae/wp-content/uploads/2024/02/almamsha-alef-community-sharjah.jpg';
    
    const { data: props, error: getErr } = await supabase
        .from('properties')
        .select('*')
        .ilike('title', `%${title}%`);
        
    if (getErr) {
        console.error(getErr);
        return;
    }
        
    if (props && props.length > 0) {
        for (const p of props) {
            await supabase.from('properties')
                .update({ images: JSON.stringify([image]) })
                .eq('id', p.id);
            console.log(`Updated images for ${p.title}`);
        }
    } else {
        console.log("Not found");
    }
}
run();
