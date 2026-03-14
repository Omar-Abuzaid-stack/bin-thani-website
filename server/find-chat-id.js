
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BOT_TOKEN = '8730614252:AAGuV_V_iHfdmVrfiol_6fCuHCrTEboYyjw';

async function getUpdates() {
    console.log('Checking for updates from Telegram bot...');
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
        const data = await response.json();
        
        if (data.ok && data.result.length > 0) {
            console.log('\n✅ Found updates!');
            data.result.forEach(update => {
                if (update.message) {
                    const chatId = update.message.chat.id;
                    const name = update.message.from.first_name;
                    console.log(`- Chat ID: ${chatId} (from ${name})`);
                }
            });
            console.log('\nUse one of these Chat IDs in your .env file as TELEGRAM_CHAT_ID');
        } else {
            console.log('\n❌ No recent messages found. Please send a message to your bot and run this script again.');
        }
    } catch (err) {
        console.error('Error fetching updates:', err.message);
    }
}

getUpdates();
