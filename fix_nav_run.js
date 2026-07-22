// fix_nav.js — Fix public page headers
// 1. Replace mojibake emoji with clean HTML entities
// 2. Fix viewport meta on pages missing maximum-scale

const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\The Mars\\Desktop\\trainers';

const PAGES = [
  'index.html',
  'about.html',
  'find-trainers.html',
  'certificates.html',
  'news-events.html',
  'blog.html',
];

// Emoji mojibake → HTML entity
// These are the garbled sequences seen when UTF-8 emoji bytes
// get stored/served as Latin-1 / Windows-1252
const EMOJI_FIXES = [
  ['\u00f0\u0178\u201c\u201c', '&#128276;'],   // 🔔 bell
  ['\u00f0\u0178\u201c\u2026', '&#128197;'],   // 📅 calendar
  ['\u00f0\u0178\u2019\u00ab', '&#128172;'],   // 💬 speech bubble
  ['\u00f0\u0178\u017d\u2030', '&#127881;'],   // 🎉 party popper
  ['\u00f0\u0178\u201c\u008d', '&#128269;'],   // 🔍 search lens
  ['\u00e2\u00ad\u0090',       '&#11088;'],    // ⭐ star
];

const VIEWPORT_OLD = 'content="width=device-width, initial-scale=1.0"';
const VIEWPORT_NEW = 'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"';

let fixedCount = 0;

for (const page of PAGES) {
  const filePath = path.join(BASE, page);
  if (!fs.existsSync(filePath)) { console.log(`SKIP: ${page}`); continue; }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix each mojibake emoji
  for (const [bad, good] of EMOJI_FIXES) {
    content = content.split(bad).join(good);
  }

  // Fix viewport (only when exact old pattern present, no maximum-scale yet)
  if (content.includes(VIEWPORT_OLD)) {
    content = content.split(VIEWPORT_OLD).join(VIEWPORT_NEW);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${page}`);
    fixedCount++;
  } else {
    console.log(`No change needed: ${page}`);
  }
}

console.log(`\nDone. ${fixedCount} file(s) updated.`);
