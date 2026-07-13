const fs = require('fs');
let html = fs.readFileSync('dashboard.html', 'utf8');

const cats = ['Academic Tutoring','Acting & Theatre','AI & Machine Learning','Blockchain & Web3','Business Coaching','Career Mentoring','Change Management','Cloud Computing','Communication Skills','Conflict Resolution','Corporate L&D','Corporate Training','Cybersecurity','Dance','Data & Analytics','Digital Marketing','Emotional Intelligence','English Language','Entrepreneurship','European Languages','Finance & Accounting','Fitness & Exercise','Functional Training','Goal Setting','Hindi & Regional','Interview Preparation','Leadership Development','Life Coaching','Mental Health & Mindfulness','Mindset & NLP','Music','Networking Skills','Nutrition & Diet','Personal Finance','Personality Development','Photography','Podcasting','Problem Solving','Professional Certifications','Public Speaking','Resume & LinkedIn','Sales & Marketing','Sleep & Recovery','Software Development','Sports Coaching','Strategy & Management','Test & Exam Prep','Time Management','UI/UX Design','Video & Filmmaking','Visual Arts & Design','Work-Life Balance','Writing & Copywriting','Yoga & Meditation'];
const optionsHtml = cats.map(c => `<option>${c}</option>`).join('\n                  ');

const newBlock = `            <div class="form-row">
              <div class="form-group">
                <label>Expertise Category 1 <span style="color:var(--red)">*</span></label>
                <select class="form-control" id="p-category1" onchange="var t=document.getElementById('p-categoryOther1');t.style.display=this.value==='Other'?'block':'none';">
                  <option value="" disabled>Select Category 1...</option>
                  ${optionsHtml}
                  <option value="Other">Other</option>
                </select>
                <input class="form-control" id="p-categoryOther1" placeholder="Specify your category" type="text" style="display:none; margin-top:8px;">
              </div>
              <div class="form-group">
                <label>Expertise Category 2</label>
                <select class="form-control" id="p-category2" onchange="var t=document.getElementById('p-categoryOther2');t.style.display=this.value==='Other'?'block':'none';">
                  <option value="">None</option>
                  ${optionsHtml}
                  <option value="Other">Other</option>
                </select>
                <input class="form-control" id="p-categoryOther2" placeholder="Specify your category" type="text" style="display:none; margin-top:8px;">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Expertise Category 3</label>
                <select class="form-control" id="p-category3" onchange="var t=document.getElementById('p-categoryOther3');t.style.display=this.value==='Other'?'block':'none';">
                  <option value="">None</option>
                  ${optionsHtml}
                  <option value="Other">Other</option>
                </select>
                <input class="form-control" id="p-categoryOther3" placeholder="Specify your category" type="text" style="display:none; margin-top:8px;">
              </div>
              <div class="form-group">
                <label>Specialization</label>
                <input class="form-control" id="p-spec" type="text" value="">
              </div>
            </div>`;

// Find and replace the single-category form row
const startTag = '<div class="form-row">\r\n              <div class="form-group">\r\n                <label>Category</label>';
const endTag = '</div>\r\n              <div class="form-group">\r\n                <label>Specialization</label>\r\n                <input class="form-control" id="p-spec" type="text" value="">\r\n              </div>\r\n            </div>';

const startIdx = html.indexOf(startTag);
const endIdx = html.indexOf(endTag);

if (startIdx === -1) {
  console.error('Start tag not found. Looking for alternatives...');
  // Try Unix newlines
  const altStart = '<div class="form-row">\n              <div class="form-group">\n                <label>Category</label>';
  const altEnd = '</div>\n              <div class="form-group">\n                <label>Specialization</label>\n                <input class="form-control" id="p-spec" type="text" value="">\n              </div>\n            </div>';
  const si = html.indexOf(altStart);
  const ei = html.indexOf(altEnd);
  if (si === -1) {
    console.error('Neither CRLF nor LF start tag found');
    process.exit(1);
  }
  html = html.slice(0, si) + newBlock + html.slice(ei + altEnd.length);
  fs.writeFileSync('dashboard.html', html);
  console.log('Replaced with Unix newlines!');
} else {
  html = html.slice(0, startIdx) + newBlock + html.slice(endIdx + endTag.length);
  fs.writeFileSync('dashboard.html', html);
  console.log('Replaced with CRLF newlines!');
}
