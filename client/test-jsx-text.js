const fs = require('fs');
const glob = require('glob');

function scanFile(file) {
    const content = fs.readFileSync(file, 'utf8');
    // extremely simple regex to find JSX text nodes: > [A-Z][a-z0-9 ]+ <
    const regex = />([^<{]*[a-zA-Z][^<{]*)<\//g;
    let match;
    let found = [];
    while ((match = regex.exec(content)) !== null) {
        let text = match[1].trim();
        if (text && /[a-zA-Z]/.test(text) && !text.includes('t(') && !text.includes('getContent(')) {
            found.push(text);
        }
    }
    if (found.length > 0) {
        console.log(`\nFile: ${file}`);
        found.forEach(t => console.log(`  - ${t}`));
    }
}

const files = glob.sync('src/**/*.jsx');
files.forEach(scanFile);
