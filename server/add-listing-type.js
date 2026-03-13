// Migration script: Add listing_type and price_per columns to properties table
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function runSQL(sql) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`SQL Error: ${err}`);
    }
    return response.json();
}

async function migrate() {
    console.log('🔄 Adding listing_type and price_per columns...');

    // Use Supabase REST API to add columns via ALTER TABLE
    // We'll use the raw SQL endpoint
    const url = `${SUPABASE_URL}/rest/v1/`;
    
    // Try adding the columns using the Supabase SQL API
    const sqlUrl = `${SUPABASE_URL}/rest/v1/`;
    
    // Add listing_type column
    const addListingType = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=listing_type&limit=1`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
    });
    
    if (addListingType.ok) {
        const data = await addListingType.json();
        if (data && !data.code) {
            console.log('✅ listing_type column already exists');
        }
    } else {
        console.log('❌ listing_type column missing - need to add via Supabase SQL editor');
    }
    
    // Add price_per column  
    const addPricePer = await fetch(`${SUPABASE_URL}/rest/v1/properties?select=price_per&limit=1`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
    });
    
    if (addPricePer.ok) {
        const data = await addPricePer.json();
        if (data && !data.code) {
            console.log('✅ price_per column already exists');
        }
    } else {
        console.log('❌ price_per column missing - need to add via Supabase SQL editor');
    }
    
    console.log('\n📋 SQL to run in Supabase SQL Editor if columns are missing:');
    console.log('---');
    console.log(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'buy';`);
    console.log(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_per TEXT DEFAULT 'total';`);
    console.log(`UPDATE properties SET listing_type = 'buy' WHERE listing_type IS NULL;`);
    console.log(`UPDATE properties SET price_per = 'total' WHERE price_per IS NULL;`);
    console.log('---');
}

migrate().catch(console.error);
