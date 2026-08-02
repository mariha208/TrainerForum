/* js/org-dashboard.js — Organization Dashboard Frontend Controller */

'use strict';

// ── INITIAL DATA STORE FOR REQUIREMENTS ───────────────────────────────────────
let ORG_REQUIREMENTS_DATA = JSON.parse(localStorage.getItem('ORG_REQUIREMENTS_STORE')) || [
  {
    id: 'REQ-8421',
    orgName: 'Acme Global Technologies',
    topic: '3-Day Executive Generative AI & LLM Implementation Workshop',
    budget: 5500,
    locationType: 'In City',
    cityDetails: 'Bangalore HQ (Indiranagar)',
    targetDate: '2026-09-10',
    duration: '10:00 AM - 5:00 PM / 3 Days',
    notes: 'Looking for a seasoned AI Architect to conduct a deep dive into fine-tuning LLMs, RAG architecture, and production deployment safety.',
    submittedDate: '2026-08-01',
    status: 'Pending'
  },
  {
    id: 'REQ-7910',
    orgName: 'Acme Global Technologies',
    topic: 'Cloud Native DevSecOps Masterclass & Hands-on Lab',
    budget: 4200,
    locationType: 'Remote',
    cityDetails: 'Virtual (Zoom / Teams)',
    targetDate: '2026-08-25',
    duration: '2:00 PM - 6:00 PM / 2 Days',
    notes: 'Targeting 25 cloud engineers on Zero-Trust Kubernetes security and Terraform pipelines.',
    submittedDate: '2026-07-28',
    status: 'Accepted'
  },
  {
    id: 'REQ-6502',
    orgName: 'Acme Global Technologies',
    topic: 'Agile Product Management & SAFe Certification',
    budget: 3000,
    locationType: 'Out City',
    cityDetails: 'Mumbai Office (BKC)',
    targetDate: '2026-07-15',
    duration: '9:00 AM - 6:00 PM / 2 Days',
    notes: 'Onsite workshop for Product Owners.',
    submittedDate: '2026-07-10',
    status: 'Rejected'
  }
];

// Save helper
function saveRequirementsStore() {
  localStorage.setItem('ORG_REQUIREMENTS_STORE', JSON.stringify(ORG_REQUIREMENTS_DATA));
}

// ── INITIALIZATION ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderRequirementsTable();
  
  // Set default date input in requirement form to 14 days in future
  const dateInput = document.getElementById('req-dates');
  if (dateInput) {
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    dateInput.value = futureDate.toISOString().split('T')[0];
  }
});

// ── MOBILE SIDEBAR TOGGLE LOGIC ───────────────────────────────────────────────
window.toggleOrgSidebar = function () {
  const sidebar = document.getElementById('orgSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
};

window.closeOrgSidebar = function () {
  const sidebar = document.getElementById('orgSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
};

// ── TAB SWITCHING ─────────────────────────────────────────────────────────────
window.switchOrgTab = function (tabId, btn) {
  // Hide all panels
  const panels = document.querySelectorAll('.org-tab-panel');
  panels.forEach(p => p.classList.remove('active'));

  // Remove active state from all nav buttons
  const navButtons = document.querySelectorAll('.org-nav-item');
  navButtons.forEach(b => b.classList.remove('active'));

  // Target panel (supports 'overview', 'requirements', etc.)
  const targetId = tabId === 'overview' ? 'overview-section' :
                   tabId === 'requirements' ? 'requirements-section' :
                   `org-tab-${tabId}`;

  const targetPanel = document.getElementById(targetId);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Active button highlight
  if (btn) {
    btn.classList.add('active');
  } else {
    const activeBtn = document.getElementById(`nav-item-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  // Auto-close mobile sidebar drawer
  closeOrgSidebar();
};

// ── RENDER REQUIREMENTS TRACKER & KPIS ────────────────────────────────────────
function renderRequirementsTable() {
  const tbody = document.getElementById('requirements-table-body');
  const totalEl = document.getElementById('kpi-total-reqs');
  const pendingEl = document.getElementById('kpi-pending-reqs');
  const acceptedEl = document.getElementById('kpi-accepted-reqs');
  const rejectedEl = document.getElementById('kpi-rejected-reqs');
  const countBadge = document.getElementById('count-reqs');

  // Compute stats
  const total = ORG_REQUIREMENTS_DATA.length;
  const pending = ORG_REQUIREMENTS_DATA.filter(r => r.status === 'Pending').length;
  const accepted = ORG_REQUIREMENTS_DATA.filter(r => r.status === 'Accepted').length;
  const rejected = ORG_REQUIREMENTS_DATA.filter(r => r.status === 'Rejected').length;

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (acceptedEl) acceptedEl.textContent = accepted;
  if (rejectedEl) rejectedEl.textContent = rejected;
  if (countBadge) countBadge.textContent = total;

  if (!tbody) return;

  if (total === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:40px;color:#94a3b8">
          No training requirements submitted yet. Click "+ Submit New Requirement" above to create one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = ORG_REQUIREMENTS_DATA.map(r => {
    let badgeClass = 'badge-pending';
    let badgeIcon = '⏱️';
    if (r.status === 'Accepted') {
      badgeClass = 'badge-accepted';
      badgeIcon = '✓';
    } else if (r.status === 'Rejected') {
      badgeClass = 'badge-rejected';
      badgeIcon = '✕';
    }

    return `
      <tr>
        <td>
          <div style="font-size:11px;font-weight:700;color:#c5a57b;letter-spacing:0.5px">${r.id}</div>
          <div style="font-weight:700;color:#ffffff;margin-top:2px">${r.topic}</div>
          <div style="font-size:12px;color:#94a3b8">${r.orgName}</div>
        </td>
        <td>
          <div>📍 ${r.locationType} (${r.cityDetails})</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:2px">📅 ${r.targetDate}</div>
        </td>
        <td>
          <div style="font-weight:800;color:#34d399">$${Number(r.budget).toLocaleString()}</div>
        </td>
        <td>
          <div style="color:#cbd5e1">${r.submittedDate}</div>
        </td>
        <td>
          <span class="badge-status ${badgeClass}">${badgeIcon} ${r.status}</span>
        </td>
        <td>
          <button type="button" class="btn btn-ghost btn-sm" onclick="openReqDetailsModal('${r.id}')">View Details</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── REQUIREMENT SUBMISSION FORM HANDLER ───────────────────────────────────────
window.handleOrgRequirementSubmit = async function (e) {
  e.preventDefault();

  const orgName = document.getElementById('req-org-name')?.value.trim();
  const topic = document.getElementById('req-topic')?.value.trim();
  const budget = Number(document.getElementById('req-budget')?.value);
  const locationType = document.getElementById('req-location-type')?.value;
  const cityDetails = document.getElementById('req-city-details')?.value.trim();
  const targetDate = document.getElementById('req-dates')?.value;
  const duration = document.getElementById('req-duration')?.value.trim();
  const notes = document.getElementById('req-notes')?.value.trim();

  if (!orgName || !topic || !budget || !cityDetails || !targetDate || !duration) {
    if (window.showToast) window.showToast('Please fill in all required fields marked with *', 3500);
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const newReq = {
    id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    orgName,
    topic,
    budget,
    locationType,
    cityDetails,
    targetDate,
    duration,
    notes: notes || 'No additional notes provided.',
    submittedDate: today,
    status: 'Pending'
  };

  // Add to top of array & save to local storage
  ORG_REQUIREMENTS_DATA.unshift(newReq);
  saveRequirementsStore();

  // Attempt backend/gsheet sync asynchronously
  try {
    const SERVER_ORIGIN = window.SERVER_ORIGIN || 'https://trainerforum.onrender.com';
    fetch(`${SERVER_ORIGIN}/api/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq)
    }).catch(err => console.warn('[ReqSubmit] Backend sync skipped or unavailable:', err.message));
  } catch (err) {
    // Ignore API network errors for local state
  }

  // Display success feedback
  if (window.showToast) {
    window.showToast('Requirement submitted successfully! It is currently under review.', 5000);
  } else {
    alert('Requirement submitted successfully! It is currently under review.');
  }

  // Reset form
  const form = document.getElementById('org-requirement-form');
  if (form) form.reset();

  // Re-render overview table & stats
  renderRequirementsTable();

  // Automatically switch back to Overview tab
  switchOrgTab('overview');
};

// ── REQUIREMENT DETAILS MODAL ─────────────────────────────────────────────────
window.openReqDetailsModal = function (reqId) {
  const req = ORG_REQUIREMENTS_DATA.find(r => r.id === reqId);
  if (!req) return;

  const content = document.getElementById('req-details-content');
  if (!content) return;

  let badgeClass = 'badge-pending';
  let badgeIcon = '⏱️';
  if (req.status === 'Accepted') {
    badgeClass = 'badge-accepted';
    badgeIcon = '✓';
  } else if (req.status === 'Rejected') {
    badgeClass = 'badge-rejected';
    badgeIcon = '✕';
  }

  content.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
      <div>
        <span class="badge-status ${badgeClass}">${badgeIcon} ${req.status}</span>
        <h3 style="margin:8px 0 0 0;font-size:18px;font-weight:800;color:#ffffff">${req.topic}</h3>
        <p style="margin:2px 0 0 0;font-size:12px;color:#94a3b8">${req.orgName} • Ref: ${req.id}</p>
      </div>
    </div>

    <div style="background:#0a0f1d;border:1px solid #1f293d;border-radius:14px;padding:16px;margin-bottom:20px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px">
        <div>
          <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase">Budget</span>
          <div style="font-size:16px;font-weight:800;color:#34d399;margin-top:2px">$${Number(req.budget).toLocaleString()}</div>
        </div>
        <div>
          <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase">Location</span>
          <div style="font-size:13px;font-weight:600;color:#ffffff;margin-top:2px">📍 ${req.locationType}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px">
        <div>
          <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase">City / Address</span>
          <div style="font-size:13px;color:#cbd5e1;margin-top:2px">${req.cityDetails}</div>
        </div>
        <div>
          <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase">Target Date</span>
          <div style="font-size:13px;color:#cbd5e1;margin-top:2px">📅 ${req.targetDate}</div>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase">Time & Duration</span>
        <div style="font-size:13px;color:#cbd5e1;margin-top:2px">⏱️ ${req.duration}</div>
      </div>

      <div>
        <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase">Special Notes / Instructions</span>
        <div style="font-size:13px;color:#cbd5e1;margin-top:4px;line-height:1.5;background:#111827;padding:10px;border-radius:8px;border:1px solid #1f293d">
          ${req.notes}
        </div>
      </div>
    </div>

    <div style="display:flex;justify-content:flex-end">
      <button type="button" class="btn btn-ghost" onclick="closeReqDetailsModal()">Close</button>
    </div>
  `;

  const modal = document.getElementById('modal-req-details');
  if (modal) modal.classList.add('active');
};

window.closeReqDetailsModal = function () {
  const modal = document.getElementById('modal-req-details');
  if (modal) modal.classList.remove('active');
};
