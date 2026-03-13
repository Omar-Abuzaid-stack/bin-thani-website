const fs = require('fs');
const glob = require('glob');

function scanFile(file) {
    const content = fs.readFileSync(file, 'utf8');
    const regex = />(\s*[a-zA-Z][^<{>]*\s*)<\//g;
    let match;
    let found = [];
    while ((match = regex.exec(content)) !== null) {
        let text = match[1].trim();
        // Ignore if string looks like {t('...')} or is just code
        if (text && /[a-zA-Z]/.test(text) && !text.includes('t(') && !text.includes('getContent(') && !text.includes('language === ')) {
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
