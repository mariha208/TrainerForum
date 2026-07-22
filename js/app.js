'use strict';

// ── DATA ──────────────────────────────────────────────────────────────────────
const TRAINERS = [];
window.TRAINERS = TRAINERS;

// ── MODAL BRIDGE ─────────────────────────────────────────────────────────────
window.openModal = function (mode) {
  const resolvedMode = (mode === 'login') ? 'login' : 'register';
  if (typeof openAuthModal === 'function') {
    openAuthModal(resolvedMode);
  } else {
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.style.display = 'flex';
  }
};

window.closeModal = function () {
  if (typeof closeAuthModal === 'function') closeAuthModal();
  const authModal = document.getElementById('auth-modal');
  if (authModal) authModal.style.display = 'none';
};

// ── DOM CONTENT LOADED ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log("Premium dark-theme application initialization routine running...");
  subscribeToTrainers();
  setupGlobalSearchEngine();
  setupFilterToggles();
  setupModalDismissals();
  verifyUserSessionToken();
  applyConditionalHeaderLogic();
});

// ── GLOBAL HEADER COMPONENT LOGIC ──────────────────────────────────────────
function applyConditionalHeaderLogic() {
  // The user requested to keep the hamburger menu visible on ALL pages now,
  // so we ensure it's explicitly shown if it was hidden previously.
  const hamBtn = document.getElementById('ham-btn');
  if (hamBtn) {
    hamBtn.style.display = 'block'; // Ensure it's fully visible
    hamBtn.classList.remove('hidden');
  }

  // Ensure hiding logic doesn't break spacing for the nav globally
  const nav = document.getElementById('nav');
  if (nav) {
    nav.style.display = 'flex';
    nav.style.justifyContent = 'space-between';
    nav.style.alignItems = 'center';
  }

  const logo = document.querySelector('.logo');
  if (logo) {
    logo.href = 'index.html'; // Fallback navigation option
  }
}

// ── SYNC ENGINE: STREAM MONGODB LIVE DATA ROWS ──────────────────────────
function subscribeToTrainers() {
  const API_BASE_URL = 'https://trainerforum.onrender.com/api/trainers';

  console.log("📡 Connecting live database arrays to original card matrix...");

  fetch(API_BASE_URL, {
    method: "GET",
    mode: "cors",
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => {
      if (!res.ok) throw new Error("Database handshake failed: HTTP " + res.status);
      return res.json();
    })
    .then(data => {
      console.log('[App] Raw API response type:', typeof data, Array.isArray(data) ? ('Array[' + data.length + ']') : JSON.stringify(data).slice(0, 200));
      const grid = document.getElementById('home-grid') || document.querySelector('.trainers-grid');
      if (!grid) return;

      grid.innerHTML = '';
      TRAINERS.length = 0;

      // Handle both array and {data: [...]} wrapper formats
      const rows = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

      const isHomeGrid = grid.id === 'home-grid';

      if (rows.length > 0) {
        rows.forEach(row => {
          
          // Helper to bypass Google Drive CORS / embedding blocks for images
          const getDriveDirectUrl = (url) => {
            const str = String(url || '').trim();
            const driveMatch = str.match(/(?:id=|d\/)([a-zA-Z0-9_-]{25,})/);
            if (driveMatch && driveMatch[1]) {
              // lh3.googleusercontent.com acts as a direct CDN without auth checks or third-party cookie restrictions
              return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
            }
            return str;
          };

          // ── COMPUTED HELPERS (resolve MongoDB schema fields + legacy aliases) ──
          const _name = (() => {
            // MongoDB schema stores firstName + lastName separately
            if (row.firstName) {
              return ((row.firstName || '') + ' ' + (row.lastName || '')).trim();
            }
            // Legacy / sheet-based aliases
            return row.fullName || row.FullName || row.name || row.Name || 'Unnamed Trainer';
          })();

          const _cat1 = row.expertiseCategory1 || row.ExpertiseCategory1 || row.category1 || row.Category1 || '';
          const _cat2 = row.expertiseCategory2 || row.ExpertiseCategory2 || row.category2 || row.Category2 || '';
          const _cat3 = row.expertiseCategory3 || row.ExpertiseCategory3 || row.category3 || row.Category3 || '';
          const _fallbackCat = row.expertiseCategory || row.ExpertiseCategory || row.category || row.Category || row.cat || row.Cat || '';
          
          let _categoryArr = [_cat1 || _fallbackCat, _cat2, _cat3].filter(Boolean);
          // deduplicate if any are same
          _categoryArr = [...new Set(_categoryArr)];
          
          const _category = _categoryArr.length > 0 ? _categoryArr.join(' • ') : 'General';

          // hourlyRate is a Number in DB schema; fall back to legacy string fields
          const _rawRate = row.hourlyRate ?? row.HourlyRate ?? row.rate ?? row.Rate ?? row.price ?? row.Price ?? 0;
          const _rateStr = String(_rawRate);

          const _experience = String(
            row.yearsOfExperience ?? row.YearsOfExperience ??
            row.experience ?? row.Experience ??
            '0'
          );

          const _tagline = String(
            row.professionalTitle || row.ProfessionalTitle ||
            row.tagline || row.Tagline ||
            row.title || row.Title ||
            ''
          );

          // Location: DB has separate city + country fields
          const _location = (() => {
            if (row.city || row.country) {
              return [row.city, row.country].filter(Boolean).join(', ');
            }
            return String(row.location || row.Location || 'Remote');
          })();

          // Images: DB uses profilePictureUrl + coverBannerUrl (schema field names)
          const _profilePic = getDriveDirectUrl(
            row.profilePictureUrl || row.ProfilePictureUrl ||
            row.profileImageUrl || row.ProfileImageUrl ||
            row.photoUrl || row.PhotoUrl ||
            ''
          );
          const _bannerPic = getDriveDirectUrl(
            row.coverBannerUrl || row.CoverBannerUrl ||
            row.bannerImageUrl || row.BannerImageUrl ||
            row.bannerUrl || row.BannerUrl ||
            ''
          );

          // Social: DB uses linkedinProfile + phoneNumber
          const _phone = String(
            row.phoneNumber || row.PhoneNumber ||
            row.whatsapp || row.Whatsapp ||
            row.phone || row.Phone ||
            ''
          );
          const _linkedin = String(
            row.linkedinProfile || row.LinkedinProfile ||
            row.linkedin || row.Linkedin ||
            (row.socialLinks && row.socialLinks.linkedin) ||
            ''
          );

          const normalizedTrainer = {
            // ── Core identity ──────────────────────────────────────────────
            id: String(row._id || row.id || row.trainerId || row.TrainerId || 'T-1001'),
            trainerId: String(row._id || row.id || row.trainerId || row.TrainerId || 'T-1001'),
            name: _name,
            fullName: _name,
            tagline: _tagline,
            role: _tagline || _category || 'Professional', // modal alias

            // ── Category / specialisation ──────────────────────────────────
            category: _category,
            cat: _category, // modal alias
            specialization: String(
              row.specialization || row.Specialization ||
              row.expertiseCategory || row.ExpertiseCategory ||
              row.category || ''
            ),

            // ── Bio, location, mode ────────────────────────────────────────
            bio: String(row.bio || row.Bio || ''),
            location: _location,
            city: _location, // modal alias
            deliveryMode: String(row.deliveryMode || row.DeliveryMode || row.mode || 'Online'),
            mode: String(row.deliveryMode || row.DeliveryMode || row.mode || 'Online'),
            availability: row.availability || row.Availability || 'Mon–Fri | 9 AM–6 PM',

            // ── Pricing ────────────────────────────────────────────────────
            price: _rateStr,
            pn: parseFloat(_rateStr.replace(/[^\d.]/g, '')) || 0,
            rate: _rateStr,

            // ── Membership ─────────────────────────────────────────────────
            membershipType: String(row.membershipType || 'FREE').toUpperCase(),
            isFeatured: row.isFeatured === true,

            // ── Experience ────────────────────────────────────────────────
            experience: _experience,
            exp: _experience, // modal alias

            // ── Social contacts ───────────────────────────────────────────
            phone: _phone,
            whatsapp: _phone, // modal alias
            linkedin: _linkedin,
            website: String(row.website || row.Website || (row.socialLinks && row.socialLinks.website) || ''),
            instagram: String(row.instagram || row.Instagram || (row.socialLinks && row.socialLinks.instagram) || ''),
            youtube: String(row.youtube || row.Youtube || (row.socialLinks && row.socialLinks.youtube) || ''),
            twitter: String(row.twitter || row.Twitter || row.x || (row.socialLinks && row.socialLinks.twitter) || ''),
            facebook: String(row.facebook || row.Facebook || (row.socialLinks && row.socialLinks.facebook) || ''),
            socialLinks: row.socialLinks || {}, // pass through for modal
            portfolioUrl: String(row.portfolioUrl || row.PortfolioUrl || row.portfolioLink || row.portfolio || row.Portfolio || ''),

            // ── Images (Parsed to bypass Drive CORS) ──────────────────────
            profilePic: _profilePic,
            profileImageUrl: _profilePic,      // modal alias
            profilePictureUrl: _profilePic,    // modal alias
            bannerPic: _bannerPic,
            bannerImageUrl: _bannerPic,        // modal alias
            coverBannerUrl: _bannerPic,        // modal alias

            // ── certificationsBy — native array from backend (or flat string fallback) ─
            certificationsBy: (() => {
              // Try new field name first, then old 'certifications' field
              const raw = row.certificationsBy || row.CertificationsBy || row.certifications || row.Certifications;
              if (Array.isArray(raw) && raw.length > 0) return raw;
              if (typeof raw === 'string' && raw.trim() && raw.trim() !== 'N/A') {
                return raw.split(/\s*;;?\s*/).map(chunk => {
                  const fields = {};
                  const parts = chunk.split('|').map(p => p.trim());

                  // Check if this chunk uses key-value format
                  if (parts.some(p => p.includes(':'))) {
                    parts.forEach(part => {
                      const ci = part.indexOf(':');
                      if (ci === -1) return;
                      const key = part.slice(0, ci).trim().toLowerCase().replace(/\s+/g, '');
                      const val = part.slice(ci + 1).trim();
                      fields[key] = val;
                    });
                    return {
                      name: fields['name'] || '',
                      givenBy: fields['givenby'] || '',
                      year: fields['year'] || ''
                    };
                  } else {
                    // Fallback: assume positional formatting: Name | Given By | Year
                    return {
                      name: parts[0] || '',
                      givenBy: parts[1] || '',
                      year: parts[2] || ''
                    };
                  }
                }).filter(r => r.name || r.givenBy);
              }
              return [];
            })(),

            // ── Other delimited fields ─────────────────────────────────────
            servicesRaw: String(row.services || row.Services || 'N/A'),
            services: String(row.services || row.Services || 'N/A'),
            portfolioVideo: String(row.portfolioVideo || row.PortfolioVideo || row.introVideo || ''),
            portfolioLinksRaw: String(row.portfolioLinks || row.portfolioLink || row.PortfolioLinks || 'N/A'),
            portfolioLinks: String(row.portfolioLinks || row.portfolioLink || row.PortfolioLinks || 'N/A'),

            // ── Tags / skills ─────────────────────────────────────────────
            tags: (() => {
              const raw = row.skills || row.tags || row.Tags;
              if (Array.isArray(raw) && raw.length > 0) return raw;
              if (typeof raw === 'string' && raw.trim()) return raw.split(',').map(s => s.trim()).filter(Boolean);
              return [];
            })(),
            etags: (() => {
              const raw = row.skills || row.tags || row.Tags;
              if (Array.isArray(raw) && raw.length > 0) return raw;
              if (typeof raw === 'string' && raw.trim()) return raw.split(',').map(s => s.trim()).filter(Boolean);
              return [];
            })(), // modal alias — must be array for _arr() in trainer-modal
            allSkills: (() => {
              const raw = row.skills || row.tags || row.Tags;
              if (Array.isArray(raw) && raw.length > 0) return raw;
              if (typeof raw === 'string' && raw.trim()) return raw.split(',').map(s => s.trim()).filter(Boolean);
              return [];
            })(), // trainer-modal reads t.allSkills first

            // ── Ratings / session counts ───────────────────────────────────
            rating: parseFloat(String(row.rating ?? '5.0')) || 5.0,
            reviews: String(row.reviews ?? '0'),
            sessions: String(row.sessions ?? '0'),

            // ── Video Intro Mapping ────────────────────────────────────────
            // introVideo saved by dashboard as JSON {url, type}; or as plain URL string
            introVideo: (() => {
              const raw = row.introVideo || row.intoVideo || row.videoIntro || row.portfolioVideo || row.PortfolioVideo || '';
              if (!raw) return '';
              if (typeof raw === 'object' && raw.url) return raw.url;
              try {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.url) return parsed.url;
              } catch (e) { }
              return String(raw);
            })(),
            videoIntro: (() => {
              const raw = row.introVideo || row.intoVideo || row.videoIntro || row.portfolioVideo || row.PortfolioVideo || '';
              if (!raw) return '';
              if (typeof raw === 'object' && raw.url) return raw.url;
              try {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.url) return parsed.url;
              } catch (e) { }
              return String(raw);
            })(),
            // ── Membership ─────────────────────────────────────────────────
            membershipType: String(row.membershipType || 'FREE').toUpperCase(),
          };

          // ── COMPLEX DESERIALIZATION (Decoupled JSON Arrays) ──────────────────────────

          // Services
          try {
            let rowServices = row.services || row.Services || '';
            if (Array.isArray(rowServices) && rowServices.length > 0) {
              normalizedTrainer.services = rowServices.map(s => ({
                name: s.title || s.name || '',
                price: s.price || '0',
                duration: s.duration || '',
                mode: s.mode || 'Online',
                type: s.type || '1-on-1',
                desc: s.features || s.desc || '',
                active: true
              })).filter(s => s.name);
            } else if (rowServices && typeof rowServices === 'string' && rowServices.startsWith('[')) {
              normalizedTrainer.services = JSON.parse(rowServices).map(s => ({
                name: s.title || s.name || '',
                price: s.price || '0',
                duration: s.duration || '',
                mode: s.mode || 'Online',
                type: s.type || '1-on-1',
                desc: s.features || s.desc || '',
                active: true
              }));
            } else {
              // Fallback for old pipe separated format
              const rawServicesStr = String(rowServices);
              if (rawServicesStr && rawServicesStr !== 'N/A' && !rawServicesStr.includes('No active')) {
                normalizedTrainer.services = rawServicesStr.split(/\s*;\s*/).map(s => {
                  const parts = s.split('|').map(p => p.trim());
                  const fields = {};

                  if (parts.some(p => p.includes(':'))) {
                    parts.forEach(part => {
                      const colonIdx = part.indexOf(':');
                      if (colonIdx === -1) return;
                      const key = part.slice(0, colonIdx).trim().toLowerCase().replace(/\s+/g, '');
                      const value = part.slice(colonIdx + 1).trim();
                      fields[key] = value;
                    });
                    const name = fields['title'] || fields['name'] || fields['service'] || '';
                    if (!name) return null;
                    return {
                      name,
                      price: String(fields['price'] || '0').replace(/[^0-9.]/g, '') || '0',
                      duration: fields['duration'] || '60 mins',
                      mode: fields['mode'] || 'Online',
                      type: fields['type'] || '1-on-1',
                      desc: fields['features'] || fields['desc'] || '',
                      active: true
                    };
                  } else {
                    return {
                      name: parts[0] || 'Professional Service',
                      price: parts[1] ? parts[1].replace(/[^0-9.]/g, '') : '0',
                      duration: parts[2] || '60 mins',
                      mode: parts[3] || 'Online',
                      type: parts[4] || '1-on-1',
                      desc: parts[5] || '',
                      active: true
                    };
                  }
                }).filter(Boolean);
              }
            }
          } catch (e) { console.error("Error parsing services:", e); }

          // Packages — handles pre-parsed array OR JSON array string OR pipe-separated string
          try {
            let rowPkgs = row.packages || row.Packages || '';
            if (Array.isArray(rowPkgs) && rowPkgs.length > 0) {
              // Already a parsed array (e.g. from data.json fallback)
              normalizedTrainer.packages = rowPkgs.map(p => ({
                name: p.title || p.name || '',
                price: String(p.price || '0'),
                duration: p.duration || '',
                features: Array.isArray(p.features) ? p.features : (p.features || '').split(',').map(s => s.trim()).filter(Boolean),
                desc: p.desc || '',
                featured: p.featured || false,
                active: p.active !== false
              })).filter(p => p.name);
            } else if (rowPkgs && typeof rowPkgs === 'string') {
              const trimmed = rowPkgs.trim();
              if (trimmed.startsWith('[')) {
                // ── Format 1: New JSON array ─────────────────────────────
                normalizedTrainer.packages = JSON.parse(trimmed).map(p => ({
                  name: p.title || p.name || '',
                  price: String(p.price || '0'),
                  duration: p.duration || '',
                  features: Array.isArray(p.features)
                    ? p.features
                    : (p.features || '').split(',').map(s => s.trim()).filter(Boolean),
                  featured: p.featured || false,
                  active: p.active !== false
                })).filter(p => p.name);
              } else if (trimmed && trimmed !== 'N/A' && trimmed !== 'undefined') {
                // ── Format 2: Pipe-separated string ──────────────────────
                // e.g. "Title : Basic | Price : 5000 | Duration : 1 Month | Features : 5 sessions, Diet ; Title : ..."
                normalizedTrainer.packages = trimmed.split(/\s*;\s*/).map(block => {
                  const parts = block.split('|').map(p => p.trim());
                  const fields = {};

                  if (parts.some(p => p.includes(':'))) {
                    parts.forEach(part => {
                      const colonIdx = part.indexOf(':');
                      if (colonIdx === -1) return;
                      const key = part.slice(0, colonIdx).trim().toLowerCase().replace(/\s+/g, '');
                      const value = part.slice(colonIdx + 1).trim();
                      fields[key] = value;
                    });
                    const name = fields['title'] || fields['name'] || fields['packagename'] || '';
                    if (!name) return null;
                    return {
                      name,
                      price: String(fields['price'] || '0').replace(/[^0-9.]/g, '') || '0',
                      duration: fields['duration'] || '',
                      features: (fields['features'] || '').split(',').map(s => s.trim()).filter(Boolean),
                      featured: false,
                      active: true
                    };
                  } else {
                    return {
                      name: parts[0] || 'Training Package',
                      price: parts[1] ? parts[1].replace(/[^0-9.]/g, '') : '0',
                      duration: parts[2] || '',
                      features: parts[3] ? parts[3].split(',').map(s => s.trim()).filter(Boolean) : [],
                      featured: false,
                      active: true
                    };
                  }
                }).filter(Boolean);
              }
            }
          } catch (e) { console.error("Error parsing packages:", e); }

          // Testimonials — handle array (from data.json), JSON string, or ;; separated URLs
          try {
            let rowTestis = row.testimonials || row.Testimonials || row.testimonialVideos || row.TestimonialVideos || row.portfolioLinks || row.PortfolioLinks || '';
            if (Array.isArray(rowTestis)) {
              if (rowTestis.length > 0) {
                normalizedTrainer.testimonials = rowTestis.map(item => {
                  if (typeof item === 'string') return { url: item, label: '' };
                  return {
                    url: item.url || item.videoUrl || item.link || '',
                    label: item.label || item.companyName || item.guestName || '',
                    companyName: item.companyName || '',
                    guestName: item.guestName || '',
                    date: item.date || ''
                  };
                }).filter(item => item && item.url);
              } else if (row.portfolioLinks) {
                // If the array is empty but we have portfolioLinks as a string
                rowTestis = row.portfolioLinks;
              }
            }

            if (typeof rowTestis === 'string' && rowTestis.trim()) {
              if (rowTestis.trim().startsWith('[')) {
                try {
                  const parsed = JSON.parse(rowTestis);
                  normalizedTrainer.testimonials = parsed.map(item => {
                    if (typeof item === 'string') return { url: item, label: '' };
                    return {
                      url: item.url || item.videoUrl || item.link || '',
                      label: item.label || item.companyName || item.guestName || '',
                      companyName: item.companyName || '',
                      guestName: item.guestName || '',
                      date: item.date || ''
                    };
                  }).filter(item => item && item.url);
                } catch (e) { }
              } else {
                normalizedTrainer.testimonials = rowTestis.split(';;').map(block => {
                  if (!block.includes('|') && (block.includes('youtu') || block.includes('http'))) {
                    return { url: block.trim(), label: '' };
                  }
                  const fields = {};
                  block.split('|').forEach(part => {
                    const colonIdx = part.indexOf(':');
                    if (colonIdx === -1) return;
                    const key = part.slice(0, colonIdx).trim().toLowerCase().replace(/\s+/g, '');
                    const value = part.slice(colonIdx + 1).trim();
                    fields[key] = value;
                  });
                  return {
                    url: fields['url'] || fields['link'] || fields['videourl'] || block.trim(),
                    label: fields['label'] || fields['companyname'] || fields['guestname'] || '',
                    companyName: fields['companyname'] || '',
                    guestName: fields['guestname'] || '',
                    date: fields['date'] || ''
                  };
                }).filter(item => item && item.url);
              }
            }
          } catch (e) { console.error("Error parsing testimonials:", e); }

          // Availability
          try {
            let rowAvail = row.availability || row.Availability || '';
            if (rowAvail) {
              if (typeof rowAvail === 'string') {
                normalizedTrainer.availability = rowAvail;
              } else {
                normalizedTrainer.availability = JSON.stringify(rowAvail);
              }
            }
          } catch (e) { console.error("Error parsing availability:", e); }

          TRAINERS.push(normalizedTrainer);
        });

        // ── SORT: PREMIUM first, then STANDARD, then FREE ──────────────────
        const tierOrder = { 'PREMIUM': 0, 'STANDARD': 1, 'FREE': 2 };
        TRAINERS.sort((a, b) => (tierOrder[a.membershipType] ?? 2) - (tierOrder[b.membershipType] ?? 2));

        // ── RENDER sorted trainers ─────────────────────────────────────────
        TRAINERS.forEach(normalizedTrainer => {
          const row = normalizedTrainer; // alias for inline helpers below
          const _catGradients = {
            'AI & Technology': 'linear-gradient(135deg,#0f2c6b 0%,#0e7490 100%)',
            'Business Coaching': 'linear-gradient(135deg,#4c1d95 0%,#7c3aed 100%)',
            'Fitness & Health': 'linear-gradient(135deg,#065f46 0%,#0d9488 100%)',
            'Cybersecurity': 'linear-gradient(135deg,#881337 0%,#e11d48 100%)',
            'Soft Skills': 'linear-gradient(135deg,#065f46 0%,#0d9488 100%)',
            'Language Training': 'linear-gradient(135deg,#78350f 0%,#f97316 100%)',
            'Music & Dance': 'linear-gradient(135deg,#881337 0%,#e11d48 100%)',
            'Career Mentoring': 'linear-gradient(135deg,#1e1b4b 0%,#6366f1 100%)',
            'Sports Coaching': 'linear-gradient(135deg,#065f46 0%,#0d9488 100%)',
            'Finance': 'linear-gradient(135deg,#1e1b4b 0%,#6366f1 100%)',
            'Motivational': 'linear-gradient(135deg,#78350f 0%,#f97316 100%)',
          };
          const _fallbackGrads = [
            'linear-gradient(135deg,#0f2c6b 0%,#0e7490 100%)',
            'linear-gradient(135deg,#065f46 0%,#0d9488 100%)',
            'linear-gradient(135deg,#4c1d95 0%,#7c3aed 100%)',
            'linear-gradient(135deg,#78350f 0%,#f97316 100%)',
          ];
          const cardGradient = _catGradients[normalizedTrainer.category] ||
            _fallbackGrads[TRAINERS.length % _fallbackGrads.length];

          // Determine the top banner background style
          const bannerStyle = normalizedTrainer.bannerPic && normalizedTrainer.bannerPic.startsWith('http')
            ? `url('${normalizedTrainer.bannerPic}') center/cover`
            : cardGradient;

          // Parse rate display
          const parsedPrice = parseFloat(normalizedTrainer.price.replace(/[^\d.]/g, '')) || 0;
          const rateDisplay = parsedPrice
            ? '₹' + parsedPrice.toLocaleString('en-IN') + '<small style="color:#aaa;font-weight:400;font-size:11px">/hr</small>'
            : 'On request<small style="color:#aaa;font-weight:400;font-size:11px">/hr</small>';

          // Experience label
          const expNum = parseInt(row.experience || '0') || 0;
          const expLabel = expNum ? expNum + ' yr' + (expNum !== 1 ? 's' : '') + ' exp' : '0 sessions';

          // Initials fallback
          const initials = normalizedTrainer.name.trim().split(/\s+/).map(p => p[0] || '').join('').substring(0, 2).toUpperCase() || 'TR';
          const hasPhoto = normalizedTrainer.profilePic && normalizedTrainer.profilePic.startsWith('http');

          // Safe social hrefs
          const phoneStr = normalizedTrainer.phone.trim();
          const linkedinStr = normalizedTrainer.linkedin.trim();
          const websiteStr = normalizedTrainer.website.trim();
          const waHref = phoneStr ? (phoneStr.startsWith('http') ? phoneStr : 'https://wa.me/' + phoneStr.replace(/\D/g, '')) : '#';
          const liHref = linkedinStr ? (linkedinStr.startsWith('http') ? linkedinStr : 'https://' + linkedinStr) : '#';
          const webHref = websiteStr ? (websiteStr.startsWith('http') ? websiteStr : 'https://' + websiteStr) : '#';

          // -- PREMIUM CARD redesigned -------------------------------------------
          const isPremium = normalizedTrainer.membershipType === 'PREMIUM';
          const isStandard = normalizedTrainer.membershipType === 'STANDARD';

          const cardHtml = `
            <div class="trainer-card"
                 data-category="${normalizedTrainer.category}"
                 data-id="${normalizedTrainer.id}"
                 data-membership="${normalizedTrainer.membershipType}"
                 onclick="openTrainerModal('${normalizedTrainer.id}')"
                 style="background: #ffffff; border-radius: 18px; overflow: hidden; position: relative; cursor: pointer; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.09); margin-top: 10px; border: 1px solid #e8edf2; text-align: left; transition: all 0.3s ease; flex-shrink: 0;"
                 onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 36px rgba(0,0,0,0.14)';"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.09)';">

              <!-- TOP HEADER: Banner + Avatar row (no absolute overlap) -->
              <div style="position: relative; height: 100px; overflow: hidden; border-radius: 18px 18px 0 0; flex-shrink: 0;">
                <!-- Banner bg -->
                <div style="position: absolute; inset: 0; background: url('${(normalizedTrainer.bannerPic && normalizedTrainer.bannerPic.startsWith('http')) ? normalizedTrainer.bannerPic : 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop'}') center / cover no-repeat; filter: brightness(0.75);"></div>
                <!-- Dark gradient overlay for readability -->
                <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.55) 100%);"></div>
                <!-- Tier ribbon -->
                ${isPremium
                  ? `<div style="position: absolute; top: 12px; right: -30px; background: linear-gradient(90deg, #d4af37, #ffdf00); color: #000; font-size: 10px; font-weight: 800; padding: 5px 36px; text-transform: uppercase; letter-spacing: 0.1em; transform: rotate(45deg); box-shadow: 0 2px 8px rgba(0,0,0,0.2);">Featured</div>`
                  : isStandard
                  ? `<div style="position: absolute; top: 12px; right: -30px; background: linear-gradient(90deg, #0d9488, #14b8a6); color: #fff; font-size: 10px; font-weight: 800; padding: 5px 36px; text-transform: uppercase; letter-spacing: 0.1em; transform: rotate(45deg); box-shadow: 0 2px 8px rgba(0,0,0,0.2);">Pro</div>`
                  : `<div style="position: absolute; top: 12px; right: -30px; background: #94a3b8; color: #fff; font-size: 10px; font-weight: 800; padding: 5px 36px; text-transform: uppercase; letter-spacing: 0.1em; transform: rotate(45deg); box-shadow: 0 2px 8px rgba(0,0,0,0.2);">Free</div>`
                }
              </div>

              <!-- AVATAR + NAME ROW (in normal document flow, no overlap possible) -->
              <div style="display: flex; align-items: center; gap: 14px; padding: 14px 16px 10px 16px; flex-shrink: 0;">
                <!-- Avatar circle -->
                <div style="flex-shrink: 0; width: 60px; height: 60px; border-radius: 50%; border: 3px solid ${isPremium ? '#d4af37' : isStandard ? '#0d9488' : '#94a3b8'}; background: #e2e8f0; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.15); margin-top: -30px; position: relative; z-index: 5;">
                  ${hasPhoto
                    ? `<img src="${normalizedTrainer.profilePic}" alt="${normalizedTrainer.name}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                       <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-weight:bold; font-size:22px; color:#fff; background:linear-gradient(135deg, #3b82f6, #8b5cf6);">${initials}</div>`
                    : `<div style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; font-weight:bold; font-size:22px; color:#fff; background:linear-gradient(135deg, #3b82f6, #8b5cf6);">${initials}</div>`
                  }
                </div>
                <!-- Name & specialization — always to the RIGHT of avatar, never underneath -->
                <div style="flex: 1; min-width: 0; padding-top: 4px;">
                  <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px;">
                    ${normalizedTrainer.name} <span style="color: #fbbf24; font-size: 13px;">${isPremium ? '&#9733;' : ''}</span>
                  </h3>
                  <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${normalizedTrainer.specialization || normalizedTrainer.category || 'Professional Trainer'}
                  </p>
                </div>
              </div>

              <!-- CARD BODY -->
              <div style="padding: 4px 16px 16px 16px; display: flex; flex-direction: column; flex: 1; gap: 10px;">

                <!-- PILLS -->
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <span style="background: #f1f5f9; border-radius: 10px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 3px;">
                    <span style="color: #e11d48; font-size: 12px;">&#128205;</span> ${normalizedTrainer.location || 'Remote'}
                  </span>
                  <span style="background: #f1f5f9; border-radius: 10px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: #475569;">
                    ${normalizedTrainer.deliveryMode || normalizedTrainer.mode || 'Online'}
                  </span>
                  <span style="background: #f1f5f9; border-radius: 10px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: #475569;">
                    ${parseInt(normalizedTrainer.experience || '0') || 0}+ yrs
                  </span>
                </div>

                <!-- RATING & PRICE -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-size: 13px; font-weight: 700; color: #f59e0b; display: flex; align-items: center; gap: 3px;">
                    &#9733; ${(parseFloat(normalizedTrainer.rating) || 5.0).toFixed(1)}
                    <span style="font-weight: 400; color: #94a3b8; font-size: 11px;">(${parseInt(normalizedTrainer.sessions || '0') || 0} sessions)</span>
                  </div>
                  <div style="font-size: 17px; font-weight: 800; color: #0f172a;">
                    ${rateDisplay}
                  </div>
                </div>

                <!-- DIVIDER -->
                <div style="height: 1px; background: #e8edf2;"></div>

                <!-- FOOTER: socials + Book Now -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 3px;">
                      <a href="${waHref}" onclick="event.stopPropagation()" style="color: #64748b; background: #f1f5f9; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      </a>
                      <a href="${liHref}" onclick="event.stopPropagation()" style="color: #64748b; background: #f1f5f9; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                      </a>
                      <a href="${webHref}" onclick="event.stopPropagation()" style="color: #64748b; background: #f1f5f9; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                      </a>
                      <span style="font-size: 12px; font-weight: 600; color: #334155; margin-left: 2px;">View Profile</span>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8;">
                      ${normalizedTrainer.website ? normalizedTrainer.website.replace(/^https?:\/\//i, '').replace(/\/$/, '') : ''}
                    </div>
                  </div>
                  <button onclick="event.stopPropagation(); openTrainerModal('${normalizedTrainer.id}')" style="background: linear-gradient(135deg, #c5a059, #e8c97a); color: #fff; border: none; padding: 9px 18px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 3px 10px rgba(197,160,89,0.35); transition: transform 0.2s; white-space: nowrap;" onmouseover="this.style.transform='scale(1.05)';" onmouseout="this.style.transform='scale(1)';">
                    Book Now
                  </button>
                </div>

              </div>
            </div>`;
          
          if (isHomeGrid) {
            // Front page: ONLY show PREMIUM (Featured) trainers
            if (normalizedTrainer.membershipType === 'PREMIUM') {
              grid.insertAdjacentHTML('beforeend', cardHtml);
            }
          } else {
            // find-trainers.html: show all trainers
            grid.insertAdjacentHTML('beforeend', cardHtml);
          }
        }); // end TRAINERS.forEach

        // ── RENDER DYNAMIC CATEGORIES ─────────────────────────────────────
        // Removed dynamic population so the hardcoded index.html categories are shown instead.

        // Setup filter mechanics mapping newly generated .trainer-card elements
        setupFilterToggles();
      } else {
        grid.innerHTML = `<p style="color: #aaa; text-align: center; padding: 40px;">No active profiles matched in data indexes.</p>`;
        console.warn('[App] No trainer rows returned. Raw data was:', data);
      }
    })
    .catch(err => console.error("❌ Data sync fault:", err));
}

// ── EXTRACTOR UTILITY FOR YOUTUBE VIDEOS ──────────────────────────────────────
function getYouTubeId(url) {
  if (!url) return null;
  const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : (String(url).trim().length === 11 ? String(url).trim() : null);
}

// ── TRAINER MODAL DETAILS POPUP ───────────────────────────────────────────────
window.viewTrainerProfileModal = function (id) {
  const trainer = TRAINERS.find(t => String(t.id) === String(id));
  if (!trainer) return;

  const modalAvatar = document.getElementById("modal-avatar");
  if (modalAvatar) modalAvatar.src = trainer.profilePic;

  const modalName = document.getElementById("modal-name");
  if (modalName) modalName.innerText = trainer.name;

  const modalTagline = document.getElementById("modal-tagline");
  if (modalTagline) modalTagline.innerText = trainer.tagline;

  const modalRate = document.getElementById("modal-rate");
  if (modalRate) modalRate.innerText = "₹" + (parseFloat(trainer.price.replace(/[^\d.]/g, '')) || 0).toLocaleString() + " / Hour";

  // Render certificationsBy array (new backend format)
  const certContainer = document.getElementById("certifications-list-target");
  if (certContainer) {
    const certs = trainer.certificationsBy || [];
    if (Array.isArray(certs) && certs.length > 0) {
      certContainer.innerHTML = certs.map((c, i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;margin-bottom:8px;">
          <span style="width:28px;height:28px;border-radius:50%;background:rgba(197,160,89,0.15);border:1px solid rgba(197,160,89,0.3);display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#C5A059;font-weight:700;flex-shrink:0">${i + 1}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:.9rem;font-weight:600;color:#fff;">${c.name || '—'}</div>
            <div style="font-size:.78rem;color:rgba(237,242,247,0.55);margin-top:2px">${c.givenBy || ''}${c.year ? ' · ' + c.year : ''}</div>
          </div>
        </div>`).
        join('');
    } else {
      certContainer.innerHTML = "<p style='color:rgba(237,242,247,0.4);font-size:.88rem;padding:12px 0'>No certifications added yet.</p>";
    }
  }

  // Fix: Safe Fallback Video Render Engine for YouTube Intro and Portfolio lists
  const videoGrid = document.getElementById("video-testimonials-grid");
  if (videoGrid) {
    videoGrid.innerHTML = "";
    let compositeVideosHtml = "";

    // 1. Process main portfolioVideo field link
    const introId = getYouTubeId(trainer.introVideo || trainer.videoIntro || trainer.portfolioVideo);
    if (introId) {
      compositeVideosHtml += `
        <div class="main-intro-video" style="margin-bottom:20px; width:100%;">
          <h4 style="color:#B49164; margin-bottom:8px; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Introduction Reel</h4>
          <div style="border-radius:12px; overflow:hidden; aspect-ratio:16/9; position:relative;">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${introId}?rel=0&modestbranding=1" frameborder="0" allowfullscreen style="position:absolute; inset:0;"></iframe>
          </div>
        </div>`;
    }

    // 2. Process alternative testimonial portfolio rows split by '|'
    const portfolioLinks = trainer.portfolioLinksRaw.trim();
    if (portfolioLinks && portfolioLinks !== "N/A" && portfolioLinks !== "undefined") {
      let loopsHtml = "";
      const links = portfolioLinks.split('|').map(s => s.trim()).filter(Boolean);

      links.forEach(link => {
        const ytId = getYouTubeId(link);
        if (ytId) {
          loopsHtml += `
            <div class="yt-embed-wrap" style="border-radius:12px; overflow:hidden;">
              <iframe width="100%" height="150" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen></iframe>
            </div>`;
        }
      });

      if (loopsHtml) {
        compositeVideosHtml += `
          <h4 style="color:#fff; margin-bottom:10px; font-size:14px; text-transform:uppercase; letter-spacing:1px; width:100%;">Video Testimonials</h4>
          <div class="testimonials-subgrid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; width:100%;">
            ${loopsHtml}
          </div>`;
      }
    }

    // 3. Process decoupled testimonials array (new backend format)
    if (Array.isArray(trainer.testimonials) && trainer.testimonials.length > 0) {
      let testiHtml = '';
      trainer.testimonials.forEach(item => {
        const url = typeof item === 'string' ? item : (item.url || '');
        const label = typeof item === 'object' ? (item.label || '') : '';
        const ytId = getYouTubeId(url);
        if (!ytId) return;
        testiHtml += `
          <div style="border-radius:12px;overflow:hidden;position:relative;height:140px;background:#111;">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1" frameborder="0" allowfullscreen style="position:absolute;inset:0;"></iframe>
            ${label ? `<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);color:#fff;font-size:0.75rem;padding:4px 8px;text-align:center;">${label}</div>` : ''}
          </div>`;
      });
      if (testiHtml) {
        compositeVideosHtml += `
          <h4 style="color:#fff; margin-bottom:10px; font-size:14px; text-transform:uppercase; letter-spacing:1px; width:100%;">Testimonial Videos</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;">${testiHtml}</div>`;
      }
    }

    videoGrid.innerHTML = compositeVideosHtml || "<p style='color:#aaa;'>No media presentations shared yet.</p>";
  }

  // Render packages into prof-packages-list
  const pkgList = document.getElementById("prof-packages-list");
  if (pkgList) {
    if (Array.isArray(trainer.packages) && trainer.packages.length > 0) {
      pkgList.innerHTML = trainer.packages.map(pkg => `
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px 20px;margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div>
              <div style="font-size:1rem;font-weight:700;color:#fff;margin-bottom:4px;">${pkg.name || pkg.title || 'Package'}</div>
              ${pkg.duration ? `<div style="font-size:0.8rem;color:var(--tm,#aaa);">⏱ ${pkg.duration}</div>` : ''}
            </div>
            <div style="font-size:1.2rem;font-weight:700;color:var(--gold,#f5c842);white-space:nowrap;">₹${Number(String(pkg.price || 0).replace(/[^0-9.]/g, '') || 0).toLocaleString('en-IN')}</div>
          </div>
          ${Array.isArray(pkg.features) && pkg.features.length > 0 ? `
          <ul style="margin:10px 0 0;padding-left:18px;font-size:0.84rem;color:rgba(237,242,247,0.75);line-height:1.7;">
            ${pkg.features.map(f => `<li>${f}</li>`).join('')}
          </ul>` : ''}
        </div>`).join('');
    } else {
      pkgList.innerHTML = "<p style='color:#aaa;font-size:0.9rem;'>No packages added yet.</p>";
    }
  }

  const modal = document.getElementById("trainer-details-modal") || document.getElementById("trainer-modal");
  if (modal) {
    modal.style.display = "flex";
    modal.classList.add('open');
  }
};

// ── INTERACTIVE APP LAYOUT FILTER UTILITIES ──────────────────────────────────
function setupFilterToggles() {
  document.querySelectorAll(".category-pill").forEach(pill => {
    pill.onclick = function () {
      document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
      this.classList.add("active");

      const selectedCat = this.getAttribute("data-target-category");
      document.querySelectorAll(".trainer-card").forEach(card => {
        if (selectedCat === "all" || card.getAttribute("data-category") === selectedCat) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    };
  });

  // Auto-apply filter from URL query parameter
  const params = new URLSearchParams(window.location.search);
  const urlCat = params.get('category') || params.get('cat');
  if (urlCat) {
    const targetPill = document.querySelector(`.category-pill[data-target-category="${urlCat}"]`);
    if (targetPill) {
      targetPill.click();
    } else {
      document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
      document.querySelectorAll(".trainer-card").forEach(card => {
        if (card.getAttribute("data-category") === urlCat) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    }
    const fCatSelect = document.getElementById('f-cat');
    if (fCatSelect) fCatSelect.value = urlCat;
  }
  
  if (window.applyFilters && document.getElementById('browse-search')) {
      window.applyFilters();
  }
}

// ── ENGINE SEARCH HANDLER ───────────────────────────────────────────────────
function setupGlobalSearchEngine() {
  const input = document.getElementById("main-search-input");
  if (!input) return;

  input.addEventListener("input", function () {
    const q = this.value.toLowerCase().trim();
    document.querySelectorAll(".trainer-card").forEach(card => {
      const name = card.querySelector(".trainer-card-name")?.innerText?.toLowerCase() || "";
      const tagline = card.querySelector(".trainer-card-tagline")?.innerText?.toLowerCase() || "";
      const spec = card.querySelector(".spec-tag")?.innerText?.toLowerCase() || "";

      if (name.includes(q) || tagline.includes(q) || spec.includes(q)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}

function setupModalDismissals() {
  const closeBtn = document.getElementById("close-modal-trigger");
  const modal = document.getElementById("trainer-details-modal");
  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.style.display = "none";
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
  }
}

// ── RECOVERY USER STATE INITIALIZER SESSION ENGINE ────────────────────────────
function verifyUserSessionToken() {
  const sessionUser = JSON.parse(localStorage.getItem('userSession') || 'null');

  const btnSignup  = document.getElementById('btn-signup');
  const btnLogin   = document.getElementById('btn-login');
  const btnLogout  = document.getElementById('btn-logout');
  const avatarWrap = document.getElementById('user-avatar-wrap');
  const avBtn      = document.getElementById('user-av-btn');
  const udAvatar   = document.querySelector('#user-dropdown .ud-avatar');
  const udName     = document.querySelector('#user-dropdown .ud-name');
  const udEmail    = document.querySelector('#user-dropdown .ud-email');

  // Always keep nlDash & mnDash hidden — the user-avatar-wrap handles profile
  ['nl-dash', 'mn-dash'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  document.querySelectorAll('.dynamic-auth-item').forEach(el => el.remove());

  if (sessionUser) {
    // ── Hide sign-in buttons ──────────────────────────────────────────────
    if (btnSignup) btnSignup.style.display = 'none';
    if (btnLogin)  btnLogin.style.display  = 'none';
    if (btnLogout) btnLogout.style.display = 'inline-block';

    // ── Populate & show avatar ────────────────────────────────────────────
    try {
      const trainer = JSON.parse(localStorage.getItem('currentTrainer') || '{}');
      const name     = trainer.name || trainer.fullName ||
                       ((sessionUser.firstName || '') + ' ' + (sessionUser.lastName || '')).trim() ||
                       sessionUser.name || 'User';
      const email    = trainer.email || sessionUser.email || sessionUser.trainerEmail || '';
      const initials = name.trim().split(/\s+/).map(w => w[0] || '').join('').substring(0, 2).toUpperCase() || '?';
      const picUrl   = sessionUser.profileImageUrl || sessionUser.photoUrl || sessionUser.profilePic ||
                       trainer.profilePictureUrl   || trainer.profilePic   || '';

      if (avBtn) {
        if (picUrl) {
          avBtn.style.backgroundImage    = `url('${picUrl}')`;
          avBtn.style.backgroundSize     = 'cover';
          avBtn.style.backgroundPosition = 'center';
          avBtn.textContent = '';
        } else {
          avBtn.style.backgroundImage = '';
          avBtn.textContent = initials;
        }
      }
      if (udAvatar) {
        if (picUrl) {
          udAvatar.style.backgroundImage    = `url('${picUrl}')`;
          udAvatar.style.backgroundSize     = 'cover';
          udAvatar.style.backgroundPosition = 'center';
          udAvatar.textContent = '';
        } else {
          udAvatar.style.backgroundImage = '';
          udAvatar.textContent = initials;
        }
      }
      if (udName)  udName.textContent  = name;
      if (udEmail) udEmail.textContent = email;
      window.loggedInTrainerId = email || null;
    } catch(ex) { console.warn('Avatar populate error:', ex); }

    if (avatarWrap) avatarWrap.style.display = 'inline-block';

    // ── Mobile auth buttons ───────────────────────────────────────────────
    const mnSignup = document.getElementById('mn-btn-signup');
    const mnLogin  = document.getElementById('mn-btn-login');
    const mnLogout = document.getElementById('mn-btn-logout');
    if (mnSignup) mnSignup.style.display = 'none';
    if (mnLogin)  mnLogin.style.display  = 'none';
    if (mnLogout) mnLogout.style.display = 'flex';

  } else {
    // ── Not logged in: show sign-in buttons, hide avatar instantly ────────
    if (avatarWrap) avatarWrap.style.display = 'none';
    if (btnSignup)  btnSignup.style.display  = 'inline-block';
    if (btnLogin)   btnLogin.style.display   = 'inline-block';
    if (btnLogout)  btnLogout.style.display  = 'none';

    const mnSignup = document.getElementById('mn-btn-signup');
    const mnLogin  = document.getElementById('mn-btn-login');
    const mnLogout = document.getElementById('mn-btn-logout');
    if (mnSignup) mnSignup.style.display = 'flex';
    if (mnLogin)  mnLogin.style.display  = 'flex';
    if (mnLogout) mnLogout.style.display = 'none';
  }
}

window.updateNavbarAuthUI = verifyUserSessionToken;

// ── GLOBAL LOGOUT HANDLER ────────────────────────────────────────────────────
window.handleLogout = function () {
  // Instantly hide the avatar so it disappears without delay
  const avatarWrap = document.getElementById('user-avatar-wrap');
  if (avatarWrap) avatarWrap.style.display = 'none';

  localStorage.removeItem('userSession');
  localStorage.removeItem('currentTrainer');
  window.loggedInTrainerId = null;
  verifyUserSessionToken();

  if (window.location.pathname.includes('dashboard.html')) {
    window.location.href = 'index.html';
  } else {
    if (window.toast) window.toast('Logged out successfully', 3000);
  }
}

// ── BROWSE PAGE FILTER & SORT HANDLERS ──────────────────────────────────────
window.applyFilters = function() {
  const searchStr = (document.getElementById('browse-search')?.value || '').toLowerCase();
  const catFilter = document.getElementById('f-cat')?.value || '';
  const priceFilter = parseInt(document.getElementById('f-price')?.value || '100000', 10);
  const ratingFilter = parseFloat(document.getElementById('f-rating')?.value || '0');
  const modeFilter = document.getElementById('f-mode')?.value || '';
  const expFilter = document.getElementById('f-exp')?.value || '';

  let visibleCount = 0;
  
  document.querySelectorAll('.trainer-card').forEach(card => {
    const id = card.getAttribute('data-id');
    const trainer = window.TRAINERS.find(t => t.id === id);
    if (!trainer) return;

    let show = true;

    if (searchStr) {
      const fullText = (trainer.name + ' ' + trainer.category + ' ' + trainer.specialization + ' ' + trainer.tags).toLowerCase();
      if (!fullText.includes(searchStr)) show = false;
    }
    if (show && catFilter && trainer.category !== catFilter) show = false;
    
    const p = parseFloat(trainer.price.replace(/[^0-9.]/g, '')) || 0;
    if (show && p > priceFilter) show = false;
    
    if (show && trainer.rating < ratingFilter) show = false;
    
    if (show && modeFilter && trainer.deliveryMode !== modeFilter && trainer.deliveryMode !== 'Hybrid') show = false;
    
    if (show && expFilter) {
      const e = parseInt(trainer.experience || '0', 10);
      if (expFilter.includes('1–3') && (e < 1 || e > 3)) show = false;
      else if (expFilter.includes('3–5') && (e < 3 || e > 5)) show = false;
      else if (expFilter.includes('5–10') && (e < 5 || e > 10)) show = false;
      else if (expFilter.includes('10+') && e < 10) show = false;
    }

    card.style.display = show ? 'flex' : 'none';
    if (show) visibleCount++;
  });

  const countEl = document.getElementById('results-count');
  if (countEl) countEl.innerText = visibleCount;
};

window.updatePriceDisplay = function(val) {
  const el = document.getElementById('price-out');
  if (el) el.innerText = '₹' + Number(val).toLocaleString('en-IN');
};

window.sortResults = function(sortBy) {
  const grid = document.querySelector('.trainers-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.trainer-card'));
  
  cards.sort((a, b) => {
    const tA = window.TRAINERS.find(t => t.id === a.getAttribute('data-id'));
    const tB = window.TRAINERS.find(t => t.id === b.getAttribute('data-id'));
    if (!tA || !tB) return 0;
    
    if (sortBy === 'rating') return tB.rating - tA.rating;
    if (sortBy === 'price-asc') {
      const pA = parseFloat(tA.price.replace(/[^0-9.]/g, '')) || 0;
      const pB = parseFloat(tB.price.replace(/[^0-9.]/g, '')) || 0;
      return pA - pB;
    }
    if (sortBy === 'price-desc') {
      const pA = parseFloat(tA.price.replace(/[^0-9.]/g, '')) || 0;
      const pB = parseFloat(tB.price.replace(/[^0-9.]/g, '')) || 0;
      return pB - pA;
    }
    if (sortBy === 'sessions') return parseInt(tB.sessions || '0') - parseInt(tA.sessions || '0');
    
    const tierOrder = { 'PREMIUM': 0, 'STANDARD': 1, 'FREE': 2 };
    return (tierOrder[tA.membershipType] ?? 2) - (tierOrder[tB.membershipType] ?? 2);
  });
  
  cards.forEach(card => grid.appendChild(card));
};;
// ── HERO SEARCH FOR MAIN INDEX AND OTHER PAGES ────────────────────────────────
window.heroSearch = function () {
  const q = document.getElementById('hs-input')?.value || '';
  const cat = document.getElementById('hs-cat')?.value || '';
  let url = 'find-trainers.html';
  const params = [];
  if (q) params.push('q=' + encodeURIComponent(q));
  if (cat) params.push('cat=' + encodeURIComponent(cat));
  if (params.length) url += '?' + params.join('&');
  window.location.href = url;
};

// ── LIVE SERVERLESS & BACKEND NOTIFICATIONS SYSTEM ─────────────────────────
const STORAGE_KEY = 'read_notification_ids';

async function fetchNotifications() {
    try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) return data;
        }
    } catch (e) { }

    try {
        const response = await fetch('/feed.json');
        if (response.ok) return await response.json();
    } catch (e) { }

    return [];
}

function getReadIds() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function getRelativeTimeString(dateInput) {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

window.markAllNotificationsRead = async function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    try {
        await fetch('/api/notifications/read-all', { method: 'PATCH' });
    } catch (err) { }

    const feed = await fetchNotifications();
    const readIds = getReadIds();
    const newReadIds = [...new Set([...readIds, ...feed.map(item => item.id || item._id)])];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReadIds));
    
    // Update UI instantly
    document.querySelectorAll('.notif-dot').forEach(dot => dot.style.display = 'none');
    
    const panel = document.getElementById('notif-panel') || document.getElementById('notif-dropdown');
    if (panel) {
        const headerHtml = `
          <div class="notif-header" style="display:flex; justify-content:space-between; align-items:center; padding:16px 18px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <h4 style="margin:0; font-size:1rem; color:#fff;">Notifications</h4>
            <a href="javascript:void(0)" onclick="window.markAllNotificationsRead(event)" style="font-size:.78rem; color:#B49164; text-decoration:none; font-weight:600;">Mark all read</a>
          </div>
        `;
        panel.innerHTML = headerHtml + '<div style="padding: 24px; text-align: center; color: #8899a6; font-size: 0.9rem;">You\'re all caught up!</div>';
    }
};

window.handleNotificationClick = async function(id, targetUrl) {
    const readIds = getReadIds();
    if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
    }

    try {
        await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (e) { }

    evaluateUnreadState();

    if (targetUrl && targetUrl !== '#') {
        window.location.href = targetUrl;
    }
};

async function renderNotifications(panel) {
    const feed = await fetchNotifications();
    const readIds = getReadIds();
    
    // Unread items
    const unreadFeed = feed.filter(item => {
        const id = item.id || item._id;
        return !item.isRead && !readIds.includes(id);
    });
    
    const headerHtml = `
      <div class="notif-header" style="display:flex; justify-content:space-between; align-items:center; padding:16px 18px; border-bottom:1px solid rgba(255,255,255,0.1);">
        <h4 style="margin:0; font-size:1rem; color:#ffffff; font-weight:600;">Notifications</h4>
        <a href="javascript:void(0)" onclick="window.markAllNotificationsRead(event)" style="font-size:.85rem; color:#B49164; text-decoration:none; font-weight:600;">Mark all read</a>
      </div>
    `;
    
    if (unreadFeed.length === 0) {
        panel.innerHTML = headerHtml + '<div style="padding: 24px; text-align: center; color: #8899a6; font-size: 0.9rem;">You\'re all caught up!</div>';
        return;
    }
    
    let html = headerHtml;
    unreadFeed.forEach(item => {
        const id = item.id || item._id;
        const typeStr = (item.type || 'news').toLowerCase();
        const isBlog = typeStr === 'blog';
        const isEvent = typeStr === 'event';
        
        const bg = isBlog ? 'rgba(3, 218, 198, 0.15)' : isEvent ? 'rgba(255, 183, 77, 0.15)' : 'rgba(52, 152, 219, 0.15)';
        const color = isBlog ? '#03dac6' : isEvent ? '#ffb74d' : '#5dade2';
        const icon = isBlog ? '📝' : isEvent ? '📅' : '📰';
        const targetUrl = item.targetUrl || (isBlog ? 'blog.html' : 'news-events.html');
        const relativeTime = getRelativeTimeString(item.createdAt || item.date);

        html += `
          <div class="notif-item unread" onclick="window.handleNotificationClick('${id}', '${targetUrl}')" style="display:flex; gap:12px; padding:14px 18px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer; transition:background 0.2s ease;">
            <div class="notif-ico" style="width:36px; height:36px; border-radius:50%; background:${bg}; color:${color}; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1.1rem;">${icon}</div>
            <div class="notif-text" style="flex:1;">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px; align-items:center;">
                <span style="font-size:0.7rem; font-weight:700; color:${color}; text-transform:uppercase; letter-spacing:0.5px; padding: 2px 6px; border-radius: 4px; background: ${bg};">${typeStr}</span>
                <span style="font-size:0.75rem; color:#888888; font-weight: 500;">${relativeTime}</span>
              </div>
              <h5 style="margin:0 0 4px; font-size:0.88rem; color:#ffffff; font-weight:600; line-height:1.3;">${item.title || item.text}</h5>
              <p style="margin:0; font-size:0.8rem; color:#a0aec0; line-height:1.35;">${item.message || item.description || ''}</p>
            </div>
          </div>
        `;
    });
    
    panel.innerHTML = html;
}

async function evaluateUnreadState() {
    const feed = await fetchNotifications();
    const readIds = getReadIds();
    const hasUnread = feed.some(item => {
        const id = item.id || item._id;
        return !item.isRead && !readIds.includes(id);
    });
    
    document.querySelectorAll('.notif-dot').forEach(dot => {
        dot.style.display = hasUnread ? 'block' : 'none';
    });
}

window.toggleNotif = async function(e) {
    if (e) e.stopPropagation();
    
    const panel = document.getElementById('notif-panel') || document.getElementById('notif-dropdown');
    if (!panel) return;
    
    // Exact background styles matching UI mockup
    panel.style.background = '#0D1B3E';
    panel.style.border = '1px solid rgba(255,255,255,0.1)';
    
    const isPanelOpen = panel.classList.contains('open') || panel.style.display === 'block';
    
    if (!isPanelOpen) {
        // Open panel
        if (panel.id === 'notif-panel') {
            panel.classList.add('open');
        } else {
            panel.style.display = 'block';
        }
        
        await renderNotifications(panel);
    } else {
        // Close panel
        if (panel.id === 'notif-panel') {
            panel.classList.remove('open');
        } else {
            panel.style.display = 'none';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    evaluateUnreadState();
});

// Close when clicking outside
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notif-panel') || document.getElementById('notif-dropdown');
    const btn = document.getElementById('notif-btn') || document.getElementById('notif-trigger');
    
    if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
        if (panel.id === 'notif-panel') {
            panel.classList.remove('open');
        } else {
            panel.style.display = 'none';
        }
    }
});
