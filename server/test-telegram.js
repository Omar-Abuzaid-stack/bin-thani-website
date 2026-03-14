
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BOT_TOKEN = '8730614252:AAGuV_V_iHfdmVrfiol_6fCuHCrTEboYyjw';
const CHAT_ID = '-1003887183193';

async function sendTest() {
    console.log(`Sending test notification to ${CHAT_ID}...`);
    
    const message = `
🚀 *Telegram Bot Connected Successfully!*
This is a test notification from the Bin Thani Website backend.
Everything is set up and working 24/7.
`.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        const data = await response.json();
        if (data.ok) {
            console.log('✅ Success! Check your Telegram.');
        } else {
            console.log('❌ Failed:', data.description);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

sendTest();
