const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const blogLink = '<li><a id="nl-blog" href="blog.html">Blog</a></li>';
const contactLink = '\n      <li><a id="nl-contact" href="contact.html">Contact</a></li>';

let updatedCount = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if it already has the contact link right after blog to avoid duplicate
    if (content.includes(blogLink) && !content.includes(blogLink + contactLink)) {
        const newContent = content.replace(
            blogLink, 
            blogLink + contactLink
        );
        fs.writeFileSync(filePath, newContent, 'utf-8');
        updatedCount++;
        console.log(`Updated nav in ${file}`);
    }
});

console.log(`Total HTML files updated: ${updatedCount}`);

// Also update js/shared.js
const sharedJsPath = path.join(rootDir, 'js', 'shared.js');
if (fs.existsSync(sharedJsPath)) {
    const sharedJsContent = fs.readFileSync(sharedJsPath, 'utf-8');
    
    // Need to handle both desktop and mobile nav forms in shared.js
    // Look for exact matches from our earlier grep
    
    // Desktop Nav replacement:
    const desktopBlog = `<li><a href="blog.html" \${currentPage==='blog.html'?'class="active"':''}>Blog</a></li>`;
    const desktopContact = `\n    <li><a href="contact.html" \${currentPage==='contact.html'?'class="active"':''}>Contact</a></li>`;
    
    let updatedSharedJs = sharedJsContent;
    if (updatedSharedJs.includes(desktopBlog) && !updatedSharedJs.includes(desktopContact)) {
        updatedSharedJs = updatedSharedJs.replace(desktopBlog, desktopBlog + desktopContact);
        console.log(`Updated desktop nav in js/shared.js`);
    }

    // Mobile Nav replacement (usually looks like: <a href="blog.html">Blog</a> in some off-canvas list)
    const mobileBlog = `              <li><a href="blog.html">Blog</a></li>`;
    const mobileContact = `\n              <li><a href="contact.html">Contact</a></li>`;
    if (updatedSharedJs.includes(mobileBlog) && !updatedSharedJs.includes(mobileContact)) {
        updatedSharedJs = updatedSharedJs.replace(mobileBlog, mobileBlog + mobileContact);
        console.log(`Updated mobile nav in js/shared.js`);
    }

    if (updatedSharedJs !== sharedJsContent) {
        fs.writeFileSync(sharedJsPath, updatedSharedJs, 'utf-8');
    }
}
