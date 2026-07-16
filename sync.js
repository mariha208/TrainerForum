const fs = require('fs');
const path = require('path');

const files = ['about.html', 'find-trainers.html', 'certificates.html', 'news-events.html', 'blog.html'];

// Read the source of truth
const indexHtml = fs.readFileSync('index.html', 'utf8');

// Extract the exact HTML blocks we want to standardize
// 1. Navbar
const navStart = indexHtml.indexOf('<nav id="nav">');
const navEnd = indexHtml.indexOf('</nav>') + 6;
const navChunk = indexHtml.substring(navStart, navEnd);

// 2. Mobile Nav Drawer
const mobileNavStart = indexHtml.indexOf('<!-- Mobile Nav Drawer -->');
const mobileNavEnd = indexHtml.indexOf('<!-- Notification Panel -->');
const mobileNavChunk = indexHtml.substring(mobileNavStart, mobileNavEnd).trim();

// 3. Notification Panel
const notifPanelStart = indexHtml.indexOf('<!-- Notification Panel -->');
const toastStart = indexHtml.indexOf('<!-- Toast -->');
const notifPanelChunk = indexHtml.substring(notifPanelStart, toastStart).trim();

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace <nav id="nav">...</nav>
  const targetNavStart = content.indexOf('<nav id="nav">');
  const targetNavEnd = content.indexOf('</nav>') + 6;
  if (targetNavStart !== -1 && targetNavEnd !== -1) {
      
      let newNavChunk = navChunk;
      
      // Attempt to set active class appropriately for this page
      newNavChunk = newNavChunk.replace(/class="active"/g, '');
      if (file === 'about.html') newNavChunk = newNavChunk.replace('id="nl-about"', 'id="nl-about" class="active"');
      if (file === 'find-trainers.html') newNavChunk = newNavChunk.replace('id="nl-browse"', 'id="nl-browse" class="active"');
      if (file === 'certificates.html') newNavChunk = newNavChunk.replace('id="nl-cats"', 'id="nl-cats" class="active"');
      if (file === 'news-events.html') newNavChunk = newNavChunk.replace('id="nl-pricing"', 'id="nl-pricing" class="active"');
      if (file === 'blog.html') newNavChunk = newNavChunk.replace('id="nl-blog"', 'id="nl-blog" class="active"');

      content = content.substring(0, targetNavStart) + newNavChunk + content.substring(targetNavEnd);
  }

  // Find where to place the mobile nav and notif panel
  // We can just wipe whatever is between </nav> and the first <section> or <!-- Toast -->
  const afterNav = content.indexOf('</nav>') + 6;
  
  // Find next stable landmark
  let nextLandmark = content.indexOf('<!-- Toast -->');
  if (nextLandmark === -1) nextLandmark = content.indexOf('<section');
  if (nextLandmark === -1) nextLandmark = content.indexOf('<div id="p-home"');
  if (nextLandmark === -1) nextLandmark = content.indexOf('<!-- ═══');
  
  if (afterNav !== -1 && nextLandmark !== -1 && nextLandmark > afterNav) {
      content = content.substring(0, afterNav) + '\n\n' + mobileNavChunk + '\n\n' + notifPanelChunk + '\n\n  ' + content.substring(nextLandmark);
  }

  // Save the file
  if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated header in ' + file);
  }
});
