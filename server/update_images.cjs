require('dotenv').config({ path: '../server/.env' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
const SUPABASE_KEY = process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.trim() : '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateImages() {
    const updates = [
        { title: 'Al Mamsha', image: 'https://www.alefgroup.ae/wp-content/uploads/2024/08/Al-Mamsha-web-banner.jpg' },
        { title: 'Modern Apartment - Al Mamsha', image: 'https://www.alefgroup.ae/wp-content/uploads/2024/08/Al-Mamsha-web-banner.jpg' },
        { title: 'Hayyan', image: 'https://www.alefgroup.ae/wp-content/uploads/2022/03/Hayyan-villas-banner.jpg' },
        { title: 'Aljada', image: 'https://arada.com/assets/images/projects/aljada/aljada-banner.jpg' },
        { title: 'Masaar', image: 'https://mybayutcdn.bayut.com/mybayut/wp-content/uploads/Cover-Aerial-view-of-Masaar-ar29082021.jpg' },
        { title: 'Jouri Hills', image: 'https://arada.com/assets/images/projects/jouri-hills/jouri-hills-banner.jpg' },
        { title: 'Naseej District', image: 'https://arada.com/assets/images/projects/aljada/naseej-district-banner.jpg' },
        { title: 'Tiger Sky Tower', image: 'https://www.tigergroup.ae/wp-content/uploads/2024/05/Tiger-Sky-Tower-Banner.jpg' },
        { title: 'Waterfront City', image: 'https://ajmalmakan.com/wp-content/uploads/2021/06/Ajmal-Makan-City-Hero.jpg' },
        { title: 'Joud Tower', image: 'https://www.tigergroup.ae/wp-content/uploads/2021/04/Tiger-Palace-Banner.jpg' },
        { title: 'Tiger Palace', image: 'https://www.tigergroup.ae/wp-content/uploads/2021/04/Tiger-Palace-Banner.jpg' },
        { title: 'Sharjah Sustainable City (Phase 2)', image: 'https://sharjahsustainablecity.ae/wp-content/uploads/2021/04/SSC-Masterplan.jpg' },
        { title: 'Al Ghaf Tower', image: 'https://www.tigergroup.ae/wp-content/uploads/2021/04/Tiger-Palace-Banner.jpg' },
        { title: 'Khalid Bin Sultan City', image: 'https://beeahgroup.com/wp-content/uploads/2021/04/Beeah-HQ.jpg' },
        { title: 'Maryam Gate', image: 'https://maryamisland.ae/wp-content/uploads/2021/04/Maryam-Island-Banner.jpg' },
        { title: 'Maryam Island', image: 'https://maryamisland.ae/wp-content/uploads/2021/04/Maryam-Island-Banner.jpg' },
        { title: 'Waterfront Penthouse - Maryam Island', image: 'https://maryamisland.ae/wp-content/uploads/2021/04/Maryam-Island-Banner.jpg' },
        { title: 'Alta Hills', image: 'https://www.altayhills.ae/wp-content/uploads/2023/06/Altay-Hills-Banner.jpg' },
        { title: 'Shoumous Residences', image: 'https://www.shoumous.com/wp-content/uploads/2021/04/Shoumous-Residences-Banner.jpg' },
        { title: 'Tilal City', image: 'https://tilaluae.com/wp-content/uploads/2021/04/Tilal-City-Banner.jpg' },
        { title: 'Garden City', image: 'https://www.shoumous.com/wp-content/uploads/2021/04/Sharjah-Garden-City-Banner.jpg' },
        { title: 'Burj Khalifa', image: 'https://www.emaar.com/en/Images/burj-khalifa-banner_tcm223-108754.jpg' },
        { title: 'Palm Jumeirah Beach Villa', image: 'https://www.nakheel.com/en/images/palm-jumeirah-banner_tcm224-108754.jpg' },
        { title: 'Saadiyat Beach Residence', image: 'https://www.aldar.com/en/images/saadiyat-beach-residence-banner_tcm225-108754.jpg' }
    ];

    for (const update of updates) {
        let images = [update.image];
        if (update.title === 'Masaar') {
            images = [
                'https://mybayutcdn.bayut.com/mybayut/wp-content/uploads/Cover-Aerial-view-of-Masaar-ar29082021.jpg',
                'https://new-projects-media.propertyfinder.com/project/363ffa4e-54ef-4349-b21c-1423fb82cad9/gallery/image/_DHvPjNicAASH8SbacodqFYLCdYhR-wJVcEp18G7x8g=/medium.webp'
            ];
        }

        const { error } = await supabase
            .from('properties')
            .update({ images: JSON.stringify(images) })
            .eq('title', update.title);
        
        if (error) {
            console.error(`Error updating ${update.title}:`, error.message);
        } else {
            console.log(`Updated: ${update.title}`);
        }
    }

    console.log("All project images updated.");
}

updateImages();
