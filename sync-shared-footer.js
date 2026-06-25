const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Extract footer from index.html
const footerRegex = /<footer\b[^>]*>[\s\S]*?<\/footer>/i;
const match = indexHtml.match(footerRegex);

if (!match) {
  console.error("Could not find footer in index.html");
  process.exit(1);
}

const newFooter = match[0];

// Replace inside js/shared.js
const sharedJsPath = path.join(__dirname, 'js', 'shared.js');
let sharedJsContent = fs.readFileSync(sharedJsPath, 'utf8');

// Replace everything between `var FOOTER_HTML = \`` and `\`;`
const sharedFooterRegex = /var FOOTER_HTML = `[\s\S]*?`;/i;

if (sharedFooterRegex.test(sharedJsContent)) {
  sharedJsContent = sharedJsContent.replace(sharedFooterRegex, `var FOOTER_HTML = \`\n${newFooter}\`;`);
  fs.writeFileSync(sharedJsPath, sharedJsContent, 'utf8');
  console.log('Updated FOOTER_HTML in js/shared.js');
} else {
  console.log('Could not find var FOOTER_HTML in js/shared.js');
}
