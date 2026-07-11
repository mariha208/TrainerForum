/* ═══════════════════════════════════════════════════
   WORLD TRAINER FORUM — ADMIN PANEL JS
   Manages trainer accounts, memberships, and status
═══════════════════════════════════════════════════ */
'use strict';

const API_BASE = 'https://trainerforum.onrender.com/api/users';

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

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let toastTimer;
function showToast(msg) {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e1e1e;border:1px solid rgba(245,200,66,.4);color:#fff;padding:12px 20px;border-radius:10px;font-size:.88rem;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,.4);transition:opacity .3s;';
    document.body.appendChild(toast);
  }
  toast.textContent = '✓ ' + msg;
  toast.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}
