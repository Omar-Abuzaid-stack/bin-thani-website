require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const translations = {
  // Titles
  "Waterfront Penthouse - Maryam Island": "بنتهاوس على الواجهة المائية - جزيرة مريم",
  "Modern Apartment - Al Mamsha": "شقة حديثة - الممشى",
  "Townhouse - Aljada": "تاون هاوس - الجادة",
  "Dubai Marina Luxury Apartment": "شقة فاخرة في دبي مارينا",
  "Yas Island Villa - Abu Dhabi": "فيلا في جزيرة ياس - أبوظبي",
  "Business Bay Office Tower": "برج مكاتب في الخليج التجاري",
  "Sobha Realty Luxury Residences": "شوبها ريالتي ريزيدنس الفاخرة",
  "Saadiyat Beach Residence": "سعديات بيتش ريزيدنس",
  "Al Mamsha": "الممشى",
  "Hayyan": "حيان",
  "Aljada": "الجادة",
  "Masaar": "مسار",
  "Maryam Gate": "بوابة مريم",
  "Tiger Sky Tower": "تايجر سكاي تاور",
  "Waterfront City": "مدينة الواجهة المائية",
  "Palm Jumeirah Beach Villa": "فيلا شاطئية في نخلة جميرا",
  "Al Ghaf Tower": "برج الغاف",
  "Maryam Island": "جزيرة مريم",
  "Luxury 6BR Villa - Al Jada": "فيلا فاخرة 6 غرف - الجادة",
  "Khalid Bin Sultan City": "مدينة خالد بن سلطان",
  "Antara": "عنترة",
  "Olfah": "ألفة",

  // Developers
  "Eagle Hills": "إيجل هيلز",
  "Tilal Properties": "تلال العقارية",
  "Arada": "أرادَ",
  "Emaar": "إعمار",
  "Aldar": "الدار",
  "Damac": "داماك",
  "Sobha Realty": "شوبها العقارية",
  "Alef Group": "مجموعة ألف",
  "Maryam Island": "جزيرة مريم",
  "Tiger Group": "مجموعة تايجر",
  "Ajmal Makan": "أجمل مكان",
  "Nakheel": "نخيل",
  "BEEAH": "بيئة",

  // Locations
  "Maryam Island, Sharjah": "جزيرة مريم، الشارقة",
  "Al Mamsha, Sharjah": "الممشى، الشارقة",
  "Aljada, Sharjah": "الجادة، الشارقة",
  "Dubai Marina, Dubai": "دبي مارينا، دبي",
  "Yas Island, Abu Dhabi": "جزيرة ياس، أبوظبي",
  "Business Bay, Dubai": "الخليج التجاري، دبي",
  "Meydan, Dubai": "ميدان، دبي",
  "Saadiyat Island, Abu Dhabi": "جزيرة السعديات، أبوظبي",
  "Muwailih, Sharjah": "مويلح، الشارقة",
  "Emirates Road, Sharjah": "طريق الإمارات، الشارقة",
  "University City, Sharjah": "المدينة الجامعية، الشارقة",
  "Suyoh District, Sharjah": "ضاحية السيوح، الشارقة",
  "Al Khan, Sharjah": "الخان، الشارقة",
  "Al Hamriya, Sharjah": "الحمرية، الشارقة",
  "Palm Jumeirah, Dubai": "نخلة جميرا، دبي",
  "Al Jada, Sharjah": "الجادة، الشارقة",
  "Sharjah": "الشارقة",
  "Sharjah Waterfront, Sharjah": "واجهة الشارقة المائية، الشارقة",

  // Descriptions
  "Exclusive 4-bedroom penthouse with breathtaking sea views.": "بنتهاوس حصري 4 غرف مع إطلالة خلابة على البحر.",
  "Contemporary 2-bedroom apartment in the heart of Al Mamsha.": "شقة معاصرة 2 غرفة في قلب الممشى.",
  "Modern 3-bedroom townhouse in the vibrant Aljada community.": "تاون هاوس حديث 3 غرف في مجتمع الجادة النابض بالحياة.",
  "Stunning 3-bedroom apartment with full marina views.": "شقة مذهلة 3 غرف مع إطلالة كاملة للارينا.",
  "Exclusive 5-bedroom villa on Yas Island with private beach access.": "فيلا حصرية 5 غرف في جزيرة ياس مع وصول خاص للشاطئ.",
  "Premium office space in the heart of Business Bay.": "مساحة مكتبية مميزة في قلب الخليج التجاري.",
  "Ultra-luxury 4-bedroom residence with premium finishes.": "سكن فاخر جداً 4 غرف مع تشطيبات راقية.",
  "Luxury residence near Louvre Abu Dhabi.": "سكن فاخر بالقرب من لوفر أبوظبي.",
  "Sharjah's first fully walkable community featuring modern apartments, vibrant retail spaces, and integrated lifestyle amenities. A truly self-sustained community ensuring safety and luxury. Contact us for latest availability.": "أول مجتمع قابل للمشي في الشارقة...",
  "A premium villa community featuring extensive green spaces and world-class amenities in a serene environment. Designed to maximize privacy while offering an unmatched natural setting.": "مجتمع فلل راقي يتميز بمساحات خضراء واسعة...",
  "The ultimate lifestyle destination in Sharjah, offering residential, commercial, hospitality, and entertainment offerings in a fully integrated super-community.": "وجهة أسلوب الحياة المطلقة في الشارقة...",
  "A forested sanctuary featuring beautiful landscapes, a mature cycling track, and elegantly designed contemporary homes. Reconnect with nature within a secure gated community.": "ملاذ غابي يتميز بمناظر طبيعية جميلة...",
  "Exclusive waterfront residences offering stunning views and premium resort-style amenities along the Sharjah corniche. Enjoy the tranquility of island living in the heart of the city.": "مساكن حصرية على الواجهة المائية...",
  "A landmark high-rise development offering luxury apartments and world-class amenities in the heart of the city. A highly anticipated addition to the iconic skyline.": "مشروع شاهق التطور يقدم شقق فاخرة...",
  "An incredible collection of islands offering pristine beaches, luxury villas, and world-class marina facilities for the ultimate waterfront lifestyle experience.": "مجموعة رائعة من الجزر تقدم شواطئ نقية...",
  "Exclusive beachfront villa on Palm Jumeirah.": "فيلا شاطئية حصرية في نخلة جميرا.",
  "Beachside Investment at Al Khan beach offering fully furnished units with exceptionally high rental yields. Handover in Q1 2029.": "استثمار شاطئي في شاطئ الخان يقدم وحدات مفروشة بالكامل...",
  "The 'Downtown' Waterfront experience boasting a high-end retail promenade and low-rise luxury villages. An AED 4.5B premier mixed-use destination.": "تجربة الواجهة المائية لوسط المدينة...",
  "Stunning 6-bedroom villa with private pool, smart home system, and panoramic views of Sharjah.": "فيلا مذهلة 6 غرف مع مسبح خاص ونظام منزل ذكي.",
  "An Architectural Icon designed by Zaha Hadid. Sharjah’s first Net-Zero ready city redefining luxury sustainability and community living.": "أيقونة معمارية صممتها زها حديد. أول مدينة في الشارقة...",
  "Antara Residences by Arada is an exclusive waterfront development nestled along the stunning shores of Sharjah. Inspired by the legendary Arabian warrior poet, Antara offers a collection of beautifully designed apartments and residences that blend contemporary architecture with the natural beauty of the waterfront. Residents enjoy breathtaking sea views, world-class amenities, and a serene lifestyle in the heart of Sharjah's most sought-after coastal destination.": "مساكن عنترة من أرادَ هي مشروع حصري على الواجهة المائية يقع على طول شواطئ الشارقة المذهلة...",
  "Olfah by Alef Group is a thoughtfully designed residential community that celebrates the beauty of nature and togetherness. Located within the vibrant Al Mamsha development in Sharjah, Olfah offers a curated collection of modern apartments surrounded by lush green spaces, walking trails, and family-friendly amenities. Designed for those who value community, comfort, and a connection to nature, Olfah is the perfect place to call home.": "ألفة من مجموعة ألف هي مجمع سكني مصمم بعناية يحتفل بجمال الطبيعة والترابط العائلي..."
};

async function run() {
  const { data: properties } = await supabase.from('properties').select('*');
  for (const p of properties) {
    const title_ar = translations[p.title] || p.title;
    const location_ar = translations[p.location] || p.location;
    const developer_ar = translations[p.developer] || p.developer;
    const description_ar = translations[p.description] || p.description;

    console.log(`Updating ${p.id}...`);
    await supabase.from('properties').update({
      title_ar, location_ar, developer_ar, description_ar
    }).eq('id', p.id);
  }
  console.log("Done translating DB!");
}
run();
