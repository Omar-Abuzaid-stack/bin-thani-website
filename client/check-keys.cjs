const ObjectSyntaxParser = require('acorn');
const fs = require('fs');
const glob = require('glob');

const lcText = fs.readFileSync('src/context/LanguageContext.jsx', 'utf8');
const objMatch = lcText.match(/const translations = (\{[\s\S]*?\n\};)/);
if (!objMatch) {
    console.error('Failed to parse translations object');
    process.exit(1);
}

// Very simple manual parsing (since acorn cannot parse JSX easily, we just grab lines safely).
const getTranslations = (lang) => {
    let keys = [];
    const blockRegex = new RegExp(`${lang}:\\s*\\{[\\s\\S]*?\\n  \\}`, 'm');
    const blockMatch = lcText.match(blockRegex);
    if (!blockMatch) return keys;
    
    const lines = blockMatch[0].split('\n');
    lines.forEach(line => {
        const keyMatch = line.match(/^\s*'?([^':]+)'?\s*:/);
        if (keyMatch && keyMatch[1] !== lang) {
            keys.push(keyMatch[1].trim());
        }
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

console.log('Keys MISSING in AR but present in EN:');
enKeys.forEach(k => { if (!arKeys.includes(k)) console.log(k); });

console.log('- Done');
