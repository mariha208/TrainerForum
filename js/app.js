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
});

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

          const _category = String(
            row.expertiseCategory || row.ExpertiseCategory ||
            row.category || row.Category ||
            row.cat || row.Cat ||
            'General'
          );

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

          // Tier badge
          const memberBadgeHtml = isPremium
            ? `<div style="position:absolute;top:12px;left:12px;z-index:20;background:linear-gradient(90deg,#b8860b,#f5c842,#b8860b);color:#000;font-size:9.5px;font-weight:800;padding:4px 11px;border-radius:99px;letter-spacing:.08em;box-shadow:0 2px 12px rgba(245,200,66,0.45);">&#11088; FEATURED</div>`
            : isStandard
            ? `<div style="position:absolute;top:12px;left:12px;z-index:20;background:rgba(7,24,58,0.9);color:#f5c842;font-size:9px;font-weight:700;padding:4px 11px;border-radius:99px;letter-spacing:.06em;border:1px solid rgba(245,200,66,0.4);backdrop-filter:blur(6px);">&#10022; PRO</div>`
            : '';

          // Card border/glow per tier
          const cardBorderStyle = isPremium
            ? 'border:1.5px solid rgba(245,200,66,0.45);box-shadow:0 4px 24px rgba(245,200,66,0.1),0 12px 40px rgba(0,0,0,0.5);'
            : isStandard
            ? 'border:1px solid rgba(99,102,241,0.3);box-shadow:0 4px 24px rgba(99,102,241,0.08),0 12px 40px rgba(0,0,0,0.45);'
            : 'border:1px solid rgba(255,255,255,0.07);box-shadow:0 4px 24px rgba(0,0,0,0.4);';

          // Avatar ring gradient per tier
          const avatarRing = isPremium
            ? 'linear-gradient(135deg,#b8860b,#f5c842,#b8860b)'
            : isStandard
            ? 'linear-gradient(135deg,#6366f1,#a78bfa)'
            : 'linear-gradient(135deg,#334155,#64748b)';

          // Rating stars
          const ratingVal = parseFloat(normalizedTrainer.rating) || 5.0;
          const starsHtml = '&#9733;'.repeat(Math.floor(ratingVal)) + '&#9734;'.repeat(5 - Math.floor(ratingVal));

          // Location + mode pill
          const _locText = normalizedTrainer.location && normalizedTrainer.location !== 'Remote' ? normalizedTrainer.location : '';
          const _modeText = normalizedTrainer.deliveryMode || normalizedTrainer.mode || 'Online';
          const locationPill = (_locText ? _locText + ' &middot; ' : '') + _modeText;

          // Sessions
          const sessionsNum = parseInt(normalizedTrainer.sessions || '0') || 0;

          const cardHtml = `
            <div class="trainer-card wtf-pcard"
                 data-category="${normalizedTrainer.category}"
                 data-id="${normalizedTrainer.id}"
                 data-membership="${normalizedTrainer.membershipType}"
                 onclick="openTrainerModal('${normalizedTrainer.id}')"
                 style="background:linear-gradient(160deg,#0c1f4a 0%,#071232 100%);border-radius:20px;overflow:visible;position:relative;cursor:pointer;display:flex;flex-direction:column;min-height:400px;${cardBorderStyle}transition:transform 0.3s cubic-bezier(.34,1.56,.64,1),box-shadow 0.3s ease;"
                 onmouseover="this.style.transform='translateY(-10px) scale(1.012)';this.style.boxShadow='0 32px 64px rgba(0,0,0,0.6)';"
                 onmouseout="this.style.transform='';this.style.boxShadow='${isPremium ? '0 4px 24px rgba(245,200,66,0.1),0 12px 40px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.4)'}'"
            >
              <div style="height:140px;border-radius:20px 20px 0 0;background:${bannerStyle};position:relative;flex-shrink:0;overflow:hidden;">
                <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,rgba(7,18,50,0.85) 100%);border-radius:20px 20px 0 0;"></div>
                ${memberBadgeHtml}
                <button onclick="event.stopPropagation();" style="position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);backdrop-filter:blur(6px);color:rgba(255,255,255,0.6);font-size:15px;transition:all 0.2s;z-index:10;" onmouseover="this.style.color='#f87171';this.style.background='rgba(248,113,113,0.15)';" onmouseout="this.style.color='rgba(255,255,255,0.6)';this.style.background='rgba(0,0,0,0.35)';">&#9825;</button>
                <div style="position:absolute;bottom:10px;right:12px;display:flex;align-items:center;gap:4px;background:rgba(0,0,0,0.45);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);border-radius:99px;padding:3px 10px;font-size:10px;color:rgba(255,255,255,0.75);">&#128205; ${locationPill}</div>
              </div>
              <div style="position:absolute;left:50%;transform:translateX(-50%);top:96px;z-index:15;width:88px;height:88px;border-radius:50%;padding:3px;background:${avatarRing};box-shadow:0 0 0 3px #071232,0 8px 24px rgba(0,0,0,0.5);">
                <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;background:#0f2044;">
                  ${hasPhoto
                    ? `<img src="${normalizedTrainer.profilePic}" alt="${normalizedTrainer.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-weight:800;font-size:22px;color:#fff;background:linear-gradient(135deg,#1e3a5f,#0e7490);">${initials}</div>`
                    : `<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-weight:800;font-size:22px;color:#fff;background:linear-gradient(135deg,#1e3a5f,#0e7490);">${initials}</div>`
                  }
                </div>
              </div>
              <div style="flex:1;padding:56px 20px 20px;display:flex;flex-direction:column;text-align:center;">
                <div style="display:flex;align-items:center;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:5px;">
                  <h3 class="trainer-card-name" style="margin:0;font-size:16px;font-weight:700;color:#f0f4ff;letter-spacing:-0.01em;line-height:1.2;">${normalizedTrainer.name}</h3>
                  <span style="background:rgba(34,197,94,0.15);color:#4ade80;font-size:9.5px;font-weight:700;padding:2px 8px;border-radius:99px;border:1px solid rgba(34,197,94,0.3);">&#10003; Verified</span>
                </div>
                <p class="trainer-card-tagline" style="margin:0 0 8px;font-size:12px;color:rgba(180,200,240,0.7);line-height:1.4;">${normalizedTrainer.specialization || normalizedTrainer.category || ''}</p>
                <div style="display:flex;justify-content:center;margin-bottom:14px;">
                  <span style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(220,230,255,0.75);font-size:10px;font-weight:600;padding:3px 12px;border-radius:99px;max-width:90%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${normalizedTrainer.category || 'General'}</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:14px;">
                  <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                    <span style="color:#f5c842;font-size:11px;letter-spacing:1px;">${starsHtml}</span>
                    <span style="color:rgba(255,255,255,0.4);font-size:9px;">${ratingVal.toFixed(1)}</span>
                  </div>
                  <div style="width:1px;height:26px;background:rgba(255,255,255,0.1);"></div>
                  <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                    <span style="color:#e2e8f0;font-size:14px;font-weight:700;">${expNum > 0 ? expNum : '&#8212;'}</span>
                    <span style="color:rgba(255,255,255,0.4);font-size:9px;">yrs exp</span>
                  </div>
                  ${sessionsNum > 0 ? `<div style="width:1px;height:26px;background:rgba(255,255,255,0.1);"></div><div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><span style="color:#e2e8f0;font-size:14px;font-weight:700;">${sessionsNum.toLocaleString('en-IN')}</span><span style="color:rgba(255,255,255,0.4);font-size:9px;">sessions</span></div>` : ''}
                </div>
                <div onclick="event.stopPropagation();" style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:16px;">
                  <a href="${waHref}" target="_blank" rel="noopener" style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(37,211,102,0.1);border:1px solid rgba(37,211,102,0.2);transition:all 0.2s;${phoneStr ? '' : 'opacity:0.25;pointer-events:none;'}" onmouseover="this.style.background='rgba(37,211,102,0.2)';this.style.transform='scale(1.15)';" onmouseout="this.style.background='rgba(37,211,102,0.1)';this.style.transform='';"><i class="fab fa-whatsapp" style="color:#25D366;font-size:14px;"></i></a>
                  <a href="${liHref}" target="_blank" rel="noopener" style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(10,102,194,0.1);border:1px solid rgba(10,102,194,0.2);transition:all 0.2s;${linkedinStr ? '' : 'opacity:0.25;pointer-events:none;'}" onmouseover="this.style.background='rgba(10,102,194,0.2)';this.style.transform='scale(1.15)';" onmouseout="this.style.background='rgba(10,102,194,0.1)';this.style.transform='';"><i class="fab fa-linkedin" style="color:#0077B5;font-size:14px;"></i></a>
                  <a href="${webHref}" target="_blank" rel="noopener" style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(180,145,100,0.1);border:1px solid rgba(180,145,100,0.2);transition:all 0.2s;${websiteStr ? '' : 'opacity:0.25;pointer-events:none;'}" onmouseover="this.style.background='rgba(180,145,100,0.2)';this.style.transform='scale(1.15)';" onmouseout="this.style.background='rgba(180,145,100,0.1)';this.style.transform='';"><i class="fas fa-globe" style="color:#B49164;font-size:14px;"></i></a>
                </div>
                <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);margin:0 8px 16px;"></div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px;margin-top:auto;gap:8px;">
                  <div style="text-align:left;">
                    <div style="color:rgba(255,255,255,0.35);font-size:9px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px;">Rate</div>
                    <div style="color:#F5C842;font-weight:700;font-size:16px;line-height:1.1;">${rateDisplay}</div>
                  </div>
                  <button onclick="event.stopPropagation();openTrainerModal('${normalizedTrainer.id}');" style="background:linear-gradient(135deg,rgba(245,200,66,0.15),rgba(245,200,66,0.08));border:1px solid rgba(245,200,66,0.3);color:#f5c842;font-size:11px;font-weight:700;padding:8px 16px;border-radius:10px;cursor:pointer;letter-spacing:.04em;transition:all 0.2s;white-space:nowrap;" onmouseover="this.style.background='rgba(245,200,66,0.22)';this.style.borderColor='rgba(245,200,66,0.6)';" onmouseout="this.style.background='linear-gradient(135deg,rgba(245,200,66,0.15),rgba(245,200,66,0.08))';this.style.borderColor='rgba(245,200,66,0.3)';">View Profile &#8594;</button>
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
        const homeCats = document.getElementById('home-cats');
        if (homeCats) {
          const catCounts = {};
          TRAINERS.forEach(t => {
            const c = t.category || 'General';
            catCounts[c] = (catCounts[c] || 0) + 1;
          });
          const topCats = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a]).slice(0, 5);
          
          const catMeta = {
            'Business Coaching': { icon: '💼', p: 'Leadership & Strategy' },
            'AI & Technology': { icon: '🤖', p: 'Future-proof skills' },
            'Fitness & Health': { icon: '💪', p: 'Physical wellbeing' },
            'Cybersecurity': { icon: '🛡️', p: 'Data protection' },
            'Soft Skills': { icon: '🗣️', p: 'Communication & EQ' },
            'Language Training': { icon: '🌍', p: 'Global fluency' },
            'Music & Dance': { icon: '🎵', p: 'Creative arts' },
            'Career Mentoring': { icon: '🎯', p: 'Professional growth' },
            'Sports Coaching': { icon: '🏃', p: 'Athletic performance' },
            'Finance': { icon: '💰', p: 'Wealth & Investment' },
            'Motivational': { icon: '⭐', p: 'Inspiring talks' }
          };

          let catsHtml = '';
          topCats.forEach(cat => {
            const meta = catMeta[cat] || { icon: '✨', p: 'Expert Training' };
            catsHtml += `
            <div class="cat-card" onclick="window.location.href='find-trainers.html?category=${encodeURIComponent(cat)}'">
              <div class="cat-icon">${meta.icon}</div>
              <h3>${cat}</h3>
              <p>${meta.p}</p>
            </div>`;
          });
          
          catsHtml += `
            <div class="cat-card" onclick="window.location.href='categories.html'" style="background:rgba(255,255,255,0.02); border:1px dashed var(--border); display:flex; flex-direction:column; justify-content:center; align-items:center; transition: .3s;">
              <div class="cat-icon" style="background:rgba(245,200,66,0.1); color:var(--gold); border:1px solid rgba(245,200,66,0.3);">+</div>
              <h3 style="color:var(--gold);">More</h3>
              <p>View all categories</p>
            </div>`;
            
          homeCats.innerHTML = catsHtml;
        }

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
  const sessionUser = JSON.parse(
    localStorage.getItem('currentTrainer') ||
    localStorage.getItem('userSession') ||
    'null'
  );

  const btnSignup = document.getElementById('btn-signup');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const navLinksUl = document.querySelector('.nav-links');

  document.querySelectorAll('.dynamic-auth-item').forEach(el => el.remove());

  if (sessionUser) {
    if (btnSignup) btnSignup.style.display = 'none';
    if (btnLogin) btnLogin.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'inline-block';

    // Robust check for trainer role, even if 'role' was stripped by a previous cache bug
    const isTrainer = (sessionUser.role && sessionUser.role.toLowerCase() === 'trainer') ||
      (!sessionUser.role && (sessionUser.trainerEmail || sessionUser.expertiseCategory || sessionUser.category));
    if (navLinksUl && isTrainer) {
      const dashLi = document.createElement('li');
      dashLi.className = 'dynamic-auth-item';
      const displayName = sessionUser.fullName || sessionUser.name ||
        ((sessionUser.firstName || '') + ' ' + (sessionUser.lastName || '')).trim() || 'Trainer';
      dashLi.innerHTML = `
        <a href="dashboard.html" target="_blank"
           style="color:var(--gold);font-weight:600;transition:color 0.3s ease;">
          Dashboard (${displayName})
        </a>`;
      navLinksUl.appendChild(dashLi);
    }

    window.loggedInTrainerId = sessionUser.email || sessionUser.trainerEmail || null;

  } else {
    if (btnSignup) btnSignup.style.display = 'inline-block';
    if (btnLogin) btnLogin.style.display = 'inline-block';
    if (btnLogout) btnLogout.style.display = 'none';
  }
}

// ── GLOBAL LOGOUT HANDLER ────────────────────────────────────────────────────
window.handleLogout = function () {
  localStorage.removeItem('userSession');
  localStorage.removeItem('currentTrainer');
  window.loggedInTrainerId = null;
  verifyUserSessionToken();
  if (typeof updateNavbarAuthUI === 'function') updateNavbarAuthUI();
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
