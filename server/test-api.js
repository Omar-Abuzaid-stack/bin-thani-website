require('dotenv').config({ path: '../.env' });
require('dotenv').config();
const { handler } = require('../client/api/developers.js'); // Cannot easily test Next/Vercel serverless function with `require` if it's ESM or doesn't have a mock `res`.
// Actually I'll just write a quick mock for req, res.

import('../client/api/developers.js').then(module => {
    const req = { method: 'GET' };
    const res = {
        setHeader: () => {},
        status: function(code) { this.code = code; return this; },
        json: function(data) { console.log(JSON.stringify(data.map(d => d.name), null, 2)); },
        send: function() {}
    };
    module.default(req, res);
}).catch(console.error);
