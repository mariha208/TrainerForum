/* ═══════════════════════════════════════════════════
   WORLD TRAINER FORUM — LOCAL PERSISTENT ENGINE
   Advanced Asset Handling & Offline Mapping Controller
═══════════════════════════════════════════════════ */

'use strict';

// ═══════════════════════════════════════════════════
// MONGODB BACKEND CONFIGURATION
// ═══════════════════════════════════════════════════
window.SERVER_ORIGIN = window.SERVER_ORIGIN || 'https://trainerforum.onrender.com';
const SERVER_ORIGIN = window.SERVER_ORIGIN;
const API_BASE_URL = `${SERVER_ORIGIN}/api/users`;

// Get the logged-in user's real MongoDB _id from localStorage
function getLoggedInUserId() {
  try {
    // ONLY read from userSession (the actual auth token), never from currentTrainer
    const session = JSON.parse(localStorage.getItem('userSession') || 'null');
    return session && session._id ? session._id : null;
  } catch (e) { return null; }
}

// ── DASHBOARD LOGGED-OUT SCREEN ──
function _showDashboardLoggedOutScreen() {
  // Hide the entire dashboard layout
  const layout = document.getElementById('db-layout');
  const sidebar = document.querySelector('.db-sidebar');
  const main = document.querySelector('.db-main');
  const topnav = document.querySelector('.db-topnav');
  if (layout)  layout.style.display  = 'none';
  if (sidebar) sidebar.style.display = 'none';
  if (main)    main.style.display    = 'none';
  if (topnav)  topnav.style.display  = 'none';

  // Build the locked-out overlay
  const overlay = document.createElement('div');
  overlay.id = 'db-loggedout-screen';
  overlay.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:var(--bg, #0f0f0f);
      font-family:'Poppins','Inter',system-ui,sans-serif;
    ">
      <div style="
        text-align:center;
        padding:48px 36px;
        max-width:460px;
        background:var(--card-bg, #1a1a1a);
        border:1px solid var(--border, #2a2a2a);
        border-radius:20px;
        box-shadow:0 20px 60px rgba(0,0,0,0.6);
      ">
        <div style="font-size:3.5rem;margin-bottom:16px">🔒</div>
        <h2 style="color:#edf2f7;font-size:1.5rem;font-weight:700;margin-bottom:12px">
          You have been logged out
        </h2>
        <p style="color:#a0aec0;font-size:0.95rem;line-height:1.6;margin-bottom:28px">
          Your account has been logged out. Please log in again to access the Trainer Dashboard.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="index.html" style="
            display:inline-block;
            padding:12px 28px;
            background:#C5A059;
            color:#0f0f0f;
            font-weight:700;
            border-radius:10px;
            text-decoration:none;
            font-size:0.95rem;
            transition:opacity .2s;
          " onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">⬅ Go to Home</a>
          <button onclick="(function(){var m=document.getElementById('auth-modal');if(m&&window.openAuthModal){window.openAuthModal('login');}else{window.location.href='index.html#login';}})()" style="
            display:inline-block;
            padding:12px 28px;
            background:transparent;
            color:#C5A059;
            font-weight:700;
            border:1.5px solid #C5A059;
            border-radius:10px;
            cursor:pointer;
            font-size:0.95rem;
            font-family:inherit;
            transition:background .2s;
          " onmouseover="this.style.background='rgba(197,160,89,.1)'" onmouseout="this.style.background='transparent'">Log In</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

// ── CROSS-TAB LOGOUT DETECTION ──
// If the user logs out in another tab, immediately show the logout screen here
window.addEventListener('storage', function(e) {
  if (e.key === 'userSession' && !e.newValue) {
    // userSession was removed in another tab => logged out
    localStorage.removeItem('currentTrainer');
    _showDashboardLoggedOutScreen();
  }
});


// ── UTILITY 1: UI CARD SYNC COUPLING MATRIX ──────────────────────────────────
function syncDisplayCardUI(data) {
  if (!data) return;

  const nameString = String(data.fullName || data.name || "Trainer").trim();
  const taglineString = String(data.tagline || "Expert Instructor").trim();

  let initials = "TR";
  if (nameString) {
    initials = nameString.split(/\s+/).map(part => part[0]).join("").substring(0, 2).toUpperCase();
  }

  const setUIInnerText = (id, textValue) => {
    const element = document.getElementById(id);
    if (element) element.innerText = textValue || "";
  };

  setUIInnerText("nav-name", nameString);
  setUIInnerText("nav-av", initials);
  setUIInnerText("sidebar-name", nameString);
  setUIInnerText("sidebar-avatar", initials);
  setUIInnerText("greeting-name", nameString.split(" ")[0]);
  setUIInnerText("pp-name", nameString);
  setUIInnerText("pp-tagline", taglineString);
  setUIInnerText("db-membership-type", data.membershipType || "FREE");

  document.querySelectorAll('.profile-card h3, .preview-card h3, .trainer-card-name, #card-name').forEach(el => el.innerText = nameString);
  document.querySelectorAll('.profile-card p, .preview-card p, .trainer-card-tagline, #card-tagline').forEach(el => {
    if (!el.classList.contains('bio-text') && !el.id.includes('bio')) el.innerText = taglineString;
  });

  _applyProfilePhotoToUI(data.profileImageUrl || data.profilePictureUrl);
  _applyBannerPhotoToUI(data.bannerImageUrl || data.localBannerBase64);
}

// ── UTILITY 2: DYNAMICALLY POPULATE VALUES ON LOAD ───────────────────────────
function populateDashboardInputs(data) {
  if (!data) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) {
      if (el.type === 'file') {
        if (!val) el.value = "";
      } else {
        el.value = val || "";
      }
    }
  };

  setVal("p-name", data.fullName || data.name || "");
  setVal("p-tagline", data.tagline || "");
  // Helper: set category dropdown; if value not in options, fall back to "Other" + custom input
  const setCat = (selectId, inputId, val) => {
    if (!val) return;
    const sel = document.getElementById(selectId);
    const inp = document.getElementById(inputId);
    if (!sel) return;
    const opt = Array.from(sel.options).find(o => o.value === val || o.text === val);
    if (opt) {
      sel.value = opt.value;
    } else {
      sel.value = 'Other';
      if (inp) { inp.value = val; inp.style.display = 'block'; }
    }
  };

  const cat1 = data.category1 || data.expertiseCategory1 || data.expertiseCategory || data.category || '';
  const cat2 = data.category2 || data.expertiseCategory2 || '';
  const cat3 = data.category3 || data.expertiseCategory3 || '';
  setCat('p-category1', 'p-categoryOther1', cat1 || 'AI & Machine Learning');
  setCat('p-category2', 'p-categoryOther2', cat2);
  setCat('p-category3', 'p-categoryOther3', cat3);
  setVal("p-spec", data.specialization || "");
  setVal("p-exp", data.experience || "");
  setVal("p-location", data.location || "");
  setVal("p-mode", data.deliveryMode || "Online & In-Person");
  setVal("p-rate", data.rate || "");
  setVal("p-bio", data.bio || "");
  setVal("p-whatsapp", data.whatsapp || "");
  setVal("p-linkedin", data.linkedin || "");
  setVal("p-website", data.website || "");
  setVal("p-instagram", data.instagram || "");
  setVal("p-youtube", data.youtube || "");
  setVal("p-twitter", data.twitter || "");
  setVal("p-facebook", data.facebook || "");
  setVal("p-portfolio", data.portfolio || data.portfolioUrl || "");

  // Certifications By — populate table rows from saved data
  renderCertificationsByTable(data.certificationsBy || "");

  const initialLinks = data.portfolioLinks || data.testimonials || "";
  const linksInput = document.getElementById("p-portfolio-links") || document.querySelector('input[placeholder*="External Portfolio" i]');
  if (linksInput) linksInput.value = initialLinks;

  const _tagsEl = document.getElementById("p-tags");
  if (_tagsEl) {
    const _skillsRaw = data.skills || data.tags;
    if (_skillsRaw) {
      _tagsEl.value = Array.isArray(_skillsRaw) ? _skillsRaw.join(', ') : _skillsRaw;
    }
  }

  const profilePhotoUrl = data.profileImageUrl || data.profilePictureUrl || "";
  setVal("p-photo-url", profilePhotoUrl);
  if (profilePhotoUrl) _applyProfilePhotoToUI(profilePhotoUrl);

  const bannerPhotoUrl = data.bannerImageUrl || data.localBannerBase64 || "";
  if (bannerPhotoUrl) _applyBannerPhotoToUI(bannerPhotoUrl);

  // Now called cleanly without throwing ReferenceErrors!
  syncDisplayCardUI(data);

  // ── Helper: parse a pipe-separated package/service string block ──────────
  function _parseBlockString(blockStr) {
    const parts = blockStr.split('|').map(p => p.trim());
    const fields = {};
    if (parts.some(p => p.includes(':'))) {
      parts.forEach(part => {
        const ci = part.indexOf(':');
        if (ci === -1) return;
        const key = part.slice(0, ci).trim().toLowerCase().replace(/\s+/g, '');
        fields[key] = part.slice(ci + 1).trim();
      });
      return {
        name: fields['title'] || fields['name'] || '',
        price: String(fields['price'] || '0').replace(/[^0-9.]/g, '') || '0',
        duration: fields['duration'] || '',
        features: (fields['features'] || '').split(',').map(s => s.trim()).filter(Boolean),
        desc: fields['desc'] || fields['description'] || '',
        featured: false,
        active: true
      };
    } else {
      return {
        name: parts[0] || '',
        price: parts[1] ? parts[1].replace(/[^0-9.]/g, '') : '0',
        duration: parts[2] || '',
        features: parts[3] ? parts[3].split(',').map(s => s.trim()).filter(Boolean) : [],
        desc: '',
        featured: false,
        active: true
      };
    }
  }

  // ── Normalize packages from API (array OR pipe-string) ────────────────────
  function _normalizePkgsFromData(raw) {
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map(p => ({
        name: p.title || p.name || '',
        price: String(p.price || '0'),
        duration: p.duration || '',
        features: Array.isArray(p.features) ? p.features : (p.features || '').split(',').map(s => s.trim()).filter(Boolean),
        desc: p.desc || '',
        featured: p.featured || false,
        active: p.active !== false
      })).filter(p => p.name);
    }
    if (typeof raw === 'string' && raw.trim() && raw.trim() !== 'N/A') {
      const trimmed = raw.trim();
      if (trimmed.startsWith('[')) {
        try { return _normalizePkgsFromData(JSON.parse(trimmed)); } catch(e) {}
      }
      return trimmed.split(/\s*;\s*/).map(b => _parseBlockString(b)).filter(p => p.name);
    }
    return [];
  }

  // Re-render Services
  if (typeof _renderServiceItem === 'function' && document.getElementById('services-container')) {
    const sCont = document.getElementById('services-container');
    sCont.innerHTML = '';
    const svcs = _normalizePkgsFromData(data.services);
    if (svcs.length > 0) {
      svcs.forEach(item => _renderServiceItem(item));
    } else {
      sCont.innerHTML = '<div class="empty-msg" style="grid-column:1/-1;text-align:center;padding:20px;color:var(--tm);font-size:.85rem">No services defined.</div>';
    }
  }

  // Re-render Packages
  if (typeof _renderPackageItem === 'function' && document.getElementById('packages-container')) {
    const pCont = document.getElementById('packages-container');
    pCont.innerHTML = '';
    const pkgs = _normalizePkgsFromData(data.packages);
    if (pkgs.length > 0) {
      pkgs.forEach(item => _renderPackageItem(item));
    } else {
      pCont.innerHTML = '<div class="empty-msg" style="grid-column:1/-1;text-align:center;padding:20px;color:var(--tm);font-size:.85rem">No packages defined.</div>';
    }
  }

  // Re-render Availability — parse plain string if needed before storing
  if (typeof _renderAvailabilitySettings === 'function') {
    _renderAvailabilitySettings();
  }

  // Load Intro Video and Testimonial Videos explicitly to catch fetched data
  if (typeof _loadIntroVideo === 'function') _loadIntroVideo();
  if (typeof _loadTestiVideos === 'function') {
    // Clear out current rendered rows before re-loading
    const testiCont = document.getElementById('testi-inputs-container');
    if (testiCont) {
      testiCont.querySelectorAll('.testi-row').forEach(row => row.remove());
    }
    _loadTestiVideos();
  }
}

// ── UTILITY 3: COLLECT & SAVE RESTRUCTURINGS ─────────────────────────────────
window.commitLocalProfileChanges = function commitLocalProfileChanges() {
  const userId = getLoggedInUserId();
  if (!userId) {
    alert('You must be logged in to save your profile.');
    return;
  }

  let cached = JSON.parse(localStorage.getItem("currentTrainer")) || {};

  // Collect category values — handling 'Other' custom text inputs
  const getCategory = (selectId, inputId) => {
    const sel = document.getElementById(selectId);
    const inp = document.getElementById(inputId);
    if (!sel) return '';
    const val = sel.value.trim();
    if (val === 'Other') return inp?.value?.trim() || '';
    if (!val || val === 'None') return '';
    return val;
  };
  const cat1 = getCategory('p-category1', 'p-categoryOther1');
  const cat2 = getCategory('p-category2', 'p-categoryOther2');
  const cat3 = getCategory('p-category3', 'p-categoryOther3');

  const payload = {

    fullName: document.getElementById("p-name")?.value?.trim() || "",
    tagline: document.getElementById("p-tagline")?.value?.trim() || "",
    category: cat1,
    category1: cat1,
    category2: cat2,
    category3: cat3,
    specialization: document.getElementById("p-spec")?.value?.trim() || "",
    experience: document.getElementById("p-exp")?.value?.trim() || "0",
    location: document.getElementById("p-location")?.value?.trim() || "",
    deliveryMode: document.getElementById("p-mode")?.value?.trim() || "Online",
    rate: document.getElementById("p-rate")?.value?.trim() || "0",
    bio: document.getElementById("p-bio")?.value?.trim() || "",
    whatsapp: document.getElementById("p-whatsapp")?.value?.trim() || "",
    linkedin: document.getElementById("p-linkedin")?.value?.trim() || "",
    website: document.getElementById("p-website")?.value?.trim() || "",
    instagram: document.getElementById("p-instagram")?.value?.trim() || "",
    youtube: document.getElementById("p-youtube")?.value?.trim() || "",
    twitter: document.getElementById("p-twitter")?.value?.trim() || "",
    facebook: document.getElementById("p-facebook")?.value?.trim() || "",
    portfolio: document.getElementById("p-portfolio-base64")?.value || document.getElementById("p-portfolio")?.value?.trim() || "",
    profileImageUrl: document.getElementById("p-photo-url")?.value?.trim() || "",
    bannerImageUrl: cached.bannerImageUrl || "",

    // Build certificationsBy array from table rows
    certificationsBy: (function () {
      const rows = document.querySelectorAll('#certifications-by-body tr[data-cert-row]');
      const arr = [];
      rows.forEach(row => {
        const name = (row.querySelector('.cert-name-input')?.value || '').trim();
        const givenBy = (row.querySelector('.cert-givenby-input')?.value || '').trim();
        const year = (row.querySelector('.cert-year-input')?.value || '').trim();
        if (name || givenBy || year) arr.push({ name, givenBy, year });
      });
      return arr;
    })(),

    services: typeof window._getServices === 'function' ? window._getServices() : (cached.services || []),
    packages: typeof window._getPackages === 'function' ? window._getPackages() : (cached.packages || []),
    testimonialVideos: typeof window._getTestiVideos === 'function' ? window._getTestiVideos() : (cached.testimonialVideos || []),
    introVideo: document.getElementById('intro-video-url')?.value?.trim() || (typeof cached.introVideo === 'object' ? cached.introVideo.url : cached.introVideo) || "",
    testimonials: typeof window._getTestimonials === 'function' ? window._getTestimonials() : (cached.testimonials || document.getElementById("p-portfolio-links")?.value?.trim() || cached.portfolioLinks || "N/A"),

    availability: typeof window._getAvailability === 'function' ? window._getAvailability() : (cached.availability || "Mon-Fri | 9:00 AM - 6:00 PM"),

    // Skills / Expertise tags
    skills: (() => {
      const raw = (document.getElementById('p-tags')?.value || '').trim();
      if (!raw) return cached.skills || cached.tags || [];
      return raw.split(',').map(s => s.trim()).filter(Boolean);
    })()
  };

  console.log('Sending to MongoDB:', JSON.stringify(payload, null, 2));

  // ── DRIVE UPLOAD THEN PATCH ───────────────────────────────────────────────
  // If a new profile or banner photo was staged, upload it to Google Drive first
  // to get a permanent URL, then include that URL in the MongoDB payload.
  async function _uploadStagedImages() {
    const uploads = [];

    if (window._stagedProfileFile) {
      uploads.push(
        _uploadImageToDrive(window._stagedProfileFile, 'profile')
          .then(url => { payload.profileImageUrl = url; })
      );
    }

    if (window._stagedBannerFile) {
      uploads.push(
        _uploadImageToDrive(window._stagedBannerFile, 'banner')
          .then(url => { payload.bannerImageUrl = url; })
      );
    }

    await Promise.all(uploads);
  }

  async function _uploadImageToDrive(file, type) {
    const statusEl = document.getElementById(type === 'profile' ? 'photo-upload-status' : 'banner-upload-status');
    try {
      if (statusEl) { statusEl.textContent = `⏳ Uploading ${type} photo to Drive...`; statusEl.style.color = 'var(--gold)'; }
      console.log(`[Drive] Uploading ${type} image...`);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);

      const res = await fetch(`${SERVER_ORIGIN}/api/upload-image`, {
        method: 'POST',
        body: formData  // No Content-Type header — browser sets it automatically with boundary
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      console.log(`[Drive] ${type} upload success:`, data.url);

      if (statusEl) { statusEl.textContent = `✓ ${type} photo uploaded!`; statusEl.style.color = '#27ae60'; }
      return data.url;
    } catch (err) {
      console.error(`[Drive] ${type} upload error:`, err);
      if (statusEl) { statusEl.textContent = `❌ Upload failed: ${err.message}`; statusEl.style.color = '#e74c3c'; }
      throw err;
    }
  }

  // Run uploads then PATCH MongoDB
  _uploadStagedImages()
    .then(() => {
      return fetch(`${SERVER_ORIGIN}/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    })
    .then(res => {
      if (!res.ok) {
        console.error("Response Status:", res.status, res.statusText);
        throw new Error(`Sync Failed: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(updatedData => {
      console.log("✅ Everything successfully synced to MongoDB!", updatedData);

      // Clear staged files after successful save
      window._stagedProfileFile = null;
      window._stagedBannerFile = null;

      // Update profile/banner images in UI with the new Drive URLs
      if (updatedData.profileImageUrl) {
        _applyProfilePhotoToUI(updatedData.profileImageUrl);
        const profilePicEl = document.getElementById('profilePic');
        if (profilePicEl) profilePicEl.src = updatedData.profileImageUrl;
      }
      if (updatedData.bannerImageUrl) {
        _applyBannerPhotoToUI(updatedData.bannerImageUrl);
      }

      const cleanCacheObj = { ...cached, ...updatedData };
      cleanCacheObj.portfolioLinks = updatedData.testimonials || updatedData.portfolioLinks || payload.testimonials || "";

      delete cleanCacheObj.profileImageBase64;
      delete cleanCacheObj.bannerImageBase64;

      localStorage.setItem("currentTrainer", JSON.stringify(cleanCacheObj));
      populateDashboardInputs(cleanCacheObj);

      const statusEl = document.getElementById("profile-save-status");
      if (statusEl) {
        statusEl.style.opacity = "1";
        statusEl.style.color = "#27ae60";
        statusEl.textContent = "✓ All dashboard elements saved to database!";
        setTimeout(() => { statusEl.style.opacity = "0"; }, 3000);
      }
    })
    .catch(err => console.error("❌ Sync Error:", err));
}

// ── CERTIFICATIONS BY TABLE HELPERS ──────────────────────────────────────────

/**
 * Render the certifications-by table from a raw string or array.
 * Raw string format from Google Sheets: "Name | GivenBy | Year ;; Name2 | GivenBy2 | Year2"
 */
function renderCertificationsByTable(raw) {
  const tbody = document.getElementById('certifications-by-body');
  const emptyEl = document.getElementById('certifications-by-empty');
  if (!tbody) return;

  let rows = [];
  if (Array.isArray(raw)) {
    rows = raw;
  } else if (typeof raw === 'string' && raw.trim() && raw.trim() !== 'N/A') {
    rows = raw.split(' ;; ').map(chunk => {
      const parts = chunk.split(' | ');
      return { name: (parts[0] || '').trim(), givenBy: (parts[1] || '').trim(), year: (parts[2] || '').trim() };
    }).filter(r => r.name || r.givenBy || r.year);
  }

  tbody.innerHTML = '';
  if (rows.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  rows.forEach((r, i) => _appendCertRow(tbody, r, i));
}

/** Append one editable row to the certifications-by tbody */
function _appendCertRow(tbody, data, rowIndex) {
  const tr = document.createElement('tr');
  tr.setAttribute('data-cert-row', rowIndex);
  tr.innerHTML = `
    <td><input class="form-control cert-name-input" type="text" value="${_escAttr(data.name || '')}" placeholder="e.g. PMP Certification"></td>
    <td><input class="form-control cert-givenby-input" type="text" value="${_escAttr(data.givenBy || '')}" placeholder="e.g. PMI Institute"></td>
    <td><input class="form-control cert-year-input" type="text" value="${_escAttr(data.year || '')}" placeholder="e.g. 2023" style="width:80px"></td>
    <td style="text-align:center">
      <button type="button" class="btn btn-sm" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:.8rem;" onclick="removeCertificationRow(this)" title="Remove row">✕</button>
    </td>`;
  tbody.appendChild(tr);
}

function _escAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Add a blank row to the certifications-by table */
function addCertificationRow() {
  const tbody = document.getElementById('certifications-by-body');
  const emptyEl = document.getElementById('certifications-by-empty');
  if (!tbody) return;
  if (emptyEl) emptyEl.style.display = 'none';
  const rowIndex = tbody.querySelectorAll('tr[data-cert-row]').length;
  _appendCertRow(tbody, {}, rowIndex);
}

/** Remove a row when the ✕ button is clicked */
function removeCertificationRow(btn) {
  const row = btn.closest('tr[data-cert-row]');
  if (row) row.remove();
  const tbody = document.getElementById('certifications-by-body');
  const emptyEl = document.getElementById('certifications-by-empty');
  if (tbody && tbody.querySelectorAll('tr[data-cert-row]').length === 0 && emptyEl) {
    emptyEl.style.display = 'block';
  }
}

// ── GOOGLE DRIVE IMAGE HELPER ───────────────────────────────────────────────
// Helper to bypass Google Drive CORS / embedding blocks for images
function getDriveDirectUrl(url) {
  const str = String(url || '').trim();
  const driveMatch = str.match(/(?:id=|d\/)([a-zA-Z0-9_-]{25,})/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return str;
}

// Helper: Apply profile photo to UI blocks
function _applyProfilePhotoToUI(url) {
  if (!url) return;
  url = getDriveDirectUrl(url);
  const photoPreview = document.getElementById("photo-preview");
  const ppAvatar = document.getElementById("pp-avatar");
  const initialsEl = document.getElementById("photo-initials");
  const cardImg = document.getElementById("card-img") || document.querySelector(".trainer-card-img");

  if (photoPreview) photoPreview.style.backgroundImage = `url('${url}')`;
  if (ppAvatar) ppAvatar.style.backgroundImage = `url('${url}')`;
  if (initialsEl) initialsEl.style.display = "none";
  if (cardImg) {
    if (cardImg.tagName === "IMG") cardImg.src = url;
    else cardImg.style.backgroundImage = `url('${url}')`;
  }
}

// Helper: Apply banner to UI blocks
function _applyBannerPhotoToUI(url) {
  if (!url) return;
  url = getDriveDirectUrl(url);
  const bannerEl = document.getElementById("profile-banner");
  const bannerPreviewEl = document.getElementById("profile-banner-preview");
  const overlay = document.getElementById("banner-overlay");

  if (bannerEl) bannerEl.style.backgroundImage = `url('${url}')`;
  if (bannerPreviewEl) bannerPreviewEl.style.backgroundImage = `url('${url}')`;
  if (overlay) overlay.style.opacity = "0";
}

// ── DOM CONTENT LOADED RUNTIME BOOTSTRAPPING ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log("Local-first asset trainer engine running...");

  // ── AUTH GUARD: Must be logged in to use dashboard ──
  const userId = getLoggedInUserId();
  if (!userId) {
    // Show full-page logout screen immediately
    _showDashboardLoggedOutScreen();
    return;
  }

  let currentTrainerData = JSON.parse(localStorage.getItem("currentTrainer"));

  // Only use cached data if it belongs to the current logged-in user
  if (currentTrainerData && currentTrainerData.trainerId !== userId) {
    localStorage.removeItem('currentTrainer');
    currentTrainerData = null;
  }

  if (!currentTrainerData) {
    currentTrainerData = { trainerId: userId };
  }

  // Populate form inputs immediately on layout load
  populateDashboardInputs(currentTrainerData);

  // Fetch fresh data from MongoDB Backend
  if (!userId) {
    console.warn('[Dashboard] No logged-in user found. Showing local data only.');
    return;
  }

  fetch(`${API_BASE_URL}/${userId}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    })
    .then(data => {
      if (data) {
        // TrainerProfile field names → dashboard field names
        const matchedData = {
          ...data,
          _id: data._id,
          fullName: data.fullName || [data.firstName, data.lastName].filter(Boolean).join(' ') || '',
          tagline: data.professionalTitle || data.tagline || '',
          category: data.expertiseCategory || data.category || '',
          location: data.city || data.location || '',
          deliveryMode: data.mode || data.deliveryMode || 'Online',
          rate: String(data.hourlyRate || data.rate || ''),
          experience: String(data.yearsOfExperience || data.experience || ''),
          whatsapp: data.phoneNumber || data.whatsapp || '',
          linkedin: data.linkedinProfile || data.linkedin || '',
          profileImageUrl: data.profilePictureUrl || data.profileImageUrl || '',
          bannerImageUrl: data.coverBannerUrl || data.bannerImageUrl || '',
          portfolioVideo: data.videoIntro || data.portfolioVideo || '',
          certificationsBy: data.certificationsBy || data.achievements || [],
          instagram: data.socialLinks?.instagram || data.instagram || '',
          youtube: data.socialLinks?.youtube || data.youtube || '',
          twitter: data.socialLinks?.twitter || data.twitter || '',
          facebook: data.socialLinks?.facebook || data.facebook || '',
        };

        currentTrainerData = {
          ...currentTrainerData,
          trainerId: matchedData.trainerId || matchedData._id || getLoggedInUserId() || '',
          fullName: matchedData.fullName || matchedData.name || currentTrainerData.fullName || "",
          tagline: matchedData.tagline || currentTrainerData.tagline || "",
          specialization: matchedData.specialization || currentTrainerData.specialization || "",
          category: matchedData.category || currentTrainerData.category || "",
          experience: matchedData.experience || currentTrainerData.experience || "",
          location: matchedData.location || currentTrainerData.location || "",
          rate: matchedData.rate || matchedData.price || currentTrainerData.rate || "",
          deliveryMode: matchedData.deliveryMode || currentTrainerData.deliveryMode || "Online & In-Person",
          bio: matchedData.bio || currentTrainerData.bio || "",
          whatsapp: matchedData.whatsapp || matchedData.phone || currentTrainerData.whatsapp || "",
          linkedin: matchedData.linkedin || currentTrainerData.linkedin || "",
          website: matchedData.website || currentTrainerData.website || "",

          // certificationsBy: prefer native array from backend, then cached, then empty array
          certificationsBy: (() => {
            const fromServer = matchedData.certificationsBy;
            if (Array.isArray(fromServer) && fromServer.length > 0) return fromServer;
            const fromCache = currentTrainerData.certificationsBy;
            if (Array.isArray(fromCache) && fromCache.length > 0) return fromCache;
            // Flat string fallback (legacy)
            const raw = (typeof fromServer === 'string' ? fromServer : '') ||
              (typeof fromCache === 'string' ? fromCache : '');
            if (raw && raw !== 'N/A') {
              return raw.split(' ;; ').map(chunk => {
                const parts = chunk.split(' | ');
                return { name: (parts[0] || '').trim(), givenBy: (parts[1] || '').trim(), year: (parts[2] || '').trim() };
              }).filter(r => r.name || r.givenBy || r.year);
            }
            return [];
          })(),

          services: (() => {
            const raw = matchedData.services || currentTrainerData.services || "";
            if (Array.isArray(raw)) return raw;
            if (typeof raw === 'string' && raw.trim() && raw !== 'N/A') {
              if (raw.startsWith('[')) {
                try { return JSON.parse(raw); } catch (e) {}
              }
              return raw.split(';').map((s, idx) => {
                const parts = s.split('|').map(x => x.trim().replace(/^.*:\s*/, ''));
                return {
                  id: Date.now() + idx,
                  name: parts[0] || 'Service',
                  price: parts[1] ? parts[1].replace(/[^0-9.]/g, '') : '0',
                  duration: parts[2] || '60 mins',
                  mode: parts[3] || 'Online',
                  type: parts[4] || '1-on-1',
                  desc: parts[5] || '',
                  featured: false
                };
              });
            }
            return [];
          })(),

          packages: (() => {
            const raw = matchedData.packages || currentTrainerData.packages || "";
            if (Array.isArray(raw)) return raw;
            if (typeof raw === 'string' && raw.trim() && raw !== 'N/A') {
              if (raw.startsWith('[')) {
                try { return JSON.parse(raw); } catch (e) {}
              }
              return raw.split(';').map((p, idx) => {
                const parts = p.split('|').map(x => x.trim().replace(/^.*:\s*/, ''));
                return {
                  id: Date.now() + idx + 1000,
                  name: parts[0] || 'Package',
                  price: parts[1] ? parts[1].replace(/[^0-9.]/g, '') : '0',
                  duration: parts[2] || '4 Weeks',
                  features: (parts[3] || '').split(',').map(f => f.trim()).filter(Boolean),
                  desc: parts[4] || '',
                  featured: false
                };
              });
            }
            return [];
          })(),

          portfolioVideo: matchedData.portfolioVideo || currentTrainerData.portfolioVideo || "",
          portfolioLinks: matchedData.portfolioLinks || currentTrainerData.portfolioLinks || "",
          introVideo: matchedData.introVideo || currentTrainerData.introVideo || "",
          testimonials: matchedData.testimonials || currentTrainerData.testimonials || [],
          profileImageUrl: matchedData.profileImageUrl || currentTrainerData.profileImageUrl || "",
          bannerImageUrl: matchedData.bannerImageUrl || currentTrainerData.bannerImageUrl || "",
          tags: matchedData.expertiseTags
            ? (typeof matchedData.expertiseTags === 'string'
              ? matchedData.expertiseTags.split(',').map(t => t.trim()).filter(Boolean)
              : matchedData.expertiseTags)
            : (currentTrainerData.tags || [])
        };

        localStorage.setItem("currentTrainer", JSON.stringify(currentTrainerData));
        populateDashboardInputs(currentTrainerData);
        console.log("Successfully loaded dashboard data from MongoDB.", currentTrainerData);
      }
    })
    .catch(err => {
      console.error("Failed to fetch live dashboard data from MongoDB:", err);
    });

  // Bind save button
  const saveBtn = document.getElementById("save-profile-btn");
  if (saveBtn) {
    saveBtn.onclick = function (e) {
      e.preventDefault();
      commitLocalProfileChanges();
    };
  }

  // --- BANNER IMAGE HANDLER --- Upload to Drive on Save ---
  const bannerInput = document.getElementById("upload-banner-file");
  if (bannerInput) {
    bannerInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("⚠️ Invalid file type.");
        return;
      }

      // Show live preview using an object URL (does not upload yet)
      const objectUrl = URL.createObjectURL(file);
      _applyBannerPhotoToUI(objectUrl);

      // Stage the file for upload when Save Profile is clicked
      window._stagedBannerFile = file;

      const statusEl = document.getElementById("banner-upload-status");
      if (statusEl) {
        statusEl.textContent = "📷 Banner ready — will upload on Save Profile";
        statusEl.style.color = "var(--gold)";
      }
    });
  }

  // --- PROFILE PHOTO HANDLER --- Upload to Drive on Save ---
  const photoFileInput = document.getElementById("upload-photo-file");
  const photoStatusEl = document.getElementById("photo-upload-status");

  if (photoFileInput) {
    photoFileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      // Show live preview using an object URL (does not upload yet)
      const localPreviewUrl = URL.createObjectURL(file);
      _applyProfilePhotoToUI(localPreviewUrl);

      // Stage the file for upload when Save Profile is clicked
      window._stagedProfileFile = file;

      if (photoStatusEl) {
        photoStatusEl.textContent = "📷 Photo ready — will upload to Drive on Save Profile";
        photoStatusEl.style.color = "var(--gold)";
      }
    });
  }
});

// ── PORTFOLIO PDF UPLOAD LISTENER ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const pPortInput = document.getElementById("p-portfolio");
  if (pPortInput) {
    pPortInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      const statusEl = document.getElementById("p-portfolio-status");
      const hiddenInput = document.getElementById("p-portfolio-base64");

      if (!file) {
        if (statusEl) statusEl.textContent = "";
        if (hiddenInput) hiddenInput.value = "";
        return;
      }

      if (file.type !== "application/pdf") {
        alert("Please upload a valid PDF document.");
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("PDF file must be under 5MB.");
        e.target.value = "";
        return;
      }

      if (statusEl) statusEl.textContent = "Processing PDF...";

      const reader = new FileReader();
      reader.onload = function (event) {
        if (hiddenInput) hiddenInput.value = event.target.result;
        if (statusEl) statusEl.textContent = "PDF Ready to Save (✓ " + file.name + ")";
      };
      reader.onerror = function () {
        if (statusEl) statusEl.textContent = "Error reading file. Please try again.";
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    });
  }
});

// -- INITIAL DASHBOARD FETCH (uses logged-in user _id) --
document.addEventListener("DOMContentLoaded", () => {
  const userId = getLoggedInUserId();
  if (!userId) return; // Not logged in — skip server fetch

  fetch(`${API_BASE_URL}/${userId}?nocache=${Date.now()}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      if (data && data._id) {
        const normalised = {
          ...data,
          fullName: data.fullName || [data.firstName, data.lastName].filter(Boolean).join(' ') || '',
          tagline: data.professionalTitle || data.tagline || '',
          category: data.expertiseCategory || data.category || '',
          location: data.city || data.location || '',
          deliveryMode: data.mode || data.deliveryMode || 'Online',
          rate: String(data.hourlyRate || data.rate || ''),
          experience: String(data.yearsOfExperience || data.experience || ''),
          whatsapp: data.phoneNumber || data.whatsapp || '',
          linkedin: data.linkedinProfile || data.linkedin || '',
          profileImageUrl: data.profilePictureUrl || data.profilePic || data.profileImageUrl || '',
          bannerImageUrl: data.coverBannerUrl || data.coverBanner || data.bannerImageUrl || '',
          certificationsBy: data.certificationsBy || data.achievements || [],
          instagram: data.socialLinks?.instagram || data.instagram || '',
          youtube: data.socialLinks?.youtube || data.youtube || '',
          twitter: data.socialLinks?.twitter || data.twitter || '',
          facebook: data.socialLinks?.facebook || data.facebook || '',
          videoIntro: data.videoIntro || '',
          testimonials: data.testimonials || [],
          services: data.services || [],
          packages: data.packages || [],
          availability: data.availability || {},
          tags: data.tags || data.skills || [],
        };
        const merged = { ...(JSON.parse(localStorage.getItem('currentTrainer') || '{}')), ...normalised };
        localStorage.setItem("currentTrainer", JSON.stringify(merged));
        populateDashboardInputs(merged);
        syncDisplayCardUI(merged);
        console.log("Dashboard re-rendered with fresh MongoDB data.");
      }
    })
    .catch(err => {
      console.error("Error fetching fresh dashboard data:", err);
      if (err.message.includes('404')) {
        alert("Your session is invalid or the database was reset. Please log in or register again.");
        localStorage.removeItem("currentTrainer");
        localStorage.removeItem("authToken");
        window.location.href = "index.html"; // Redirect to home so they can register
      }
    });
});