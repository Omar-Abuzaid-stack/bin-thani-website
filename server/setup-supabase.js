/**
 * Supabase Database Setup Script
 * Run this script to create tables and seed data
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
    console.log('🔧 Setting up Supabase database...\n');

    try {
        // Create properties table
        console.log('📋 Creating properties table...');
        const { error: propsError } = await supabase
            .from('properties')
            .select('*')
            .limit(1);
        
        if (propsError && propsError.message.includes('does not exist')) {
            // Table doesn't exist, create it
            const { error: createProps } = await supabase.rpc('create_properties_table', {});
            if (createProps) {
                console.log('   Note: Will create table via SQL below');
            }
        } else {
            console.log('   ✅ Properties table already exists');
        }

        // Create leads table  
        console.log('📋 Creating leads table...');
        const { error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .limit(1);

        if (leadsError && leadsError.message.includes('does not exist')) {
            console.log('   Note: Will create table via SQL below');
        } else {
            console.log('   ✅ Leads table already exists');
        }

        // Check if we need to seed data
        const { data: existingProps } = await supabase
            .from('properties')
            .select('id')
            .limit(1);

        if (!existingProps || existingProps.length === 0) {
            console.log('\n🌱 Seeding properties data...');
            
            const properties = [
                {
                    title: 'Luxury 6BR Villa - Al Jada',
                    description: 'Stunning 6-bedroom villa with private pool, smart home system, and panoramic views of Sharjah. Premium finishing with Italian marble floors.',
                    price: 'AED 7,500,000',
                    price_numeric: 7500000,
                    location: 'Al Jada, Sharjah',
                    area_full: 'Al Jada, Sharjah',
                    type: 'Villa',
                    bedrooms: 6,
                    bathrooms: 7,
                    area: '6,500 sqft',
                    images: JSON.stringify(['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800']),
                    status: 'Available',
                    amenities: JSON.stringify(['Private Pool', 'Smart Home', 'Home Cinema', 'Gym', 'Garden', 'Parking']),
                    featured: true,
                    developer: 'Arada',
                    year_built: 2024,
                    parking: 3,
                    furnished: 'Yes'
                },
                {
                    title: 'Waterfront Penthouse - Maryam Island',
                    description: 'Exclusive 4-bedroom penthouse with breathtaking sea views, private terrace, and access to world-class amenities.',
                    price: 'AED 5,200,000',
                    price_numeric: 5200000,
                    location: 'Maryam Island, Sharjah',
                    area_full: 'Maryam Island, Sharjah',
                    type: 'Penthouse',
                    bedrooms: 4,
                    bathrooms: 5,
                    area: '3,800 sqft',
                    images: JSON.stringify(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800']),
                    status: 'Available',
                    amenities: JSON.stringify(['Sea View', 'Private Terrace', 'Concierge', 'Infinity Pool', 'Spa']),
                    featured: true,
                    developer: 'Eagle Hills',
                    year_built: 2023,
                    parking: 2,
                    furnished: 'Yes'
                },
                {
                    title: 'Modern Apartment - Al Mamsha',
                    description: 'Contemporary 2-bedroom apartment in the heart of Al Mamsha. Walking distance to schools and shopping centers.',
                    price: 'AED 850,000',
                    price_numeric: 850000,
                    location: 'Al Mamsha, Sharjah',
                    area_full: 'Al Mamsha, Sharjah',
                    type: 'Apartment',
                    bedrooms: 2,
                    bathrooms: 2,
                    area: '1,200 sqft',
                    images: JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']),
                    status: 'Available',
                    amenities: JSON.stringify(['Balcony', 'Gym', 'Pool', 'Parking', 'Security']),
                    featured: true,
                    developer: 'Tilal Properties',
                    year_built: 2022,
                    parking: 1,
                    furnished: 'No'
                },
                {
                    title: 'Townhouse - Aljada',
                    description: 'Modern 3-bedroom townhouse in the vibrant Aljada community. Close to Expo Center and universities.',
                    price: 'AED 1,650,000',
                    price_numeric: 1650000,
                    location: 'Aljada, Sharjah',
                    area_full: 'Aljada, Sharjah',
                    type: 'Townhouse',
                    bedrooms: 3,
                    bathrooms: 3,
                    area: '2,400 sqft',
                    images: JSON.stringify(['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800']),
                    status: 'Available',
                    amenities: JSON.stringify(['Community Pool', 'Gym', 'Park', 'Kids Play Area', 'Parking']),
                    featured: true,
                    developer: 'Arada',
                    year_built: 2024,
                    parking: 2,
                    furnished: 'No'
                },
                {
                    title: 'Dubai Marina Luxury Apartment',
                    description: 'Stunning 3-bedroom apartment with full marina views, premium amenities and concierge service.',
                    price: 'AED 3,200,000',
                    price_numeric: 3200000,
                    location: 'Dubai Marina, Dubai',
                    area_full: 'Dubai Marina, Dubai',
                    type: 'Apartment',
                    bedrooms: 3,
                    bathrooms: 3,
                    area: '1,850 sqft',
                    images: JSON.stringify(['https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800']),
                    status: 'Available',
                    amenities: JSON.stringify(['Marina View', 'Concierge', 'Pool', 'Gym', 'Valet']),
                    featured: true,
                    developer: 'Emaar',
                    year_built: 2021,
                    parking: 2,
                    furnished: 'Yes'
                },
                {
                    title: 'Yas Island Villa - Abu Dhabi',
                    description: 'Exclusive 5-bedroom villa on Yas Island with private beach access and golf course views.',
                    price: 'AED 12,500,000',
                    price_numeric: 12500000,
                    location: 'Yas Island, Abu Dhabi',
                    area_full: 'Yas Island, Abu Dhabi',
                    type: 'Villa',
                    bedrooms: 5,
                    bathrooms: 6,
                    area: '8,000 sqft',
                    images: JSON.stringify(['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800']),
                    status: 'Off-Plan',
                    amenities: JSON.stringify(['Private Beach', 'Golf View', 'Pool', 'Home Theater', 'Staff Quarters']),
                    featured: true,
                    developer: 'Aldar',
                    year_built: 2025,
                    parking: 4,
                    furnished: 'Yes'
                },
                {
                    title: 'Business Bay Office Tower',
                    description: 'Premium office space in the heart of Business Bay with stunning city views.',
                    price: 'AED 2,100,000',
                    price_numeric: 2100000,
                    location: 'Business Bay, Dubai',
                    area_full: 'Business Bay, Dubai',
                    type: 'Office',
                    bedrooms: 0,
                    bathrooms: 2,
                    area: '1,500 sqft',
                    images: JSON.stringify(['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800']),
                    status: 'Available',
                    amenities: JSON.stringify(['City View', '24/7 Security', 'Conference Room', 'Parking']),
                    featured: false,
                    developer: 'Damac',
                    year_built: 2023,
                    parking: 1,
                    furnished: 'No'
                },
                {
                    title: 'Sobha Realty Luxury Residences',
                    description: 'Ultra-luxury 4-bedroom residence with premium finishes and exclusive amenities.',
                    price: 'AED 8,900,000',
                    price_numeric: 8900000,
                    location: 'Meydan, Dubai',
                    area_full: 'Meydan, Dubai',
                    type: 'Apartment',
                    bedrooms: 4,
                    bathrooms: 5,
                    area: '4,200 sqft',
                    images: JSON.stringify(['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800']),
                    status: 'Available',
                    amenities: JSON.stringify(['Golf View', 'Private Elevator', 'Smart Home', 'Spa', 'Cinema']),
                    featured: true,
                    developer: 'Sobha Realty',
                    year_built: 2024,
                    parking: 3,
                    furnished: 'Yes'
                },
                {
                    title: 'Palm Jumeirah Beach Villa',
                    description: 'Exclusive beachfront villa on Palm Jumeirah with private beach and pool.',
                    price: 'AED 25,000,000',
                    price_numeric: 25000000,
                    location: 'Palm Jumeirah, Dubai',
                    area_full: 'Palm Jumeirah, Dubai',
                    type: 'Villa',
                    bedrooms: 7,
                    bathrooms: 8,
                    area: '12,000 sqft',
                    images: JSON.stringify(['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']),
                    status: 'Available',
                    amenities: JSON.stringify(['Private Beach', 'Pool', 'Home Theater', 'Staff Quarters', 'Smart Home']),
                    featured: true,
                    developer: 'Nakheel',
                    year_built: 2023,
                    parking: 6,
                    furnished: 'Yes'
                },
                {
                    title: 'Saadiyat Beach Residence',
                    description: 'Luxury residence near Louvre Abu Dhabi with beach and golf access.',
                    price: 'AED 4,800,000',
                    price_numeric: 4800000,
                    location: 'Saadiyat Island, Abu Dhabi',
                    area_full: 'Saadiyat Island, Abu Dhabi',
                    type: 'Apartment',
                    bedrooms: 3,
                    bathrooms: 4,
                    area: '2,800 sqft',
                    images: JSON.stringify(['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800']),
                    status: 'Available',
                    amenities: JSON.stringify(['Beach Access', 'Golf View', 'Pool', 'Concierge', 'Parking']),
                    featured: true,
                    developer: 'Aldar',
                    year_built: 2022,
                    parking: 2,
                    furnished: 'Yes'
                }
            ];

            const { error: seedError } = await supabase
                .from('properties')
                .insert(properties);

            if (seedError) {
                console.log('   ⚠️ Seed error:', seedError.message);
            } else {
                console.log('   ✅ Seeded 10 properties');
            }
        }

        console.log('\n✅ Database setup complete!');
        console.log('\n📝 Next steps:');
        console.log('   1. Go to Supabase Dashboard → SQL Editor');
        console.log('   2. Run the SQL below to create tables manually if they don\'t exist:');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

setupDatabase();
