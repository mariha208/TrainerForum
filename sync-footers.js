const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');

const indexHtml = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

// Extract footer from index.html
const footerRegex = /<footer\b[^>]*>[\s\S]*?<\/footer>/i;
const match = indexHtml.match(footerRegex);

if (!match) {
  console.error("Could not find footer in index.html");
  process.exit(1);
}

const newFooter = match[0];

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, newFooter);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated footer in ${file}`);
  } else {
    console.log(`No footer found in ${file}, skipping.`);
  }
});

console.log('Footer sync complete.');
