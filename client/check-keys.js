const fs = require('fs');
const glob = require('glob');

// Load translations from LanguageContext.jsx
const lcText = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');

const getTranslations = (lang) => {
    const regex = new RegExp(`^\\s*${lang}:\\s*\\{([\\s\\S]*?)^\\s*\\},?$`, 'm');
    const match = lcText.match(regex);
    if (!match) return [];
    
    const lines = match[1].split('\n');
    const keys = [];
    lines.forEach(line => {
        const keyMatch = line.match(/^\s*'?([^':]+)'?\s*:/);
        if (keyMatch) keys.push(keyMatch[1].trim());
    });
    return keys;
};

const enKeys = getTranslations('en');
const arKeys = getTranslations('ar');

const usedKeys = new Set();
const files = glob.sync('src/**/*.jsx');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const matchIter = content.matchAll(/t\(['"]([^'"]+)['"]\)/g);
    for (const match of matchIter) {
        usedKeys.add(match[1]);
    }
});

console.log('Keys used in t() that are MISSING in EN:');
usedKeys.forEach(k => { if (!enKeys.includes(k)) console.log(k); });

console.log('Keys used in t() that are MISSING in AR:');
usedKeys.forEach(k => { if (!arKeys.includes(k)) console.log(k); });
