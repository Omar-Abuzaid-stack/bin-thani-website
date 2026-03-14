const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer awKEm1o4t9xGNiGwpHp7BSzSrKYjDb4L`
        },
        body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [{role: 'user', content: 'hello'}],
            temperature: 0.7,
            max_tokens: 50
        })
    });
    console.log(mistralRes.status);
    console.log(await mistralRes.json());
}
main();
