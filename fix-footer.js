const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = \          <!-- SECTION 2: For Clients -->
          <div class="footer-col">
            <h4 class="footer-col-hd">For Clients</h4>
            <ul class="footer-links">
              <li><a href="find-trainers.html">Browse Trainers</a></li>
              <li><a href="categories.html">All Categories</a></li>
              <li><a href="corporate-training.html">Corporate Training</a></li>
              <li><a href="gift-a-session.html">Gift a Session</a></li>
              <li><a href="pricing.html">Pricing</a></li>
              <li><a href="leadership-training.html">Leadership Training</a></li>
              <li><a href="sales-training.html">Sales Training</a></li>
              <li><a href="soft-skills-training.html">Soft Skills Training</a></li>
              <li><a href="technology-training.html">Technology Training</a></li>
              <li><a href="executive-coaching.html">Executive Coaching</a></li>
              <li><a href="team-building.html">Team Building Programs</a></li>
              <li><a href="request-custom-training.html">Request Custom Training</a></li>
            </ul>
          </div>

          <!-- SECTION 3: For Trainers -->
          <div class="footer-col">
            <h4 class="footer-col-hd">For Trainers</h4>
            <ul class="footer-links">
              <li><a href="dashboard.html">List Your Profile</a></li>
              <li><a href="trainer-resources.html">Trainer Resources</a></li>
              <li><a href="community-forum.html">Community Forum</a></li>
              <li><a href="success-stories.html">Success Stories</a></li>
              <li><a href="verification-process.html">Verification Process</a></li>
              <li><a href="dashboard.html">Trainer Dashboard</a></li>
              <li><a href="become-verified.html">Become Verified</a></li>
              <li><a href="trainer-academy.html">Trainer Academy</a></li>
              <li><a href="learning-center.html">Learning Center</a></li>
              <li><a href="certification-support.html">Certification Support</a></li>
              <li><a href="events-workshops.html">Events &amp; Workshops</a></li>
              <li><a href="earnings-program.html">Earnings Program</a></li>
              <li><a href="partner-program.html">Partner Program</a></li>
            </ul>
          </div>

          <!-- SECTION 5: Company -->
          <div class="footer-col">
            <h4 class="footer-col-hd">Company</h4>
            <ul class="footer-links">
              <li><a href="about.html">About Us</a></li>
              <li><a href="blog.html">Blog</a></li>
              <li><a href="press.html">Press</a></li>
              <li><a href="careers.html">Careers</a></li>
              <li><a href="privacy-policy.html">Privacy Policy</a></li>
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="terms-conditions.html">Terms &amp; Conditions</a></li>
              <li><a href="faqs.html">FAQs</a></li>
              <li><a href="help-center.html">Help Center</a></li>
              <li><a href="affiliate-program.html">Affiliate Program</a></li>
              <li><a href="partners.html">Partners</a></li>
              <li><a href="media-kit.html">Media Kit</a></li>
            </ul>
          </div>\;

const regex = /<!-- SECTION 2: For Clients -->[\s\S]*?<!-- SECTION 5: Company -->[\s\S]*?<\/ul>\s*<\/div>/;
if (regex.test(html)) {
  html = html.replace(regex, replacement);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Replaced successfully.');
} else {
  console.log('Could not find target block to replace.');
}
