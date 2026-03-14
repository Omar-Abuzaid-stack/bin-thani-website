// Vercel Serverless Function: Track API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8730614252:AAGuV_V_iHfdmVrfiol_6fCuHCrTEboYyjw';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003887183193';

// UAE time formatted like "DD/MM/YYYY HH:mm AM/PM"
function getUAETime() {
    const options = {
        timeZone: 'Asia/Dubai',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date()).toUpperCase() + ' (UAE Time)';
}

function formatTimeSpent(ms) {
    if (!ms || isNaN(ms)) return 'Unknown';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s}s`;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).send('');
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, path, device, timeSpent } = req.body;
        
        let message = '';
        if (action === 'enter') {
            message = `👀 *New Visitor Entered — Bin Thani Real Estate*
🌍 *Page:* ${path || '/'}
📱 *Device:* ${device || 'Unknown'}
🕐 *Time:* ${getUAETime()}`;
        } else if (action === 'leave') {
            message = `🚪 *Visitor Left — Bin Thani Real Estate*
⏱ *Time Spent:* ${formatTimeSpent(timeSpent)}
📄 *Last Page:* ${path || '/'}
🕐 *Time:* ${getUAETime()}`;
        } else {
             return res.status(200).json({ success: true, ignored: true });
        }

        if (TELEGRAM_CHAT_ID && TELEGRAM_BOT_TOKEN) {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
