'use strict';

/* ══════════════════════════════════════════════════════════════════
   WORLD TRAINER FORUM — PREMIUM TRAINER PROFILE MODAL
   Enterprise-grade · All sections · Booking integration
   ══════════════════════════════════════════════════════════════════ */

// ── BOOKING STATE ──────────────────────────────────────────────────────────────
window.bookingState = {
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  selectedDay: null,
  selectedTime: null,
  selectedPkg: null,
  selectedPkgName: '',
  trainerId: null,
};

// ── OPEN BY INDEX (called from card onclick — zero string matching) ────────────
window.openTrainerByIdx = function (idx) {
  const list = window.TRAINERS || [];
  const trainer = list[Number(idx)];
  if (!trainer) {
    console.warn('[WTF] openTrainerByIdx: no trainer at index', idx, '| total:', list.length);
    return;
  }
  // Pass the object directly — no ID lookup needed
  window.openTrainerModal(trainer);
};

// ── OPEN TRAINER MODAL (Premium Version) ──────────────────────────────────────
// Accepts either a trainer OBJECT (from openTrainerByIdx) or an ID string
window.openTrainerModal = function (idOrObj) {
  const TRAINERS = window.TRAINERS || [];

  // Resolve to a trainer object regardless of what was passed
  let t;
  if (idOrObj && typeof idOrObj === 'object') {
    t = idOrObj; // already a trainer object — no lookup needed
  } else {
    t = TRAINERS.find(x => String(x.id) === String(idOrObj));
    if (!t) { console.warn('[WTF] openTrainerModal: trainer not found for id:', idOrObj); return; }
  }

  // ── AUTH GUARD ──
  const isLoggedOut = !localStorage.getItem('userSession');
  if (isLoggedOut) {
    if (window.openAuthModal) {
      window.openAuthModal('login');
    } else {
      window.location.href = 'index.html#login';
    }
    return;
  }


  window.currentTrainer = t;

  // Sync latest localStorage data for this specific trainer (only if strictly matching ID)
  const trainerId = String(t.id);
  const lpKey = `tv-trainer-${trainerId}-profile`;
  const lpackKey = `tv-trainer-${trainerId}-packages`;
  const lavailKey = `tv-trainer-${trainerId}-availability`;

  const lpack = JSON.parse(localStorage.getItem(lpackKey) || 'null');
  if (lpack) t.packages = lpack;
  const lavail = JSON.parse(localStorage.getItem(lavailKey) || 'null');
  if (lavail) t.availability = lavail;

  // Also merge specificDates from currentTrainer (dashboard-saved data) if it's the same trainer
  try {
    const _ct = JSON.parse(localStorage.getItem('currentTrainer') || '{}');
    const _ctId = String(_ct.trainerId || _ct._id || _ct.id || '');
    if (_ctId && _ctId === trainerId && _ct.availability) {
      let _ctAvail = typeof _ct.availability === 'string' ? JSON.parse(_ct.availability) : _ct.availability;
      if (_ctAvail && _ctAvail.specificDates) {
        // Merge specificDates into t.availability
        if (!t.availability || typeof t.availability !== 'object') t.availability = {};
        t.availability.specificDates = _ctAvail.specificDates;
      }
    }
  } catch(e) {}

  // Sync profile data (especially social links)
  const sp = JSON.parse(localStorage.getItem(lpKey) || 'null');
  if (sp) {
    if (sp.social) t.socialLinks = sp.social;
    if (sp.whatsapp) t.whatsapp = sp.whatsapp;
    if (sp.linkedin) t.linkedin = sp.linkedin;
  }

  // Determine if the currently logged-in user owns this trainer card
  const isOwner = window.loggedInTrainerId != null && String(window.loggedInTrainerId) === trainerId;

  const modal = document.getElementById('trainer-modal');
  if (!modal) return;
  try {
    modal.innerHTML = buildPremiumModal(t, isOwner);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch (err) {
    console.error('[WTF] Error building premium modal for trainer', t.id, err);
    alert('Failed to load trainer profile: ' + err.stack);
  }

  // Activate first tab
  setTimeout(() => {
    switchTPMTab(null, 'overview');
    animateCounters();
  }, 50);
};


// ── CLOSE MODAL ────────────────────────────────────────────────────────────────
window.closeTrainerModal = function () {
  const modal = document.getElementById('trainer-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  // Pause any videos
  modal.querySelectorAll('video, iframe').forEach(v => {
    try { v.src = v.src; } catch (e) { }
  });
};

// ── OPEN WHATSAPP FOR TRAINER ──────────────────────────────────────────────────
window.openWhatsAppForTrainer = function (id) {
  const t = window.currentTrainer;
  if (!t || String(t.id) !== String(id)) {
    alert("Trainer details not loaded properly.");
    return;
  }

  let phone = t.whatsapp || t.phone || t.phoneNumber || '';
  if (!phone) {
    const sp = JSON.parse(localStorage.getItem(`tv-trainer-${id}-profile`) || 'null');
    if (sp && sp.whatsapp) phone = sp.whatsapp;
  }

  if (!phone) {
    alert("No WhatsApp number provided for this trainer.");
    return;
  }

  // Clean phone number (keep only digits)
  phone = String(phone).replace(/[^0-9]/g, '');

  // If it's a 10 digit Indian number, append 91
  if (phone.length === 10) {
    phone = '91' + phone;
  }

  const msg = encodeURIComponent(`Hi ${t.name}, I found your profile on World Trainer Forum and would like to connect!`);
  const url = `https://wa.me/${phone}?text=${msg}`;
  window.open(url, '_blank');
};


// ── TAB SWITCHER ───────────────────────────────────────────────────────────────
window.switchTModalTab = function (btn, id) {
  switchTPMTab(btn, id);
};

window.switchTPMTab = function (btn, id) {
  document.querySelectorAll('.tpm-tab').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.tpm-panel').forEach(p => p.classList.remove('on'));
  if (btn) btn.classList.add('on');
  else {
    const autoBtn = document.querySelector(`.tpm-tab[data-tab="${id}"]`);
    if (autoBtn) autoBtn.classList.add('on');
  }
  const panel = document.getElementById('tpm-' + id);
  if (panel) panel.classList.add('on');
};

// ── HELPER FUNCTIONS ───────────────────────────────────────────────────────────
function fmtTime(t24) {
  if (!t24) return '';
  const [h, m] = t24.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function fmtINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function randomBetween(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// ── ANIMATE COUNTERS ───────────────────────────────────────────────────────────
function animateCounters() {
  document.querySelectorAll('.tpm-exp-num[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const isDecimal = target % 1 !== 0;
    const duration = 1200;
    const step = 16;
    const steps = duration / step;
    let current = 0;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        clearInterval(timer);
        current = target;
      }
      el.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
    }, step);
  });
}

// ── BUILD PREMIUM MODAL HTML ───────────────────────────────────────────────────
function buildPremiumModal(t, isOwner = false) {
  t = t || {};
  t.cat = t.cat || 'Professional';
  t.lang = t.lang || 'English';
  t.sessions = String(t.sessions || '0');

  function _arr(val, def) {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return def || [];
  }

  const pn = parseInt(String(t.price || t.pn || '0').replace(/[^0-9]/g, '')) || 0;

  const bannerGradients = {
    'gb-blue': 'linear-gradient(135deg, #0D3A6B 0%, #1A5FA8 50%, #0D3060 100%)',
    'gb-green': 'linear-gradient(135deg, #0D3D28 0%, #1A6B44 50%, #0D3028 100%)',
    'gb-purple': 'linear-gradient(135deg, #2D1260 0%, #6B3AA0 50%, #4010A0 100%)',
    'gb-red': 'linear-gradient(135deg, #5C1818 0%, #A02020 50%, #6B1010 100%)',
    'gb-teal': 'linear-gradient(135deg, #073B3B 0%, #0A6B6B 50%, #084040 100%)',
    'gb-orange': 'linear-gradient(135deg, #5C3010 0%, #A05820 50%, #7A3D10 100%)',
    'gb-navy': 'linear-gradient(135deg, #081838 0%, #0D3060 50%, #051028 100%)',
  };
  const bannerBgUrl = t.bannerImageUrl || t.coverBannerUrl || 'assets/default-banner.png';
  const bannerBg = `background-image:url('${bannerBgUrl}');background-size:cover;background-position:center`;

  const avatarUrl = t.profileImageUrl || t.profilePictureUrl || 'assets/default-avatar.png';
  const avatarHtml = `<img src="${avatarUrl}" alt="${t.name}" style="width:100%;height:100%;object-fit:cover">`;
  const avatarBg = `background:${t.ac}`;

  // Parse sessions
  let sessNum = t.sessions.includes('K') ? parseFloat(t.sessions) * 1000 : parseInt(t.sessions) || 0;
  let expYears = parseInt(t.exp) || 8;

  // Generate package data
  const pkgs = _arr(t.packages, []).filter(p => p.active !== false);

  // Normalise availability — ensure exactly 7 days
  const _DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let avs = {
    Mon: { available: true, start: '09:00', end: '18:00' },
    Tue: { available: true, start: '09:00', end: '18:00' },
    Wed: { available: true, start: '09:00', end: '17:00' },
    Thu: { available: true, start: '10:00', end: '18:00' },
    Fri: { available: true, start: '09:00', end: '17:00' },
    Sat: { available: true, start: '10:00', end: '14:00' },
    Sun: { available: false, start: '10:00', end: '14:00' },
  };

  let _rawAvs = t.availability;
  if (typeof _rawAvs === 'string') {
    try { _rawAvs = JSON.parse(_rawAvs); } catch (e) { _rawAvs = null; }
  }

  // If this is the logged-in trainer's own profile, always use currentTrainer localStorage
  // so the front-end matches exactly what was saved in the dashboard.
  if (isOwner) {
    try {
      const _ctOwner = JSON.parse(localStorage.getItem('currentTrainer') || '{}');
      let _ctOwnerAvail = _ctOwner.availability;
      if (typeof _ctOwnerAvail === 'string') _ctOwnerAvail = JSON.parse(_ctOwnerAvail);
      if (_ctOwnerAvail && typeof _ctOwnerAvail === 'object') _rawAvs = _ctOwnerAvail;
    } catch(e) {}
  }

  if (_rawAvs && typeof _rawAvs === 'object') {
    if (Array.isArray(_rawAvs)) {
      _rawAvs.forEach((info, i) => { if (_DAY_NAMES[i] && info) avs[_DAY_NAMES[i]] = info; });
    } else {
      const hasNamed = _DAY_NAMES.some(d => _rawAvs[d] || _rawAvs[d.toLowerCase()]);
      if (hasNamed) {
        _DAY_NAMES.forEach(d => {
          const val = _rawAvs[d] || _rawAvs[d.toLowerCase()];
          if (val) avs[d] = val;
        });
      } else {
        // Fallback for weird numeric keys like "20", "21"
        const vals = Object.values(_rawAvs);
        vals.slice(0, 7).forEach((info, i) => { if (info) avs[_DAY_NAMES[i]] = info; });
      }
    }
  }

  const timeSlots = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM'];
  // Build skills from all possible fields
  const _rawSkills = t.allSkills || t.etags || t.skills || t.tags;
  let skills = [];
  if (Array.isArray(_rawSkills) && _rawSkills.length > 0) {
    skills = _rawSkills.map(s => String(s).trim()).filter(Boolean);
  } else if (typeof _rawSkills === 'string' && _rawSkills.trim()) {
    skills = _rawSkills.split(',').map(s => s.trim()).filter(Boolean);
  }
  // Fallback: use specialization and category as pill tags if skills still empty
  if (skills.length === 0) {
    const spec = String(t.specialization || t.spec || '').trim();
    const cat  = String(t.category || t.cat || '').trim();
    if (spec) spec.split(',').map(s => s.trim()).filter(Boolean).forEach(s => skills.push(s));
    if (cat && !skills.includes(cat)) skills.push(cat);
  }
  const tagsArr = skills; // keep same reference for de-dupe below

  // Reviews data — loaded from Firestore trainer document (reviewsData field)
  const reviews = _arr(t.reviewsData, []);
  // Dynamic avg rating from actual reviews (fallback to t.rating)
  const _avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.stars) || 5), 0) / reviews.length).toFixed(1)
    : (t.rating || '5.0');
  const _reviewCount = reviews.length || Number(t.reviews) || 0;
  // Permission: show Write Review if logged in (authToken or currentTrainer exists)
  const _canReview = (() => { try { return !!localStorage.getItem('authToken') || !!localStorage.getItem('currentTrainer'); } catch (e) { return false; } })();

  const certifications = _arr(t.achievements, []);

  const services = _arr(t.services, []).filter(s => s.active !== false);

  // Map testimonials from the decoupled array. Handle both strings and objects robustly.
  let testis = _arr(t.testimonials, []).map(item => {
    return typeof item === 'string' ? { url: item } : item;
  }).filter(tst => tst && tst.url);

  if (!testis.length) {
    // Fallback to portfolio if any old ones exist
    testis = _arr(t.portfolioLinksRaw ? t.portfolioLinksRaw.split('|') : t.portfolio, []).map(p => {
      return typeof p === 'string' ? { url: p, category: 'testimonial' } : p;
    }).filter(p => p && p.category === 'testimonial' && p.url);
  }
  let logos = []; // Logs are no longer reliably fetched this way, keeping empty array for safety

  const aiReasons = [
    { ico: '🎯', text: 'Matches your learning goals perfectly based on your profile' },
    { ico: '⭐', text: `Highly rated in ${t.cat} — ${t.rating}★ from ${t.reviews} verified reviews` },
    { ico: '📅', text: 'Available this week with 6+ open slots for new clients' },
    { ico: '👥', text: 'Similar organizations who booked this trainer saw 3× growth in 90 days' },
    { ico: '💰', text: `Competitive pricing at ${fmtINR(t.pn)}/hr — top value in ${t.cat}` },
  ];

  const relatedTrainers = (window.TRAINERS || []).filter(x => x.id !== t.id && x.cat === t.cat).slice(0, 4);
  if (relatedTrainers.length < 2) {
    (window.TRAINERS || []).filter(x => x.id !== t.id).slice(0, 4 - relatedTrainers.length).forEach(x => relatedTrainers.push(x));
  }

  return `
  <div class="tpm-box">
    <!-- Close Button -->
    <button class="tpm-close" onclick="closeTrainerModal()" title="Close (ESC)">✕</button>

    <!-- Cover Banner -->
    <div class="tpm-banner">
      <div class="tpm-banner-img" style="${bannerBg}"></div>
      <div class="tpm-banner-overlay"></div>
      <div class="tpm-banner-particles" aria-hidden="true">
        ${Array.from({ length: 8 }, (_, i) => `<div class="tpm-particle" style="left:${10 + i * 12}%;top:${20 + i * 8}%;animation-delay:${i * 0.8}s"></div>`).join('')}
      </div>
    </div>

    <!-- Header -->
    <div class="tpm-header">
      <div class="tpm-avatar" style="${avatarBg}">${avatarHtml}</div>
      <div class="tpm-header-info">
        <h2>
          ${t.name}
          ${t.ver ? `<span class="tpm-verified-badge">✓ Verified Expert</span>` : ''}
        </h2>
        <div class="tpm-header-meta">${t.role} &nbsp;·&nbsp; ${t.exp} Experience &nbsp;·&nbsp; ${t.city} &nbsp;·&nbsp; ${t.mode}</div>
        <div class="tpm-header-chips">
          <span class="tpm-chip">⭐ ${t.rating} &nbsp;(${t.reviews} reviews)</span>
          <span class="tpm-chip">🏆 ${t.sessions} Sessions</span>
          <span class="tpm-chip">🌐 ${t.lang}</span>
          <span class="tpm-chip avail avail-dot">Available Now</span>
        </div>
      </div>
      <div class="tpm-header-actions">
        ${isOwner ? `
        <button class="tpm-btn tpm-btn-ghost" onclick="openTrainerDashboard('${t.id}')" title="Edit Profile in Dashboard" style="border-color:rgba(197,160,89,0.5);color:var(--gold)">
          ⚙️ Edit Dashboard
        </button>` : ''}
        <button class="tpm-btn tpm-btn-ghost" onclick="openWhatsAppForTrainer('${t.id}')" title="Send WhatsApp Message">
          💬 Message
        </button>
        <button class="tpm-btn tpm-btn-ghost tpm-btn-save" id="tpm-save-btn" onclick="toggleTPMSave(this, '${t.id}')" title="Save Trainer">
          ♡ Save
        </button>
        <button class="tpm-btn tpm-btn-ghost" onclick="shareTrainerProfile('${t.id}')" title="Share Profile">
          ↗ Share
        </button>
        <button class="tpm-btn tpm-btn-gold" onclick="openBookingModal('${t.id}')" title="Book a Session">
          📅 Book Session
        </button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tpm-tabs-wrap">
      <div class="tpm-tabs" role="tablist">
        <button class="tpm-tab" data-tab="overview"       onclick="switchTPMTab(this,'overview')"       role="tab"><span class="tpm-tab-icon">👤</span> Overview</button>
        <button class="tpm-tab" data-tab="introduction"   onclick="switchTPMTab(this,'introduction')"   role="tab"><span class="tpm-tab-icon">🎬</span> Introduction</button>
        <button class="tpm-tab" data-tab="services"       onclick="switchTPMTab(this,'services')"       role="tab"><span class="tpm-tab-icon">🛎</span> Services</button>
        <button class="tpm-tab" data-tab="packages"       onclick="switchTPMTab(this,'packages')"       role="tab"><span class="tpm-tab-icon">📦</span> Packages</button>
        <button class="tpm-tab" data-tab="certifications" onclick="switchTPMTab(this,'certifications')" role="tab"><span class="tpm-tab-icon">🏅</span> Certifications</button>
        <button class="tpm-tab" data-tab="portfolio"      onclick="switchTPMTab(this,'portfolio')"      role="tab"><span class="tpm-tab-icon">🖼</span> Portfolio</button>

        <button class="tpm-tab" data-tab="availability"   onclick="switchTPMTab(this,'availability')"   role="tab"><span class="tpm-tab-icon">📅</span> Availability</button>
      </div>
    </div>

    <!-- Body: Main + Sidebar -->
    <div class="tpm-body">

      <!-- ── MAIN CONTENT ── -->
      <div class="tpm-main">

        <!-- ═══ TAB: OVERVIEW ═══ -->
        <div class="tpm-panel" id="tpm-overview">

          <!-- About -->
          <div class="tpm-section">
            <div class="tpm-section-title"><span class="tpm-sec-icon">📝</span> ABOUT ${t.name.toUpperCase()}</div>
            <p class="tpm-bio collapsed" id="tpm-bio-text">${t.bio || "No bio provided yet."}</p>
            <button class="tpm-expand-btn" onclick="toggleTPMBio()">▾ Read more</button>
          </div>

          <!-- Skills & Expertise -->
          <div class="tpm-section">
            <div class="tpm-section-title"><span class="tpm-sec-icon">💡</span> Skills & Expertise</div>
            <div class="tpm-skill-tags">
              ${skills.length
                ? skills.map((s, i) => `<span class="tpm-skill-tag ${i % 3 === 0 ? 'gold' : ''}">${s}</span>`).join('')
                : `<span style="color:rgba(237,242,247,0.35);font-size:0.82rem;">No skills listed yet.</span>`
              }
            </div>
          </div>



          ${(() => {
      const sLinks = t.socialLinks || {};
      const platforms = [
        { key: 'linkedin', url: t.linkedin || sLinks.linkedin, ico: 'in', label: 'LinkedIn', cls: 'tpm-social-li' },
        { key: 'instagram', url: t.instagram || sLinks.instagram, ico: '📷', label: 'Instagram', cls: 'tpm-social-ig' },
        { key: 'youtube', url: t.youtube || sLinks.youtube, ico: '▶', label: 'YouTube', cls: 'tpm-social-yt' },
        { key: 'twitter', url: t.twitter || sLinks.twitter, ico: '𝕏', label: 'Twitter', cls: 'tpm-social-tw' },
        { key: 'whatsapp', url: t.whatsapp || sLinks.whatsapp || t.phone, ico: '💬', label: 'WhatsApp', cls: 'tpm-social-wa', action: `openWhatsAppForTrainer('${t.id}')` },
        { key: 'facebook', url: t.facebook || sLinks.facebook, ico: 'f', label: 'Facebook', cls: 'tpm-social-fb' },
        { key: 'website', url: t.website || sLinks.website, ico: '🌐', label: 'Website', cls: 'tpm-social-web' },
        { key: 'portfolio', url: t.portfolioUrl || sLinks.portfolio, ico: '🗂', label: 'Portfolio', cls: 'tpm-social-port' },
      ];
      const activeLinksHtml = platforms.map(p => {
        if (!p.url) return ''; // Only show platforms with links
        if (p.action) {
          return `<div class="tpm-social-btn ${p.cls}" onclick="${p.action}"><div class="tpm-social-icon">${p.ico}</div>${p.label}</div>`;
        }
        let href = String(p.url).startsWith('http') ? p.url : 'https://' + p.url;
        return `<a href="${href}" target="_blank" rel="noopener" style="text-decoration:none" class="tpm-social-btn ${p.cls}"><div class="tpm-social-icon">${p.ico}</div>${p.label}</a>`;
      }).join('');
      return `
            <div class="tpm-section">
              <div class="tpm-section-title"><span class="tpm-sec-icon">🌐</span> Connect</div>
              <div class="tpm-social-grid">
                ${activeLinksHtml}
              </div>
            </div>`;
    })()}


        </div><!-- /overview panel -->


        <!-- ═══ TAB: INTRODUCTION ═══ -->
        <div class="tpm-panel" id="tpm-introduction">

          <!-- Video Player -->
          <div class="tpm-section">
            <div class="tpm-section-title"><span class="tpm-sec-icon">🎬</span> Introduction Video</div>
            ${buildVideoPlayer(t)}
            <div style="margin-top:16px">
              <div style="font-size:1rem;font-weight:700;color:rgba(237,242,247,0.95);margin-bottom:6px">${t.name} — ${t.role}</div>
              <div style="font-size:0.84rem;color:rgba(237,242,247,0.55);line-height:1.7">${t.cat} Expert &nbsp;·&nbsp; ${t.exp} Experience &nbsp;·&nbsp; ${t.sessions} Sessions Completed</div>
              <div style="margin-top:12px;padding:16px;background:rgba(197,160,89,0.07);border:1px solid rgba(197,160,89,0.15);border-radius:12px">
                <div style="font-size:0.82rem;color:rgba(197,160,89,0.9);font-weight:600;margin-bottom:6px">Professional Tagline</div>
                <div style="font-size:0.88rem;color:rgba(237,242,247,0.7);line-height:1.6;font-style:italic">"Transforming ${t.cat.toLowerCase()} careers through personalised mentorship, real-world application, and measurable results."</div>
              </div>
            </div>
          </div>

          

        </div><!-- /introduction panel -->


        <div class="tpm-panel" id="tpm-services">
          <div class="tpm-section">
            <div class="tpm-section-title"><span class="tpm-sec-icon">🛎</span> Training Services</div>
            ${services.map(svc => `
              <div class="tpm-service-card">
                <div class="tpm-service-icon">${svc.type === 'Corporate' ? '🏢' : svc.type === 'Group' ? '👥' : '🎯'}</div>
                <div class="tpm-service-info">
                  <div class="tpm-service-name">${svc.name} ${svc.featured ? '<span class="tpm-skill-tag gold" style="font-size:0.6rem;padding:2px 6px">Featured</span>' : ''}</div>
                  <div class="tpm-service-desc">${svc.desc}</div>
                  <div class="tpm-service-meta">
                    <span class="tpm-service-pill">⏱ ${svc.duration}</span>
                    <span class="tpm-service-pill">📍 ${svc.mode}</span>
                    <span class="tpm-service-pill">👥 ${svc.type}</span>
                  </div>
                </div>
                <div class="tpm-service-price-wrap">
                  <div class="tpm-service-price">${fmtINR(svc.price)}</div>
                  <span class="tpm-service-per">Starting Price</span>
                  <button class="tpm-btn tpm-btn-gold" style="font-size:0.78rem;padding:8px 16px" onclick="openBookingModal('${t.id}')">
                    Book This →
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div><!-- /services panel -->


        <!-- ═══ TAB: PACKAGES ═══ -->
        <div class="tpm-panel" id="tpm-packages">
          <div class="tpm-section">
            <div class="tpm-section-title"><span class="tpm-sec-icon">📦</span> Training Packages</div>
            <div class="tpm-packages-grid">
              ${pkgs.map((pkg) => `
                <div class="tpm-pkg ${pkg.featured ? 'recommended' : ''}">
                  ${pkg.featured ? '<div class="tpm-pkg-badge">⭐ Featured Package</div>' : ''}
                  <div class="tpm-pkg-name">${pkg.name}</div>
                  <div class="tpm-pkg-price">${fmtINR(pkg.price)}</div>
                  <div class="tpm-pkg-duration">⏱ ${pkg.duration}</div>
                  ${pkg.desc ? `<div style="font-size:0.8rem;color:rgba(237,242,247,0.7);margin-bottom:12px;text-align:center;">${pkg.desc}</div>` : ''}
                  <ul class="tpm-pkg-features">
                    ${_arr(pkg.features, []).map(f => `<li>${f}</li>`).join('')}
                  </ul>
                  <button class="tpm-btn ${pkg.featured ? 'tpm-btn-gold' : 'tpm-btn-ghost'}" style="width:100%;justify-content:center;font-size:0.84rem;margin-top:auto" onclick="openBookingModal('${t.id}')">
                    ${pkg.featured ? '🔥 Get Started' : 'Select Package'}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div><!-- /packages panel -->


        <!-- ═══ TAB: CERTIFICATIONS ═══ -->
        <div class="tpm-panel" id="tpm-certifications">
          <div class="tpm-section">
            <div class="tpm-section-title"><span class="tpm-sec-icon">🏅</span> Certifications By</div>

            ${(() => {
      // Read from all possible field aliases
      const rawCerts = t.certificationsBy || t.achievements || t.certifications || '';
      let certRows = [];
      if (Array.isArray(rawCerts) && rawCerts.length > 0) {
        // Filter out empty/invalid rows (must have at least a name or givenBy)
        certRows = rawCerts.filter(r => r && (r.name || r.givenBy || r.year) && !r.id /* skip achievement-format objects */);
      } else if (typeof rawCerts === 'string' && rawCerts.trim() && rawCerts.trim() !== 'N/A') {
        certRows = rawCerts.split(' ;; ').map(chunk => {
          const parts = chunk.split(' | ');
          return {
            name: (parts[0] || '').trim(),
            givenBy: (parts[1] || '').trim(),
            year: (parts[2] || '').trim()
          };
        }).filter(r => r.name || r.givenBy || r.year);
      }

      if (certRows.length === 0) {
        return `<div style="padding:32px 16px;text-align:center;color:rgba(237,242,247,0.35);">
                    <div style="font-size:2.5rem;margin-bottom:10px">🏅</div>
                    <div style="font-size:0.88rem;font-weight:600;margin-bottom:4px">No certifications added yet.</div>
                  </div>`;
      }

      const thStyle = `padding:10px 14px;text-align:left;color:rgba(237,242,247,0.4);font-size:0.7rem;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.07);text-transform:uppercase;letter-spacing:.06em`;
      const tdStyle = `padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.04)`;

      const rows = certRows.map((r, i) => `
              <tr style="transition:background .15s" onmouseover="this.style.background='rgba(197,160,89,0.05)'" onmouseout="this.style.background=''">
                <td style="${tdStyle};color:rgba(237,242,247,0.9);font-weight:600">
                  <span style="display:inline-flex;align-items:center;gap:8px">
                    <span style="width:24px;height:24px;border-radius:50%;background:rgba(197,160,89,0.15);border:1px solid rgba(197,160,89,0.3);display:inline-flex;align-items:center;justify-content:center;font-size:.65rem;color:#C5A059;font-weight:700;flex-shrink:0">${i + 1}</span>
                    ${r.name || '—'}
                  </span>
                </td>
                <td style="${tdStyle};color:rgba(237,242,247,0.65)">${r.givenBy || '—'}</td>
                <td style="${tdStyle};color:rgba(197,160,89,0.85);font-weight:600">${r.year || '—'}</td>
              </tr>`).join('');

      return `
            <div style="overflow-x:auto">
              <table style="width:100%;border-collapse:collapse;font-size:0.84rem">
                <thead><tr>
                  <th style="${thStyle}">Name</th>
                  <th style="${thStyle}">Given By</th>
                  <th style="${thStyle}">Year</th>
                </tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`;
    })()}

          </div>
        </div><!-- /certifications panel -->


        <!-- ═══ TAB: PORTFOLIO ═══ -->
        <div class="tpm-panel" id="tpm-portfolio">

          <!-- Intro Video -->
          <div class="tpm-section">
            <div class="tpm-section-title"><span class="tpm-sec-icon">🎬</span> Introduction Video</div>
            ${buildVideoPlayer(t)}
          </div>

          <!-- Testimonial Videos -->
          ${testis.length > 0 ? `
          <div class="tpm-section">
            <div class="tpm-section-title"><span class="tpm-sec-icon">▶️</span> Testimonial Videos</div>
            <div style="display:flex;flex-wrap:wrap;gap:14px">
              ${testis.map((tst, i) => {
      let videoId = '';
      const ytMatch = String(tst.url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/);
      if (ytMatch && ytMatch[1]) videoId = ytMatch[1];

      const metadataHtml = (tst.companyName || tst.guestName || tst.date)
        ? `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent, rgba(0,0,0,0.9));color:#fff;font-size:0.75rem;padding:20px 10px 8px;pointer-events:none;display:flex;flex-direction:column;gap:2px;">
             ${tst.companyName ? `<span style="font-weight:700;color:var(--tm)">🏢 ${tst.companyName}</span>` : ''}
             ${tst.guestName ? `<span style="opacity:0.9">👤 ${tst.guestName}</span>` : ''}
             ${tst.date ? `<span style="opacity:0.7;font-size:0.65rem">📅 ${tst.date}</span>` : ''}
           </div>`
        : (tst.label ? `<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.8);color:#fff;font-size:0.75rem;padding:4px 8px;text-align:center;pointer-events:none;">${tst.label}</div>` : '');

      if (videoId) {
        return `
                <div class="tpm-video-container" style="flex: 1 1 280px; max-width: 320px; height:180px;position:relative;overflow:hidden;border-radius:12px;">
                  <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" frameborder="0" allowfullscreen style="position:absolute;inset:0;"></iframe>
                  ${metadataHtml}
                </div>`;
      } else {
        return `
                <div class="tpm-video-container" onclick="window.open('${tst.url}','_blank')" style="flex: 1 1 280px; max-width: 320px; height:180px;position:relative;overflow:hidden;border-radius:12px;background:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                  <button class="tpm-play-btn" style="width:40px;height:40px;font-size:1rem">▶</button>
                  ${metadataHtml}
                </div>`;
      }
    }).join('')}
            </div>
          </div>` : ''}

          <!-- Company Logos -->
          ${logos.length > 0 ? `
          <div class="tpm-section">
            <div class="tpm-section-title"><span class="tpm-sec-icon">🏢</span> Trusted By</div>
            <div style="display:flex;flex-wrap:wrap;gap:16px">
              ${logos.map(l => `
                <div style="display:flex;flex-direction:column;align-items:center;gap:8px;min-width:100px;padding:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:var(--r);transition:transform .2s" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
                  <div style="width:64px;height:64px;border-radius:50%;overflow:hidden;border:2px solid var(--bd);background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center">
                    <img src="${l.src}" alt="${l.name}" style="width:100%;height:100%;object-fit:cover">
                  </div>
                  <div style="font-size:.76rem;color:var(--ts);text-align:center;font-weight:600">${l.name}</div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          ${/* Portfolio items from Firestore — case studies, certs, photos, videos */ (() => {
      const portItems = Array.isArray(t.portfolio) ? t.portfolio.filter(p => p.featured || true) : [];
      if (!portItems.length) return '';
      const catColors = { 'case-study': 'rgba(201,168,76,.12)', 'video': 'rgba(41,128,185,.12)', 'certificate': 'rgba(39,174,96,.12)', 'photo': 'rgba(142,68,173,.12)' };
      const catLabel = { 'case-study': 'Case Study', 'video': 'Video', 'certificate': 'Certificate', 'photo': 'Photo' };
      return `
            <div class="tpm-section">
              <div class="tpm-section-title"><span class="tpm-sec-icon">🖼</span> Portfolio Work</div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
                ${portItems.slice(0, 6).map(p => {
        const heroHtml = p.thumbUrl
          ? `<div style="height:110px;border-radius:10px;overflow:hidden;position:relative;cursor:pointer" onclick="window.open('${p.videoUrl || ''}','_blank')">
                         <img src="${p.thumbUrl}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover">
                         <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.4)"><span style="font-size:1.8rem">▶</span></div>
                       </div>`
          : `<div style="height:110px;border-radius:10px;background:${catColors[p.category] || 'rgba(255,255,255,.05)'};display:flex;align-items:center;justify-content:center;font-size:2.4rem">${p.ico || '📋'}</div>`;
        return `
                  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;transition:transform .2s" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
                    ${heroHtml}
                    <div>
                      <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:rgba(237,242,247,0.35);margin-bottom:4px">${catLabel[p.category] || p.category}</div>
                      <div style="font-size:.86rem;font-weight:700;color:rgba(237,242,247,0.9);line-height:1.3;margin-bottom:4px">${p.title}</div>
                      ${p.client ? `<div style="font-size:.72rem;color:rgba(237,242,247,0.4)">🏢 ${p.client}</div>` : ''}
                    </div>
                    ${p.tags && p.tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px">${p.tags.slice(0, 2).map(tg => `<span style="font-size:.62rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:2px 7px;color:rgba(237,242,247,0.5)">${tg}</span>`).join('')}</div>` : ''}
                  </div>`;
      }).join('')}
              </div>
            </div>`;
    })()}

        </div><!-- /portfolio panel -->


        <!-- ═══ TAB: AVAILABILITY ═══ -->
        <div class="tpm-panel" id="tpm-availability">
          <div class="tpm-section">
            <div class="tpm-section-title"><span class="tpm-sec-icon">📅</span> Weekly Availability</div>
            <div style="font-size:0.78rem;color:rgba(237,242,247,0.4);margin-bottom:16px">All times shown in IST (Indian Standard Time, UTC+5:30)</div>
            <div class="tpm-avail-grid">
              ${Object.entries(avs).map(([day, info]) => {
      const en = typeof info === 'object' ? (typeof info.available !== 'undefined' ? info.available : info.enabled) : true;
      const from = typeof info === 'object' ? (info.start || info.from || '09:00') : '09:00';
      const to = typeof info === 'object' ? (info.end || info.to || '18:00') : '18:00';
      const timeStr = en ? `${fmtTime(from)} – ${fmtTime(to)}` : 'Unavailable';
      return `
                  <div class="tpm-avail-row ${en ? 'available' : 'unavailable'}">
                    <div class="tpm-avail-day">
                      <div class="tpm-avail-day-dot">${day[0]}</div>
                      <span class="tpm-avail-day-name">${day}</span>
                    </div>
                    <span class="tpm-avail-time">${timeStr}</span>
                  </div>
                `;
    }).join('')}
            </div>

            <!-- Public Availability Calendar -->
            ${(() => {
      const _avMap = {};
      Object.entries(avs).forEach(([d, info]) => {
        let isAvail = typeof info === 'object' ? (typeof info.available !== 'undefined' ? info.available : info.enabled) : true;
        _avMap[d] = isAvail !== false;
      });

      // Read specificDates: if this is the logged-in trainer's own profile,
      // always read from currentTrainer localStorage (most up-to-date, set by dashboard).
      // For other trainers, read from t.availability.
      let _specificDates = {};
      try {
        if (isOwner) {
          // Own profile — pull fresh from localStorage
          const _ctData = JSON.parse(localStorage.getItem('currentTrainer') || '{}');
          let _ctAvail = _ctData.availability;
          if (typeof _ctAvail === 'string') _ctAvail = JSON.parse(_ctAvail);
          if (_ctAvail && _ctAvail.specificDates) _specificDates = _ctAvail.specificDates;
        } else {
          // Another trainer's profile — use t.availability
          let _parsed = typeof t.availability === 'string' ? JSON.parse(t.availability) : t.availability;
          if (_parsed && _parsed.specificDates) _specificDates = _parsed.specificDates;
        }
      } catch(e) {}

      const _shortDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();
      const y = now.getFullYear(), m = now.getMonth();
      const firstDay = new Date(y, m, 1).getDay();
      const days = new Date(y, m + 1, 0).getDate();
      const mLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      const dnHdr = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(n =>
        `<div style="text-align:center;font-size:.66rem;font-weight:700;color:rgba(237,242,247,0.3);padding:4px 0">${n}</div>`
      ).join('');
      let cells = '';
      for (let i = 0; i < firstDay; i++) cells += '<div></div>';
      for (let d = 1; d <= days; d++) {
        const dk = _shortDay[new Date(y, m, d).getDay()];
        const dateKey = y + '-' + m + '-' + d;
        let en = _avMap[dk] !== false;
        // Apply specific date override if exists
        if (typeof _specificDates[dateKey] !== 'undefined') en = _specificDates[dateKey];
        const isToday = d === now.getDate();
        const bg = en ? (isToday ? 'rgba(197,160,89,0.22)' : 'rgba(255,255,255,0.04)') : 'rgba(239,68,68,0.16)';
        const bdr = en ? (isToday ? '1.5px solid #C5A059' : '1px solid rgba(255,255,255,0.07)') : '1px solid rgba(239,68,68,0.32)';
        const clr = en ? (isToday ? '#C5A059' : 'rgba(237,242,247,0.8)') : 'rgba(239,68,68,0.9)';
        cells += `<div style="text-align:center;padding:6px 2px;border-radius:7px;background:${bg};border:${bdr};font-size:.74rem;font-weight:600;color:${clr}">${d}</div>`;
      }
      return `
      <div style="margin-top:22px">
        <div style="font-size:0.78rem;font-weight:700;color:rgba(237,242,247,0.5);text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">📆 Monthly View — ${mLabel}</div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden">
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;padding:10px">${dnHdr}${cells}</div>
          <div style="padding:4px 12px 10px;display:flex;gap:14px;font-size:.66rem;color:rgba(237,242,247,0.35)">
            <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:2px;background:rgba(239,68,68,0.4);display:inline-block"></span>Unavailable</span>
            <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:2px;background:rgba(197,160,89,0.25);display:inline-block"></span>Today</span>
          </div>
        </div>
      </div>`;
    })()}

            <div class="tpm-time-slots-wrap">
              <div class="tpm-slots-label">Available Time Slots Today</div>
              <div class="tpm-time-slots">
                ${timeSlots.map(s => `<div class="tpm-time-slot" onclick="openBookingModal('${t.id}')">${s}</div>`).join('')}
              </div>
            </div>
            <div style="margin-top:20px;text-align:center">
              <button class="tpm-btn tpm-btn-gold" style="padding:13px 32px" onclick="openBookingModal('${t.id}')">
                📅 Book a Slot Now
              </button>
            </div>
          </div>
        </div><!-- /availability panel -->

      </div><!-- /tpm-main -->


      <!-- ── SIDEBAR ── -->
      <div class="tpm-sidebar">

        <!-- Booking Widget -->
        <div class="tpm-sidebar-widget" style="border-color:rgba(197,160,89,0.3);box-shadow:0 8px 32px rgba(197,160,89,0.1)">
          <div class="tpm-sidebar-widget-title">Starting From</div>
          <div class="tpm-price-display">${fmtINR(t.pn)}<span>/hr</span></div>
          <div class="tpm-sidebar-stats">
            <div class="tpm-sidebar-stat">
              <div class="tpm-sidebar-stat-val">${t.sessions}</div>
              <div class="tpm-sidebar-stat-key">Sessions</div>
            </div>
            <div class="tpm-sidebar-stat">
              <div class="tpm-sidebar-stat-val">${t.exp}</div>
              <div class="tpm-sidebar-stat-key">Experience</div>
            </div>
          </div>
          <button class="tpm-btn tpm-btn-gold tpm-book-cta" onclick="openBookingModal('${t.id}')">
            📅 Book Session →
          </button>
          <button class="tpm-book-cta-ghost" onclick="openWhatsAppForTrainer('${t.id}')">
            💬 Message Trainer
          </button>
        </div>

        <!-- Top Skills -->
        <div class="tpm-sidebar-widget">
          <div class="tpm-sidebar-widget-title">Top Skills</div>
          <div class="tpm-skill-tags">
            ${skills.slice(0, 8).map((s, i) => `<span class="tpm-skill-tag ${i % 2 === 0 ? 'gold' : ''}" style="font-size:0.72rem">${s}</span>`).join('')}
          </div>
        </div>

      </div><!-- /sidebar -->

    </div><!-- /tpm-body -->

    <!-- Sticky Mobile Footer -->
    <div class="tpm-sticky-footer">
      <div>
        <span class="tpm-sticky-price-label">Starting from</span>
        <div class="tpm-sticky-price">${fmtINR(t.pn)}<span style="font-size:0.8rem;font-weight:400;color:rgba(237,242,247,0.4)">/hr</span></div>
      </div>
      <button class="tpm-btn tpm-btn-gold" onclick="openBookingModal('${t.id}')" style="padding:13px 28px">
        Book Session →
      </button>
    </div>

  </div><!-- /tpm-box -->

  <!-- Lightbox -->
  <div id="tpm-lightbox" onclick="closeTPMLightbox()">
    <button id="tpm-lightbox-close" onclick="closeTPMLightbox()">✕</button>
    <div style="text-align:center">
      <div id="tpm-lightbox-content" style="font-size:5rem;margin-bottom:20px"></div>
      <div id="tpm-lightbox-label" style="color:rgba(255,255,255,0.8);font-size:1rem;font-weight:600"></div>
      <div id="tpm-lightbox-sub" style="color:rgba(255,255,255,0.45);font-size:0.84rem;margin-top:6px"></div>
    </div>
  </div>
  `;
}

// ── VIDEO PLAYER BUILDER ───────────────────────────────────────────────────────
function buildVideoPlayer(t) {
  // introVideo saved by dashboard as {url, type}; videoIntro or portfolioVideo may be plain strings
  let introRaw = t.introVideo || t.videoIntro || t.portfolioVideo || '';
  // Normalise to string
  let introUrl = '';
  if (introRaw && typeof introRaw === 'object') {
    introUrl = introRaw.url || '';
  } else if (typeof introRaw === 'string') {
    try {
      const parsed = JSON.parse(introRaw);
      introUrl = parsed.url || introRaw;
    } catch (e) {
      introUrl = introRaw;
    }
  }

  if (introUrl) {
    let videoId = '';
    const ytMatch = introUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) videoId = ytMatch[1];

    if (videoId) {
      return `
      <div style="position:relative;border-radius:14px;overflow:hidden;aspect-ratio:16/9;box-shadow:0 8px 32px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);margin-bottom:20px;">
        <iframe
          src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1"
          title="Introduction Video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
          style="position:absolute;inset:0;width:100%;height:100%;border:none;">
        </iframe>
      </div>`;
    }

    return `
    <div class="tpm-video-container" onclick="window.open('${introUrl}','_blank')" style="position:relative;overflow:hidden;">
      <div class="tpm-video-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.7); display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <button class="tpm-play-btn">▶</button>
        <div class="tpm-video-label">Watch Introduction Video</div>
      </div>
      <div class="tpm-video-hd">HD</div>
      <div class="tpm-video-duration">Watch on YouTube ↗</div>
    </div>`;
  }
  return `
  <div class="tpm-video-container" onclick="window.toast('▶ Video preview — connect to trainer database for live content.')">
    <div class="tpm-video-overlay">
      <button class="tpm-play-btn">▶</button>
      <div class="tpm-video-label">Introduction by ${t.name}</div>
    </div>
    <div class="tpm-video-hd">HD</div>
    <div class="tpm-video-duration">4:32</div>
  </div>`;
}

// ── REVIEW CARD BUILDER ────────────────────────────────────────────────────────
function buildReviewCard(r) {
  return `
  <div class="tpm-review-card">
    <div class="tpm-review-head">
      <div class="tpm-review-av" style="background:${r.bg}">${r.av}</div>
      <div class="tpm-review-meta">
        <div class="tpm-review-name">${r.name}</div>
        <div class="tpm-review-service">${r.svc}</div>
      </div>
      <div class="tpm-review-date">${r.date}</div>
    </div>
    <div class="tpm-review-stars">${'★'.repeat(r.stars || 5)}${'☆'.repeat(5 - (r.stars || 5))}</div>
    <div class="tpm-review-text">${r.text}</div>
  </div>`;
}

// ── HELPER ACTIONS ─────────────────────────────────────────────────────────────
window.toggleTPMBio = function () {
  const bio = document.getElementById('tpm-bio-text');
  const btn = bio ? bio.nextElementSibling : null;
  if (!bio) return;
  if (bio.classList.contains('collapsed')) {
    bio.classList.remove('collapsed');
    if (btn) { btn.textContent = '▴ Show less'; }
  } else {
    bio.classList.add('collapsed');
    if (btn) { btn.textContent = '▾ Read more'; }
  }
};

window.toggleTPMSave = function (btn, id) {
  if (btn.classList.contains('saved')) {
    btn.classList.remove('saved');
    btn.innerHTML = '♡ Save';
    window.toast && window.toast('Trainer removed from saved list.');
  } else {
    btn.classList.add('saved');
    btn.innerHTML = '❤ Saved';
    window.toast && window.toast('❤ Trainer saved to your list!');
  }
};

window.shareTrainerProfile = function (id) {
  const t = (window.TRAINERS || []).find(x => x.id === id);
  if (!t) return;
  if (navigator.share) {
    navigator.share({ title: t.name, text: `Check out ${t.name} on World Trainer Forum — ${t.role}`, url: window.location.href });
  } else {
    navigator.clipboard?.writeText(window.location.href);
    window.toast && window.toast('🔗 Profile link copied to clipboard!');
  }
};

window.openTPMLightbox = function (label, type) {
  const lb = document.getElementById('tpm-lightbox');
  const icons = { Video: '🎥', PDF: '📄', Image: '📸', Article: '📝', Link: '🔗' };
  if (!lb) return;
  document.getElementById('tpm-lightbox-content').textContent = icons[type] || '📁';
  document.getElementById('tpm-lightbox-label').textContent = label;
  document.getElementById('tpm-lightbox-sub').textContent = type + ' · Click outside to close';
  lb.classList.add('open');
};

window.closeTPMLightbox = function () {
  const lb = document.getElementById('tpm-lightbox');
  if (lb) lb.classList.remove('open');
};

// ══════════════════════════════════════════════════════════════════════════════
// PREMIUM BOOKING MODAL
// ══════════════════════════════════════════════════════════════════════════════
window.openBookingModal = function (tid) {
  const TRAINERS = window.TRAINERS || [];
  const t = TRAINERS.find(x => x.id === tid) || window.currentTrainer;
  if (!t) return;

  window.bookingState.trainerId = tid;
  window.bookingState.selectedDay = null;
  window.bookingState.selectedTime = null;
  window.bookingState.selectedPkg = t.pn;
  window.bookingState.selectedPkgName = 'Introductory Session';

  // ── Resolve the booked trainer's availability ──
  let _trainerAvailability = null;
  try {
    const _lavail = JSON.parse(localStorage.getItem(`tv-trainer-${tid}-availability`) || 'null');
    if (_lavail) {
      _trainerAvailability = _lavail;
    } else {
      let _tAvail = t.availability;
      if (typeof _tAvail === 'string') _tAvail = JSON.parse(_tAvail);
      _trainerAvailability = _tAvail;
    }
  } catch(e) {}
  window.bookingState.trainerAvailability = _trainerAvailability;

  const basePkgs = t.packages && t.packages.length > 0 ? t.packages : [
    { name: 'Introductory Session', desc: '60-min 1-on-1', price: t.pn },
    { name: 'Deep Dive Programme', desc: '4 weeks · 8 sessions', price: t.pn * 12 },
    { name: 'Monthly Retainer', desc: '8 sessions/month', price: t.pn * 20 },
  ];
  const services = t.services && t.services.length > 0 ? t.services.map(s => ({
    name: s.name,
    desc: s.desc || (s.duration ? s.duration + ' · ' + (s.mode || '') : ''),
    price: s.price || 0
  })) : [];
  const pkgs = [...services, ...basePkgs];

  const avatarHtml = t.photoUrl
    ? `<img src="${t.photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : t.av;

  document.getElementById('booking-modal').innerHTML = `
  <div class="bpm-box">
    <!-- Header -->
    <div class="bpm-header">
      <h2>📅 Book a Session</h2>
      <div style="display:flex;align-items:center;gap:14px">
        <div class="bpm-trainer-mini">
          <div>
            <div style="font-weight:700;font-size:0.9rem;color:rgba(237,242,247,0.95)">${t.name}</div>
            <div style="font-size:0.74rem;color:rgba(237,242,247,0.45)">${fmtINR(t.pn)}/hr</div>
          </div>
        </div>
        <button class="tpm-close" style="position:static;flex-shrink:0" onclick="closeBookingModal()">✕</button>
      </div>
    </div>

    <!-- Body -->
    <div class="bpm-body">
      <div class="bpm-left">

        <!-- Package Selection -->
        <div style="margin-bottom:24px">
          <span class="tpm-form-label">Select Package</span>
          <div style="display:flex;flex-direction:column;gap:8px" id="bpm-pkg-list">
            ${pkgs.map((p, i) => `
              <div class="bpm-pkg-opt ${i === 0 ? 'selected' : ''}"
                   style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border:1.5px solid ${i === 0 ? 'var(--gold)' : 'rgba(255,255,255,0.1)'};border-radius:12px;cursor:pointer;transition:all .2s;background:${i === 0 ? 'rgba(197,160,89,0.1)' : 'rgba(255,255,255,0.04)'}"
                   onclick="selectBPMPkg(this, ${p.price}, '${p.name}')">
                <div>
                  <div style="font-weight:600;font-size:0.88rem;color:rgba(237,242,247,0.95)">${p.name}</div>
                  <div style="font-size:0.76rem;color:rgba(237,242,247,0.45)">${p.desc}</div>
                </div>
                <div style="font-weight:700;color:#C5A059;font-size:0.95rem">${fmtINR(p.price)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Calendar -->
        <div style="margin-bottom:20px">
          <span class="tpm-form-label">Choose Date</span>
          <div id="bpm-calendar"></div>
        </div>

        <!-- Time Slots -->
        <div id="bpm-slots-wrap" style="display:none;margin-bottom:20px">
          <span class="tpm-form-label">Available Times</span>
          <div class="tpm-time-slots" id="bpm-slots"></div>
        </div>

        <!-- Session Options -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div>
            <label class="tpm-form-label" for="bpm-type">Session Type</label>
            <select id="bpm-type" onchange="updateBPMSummary()"
              style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.9);font-family:'Poppins',sans-serif;font-size:0.86rem;outline:none">
              <option style="background:#0F1A2C;color:#fff">1-on-1 Session</option>
              <option style="background:#0F1A2C;color:#fff">Group Session (2–5)</option>
              <option style="background:#0F1A2C;color:#fff">Corporate Training</option>
              <option style="background:#0F1A2C;color:#fff">Workshop</option>
            </select>
          </div>
          <div>
            <label class="tpm-form-label" for="bpm-mode">Meeting Mode</label>
            <select id="bpm-mode" onchange="updateBPMSummary()"
              style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.9);font-family:'Poppins',sans-serif;font-size:0.86rem;outline:none">
              <option style="background:#0F1A2C;color:#fff">Online (Zoom/Meet)</option>
              <option style="background:#0F1A2C;color:#fff">In-Person</option>
              <option style="background:#0F1A2C;color:#fff">Hybrid</option>
            </select>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="tpm-form-label" for="bpm-notes">Notes for Trainer</label>
          <textarea id="bpm-notes" rows="3"
            style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.9);font-family:'Poppins',sans-serif;font-size:0.86rem;outline:none;resize:vertical;min-height:80px"
            placeholder="Share your goals, current skill level, or specific topics you want to cover…"></textarea>
        </div>

      </div><!-- /bpm-left -->

      <!-- Summary -->
      <div class="bpm-right">
        <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(237,242,247,0.4);margin-bottom:16px">Booking Summary</div>
        <div id="bpm-summary-rows">
          ${[
      ['Trainer', t.name],
      ['Package', 'Introductory Session'],
      ['Date', 'Not selected'],
      ['Time', 'Not selected'],
      ['Mode', 'Online (Zoom/Meet)'],
      ['Type', '1-on-1 Session'],
    ].map(([label, value], i) => `
            <div class="bpm-summary-row">
              <span class="bpm-summary-label">${label}</span>
              <span class="bpm-summary-value" id="bpm-sum-${['trainer', 'pkg', 'date', 'time', 'mode', 'type'][i]}">${value}</span>
            </div>
          `).join('')}
        </div>
        <div class="bpm-total">
          <div class="bpm-total-label">Total Amount</div>
          <div class="bpm-total-amt" id="bpm-total-amt">${fmtINR(t.pn)}</div>
        </div>
        <button class="tpm-btn tpm-btn-gold"
          style="width:100%;justify-content:center;margin-top:16px;padding:14px;font-size:0.95rem"
          onclick="confirmBPMBooking()">
          Confirm & Pay Securely 🔒
        </button>
        <div class="bpm-trust">
          Powered by Razorpay · End-to-end encrypted<br>Free cancellation up to 24h before
        </div>
        <div style="margin-top:16px;padding:14px;background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:10px">
          <div style="font-size:0.72rem;color:#4ADE80;font-weight:700;margin-bottom:4px">✅ Secure Booking</div>
          <div style="font-size:0.76rem;color:rgba(237,242,247,0.5);line-height:1.6">Your payment is protected. Sessions are confirmed only after trainer acceptance.</div>
        </div>
      </div><!-- /bpm-right -->

    </div><!-- /bpm-body -->
  </div><!-- /bpm-box -->
  `;

  document.getElementById('booking-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderBPMCalendar();
};

window.closeBookingModal = function () {
  document.getElementById('booking-modal').classList.remove('open');
  document.body.style.overflow = '';
};

window.selectBPMPkg = function (el, price, name) {
  document.querySelectorAll('.bpm-pkg-opt').forEach(o => {
    o.style.border = '1.5px solid rgba(255,255,255,0.1)';
    o.style.background = 'rgba(255,255,255,0.04)';
  });
  el.style.border = '1.5px solid var(--gold, #C5A059)';
  el.style.background = 'rgba(197,160,89,0.1)';
  window.bookingState.selectedPkg = price;
  window.bookingState.selectedPkgName = name;
  const sumPkg = document.getElementById('bpm-sum-pkg');
  if (sumPkg) sumPkg.textContent = name;
  const total = document.getElementById('bpm-total-amt');
  if (total) total.textContent = fmtINR(price);
};

// ── CALENDAR RENDER ────────────────────────────────────────────────────────────
window.renderBPMCalendar = function () {
  const state = window.bookingState;
  const el = document.getElementById('bpm-calendar');
  if (!el) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const month = state.month;
  const year = state.year;
  const firstDay = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const booked = new Set([randomBetween(3, 8), randomBetween(12, 16), randomBetween(20, 25)]);

  // Read blocked specific dates from the booked trainer's availability
  let _bpmSpecificDates = {};
  let _bpmWeeklyAvs = {};
  const _daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  try {
    let _bpmAvs = window.bookingState.trainerAvailability;
    if (!_bpmAvs) {
      const _bpmRaw = JSON.parse(localStorage.getItem('currentTrainer') || '{}');
      _bpmAvs = _bpmRaw.availability;
      if (typeof _bpmAvs === 'string') _bpmAvs = JSON.parse(_bpmAvs);
    }
    if (_bpmAvs && _bpmAvs.specificDates) _bpmSpecificDates = _bpmAvs.specificDates;
    if (_bpmAvs) {
      ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(function(dk) {
        if (_bpmAvs[dk]) {
          var inf = _bpmAvs[dk];
          _bpmWeeklyAvs[dk] = typeof inf.available !== 'undefined' ? inf.available : (inf.enabled !== false);
        }
      });
    }
  } catch(e) {}

  let cells = '';
  for (let i = firstDay - 1; i >= 0; i--) {
    cells += `<div class="bpm-cal-day other-month">${prevDays - i}</div>`;
  }
  for (let d = 1; d <= daysCount; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isSelected = d === state.selectedDay;
    const isBk = booked.has(d);
    const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Check if this specific date is blocked
    const _dateKey = year + '-' + month + '-' + d;
    const _dayName = _daysMap[new Date(year, month, d).getDay()];
    let isBlocked = false;
    if (typeof _bpmSpecificDates[_dateKey] !== 'undefined') {
      isBlocked = !_bpmSpecificDates[_dateKey];
    } else if (typeof _bpmWeeklyAvs[_dayName] !== 'undefined') {
      isBlocked = !_bpmWeeklyAvs[_dayName];
    }
    let cls = 'bpm-cal-day';
    if (isPast) cls += ' other-month';
    else if (isBk || isBlocked) cls += ' booked';
    else if (isSelected) cls += ' selected';
    else if (isToday) cls += ' today';
    const click = (!isPast && !isBk && !isBlocked) ? `onclick="selectBPMDay(${d})"` : '';
    const titleAttr = isBlocked ? 'title="Unavailable"' : '';
    cells += `<div class="${cls}" ${click} ${titleAttr}>${d}</div>`;
  }
  const totalCells = firstDay + daysCount;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    cells += `<div class="bpm-cal-day other-month">${i}</div>`;
  }

  el.innerHTML = `
  <div class="bpm-cal-header">
    <button class="bpm-cal-nav" onclick="bpmCalNav(-1)">‹</button>
    <span class="bpm-cal-title">${months[month]} ${year}</span>
    <button class="bpm-cal-nav" onclick="bpmCalNav(1)">›</button>
  </div>
  <div class="bpm-cal-grid">
    ${days.map(d => `<div class="bpm-cal-day-label">${d}</div>`).join('')}
    ${cells}
  </div>`;
};

window.bpmCalNav = function (dir) {
  window.bookingState.month += dir;
  if (window.bookingState.month > 11) { window.bookingState.month = 0; window.bookingState.year++; }
  if (window.bookingState.month < 0) { window.bookingState.month = 11; window.bookingState.year--; }
  renderBPMCalendar();
};

// Keep backward compat
window.bkCalNav = window.bpmCalNav;
window.selectBookingDay = function (d) { selectBPMDay(d); };
window.selectBookingTime = function (t) { selectBPMTime(t); };
window.updateBookingSummary = window.updateBPMSummary = function () {
  const mode = document.getElementById('bpm-mode')?.value || '';
  const type = document.getElementById('bpm-type')?.value || '';
  const sumMode = document.getElementById('bpm-sum-mode');
  const sumType = document.getElementById('bpm-sum-type');
  if (sumMode) sumMode.textContent = mode;
  if (sumType) sumType.textContent = type;
};
window.selectBookingPkg = window.selectBPMPkg;
window.confirmBookingModal = window.confirmBPMBooking = function () {
  _showPaymentGateway();
};

window.selectBPMDay = function (d) {
  window.bookingState.selectedDay = d;
  renderBPMCalendar();
  const slotWrap = document.getElementById('bpm-slots-wrap');
  if (slotWrap) slotWrap.style.display = 'block';
  const slotsEl = document.getElementById('bpm-slots');
  const slots = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM'];
  const unavail = new Set([1, 3]);
  if (slotsEl) {
    slotsEl.innerHTML = slots.map((s, i) => `
      <div class="tpm-time-slot ${unavail.has(i) ? 'unavailable' : ''}" onclick="${unavail.has(i) ? '' : `selectBPMTime('${s}')`}">
        ${s}${unavail.has(i) ? ' (Full)' : ''}
      </div>
    `).join('');
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sumDate = document.getElementById('bpm-sum-date');
  if (sumDate) sumDate.textContent = `${d} ${months[window.bookingState.month]} ${window.bookingState.year}`;
};

window.selectBPMTime = function (t) {
  window.bookingState.selectedTime = t;
  document.querySelectorAll('#bpm-slots .tpm-time-slot').forEach(s => s.classList.remove('selected'));
  const slots = document.querySelectorAll('#bpm-slots .tpm-time-slot');
  const times = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM'];
  const idx = times.indexOf(t);
  if (slots[idx]) slots[idx].classList.add('selected');
  const sumTime = document.getElementById('bpm-sum-time');
  if (sumTime) sumTime.textContent = t;
};

window.confirmBPMBooking = function () {
  _showPaymentGateway();
};

function _showPaymentGateway() {
  const state = window.bookingState;
  if (!state.selectedDay) { window.toast && window.toast('⚠️ Please select a date first.'); return; }
  if (!state.selectedTime) { window.toast && window.toast('⚠️ Please select a time slot.'); return; }

  const t = (window.TRAINERS || []).find(x => String(x.id) === String(state.trainerId)) || window.currentTrainer || {};
  const amt = state.selectedPkg || t.pn || 2500;
  const pkg = state.selectedPkgName || 'Session';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${state.selectedDay} ${months[state.month]} ${state.year}`;

  const bpmBox = document.querySelector('.bpm-box');
  if (!bpmBox) return;

  bpmBox.innerHTML = `
  <div style="display:flex;flex-direction:column;height:100%">
    <!-- Header -->
    <div class="bpm-header" style="border-bottom:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex;align-items:center;gap:12px">
        <button onclick="closeBookingModal()" style="background:rgba(255,255,255,0.07);border:none;border-radius:50%;width:34px;height:34px;cursor:pointer;color:rgba(237,242,247,0.7);font-size:1rem;display:flex;align-items:center;justify-content:center">✕</button>
        <div>
          <div style="font-size:0.78rem;color:rgba(237,242,247,0.4);font-family:'Poppins',sans-serif">Step 2 of 2</div>
          <h2 style="font-size:1.05rem;margin:0">🔒 Secure Payment</h2>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:0.72rem;color:#4ADE80;font-family:'Poppins',sans-serif">
        <span style="width:7px;height:7px;background:#4ADE80;border-radius:50%;display:inline-block"></span>
        256-bit SSL
      </div>
    </div>

    <!-- Body -->
    <div style="display:grid;grid-template-columns:1fr 340px;gap:0;flex:1;overflow:hidden">

      <!-- LEFT: Payment Form -->
      <div style="padding:28px;overflow-y:auto;border-right:1px solid rgba(255,255,255,0.07)">

        <!-- Payment Method Tabs -->
        <div style="margin-bottom:24px">
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(237,242,247,0.4);margin-bottom:12px">Payment Method</div>
          <div style="display:flex;gap:8px" id="pay-tabs">
            ${[['card', '💳 Card'], ['upi', '📱 UPI'], ['netbanking', '🏦 Net Banking'], ['wallet', '👜 Wallet']].map(([id, label], i) => `
              <button id="ptab-${id}" onclick="_switchPayTab('${id}')" style="flex:1;padding:10px 6px;border:1.5px solid ${i === 0 ? '#C5A059' : 'rgba(255,255,255,0.1)'};border-radius:10px;background:${i === 0 ? 'rgba(197,160,89,0.12)' : 'rgba(255,255,255,0.04)'};color:${i === 0 ? '#C5A059' : 'rgba(237,242,247,0.55)'};font-family:'Poppins',sans-serif;font-size:0.72rem;font-weight:600;cursor:pointer;transition:all .2s">${label}</button>
            `).join('')}
          </div>
        </div>

        <!-- Card Form (default) -->
        <div id="pform-card">
          <div style="margin-bottom:16px">
            <label style="font-size:0.76rem;font-weight:600;color:rgba(237,242,247,0.5);display:block;margin-bottom:6px;font-family:'Poppins',sans-serif">Card Number</label>
            <div style="position:relative">
              <input type="text" placeholder="1234  5678  9012  3456" maxlength="19"
                oninput="this.value=this.value.replace(/[^\d]/g,'').replace(/(\d{4})/g,'$1 ').trim()"
                style="width:100%;padding:12px 44px 12px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.9);font-family:'Poppins',sans-serif;font-size:0.9rem;outline:none;letter-spacing:.08em">
              <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:1.1rem">💳</span>
            </div>
          </div>
          <div style="margin-bottom:16px">
            <label style="font-size:0.76rem;font-weight:600;color:rgba(237,242,247,0.5);display:block;margin-bottom:6px;font-family:'Poppins',sans-serif">Name on Card</label>
            <input type="text" placeholder="Full name as on card"
              style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.9);font-family:'Poppins',sans-serif;font-size:0.9rem;outline:none">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
            <div>
              <label style="font-size:0.76rem;font-weight:600;color:rgba(237,242,247,0.5);display:block;margin-bottom:6px;font-family:'Poppins',sans-serif">Expiry</label>
              <input type="text" placeholder="MM / YY" maxlength="7"
                style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.9);font-family:'Poppins',sans-serif;font-size:0.9rem;outline:none">
            </div>
            <div>
              <label style="font-size:0.76rem;font-weight:600;color:rgba(237,242,247,0.5);display:block;margin-bottom:6px;font-family:'Poppins',sans-serif">CVV</label>
              <input type="password" placeholder="•••" maxlength="4"
                style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.9);font-family:'Poppins',sans-serif;font-size:0.9rem;outline:none">
            </div>
          </div>
        </div>

        <!-- UPI Form -->
        <div id="pform-upi" style="display:none">
          <div style="margin-bottom:16px">
            <label style="font-size:0.76rem;font-weight:600;color:rgba(237,242,247,0.5);display:block;margin-bottom:6px;font-family:'Poppins',sans-serif">UPI ID</label>
            <input type="text" placeholder="yourname@upi"
              style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.9);font-family:'Poppins',sans-serif;font-size:0.9rem;outline:none">
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            ${['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => `<button style="padding:8px 18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:20px;color:rgba(237,242,247,0.7);font-family:'Poppins',sans-serif;font-size:0.8rem;cursor:pointer">${app}</button>`).join('')}
          </div>
        </div>

        <!-- Net Banking Form -->
        <div id="pform-netbanking" style="display:none">
          <select style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.7);font-family:'Poppins',sans-serif;font-size:0.9rem;outline:none">
            <option style="background:#0F1A2C;color:#fff">Select your bank</option>
            ${['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Yes Bank', 'Punjab National Bank'].map(b => `<option style="background:#0F1A2C;color:#fff">${b}</option>`).join('')}
          </select>
        </div>

        <!-- Wallet Form -->
        <div id="pform-wallet" style="display:none">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            ${['Paytm Wallet', 'Amazon Pay', 'Mobikwik', 'Freecharge'].map(w => `<button style="padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:rgba(237,242,247,0.7);font-family:'Poppins',sans-serif;font-size:0.82rem;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='#C5A059'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">${w}</button>`).join('')}
          </div>
        </div>

        <!-- Pay Button -->
        <button onclick="_processBPMPayment()" style="width:100%;padding:15px;background:linear-gradient(135deg,#C5A059,#E6C97A);border:none;border-radius:12px;color:#071A3A;font-family:'Poppins',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;margin-top:20px;letter-spacing:.01em;transition:transform .2s,box-shadow .2s;box-shadow:0 6px 20px rgba(197,160,89,0.35)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 10px 28px rgba(197,160,89,0.45)'" onmouseout="this.style.transform='';this.style.boxShadow='0 6px 20px rgba(197,160,89,0.35)'">
          Pay ${fmtINR ? fmtINR(amt) : '₹' + amt} Securely 🔒
        </button>

        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;font-size:0.7rem;color:rgba(237,242,247,0.3);font-family:'Poppins',sans-serif">
          <span>🔒</span> Powered by Razorpay · PCI DSS Compliant · End-to-end Encrypted
        </div>
      </div>

      <!-- RIGHT: Order Summary -->
      <div style="padding:28px;background:rgba(0,0,0,0.15)">
        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(237,242,247,0.4);margin-bottom:16px">Order Summary</div>

        <div style="background:rgba(197,160,89,0.08);border:1px solid rgba(197,160,89,0.2);border-radius:12px;padding:16px;margin-bottom:20px">
          <div style="font-size:0.78rem;color:rgba(237,242,247,0.45);margin-bottom:4px;font-family:'Poppins',sans-serif">Package</div>
          <div style="font-size:0.95rem;font-weight:700;color:rgba(237,242,247,0.95)">${pkg}</div>
          <div style="font-size:0.78rem;color:rgba(237,242,247,0.45);margin-top:2px;font-family:'Poppins',sans-serif">${t.name || 'Trainer'}</div>
        </div>

        ${[['📅 Date & Time', `${dateStr} · ${state.selectedTime}`], ['👤 Trainer', t.name || '—'], ['📍 Mode', 'Online (Zoom/Meet)'], ['⏱ Duration', '60 minutes']].map(([label, val]) => `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-family:'Poppins',sans-serif">
            <span style="font-size:0.78rem;color:rgba(237,242,247,0.4)">${label}</span>
            <span style="font-size:0.8rem;font-weight:600;color:rgba(237,242,247,0.85);text-align:right;max-width:160px">${val}</span>
          </div>
        `).join('')}

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.12)">
          <span style="font-size:0.8rem;color:rgba(237,242,247,0.5);font-family:'Poppins',sans-serif">Total (incl. GST)</span>
          <span style="font-size:1.3rem;font-weight:700;color:#C5A059">${fmtINR ? fmtINR(amt) : '₹' + amt}</span>
        </div>

        <div style="margin-top:20px;padding:14px;background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:10px">
          <div style="font-size:0.7rem;color:#4ADE80;font-weight:700;margin-bottom:4px;font-family:'Poppins',sans-serif">✅ Safe & Secure</div>
          <div style="font-size:0.72rem;color:rgba(237,242,247,0.45);line-height:1.6;font-family:'Poppins',sans-serif">Payment held in escrow until session is confirmed. Free cancellation up to 24h before.</div>
        </div>
      </div>

    </div>
  </div>`;
}

window._switchPayTab = function (tab) {
  ['card', 'upi', 'netbanking', 'wallet'].forEach(t => {
    const form = document.getElementById('pform-' + t);
    const btn = document.getElementById('ptab-' + t);
    if (form) form.style.display = t === tab ? 'block' : 'none';
    if (btn) {
      btn.style.borderColor = t === tab ? '#C5A059' : 'rgba(255,255,255,0.1)';
      btn.style.background = t === tab ? 'rgba(197,160,89,0.12)' : 'rgba(255,255,255,0.04)';
      btn.style.color = t === tab ? '#C5A059' : 'rgba(237,242,247,0.55)';
    }
  });
};

window._processBPMPayment = function () {
  const bpmBox = document.querySelector('.bpm-box');
  if (!bpmBox) return;
  bpmBox.innerHTML = `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:48px 32px">
    <div style="width:80px;height:80px;border-radius:50%;background:rgba(74,222,128,0.12);border:2px solid rgba(74,222,128,0.4);display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin-bottom:24px;animation:pulse 1.5s ease infinite">✅</div>
    <h2 style="color:rgba(237,242,247,0.95);margin-bottom:8px">Booking Confirmed!</h2>
    <p style="color:rgba(237,242,247,0.5);font-family:'Poppins',sans-serif;font-size:0.9rem;max-width:360px;line-height:1.7">Your session has been booked successfully. A confirmation has been sent to your email. The trainer will contact you within 2 hours.</p>
    <div style="margin-top:28px;padding:18px 28px;background:rgba(197,160,89,0.08);border:1px solid rgba(197,160,89,0.2);border-radius:14px;font-family:'Poppins',sans-serif">
      <div style="font-size:0.7rem;color:rgba(237,242,247,0.35);margin-bottom:4px">Booking Reference</div>
      <div style="font-size:1rem;font-weight:700;color:#C5A059;letter-spacing:.1em">#WTF-${Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
    </div>
    <button onclick="closeBookingModal()" style="margin-top:28px;padding:13px 36px;background:linear-gradient(135deg,#C5A059,#E6C97A);border:none;border-radius:999px;color:#071A3A;font-family:'Poppins',sans-serif;font-size:0.95rem;font-weight:700;cursor:pointer">Done</button>
  </div>`;
  window.toast && window.toast('🎉 Booking confirmed! Check your email for details.');
};

// ── EXPOSE GLOBALS ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Trainer modal click outside
  document.getElementById('trainer-modal')?.addEventListener('click', e => {
    if (e.target.id === 'trainer-modal') closeTrainerModal();
  });
  // Booking modal click outside
  document.getElementById('booking-modal')?.addEventListener('click', e => {
    if (e.target.id === 'booking-modal') closeBookingModal();
  });
});

// ── REVIEW MODAL ──────────────────────────────────────────────────────────────
window.openReviewModal = function (tid) {
  const TRAINERS = window.TRAINERS || [];
  const t = TRAINERS.find(x => String(x.id) === String(tid)) || window.currentTrainer;
  if (!t) return;

  let modal = document.getElementById('review-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); z-index:999999; display:none; justify-content:center; align-items:center; padding:20px;';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
      if (e.target.id === 'review-modal') closeReviewModal();
    });
  }

  const avatarHtml = t.profileImageUrl || t.profilePictureUrl
    ? `<img src="${t.profileImageUrl || t.profilePictureUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
    : (t.av || '👤');

  modal.innerHTML = `
  <div class="bpm-box" style="max-width:500px; padding: 32px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
      <h2 style="margin:0; font-size: 1.4rem; color: rgba(237,242,247,0.95); font-family: 'Poppins', sans-serif;">Write a Review</h2>
      <button onclick="closeReviewModal()" class="tpm-btn-icon" style="background:transparent; border:none; color:rgba(255,255,255,0.5); font-size: 1.2rem; cursor: pointer;">✕</button>
    </div>
    
    <div style="display:flex; align-items:center; gap: 14px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1)">
      <div style="width: 48px; height: 48px; border-radius: 50%; background: ${t.ac || 'rgba(197,160,89,0.2)'}; display:flex; align-items:center; justify-content:center; overflow:hidden; font-size: 1.5rem;">
        ${avatarHtml}
      </div>
      <div>
        <div style="font-weight: 700; color: rgba(237,242,247,0.95); font-family: 'Poppins', sans-serif;">${t.name}</div>
        <div style="font-size: 0.8rem; color: rgba(237,242,247,0.5); font-family: 'Poppins', sans-serif;">${t.category || 'Professional Trainer'}</div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <label class="tpm-form-label" style="display:block; margin-bottom:8px; font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:rgba(237,242,247,0.4)">Overall Rating</label>
      <div id="review-stars-input" style="font-size: 2.2rem; color: rgba(237,242,247,0.3); cursor: pointer; display:flex; gap: 8px;">
        <span onclick="setReviewStars(1)">★</span>
        <span onclick="setReviewStars(2)">★</span>
        <span onclick="setReviewStars(3)">★</span>
        <span onclick="setReviewStars(4)">★</span>
        <span onclick="setReviewStars(5)">★</span>
      </div>
      <input type="hidden" id="review-stars-val" value="0">
    </div>

    <div style="margin-bottom: 20px;">
      <label class="tpm-form-label" style="display:block; margin-bottom:8px; font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:rgba(237,242,247,0.4)">Review Title</label>
      <input type="text" id="review-title" style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.9);font-family:'Poppins',sans-serif;font-size:0.9rem;outline:none" placeholder="E.g., Exceptional training experience">
    </div>

    <div style="margin-bottom: 24px;">
      <label class="tpm-form-label" style="display:block; margin-bottom:8px; font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:rgba(237,242,247,0.4)">Your Review</label>
      <textarea id="review-body" rows="4" style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(237,242,247,0.9);font-family:'Poppins',sans-serif;font-size:0.9rem;outline:none;resize:vertical" placeholder="What did you like about the session? Did it meet your expectations?"></textarea>
    </div>

    <button onclick="submitReview('${t.id}')" style="width:100%;padding:14px;background:linear-gradient(135deg,#C5A059,#E6C97A);border:none;border-radius:10px;color:#071A3A;font-family:'Poppins',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(197,160,89,0.35);transition:transform .2s">Submit Review</button>
  </div>`;

  modal.style.display = 'flex';
};

window.setReviewStars = function (val) {
  document.getElementById('review-stars-val').value = val;
  const spans = document.getElementById('review-stars-input').querySelectorAll('span');
  spans.forEach((span, i) => {
    span.style.color = i < val ? '#C5A059' : 'rgba(237,242,247,0.3)';
  });
};

window.closeReviewModal = function () {
  const modal = document.getElementById('review-modal');
  if (modal) modal.style.display = 'none';
};

window.submitReview = function (tid) {
  const stars = document.getElementById('review-stars-val').value;
  if (stars === '0') {
    alert('Please select a star rating.');
    return;
  }
  // Dummy submit for front-end
  const btn = document.querySelector('#review-modal button[onclick^="submitReview"]');
  if (btn) btn.textContent = 'Submitting...';

  setTimeout(() => {
    closeReviewModal();
    window.toast && window.toast('⭐ Review submitted successfully! Pending approval.');
  }, 1000);
};
