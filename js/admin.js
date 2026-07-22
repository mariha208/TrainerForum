/* ═══════════════════════════════════════════════════
   WORLD TRAINER FORUM — ADMIN PANEL JS
   Manages trainer accounts, memberships, and status
═══════════════════════════════════════════════════ */
'use strict';

// ── API Endpoints ─────────────────────────────────────────────────────────────
// The site frontend is hosted on GitHub Pages (static only).
// All backend API calls MUST use the full Render server URL.
// Relative paths like /api/posts will 404/405 on GitHub Pages.
const API_BASE = 'https://trainerforum.onrender.com/api/users';
const POSTS_API_BASE = 'https://trainerforum.onrender.com/api/posts';
const NOTIFS_API_BASE = 'https://trainerforum.onrender.com/api/notifications';
const UPLOAD_API_BASE = 'https://trainerforum.onrender.com/api/upload-image';

let allTrainers = [];      // All fetched trainers (raw)
let filteredTrainers = []; // After filters applied
const PAGE_SIZE = 15;
let currentPage = 1;

// ── BOOT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadTrainers();
});

// ── FETCH ALL TRAINERS FROM API ───────────────────────────────────────────────
async function loadTrainers() {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--tm);">Loading trainers…</td></tr>`;

  try {
    const res = await fetch(`${API_BASE}?role=trainer`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    allTrainers = Array.isArray(data) ? data : (data.data || []);
    applyFilters();
    updateStats();
  } catch (err) {
    console.error('[Admin] Load error:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#f87171;">❌ Failed to load trainer data. Is the server running?</td></tr>`;
  }
}

// ── UPDATE STAT CARDS ─────────────────────────────────────────────────────────
function updateStats() {
  const total = allTrainers.length;
  const premium = allTrainers.filter(t => (t.membershipType || 'FREE') === 'PREMIUM').length;
  const standard = allTrainers.filter(t => (t.membershipType || 'FREE') === 'STANDARD').length;
  const free = allTrainers.filter(t => !t.membershipType || t.membershipType === 'FREE').length;

  setText('stat-total', total);
  setText('stat-premium', premium);
  setText('stat-standard', standard);
  setText('stat-free', free);
}

// ── APPLY FILTERS ─────────────────────────────────────────────────────────────
function applyFilters() {
  const membership = document.getElementById('filter-membership').value;
  const status = document.getElementById('filter-status').value;
  const search = (document.getElementById('filter-search').value || '').trim().toLowerCase();

  filteredTrainers = allTrainers.filter(t => {
    const mt = (t.membershipType || 'FREE').toUpperCase();
    const isSuspended = t.suspended === true;
    const statusStr = isSuspended ? 'suspended' : 'active';
    const name = ([t.fullName, t.firstName, t.lastName].filter(Boolean).join(' ')).toLowerCase();
    const email = (t.email || '').toLowerCase();

    if (membership && mt !== membership) return false;
    if (status && statusStr !== status) return false;
    if (search && !name.includes(search) && !email.includes(search)) return false;
    return true;
  });

  currentPage = 1;
  renderTable();
}

// ── RENDER TABLE PAGE ─────────────────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('admin-table-body');
  const total = filteredTrainers.length;
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const page = filteredTrainers.slice(start, end);

  // Update info
  document.getElementById('page-info').textContent = `Showing ${start + 1}–${end} of ${total} trainers`;

  if (page.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No trainers match your filters.</td></tr>`;
    renderPagination(0);
    return;
  }

  tbody.innerHTML = page.map(t => {
    const name = [t.firstName, t.lastName].filter(Boolean).join(' ') || t.fullName || 'Unnamed';
    const email = t.email || '—';
    const cat = t.expertiseCategory || t.category || '—';
    const mt = (t.membershipType || 'FREE').toUpperCase();
    const isSuspended = t.suspended === true;
    const id = t._id;
    const joined = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const initials = name.split(' ').map(p => p[0] || '').join('').substring(0, 2).toUpperCase();

    const memberBadge = mt === 'PREMIUM'
      ? `<span class="badge badge-premium">⭐ Elite</span>`
      : mt === 'STANDARD'
      ? `<span class="badge badge-standard">🚀 Pro</span>`
      : `<span class="badge badge-free">Starter</span>`;

    const statusBadge = isSuspended
      ? `<span class="badge badge-suspended">Suspended</span>`
      : `<span class="badge badge-active">Active</span>`;

    return `<tr>
      <td>
        <div class="trainer-info">
          <div class="admin-av">${initials}</div>
          <div class="trainer-info-text">
            <div class="name">${escHtml(name)}</div>
            <div class="email">${escHtml(email)}</div>
          </div>
        </div>
      </td>
      <td style="color:var(--tm);font-size:.82rem;">${escHtml(cat)}</td>
      <td>${memberBadge}</td>
      <td>${statusBadge}</td>
      <td style="color:var(--tm);font-size:.82rem;">${joined}</td>
      <td>
        <div class="action-wrap">
          <button class="action-btn">Actions ▾</button>
          <div class="action-menu">
            <button onclick="openPlanModal('${id}', '${escHtml(name)}', '${mt}')">✏️ Change Plan</button>
            <button onclick="toggleSuspend('${id}', ${isSuspended})">${isSuspended ? '✅ Reactivate' : '⏸️ Suspend'}</button>
            <div class="separator"></div>
            <button class="danger" onclick="deleteTrainer('${id}', '${escHtml(name)}')">🗑️ Delete Account</button>
          </div>
        </div>
      </td>
    </tr>`;
  }).join('');

  renderPagination(total);
}

// ── PAGINATION ────────────────────────────────────────────────────────────────
function renderPagination(total) {
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const container = document.getElementById('page-btns');
  if (pageCount <= 1) { container.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= pageCount; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  container.innerHTML = html;
}

function goPage(n) {
  currentPage = n;
  renderTable();
}

// ── PLAN CHANGE MODAL ─────────────────────────────────────────────────────────
function openPlanModal(id, name, currentPlan) {
  document.getElementById('edit-trainer-id').value = id;
  document.getElementById('edit-trainer-name').textContent = name;
  document.getElementById('edit-plan-select').value = currentPlan || 'FREE';
  document.getElementById('plan-modal').classList.add('open');
}

function closePlanModal() {
  document.getElementById('plan-modal').classList.remove('open');
}

async function savePlanChange() {
  const id = document.getElementById('edit-trainer-id').value;
  const plan = document.getElementById('edit-plan-select').value;

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membershipType: plan })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    // Update local data without full reload
    const trainer = allTrainers.find(t => t._id === id);
    if (trainer) trainer.membershipType = plan;

    closePlanModal();
    updateStats();
    applyFilters();
    showToast(`Plan updated to ${plan} successfully.`);
  } catch (err) {
    alert('❌ Failed to update plan: ' + err.message);
  }
}

// ── SUSPEND / REACTIVATE ──────────────────────────────────────────────────────
async function toggleSuspend(id, isSuspended) {
  const action = isSuspended ? 'reactivate' : 'suspend';
  if (!confirm(`Are you sure you want to ${action} this trainer?`)) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspended: !isSuspended })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const trainer = allTrainers.find(t => t._id === id);
    if (trainer) trainer.suspended = !isSuspended;
    applyFilters();
    showToast(`Trainer ${isSuspended ? 'reactivated' : 'suspended'} successfully.`);
  } catch (err) {
    alert('❌ Failed to update status: ' + err.message);
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
async function deleteTrainer(id, name) {
  if (!confirm(`⚠️ Permanently delete "${name}"? This cannot be undone.`)) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    allTrainers = allTrainers.filter(t => t._id !== id);
    updateStats();
    applyFilters();
    showToast(`${name} deleted.`);
  } catch (err) {
    alert('❌ Delete failed: ' + err.message);
  }
}

// ── EXPORT CSV ────────────────────────────────────────────────────────────────
function exportCSV() {
  const headers = ['Name', 'Email', 'Category', 'Membership', 'Status', 'Joined'];
  const rows = filteredTrainers.map(t => {
    const name = [t.firstName, t.lastName].filter(Boolean).join(' ') || t.fullName || '';
    const cat = t.expertiseCategory || t.category || '';
    const mt = t.membershipType || 'FREE';
    const status = t.suspended ? 'Suspended' : 'Active';
    const joined = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '';
    return [name, t.email || '', cat, mt, status, joined].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'trainers_export.csv'; a.click();
  URL.revokeObjectURL(url);
}

let selectedImageFile = null;

// ── TAB SWITCHING ─────────────────────────────────────────────────────────────
window.switchAdminTab = function(tab) {
  const btnTrainers = document.getElementById('tab-btn-trainers');
  const btnPublishing = document.getElementById('tab-btn-publishing');
  const secTrainers = document.getElementById('tab-section-trainers');
  const secPublishing = document.getElementById('tab-section-publishing');

  if (tab === 'publishing') {
    btnTrainers.className = 'btn-sm btn-dark';
    btnPublishing.className = 'btn-sm btn-gold';
    secTrainers.style.display = 'none';
    secPublishing.style.display = 'block';
    loadPublishedPosts();
  } else {
    btnTrainers.className = 'btn-sm btn-gold';
    btnPublishing.className = 'btn-sm btn-dark';
    secTrainers.style.display = 'block';
    secPublishing.style.display = 'none';
  }
};

// ── IMAGE FILE SELECTION ──────────────────────────────────────────────────────
window.handleImageFileSelect = function(e) {
  const file = e.target.files[0];
  const fileNameSpan = document.getElementById('pub-file-name');
  if (file) {
    selectedImageFile = file;
    if (fileNameSpan) fileNameSpan.textContent = `📁 ${file.name}`;
  } else {
    selectedImageFile = null;
    if (fileNameSpan) fileNameSpan.textContent = '';
  }
};

// ── RESET PUBLISH FORM ────────────────────────────────────────────────────────
window.resetPublishForm = function() {
  const form = document.getElementById('publish-form');
  if (form) form.reset();
  selectedImageFile = null;
  const fileNameSpan = document.getElementById('pub-file-name');
  if (fileNameSpan) fileNameSpan.textContent = '';
};

// ── SUBMIT PUBLISH FORM ───────────────────────────────────────────────────────
window.handlePublishSubmit = async function(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('btn-publish-submit');
  const category = document.getElementById('pub-category').value;
  const title = document.getElementById('pub-title').value.trim();
  const description = document.getElementById('pub-description').value.trim();
  const content = document.getElementById('pub-content').value.trim();
  let imageUrl = (document.getElementById('pub-image-url').value || '').trim();

  if (!title || !description || !content) {
    alert('Please fill in all required fields (Title, Description, and Content).');
    return;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Publishing...';
    }

    // 1. Upload image file if provided
    if (selectedImageFile) {
      const formData = new FormData();
      formData.append('image', selectedImageFile);
      formData.append('type', 'post');

      const uploadRes = await fetch(UPLOAD_API_BASE, {
        method: 'POST',
        body: formData
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        if (uploadData.url) imageUrl = uploadData.url;
      } else {
        console.warn('[Publish] Image upload failed, proceeding with URL fallback');
      }
    }

    // 2. Submit Post payload
    const postPayload = { category, title, description, content, imageUrl };
    const res = await fetch(POSTS_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postPayload)
    });

    if (!res.ok) {
      let errMsg = 'HTTP ' + res.status;
      try { const errData = await res.json(); errMsg = errData.error || errMsg; } catch (e) {}
      throw new Error(errMsg);
    }

    const responseData = await res.json();

    showToast(`${category} post published & notification sent!`);
    resetPublishForm();
    loadPublishedPosts();

  } catch (err) {
    console.error('[Publish] Error:', err);
    alert('❌ Failed to publish post: ' + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🚀 Publish & Send Notification';
    }
  }
};

// ── LOAD PUBLISHED POSTS TABLE ────────────────────────────────────────────────
window.loadPublishedPosts = async function() {
  const tbody = document.getElementById('published-posts-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--tm);">Loading published posts...</td></tr>`;

  try {
    const res = await fetch(POSTS_API_BASE);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const posts = await res.json();

    if (!Array.isArray(posts) || posts.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No published posts yet. Use the form above to publish news, events, or blogs.</td></tr>`;
      return;
    }

    tbody.innerHTML = posts.map(p => {
      const cat = p.category || 'News';
      const title = p.title || 'Untitled';
      const desc = p.description || '—';
      const id = p.id || p._id;
      const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
      const excerpt = desc.length > 80 ? desc.substring(0, 77) + '...' : desc;

      const catBadge = cat === 'Blog' 
        ? `<span class="badge" style="background:rgba(3,218,198,0.15); color:#03dac6; border:1px solid rgba(3,218,198,0.3);">📝 Blog</span>`
        : cat === 'Event'
        ? `<span class="badge" style="background:rgba(255,183,77,0.15); color:#ffb74d; border:1px solid rgba(255,183,77,0.3);">📅 Event</span>`
        : `<span class="badge" style="background:rgba(52,152,219,0.15); color:#5dade2; border:1px solid rgba(52,152,219,0.3);">📰 News</span>`;

      return `<tr>
        <td>${catBadge}</td>
        <td style="font-weight:600; color:var(--ts);">${escHtml(title)}</td>
        <td style="color:var(--tm); font-size:.82rem;">${escHtml(excerpt)}</td>
        <td style="color:var(--tm); font-size:.82rem;">${dateStr}</td>
        <td>
          <button class="btn-sm btn-danger" onclick="deletePost('${id}', '${escHtml(title)}')">🗑️ Delete</button>
        </td>
      </tr>`;
    }).join('');

  } catch (err) {
    console.error('[Admin] Load published posts error:', err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:#f87171;">❌ Failed to load published posts.</td></tr>`;
  }
};

// ── DELETE POST ───────────────────────────────────────────────────────────────
window.deletePost = async function(id, title) {
  if (!confirm(`Are you sure you want to delete post "${title}"?`)) return;

  try {
    const res = await fetch(`${POSTS_API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    showToast(`Post deleted successfully.`);
    loadPublishedPosts();
  } catch (err) {
    alert('❌ Failed to delete post: ' + err.message);
  }
};
