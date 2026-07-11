/* ═══════════════════════════════════════════════════
   WORLD TRAINER FORUM — TRAINER DASHBOARD SYNC ENGINE
   Real-time dashboard ⇄ Public Trainer Card binding
═══════════════════════════════════════════════════ */

'use strict';

// ── UNIFIED STATE (mirrors TrainerProfile document) ────────────────────────
window.TDB_STATE = { achievements: [], events: [], skills: [], languages: [] };

const TDB_TEXT_INPUTS = [
  'tdb-name', 'tdb-tagline', 'tdb-bio', 'tdb-rate', 'tdb-category',
  'tdb-city', 'tdb-country', 'tdb-mode', 'tdb-languages', 'tdb-tags',
  'tdb-whatsapp', 'tdb-linkedin', 'tdb-website'
];

function tdbEscape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function tdbGet(id) { return document.getElementById(id)?.value.trim() || ''; }
function tdbSet(id, val) { const el = document.getElementById(id); if (el && val !== undefined && val !== null) el.value = val; }
function tdbText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function tdbUid() { return (crypto.randomUUID && crypto.randomUUID()) || `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

// ── LOAD ─────────────────────────────────────────────────────────────────
async function loadTrainerProfile() {
  const session = JSON.parse(localStorage.getItem('currentTrainer') || 'null');
  const token = localStorage.getItem('authToken');
  if (!session || !session._id) return;

  try {
    const res = await fetch(`https://trainerforum.onrender.com/api/users/${session._id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (res.ok) window.TDB_STATE = await res.json();
  } catch (err) {
    console.error('[TDB] profile load failed:', err);
  }

  hydrateForm();
  renderAchievements();
  renderEvents();
  updatePreview();
}

function hydrateForm() {
  const s = TDB_STATE;
  tdbSet('tdb-name', `${s.firstName || ''} ${s.lastName || ''}`.trim());
  tdbSet('tdb-tagline', s.professionalTitle);
  tdbSet('tdb-bio', s.bio);
  tdbSet('tdb-rate', s.hourlyRate || '');
  tdbSet('tdb-category', s.expertiseCategory);
  tdbSet('tdb-city', s.city);
  tdbSet('tdb-country', s.country);
  tdbSet('tdb-mode', s.mode);
  tdbSet('tdb-languages', (s.languages || []).join(', '));
  tdbSet('tdb-tags', (s.skills || []).join(', '));
  tdbSet('tdb-whatsapp', s.phoneNumber);
  tdbSet('tdb-linkedin', s.linkedinProfile);
  tdbSet('tdb-website', s.website);

  if (s.profilePictureUrl) setAvatarPreview(s.profilePictureUrl);
  if (s.coverBannerUrl) setBannerPreview(s.coverBannerUrl);

  // Membership UI Population
  const memTypeEl = document.getElementById('db-membership-type');
  if (memTypeEl) memTypeEl.innerText = s.membershipType || 'FREE';

  const memStatusEl = document.getElementById('db-membership-status');
  if (memStatusEl) memStatusEl.innerText = s.membershipStatus || 'ACTIVE';

  const payStatusEl = document.getElementById('db-payment-status');
  if (payStatusEl) payStatusEl.innerText = s.paymentStatus || 'FREE';

}

// ── LIVE PREVIEW BINDING (keyup/change → sticky card) ──────────────────────
function bindLiveInputs() {
  TDB_TEXT_INPUTS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
  });
}

function updatePreview() {
  const name = tdbGet('tdb-name') || 'Your Name';
  const tagline = tdbGet('tdb-tagline') || 'Professional Title';
  const rate = tdbGet('tdb-rate');
  const tags = tdbGet('tdb-tags').split(',').map(t => t.trim()).filter(Boolean).slice(0, 3);
  const location = [tdbGet('tdb-city'), tdbGet('tdb-country')].filter(Boolean).join(', ') || 'Online';

  tdbText('tdb-preview-name', name);
  tdbText('tdb-preview-tagline', tagline);
  tdbText('tdb-preview-rate', rate ? `₹${Number(rate).toLocaleString('en-IN')}/hr` : 'Rate on request');
  tdbText('tdb-preview-location', location);
  tdbText('tdb-preview-bio', tdbGet('tdb-bio'));

  const tagsEl = document.getElementById('tdb-preview-tags');
  if (tagsEl) {
    tagsEl.innerHTML = tags.length
      ? tags.map(t => `<span class="tdb-pill">${tdbEscape(t)}</span>`).join('')
      : '<span class="tdb-pill">General</span>';
  }

  const avEl = document.getElementById('tdb-preview-avatar');
  if (avEl && !TDB_STATE.profilePictureUrl) {
    avEl.textContent = name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
  }
}

// ── 2A. PROFILE PHOTO — server upload, DB-mapped CDN URL ───────────────────
async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  setAvatarPreview(URL.createObjectURL(file)); // instant local preview while uploading

  const token = localStorage.getItem('authToken');
  const fd = new FormData();
  fd.append('avatar', file);

  try {
    const res = await fetch('https://trainerforum.onrender.com/api/users/profile/upload-avatar', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd
    });
    const data = await res.json();
    if (res.ok) {
      TDB_STATE.profilePictureUrl = data.url;
      setAvatarPreview(data.url);
      window.toast?.('✅ Profile photo updated.');
    } else {
      window.toast?.(data.error || 'Photo upload failed.');
    }
  } catch (err) {
    console.error('[TDB] avatar upload failed:', err);
    window.toast?.('Photo upload failed — check your connection.');
  }
}

function setAvatarPreview(src) {
  ['tdb-avatar-preview', 'tdb-preview-avatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<img src="${src}" alt="Profile photo">`;
  });
}

// ── 2B. COVER BANNER — frontend-local asset (base64, no server upload) ────
function handleBannerUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    TDB_STATE.coverBannerUrl = reader.result;
    setBannerPreview(reader.result);
  };
  reader.readAsDataURL(file);
}

function setBannerPreview(src) {
  ['tdb-banner-preview', 'tdb-preview-banner'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.backgroundImage = `url('${src}')`; el.classList.add('has-image'); }
  });
}

// ── SHARED MODAL SHELL ──────────────────────────────────────────────────────
function tdbOpenModal(innerHtml) {
  const modal = document.getElementById('tdb-modal');
  if (!modal) return;
  modal.innerHTML = `
    <div class="tdb-overlay" onclick="closeTDBModal()"></div>
    <div class="tdb-modal-box">
      <button class="tdb-modal-close" onclick="closeTDBModal()">✕</button>
      ${innerHtml}
    </div>`;
  modal.classList.add('active');
}
function closeTDBModal() {
  const modal = document.getElementById('tdb-modal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.innerHTML = '';
}

// ── ACHIEVEMENTS & CERTIFICATIONS — "+ Add" popup ──────────────────────────
function openAchievementModal() {
  tdbOpenModal(`
    <h3>Add Achievement / Certification</h3>
    <div class="tdb-form-group"><label>Certificate Title / Name</label>
      <input id="tdb-cert-title" placeholder="e.g. Certified Scrum Master"></div>
    <div class="tdb-form-group"><label>Issuing Body / Details</label>
      <input id="tdb-cert-sub" placeholder="e.g. Scrum Alliance, 2024"></div>
    <div class="tdb-form-group"><label>Certificate Image</label>
      <input id="tdb-cert-file" type="file" accept="image/*"></div>
    <button class="btn am-btn-primary" onclick="saveAchievement()">Save</button>
  `);
}

function saveAchievement() {
  const title = tdbGet('tdb-cert-title');
  const sub = tdbGet('tdb-cert-sub');
  const file = document.getElementById('tdb-cert-file')?.files[0];
  if (!title) { window.toast?.('Certificate title is required.'); return; }

  const item = { id: tdbUid(), title, sub, ico: '🏅', verify: false };
  if (file) {
    const reader = new FileReader();
    reader.onload = () => { item.ico = reader.result; tdbPushAchievement(item); };
    reader.readAsDataURL(file);
  } else {
    tdbPushAchievement(item);
  }
}

function tdbPushAchievement(item) {
  TDB_STATE.achievements = TDB_STATE.achievements || [];
  TDB_STATE.achievements.push(item);
  renderAchievements();
  closeTDBModal();
}

function removeAchievement(id) {
  TDB_STATE.achievements = (TDB_STATE.achievements || []).filter(a => a.id !== id);
  renderAchievements();
}

function renderAchievements() {
  const list = document.getElementById('tdb-achievements-list');
  if (!list) return;
  const items = TDB_STATE.achievements || [];
  list.innerHTML = items.length ? items.map(c => {
    const icoHtml = String(c.ico || '').startsWith('data:')
      ? `<img src="${c.ico}" alt="${tdbEscape(c.title)}">`
      : `<span class="tdb-cert-emoji">${c.ico || '🏅'}</span>`;
    return `<div class="tdb-cert-card">
      <div class="tdb-cert-icon">${icoHtml}</div>
      <div class="tdb-cert-info">
        <div class="tdb-cert-name">${tdbEscape(c.title)}</div>
        <div class="tdb-cert-org">${tdbEscape(c.sub)}</div>
      </div>
      <button class="tdb-remove-btn" onclick="removeAchievement('${c.id}')" title="Remove">✕</button>
    </div>`;
  }).join('') : `<p class="tdb-empty">No certifications added yet.</p>`;
}

// ── PAST EVENTS — "+ Add" popup ────────────────────────────────────────────
function openEventModal() {
  tdbOpenModal(`
    <h3>Add Past Event</h3>
    <div class="tdb-form-group"><label>Company Name</label>
      <input id="tdb-event-company" placeholder="e.g. TechCorp India"></div>
    <div class="tdb-form-group"><label>Event Name</label>
      <input id="tdb-event-name" placeholder="e.g. Annual Leadership Summit"></div>
    <div class="tdb-form-group"><label>Event Date</label>
      <input id="tdb-event-date" placeholder="e.g. May 2026"></div>
    <div class="tdb-form-group"><label>Corporate Logo</label>
      <input id="tdb-event-logo" type="file" accept="image/*"></div>
    <button class="btn am-btn-primary" onclick="saveEvent()">Save</button>
  `);
}

function saveEvent() {
  const company = tdbGet('tdb-event-company');
  const evName = tdbGet('tdb-event-name');
  const date = tdbGet('tdb-event-date');
  const file = document.getElementById('tdb-event-logo')?.files[0];
  if (!company || !evName) { window.toast?.('Company and event name are required.'); return; }

  const item = { id: tdbUid(), company, event: evName, date, logo: '🏢' };
  if (file) {
    const reader = new FileReader();
    reader.onload = () => { item.logo = reader.result; tdbPushEvent(item); };
    reader.readAsDataURL(file);
  } else {
    tdbPushEvent(item);
  }
}

function tdbPushEvent(item) {
  TDB_STATE.events = TDB_STATE.events || [];
  TDB_STATE.events.push(item);
  renderEvents();
  closeTDBModal();
}

function removeEvent(id) {
  TDB_STATE.events = (TDB_STATE.events || []).filter(e => e.id !== id);
  renderEvents();
}

function renderEvents() {
  const tbody = document.getElementById('tdb-events-list');
  if (!tbody) return;
  const items = TDB_STATE.events || [];
  tbody.innerHTML = items.length ? items.map(ev => {
    const logoHtml = String(ev.logo || '').startsWith('data:')
      ? `<img src="${ev.logo}" alt="${tdbEscape(ev.company)}">`
      : `<span class="tdb-cert-emoji">${ev.logo || '🏢'}</span>`;
    return `<tr>
      <td>${logoHtml}</td>
      <td><strong>${tdbEscape(ev.company)}</strong></td>
      <td>${tdbEscape(ev.event)}</td>
      <td>${tdbEscape(ev.date)}</td>
      <td><button class="tdb-remove-btn" onclick="removeEvent('${ev.id}')" title="Remove">✕</button></td>
    </tr>`;
  }).join('') : `<tr><td colspan="5" class="tdb-empty">No past events added yet.</td></tr>`;
}

// ── SAVE — writes localStorage immediately, then syncs to server ──────────
async function saveTrainerProfile() {
  const nameParts = tdbGet('tdb-name').split(' ').filter(Boolean);

  const session = JSON.parse(localStorage.getItem('currentTrainer') || 'null');
  const localId = session ? session._id : '1';
  const getLS = (key) => {
    try {
      const val = JSON.parse(localStorage.getItem(`tv-trainer-${localId}-${key}`) || localStorage.getItem(`tv-${key}`) || '[]');
      return Array.isArray(val) ? val : [];
    } catch (e) { return []; }
  };

  const payload = {
    firstName: nameParts.shift() || '',
    lastName: nameParts.join(' '),
    professionalTitle: tdbGet('tdb-tagline'),
    bio: tdbGet('tdb-bio'),
    hourlyRate: parseInt(tdbGet('tdb-rate')) || 0,
    expertiseCategory: tdbGet('tdb-category'),
    city: tdbGet('tdb-city'),
    country: tdbGet('tdb-country'),
    mode: tdbGet('tdb-mode'),
    languages: tdbGet('tdb-languages').split(',').map(s => s.trim()).filter(Boolean),
    skills: tdbGet('tdb-tags').split(',').map(s => s.trim()).filter(Boolean),
    phoneNumber: tdbGet('tdb-whatsapp'),
    linkedinProfile: tdbGet('tdb-linkedin'),
    website: tdbGet('tdb-website'),
    coverBannerUrl: TDB_STATE.coverBannerUrl || '',
    achievements: TDB_STATE.achievements || [],
    events: TDB_STATE.events || [],
    services: getLS('services'),
    packages: getLS('packages'),
    availability: JSON.parse(localStorage.getItem(`tv-trainer-${localId}-availability`) || 'null') || undefined,
    videoIntro: (JSON.parse(localStorage.getItem(`tv-trainer-${localId}-profile`) || '{}').introVideo) || '',
    portfolio: [
      ...getLS('portfolio-testis').map(t => ({ category: 'testimonial', ...t })),
      ...getLS('portfolio-logos').map(l => ({ category: 'company', ...l }))
    ]
  };

  const token = localStorage.getItem('authToken');
  if (!session || !session._id) { window.toast?.('Session expired — please log in again.'); return; }

  // ── STEP 1: Always write localStorage immediately (no API dependency) ─────
  // This ensures the public trainer card always reflects the latest edits,
  // even if the server save fails (expired token, network error, etc.)
  const profileSnapshot = JSON.stringify({
    name: tdbGet('tdb-name'),
    tagline: payload.professionalTitle,
    bio: payload.bio,
    rate: payload.hourlyRate,
    category: payload.expertiseCategory,
    location: [payload.city, payload.country].filter(Boolean).join(', '),
    mode: payload.mode,
    languages: payload.languages,
    tags: payload.skills,
    whatsapp: payload.phoneNumber,
    photo: TDB_STATE.profilePictureUrl || '',
    banner: payload.coverBannerUrl,
    achievements: payload.achievements,
    events: payload.events,
  });
  localStorage.setItem(`tv-trainer-${session._id}-profile`, profileSnapshot);
  localStorage.setItem('tv-trainer-1-profile', profileSnapshot);        // universal fallback
  localStorage.setItem('tv-primary-trainer-id', session._id);
  localStorage.setItem('tv-trainer-updated', new Date().toISOString());

  // Sync to Google Apps Script via server proxy (/api/gsheet)

  // Serialize certificationsBy array → "Name | GivenBy | Year ;; ..."
  const certsRaw = (TDB_STATE.achievements || []);
  // Also attempt to read from dashboard table if present (cross-page fallback)
  let certsByStr = '';
  try {
    const dbRows = document.querySelectorAll('#certifications-by-body tr[data-cert-row]');
    if (dbRows && dbRows.length > 0) {
      certsByStr = Array.from(dbRows).map(row => {
        const name = (row.querySelector('.cert-name-input')?.value || '').trim();
        const givenBy = (row.querySelector('.cert-givenby-input')?.value || '').trim();
        const year = (row.querySelector('.cert-year-input')?.value || '').trim();
        return [name, givenBy, year].join(' | ');
      }).filter(s => s.replace(/\|/g, '').trim()).join(' ;; ');
    }
  } catch (e) { /* ignore if table not on this page */ }
  const postData = {
    trainerId: session._id || "1",
    name: tdbGet('tdb-name'),
    specialization: payload.expertiseCategory || "",
    price: payload.hourlyRate || "",
    experience: "1yr",
    location: [payload.city, payload.country].filter(Boolean).join(', ') || "",
    deliveryMode: payload.mode || "",
    certificationsBy: certsByStr
  };

  fetch('https://trainerforum.onrender.com/api/gsheet', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(postData)
  })
    .then(response => response.json())
    .then(data => {
      console.log("Sync response:", data);
      if (data.success) {
        console.log("✅ Data sent to Google Sheets backend successfully!");
      } else {
        console.warn("⚠️ Sheets sync issue:", data.hint || data.raw);
      }
    })
    .catch(err => console.error("Error syncing profile:", err));

  // ── STEP 2: Attempt server save (best-effort, non-blocking for the card) ──
  try {
    const res = await fetch(`https://trainerforum.onrender.com/api/users/${session._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      Object.assign(TDB_STATE, data.user);

      window.toast?.('✅ Profile saved! Your public trainer card is now updated.');
    } else {
      // API failed but localStorage already has the data — card will still show correctly
      window.toast?.('⚠️ Profile saved locally. Server sync failed — card is updated on this device.');
    }
  } catch (err) {
    console.error('[TDB] server save failed:', err);
    window.toast?.('⚠️ Profile saved locally. Check your connection for full sync.');
  }
}

// ── INIT ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadTrainerProfile().then(bindLiveInputs);
  document.getElementById('tdb-avatar-input')?.addEventListener('change', handleAvatarUpload);
  document.getElementById('tdb-banner-input')?.addEventListener('change', handleBannerUpload);
  document.getElementById('tdb-modal')?.addEventListener('click', e => {
    if (e.target.id === 'tdb-modal') closeTDBModal();
  });
});

Object.assign(window, {
  openAchievementModal, saveAchievement, removeAchievement, renderAchievements,
  openEventModal, saveEvent, removeEvent, renderEvents,
  closeTDBModal, handleAvatarUpload, handleBannerUpload,
  saveTrainerProfile, updatePreview, loadTrainerProfile,
});
