/* ═══════════════════════════════════════════════════════
   WORLD TRAINER FORUM — Shared Components v1.0
   Injects nav + footer into every page automatically
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Detect current page for active nav link ── */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  /* ── NAV HTML ── */
  var NAV_HTML = `
<nav id="nav">
  <a class="logo" href="index.html">
    <img src="img/logo.svg" alt="World Trainer Forum Logo" style="height:42px;margin-right:10px;">
    World Trainer <span class="g">Forum</span>
  </a>
  <ul class="nav-links">
    <li><a href="about.html" ${currentPage==='about.html'?'class="active"':''}>About</a></li>
    <li><a href="find-trainers.html" ${currentPage==='find-trainers.html'?'class="active"':''}>Find Trainers</a></li>
    <li><a href="categories.html" ${currentPage==='categories.html'?'class="active"':''}>Categories</a></li>
    <li><a href="pricing.html" ${currentPage==='pricing.html'?'class="active"':''}>Pricing</a></li>
    <li><a href="blog.html" ${currentPage==='blog.html'?'class="active"':''}>Blog</a></li>
  </ul>
  <div class="nav-r">
    <button class="btn btn-ghost btn-sm" onclick="window.location.href='index.html'">Sign Up</button>
    <button class="btn btn-gold btn-sm" onclick="window.location.href='index.html'">Log In</button>
    <button class="ham-btn" id="ham-btn" onclick="toggleMobileMenu()" aria-label="Toggle Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="mobile-nav" id="mobile-nav">
  <div style="display:flex;justify-content:flex-end;margin-bottom:20px;">
    <button onclick="toggleMobileMenu()" style="background:none;border:none;color:#fff;font-size:2rem;cursor:pointer;" aria-label="Close">×</button>
  </div>
  <a href="about.html">About</a>
  <a href="find-trainers.html">Find Trainers</a>
  <a href="categories.html">Categories</a>
  <a href="pricing.html">Pricing</a>
  <a href="blog.html">Blog</a>
  <div style="margin-top:30px;display:flex;flex-direction:column;gap:12px;">
    <button class="btn btn-ghost" onclick="toggleMobileMenu();window.location.href='index.html'">Sign Up</button>
    <button class="btn btn-gold" onclick="toggleMobileMenu();window.location.href='index.html'">Log In</button>
  </div>
</div>`;

  /* ── FOOTER HTML ── */
  var FOOTER_HTML = `
<footer id="site-footer">

      <!-- ── MAIN FOOTER BODY ── -->
      <div class="footer-main">

        <!-- ROW 1: Brand + 4 link columns + Newsletter -->
        <div class="footer-top-grid">

          <!-- SECTION 1: Brand + Trust -->
          <div class="footer-brand-col">
            <a class="footer-logo" href="index.html">
              <img src="img/logo.svg" alt="World Trainer Forum Logo">
              <span>World Trainer <span class="g">Forum</span></span>
            </a>
            <p class="footer-tagline">Connecting organizations with world-class trainers, coaches, mentors, and speakers worldwide.</p>

            <!-- Trust Indicators -->
            <ul class="footer-trust-list">
              <li><i class="fa-solid fa-circle-check"></i> Verified Trainers</li>
              <li><i class="fa-solid fa-globe"></i> Global Community</li>
              <li><i class="fa-solid fa-lock"></i> Secure Payments</li>
              <li><i class="fa-solid fa-building"></i> Corporate Solutions</li>
              <li><i class="fa-solid fa-headset"></i> 24/7 Support</li>
            </ul>

            <!-- Stats Row -->
            <div class="footer-stats">
              <div class="footer-stat-card">
                <i class="fa-solid fa-users"></i>
                <span class="fsc-num">50K+</span>
                <span class="fsc-lbl">Trainers</span>
              </div>
              <div class="footer-stat-card">
                <i class="fa-solid fa-earth-asia"></i>
                <span class="fsc-num">120+</span>
                <span class="fsc-lbl">Countries</span>
              </div>
              <div class="footer-stat-card">
                <i class="fa-solid fa-graduation-cap"></i>
                <span class="fsc-num">1M+</span>
                <span class="fsc-lbl">Learners</span>
              </div>
              <div class="footer-stat-card">
                <i class="fa-solid fa-calendar-check"></i>
                <span class="fsc-num">10K+</span>
                <span class="fsc-lbl">Sessions</span>
              </div>
            </div>

            <!-- Social Icons -->
            <div class="footer-social">
              <a href="#" class="fsoc-btn" aria-label="LinkedIn" title="LinkedIn">
                <i class="fa-brands fa-linkedin-in"></i>
              </a>
              <a href="#" class="fsoc-btn" aria-label="Facebook" title="Facebook">
                <i class="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" class="fsoc-btn" aria-label="Instagram" title="Instagram">
                <i class="fa-brands fa-instagram"></i>
              </a>
              <a href="#" class="fsoc-btn" aria-label="YouTube" title="YouTube">
                <i class="fa-brands fa-youtube"></i>
              </a>
              <a href="#" class="fsoc-btn" aria-label="X / Twitter" title="X / Twitter">
                <i class="fa-brands fa-x-twitter"></i>
              </a>
            </div>
          </div>

                    <!-- SECTION 2: For Clients -->
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
          </div>


          <!-- SECTION 6: Newsletter -->
          <div class="footer-newsletter-col">
            <div class="footer-newsletter-card">
              <div class="fnl-icon"><i class="fa-solid fa-paper-plane"></i></div>
              <h4 class="fnl-title">Stay Updated</h4>
              <p class="fnl-sub">Get training insights, industry trends, and expert resources.</p>
              <form class="fnl-form" onsubmit="return false;">
                <div class="fnl-input-wrap">
                  <i class="fa-regular fa-envelope fnl-input-ico"></i>
                  <input type="email" class="fnl-input" placeholder="Your email address" aria-label="Email for newsletter">
                  <button type="submit" class="fnl-btn">Subscribe</button>
                </div>
              </form>
              <ul class="fnl-features">
                <li><i class="fa-solid fa-circle-check"></i> Weekly insights</li>
                <li><i class="fa-solid fa-circle-check"></i> Trainer resources</li>
                <li><i class="fa-solid fa-circle-check"></i> Event updates</li>
              </ul>
            </div>
          </div>

        </div><!-- /footer-top-grid -->

        <!-- SECTION 4: Popular Training Topics (Chips) -->
        <div class="footer-topics">
          <h4 class="footer-topics-hd">Popular Training Topics</h4>
          <div class="footer-chips">
            <a href="#" class="footer-chip">Leadership</a>
            <a href="#" class="footer-chip">Communication Skills</a>
            <a href="#" class="footer-chip">AI &amp; Technology</a>
            <a href="#" class="footer-chip">Sales &amp; Marketing</a>
            <a href="#" class="footer-chip">HR Training</a>
            <a href="#" class="footer-chip">Public Speaking</a>
            <a href="#" class="footer-chip">Personal Development</a>
            <a href="#" class="footer-chip">Business Strategy</a>
            <a href="#" class="footer-chip">Finance</a>
            <a href="#" class="footer-chip">Health &amp; Wellness</a>
            <a href="#" class="footer-chip">Executive Coaching</a>
            <a href="#" class="footer-chip">Team Building</a>
          </div>
        </div>

        <!-- SECTION 7: Trust & Security Strip -->
        <div class="footer-trust-strip">
          <div class="fts-item">
            <i class="fa-solid fa-shield-halved"></i>
            <span>SSL Secure</span>
          </div>
          <div class="fts-divider"></div>
          <div class="fts-item">
            <i class="fa-solid fa-scale-balanced"></i>
            <span>GDPR Compliant</span>
          </div>
          <div class="fts-divider"></div>
          <div class="fts-item">
            <i class="fa-solid fa-user-check"></i>
            <span>Verified Profiles</span>
          </div>
          <div class="fts-divider"></div>
          <div class="fts-item">
            <i class="fa-solid fa-credit-card"></i>
            <span>Safe Payments</span>
          </div>
          <div class="fts-divider"></div>
          <div class="fts-item">
            <i class="fa-solid fa-earth-americas"></i>
            <span>Trusted Worldwide</span>
          </div>
        </div>

      </div><!-- /footer-main -->

      <!-- SECTION 8: Bottom Legal Bar -->
      <div class="footer-legal">
        <div class="footer-legal-inner">
          <span class="fl-copy">© 2026 World Trainer Forum Technologies Pvt. Ltd. All rights reserved.</span>
          <nav class="fl-links" aria-label="Legal links">
            <a href="#">Privacy Policy</a>
            <span class="fl-dot">·</span>
            <a href="#">Terms</a>
            <span class="fl-dot">·</span>
            <a href="#">Cookies</a>
            <span class="fl-dot">·</span>
            <a href="#">Accessibility</a>
            <span class="fl-dot">·</span>
            <a href="#">Sitemap</a>
          </nav>
          <span class="fl-tagline">Made for Global Learning &amp; Growth 🌍</span>
        </div>
      </div>

    </footer>`;

  /* ── Inject nav ── */
  var navEl = document.getElementById('nav-inject');
  if (navEl) navEl.outerHTML = NAV_HTML;

  /* ── Inject footer ── */
  var footerEl = document.getElementById('footer-inject');
  if (footerEl) footerEl.outerHTML = FOOTER_HTML;

  /* ── Mobile menu toggle ── */
  window.toggleMobileMenu = function () {
    var mn = document.getElementById('mobile-nav');
    if (mn) mn.classList.toggle('open');
  };

  /* ── Smooth fade-in on page load ── */
  document.addEventListener('DOMContentLoaded', function () {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.35s ease';
    requestAnimationFrame(function () {
      document.body.style.opacity = '1';
    });

    /* Intersection Observer reveal for .sp-reveal */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('sp-visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
      document.querySelectorAll('.sp-reveal').forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll('.sp-reveal').forEach(function (el) { el.classList.add('sp-visible'); });
    }

    /* FAQ accordion */
    document.querySelectorAll('.sp-faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.sp-faq-item');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.sp-faq-item.open').forEach(function (o) { o.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
  });

  /* ── Page transition on link clicks ── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target === '_blank') return;
    if (href.startsWith('http') && !href.includes('worldtrainerforum.com')) return;
    e.preventDefault();
    document.body.style.opacity = '0';
    setTimeout(function () { window.location.href = href; }, 320);
  });

})();
