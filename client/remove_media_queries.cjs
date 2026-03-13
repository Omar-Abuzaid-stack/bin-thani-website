const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.css')) {
            results.push(file);
        }
    });
    return results;
}

const cssFiles = walk('./src');

cssFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // This regex attempts to find @media blocks. 
    // It's a bit naive but should work for standard nested braces (1 level).
    // @media[^{]+\{(?:[^{}]+|\{[^{}]*\})*\}
    // We want to remove the entire block.
    
    const mediaRegex = /@media[^{]+\{(?:[^{}]+|\{[^{}]*\})*\}/g;
    
    const newContent = content.replace(mediaRegex, '');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log(`Cleaned media queries from: ${file}`);
    }
});

console.log('Finished cleaning media queries.');
