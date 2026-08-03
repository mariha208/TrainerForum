/* js/org-dashboard.js — Organization Dashboard Live Controller */

'use strict';

// ── LIVE DATA STORES ──────────────────────────────────────────────────────────
let ORG_REQUIREMENTS_DATA = [];
let ORG_HIRED_TRAINERS_DATA = [];

window.SERVER_ORIGIN = window.SERVER_ORIGIN || 'https://trainerforum.onrender.com';

function getAuthHeaders() {
  const token = localStorage.getItem('token') || localStorage.getItem('wtf_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// ── INITIALIZATION ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await fetchLiveRequirements();
  await fetchLiveHiredTrainers();
  
  // Set default target date input to 14 days in future
  const dateInput = document.getElementById('req-dates');
  if (dateInput) {
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    dateInput.value = futureDate.toISOString().split('T')[0];
  }
});

// ── FETCH LIVE REQUIREMENTS (API INTEGRATION) ─────────────────────────────────
async function fetchLiveRequirements() {
  try {
    const res = await fetch(`${SERVER_ORIGIN}/api/requirements/my-requirements`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (res.ok) {
      const data = await res.json();
      ORG_REQUIREMENTS_DATA = data.requirements || [];
    } else {
      console.warn('[OrgDashboard] Fallback to local storage for requirements.');
      ORG_REQUIREMENTS_DATA = JSON.parse(localStorage.getItem('ORG_REQUIREMENTS_STORE')) || [];
    }
  } catch (err) {
    console.warn('[OrgDashboard] Network error, loading local requirements:', err.message);
    ORG_REQUIREMENTS_DATA = JSON.parse(localStorage.getItem('ORG_REQUIREMENTS_STORE')) || [];
  }

  renderRequirementsTrack();
}

// ── FETCH LIVE HIRED TRAINERS (API INTEGRATION) ──────────────────────────────
async function fetchLiveHiredTrainers() {
  try {
    const res = await fetch(`${SERVER_ORIGIN}/api/bookings/my-hired-trainers`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (res.ok) {
      const data = await res.json();
      ORG_HIRED_TRAINERS_DATA = data.hiredTrainers || [];
    } else {
      ORG_HIRED_TRAINERS_DATA = JSON.parse(localStorage.getItem('ORG_HIRED_TRAINERS_STORE')) || [];
    }
  } catch (err) {
    ORG_HIRED_TRAINERS_DATA = JSON.parse(localStorage.getItem('ORG_HIRED_TRAINERS_STORE')) || [];
  }

  renderHiredTrainersView();
}
window.fetchLiveHiredTrainers = fetchLiveHiredTrainers;

// ── MOBILE SIDEBAR TOGGLE ─────────────────────────────────────────────────────
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
window.switchOrgTab = function (tabId, targetParam) {
  const panels = document.querySelectorAll('.org-tab-panel');
  panels.forEach(p => p.classList.remove('active'));

  const navButtons = document.querySelectorAll('.org-nav-item');
  navButtons.forEach(b => b.classList.remove('active'));

  const targetId = tabId === 'overview' ? 'overview-section' :
                   tabId === 'requirements' ? 'requirements-section' :
                   `org-tab-${tabId}`;

  const targetPanel = document.getElementById(targetId);
  if (targetPanel) targetPanel.classList.add('active');

  let activeItem = document.getElementById(`nav-item-${tabId}`);
  if (targetParam && targetParam.currentTarget) {
    activeItem = targetParam.currentTarget.closest('.org-nav-item') || targetParam.currentTarget;
  } else if (targetParam && targetParam.classList) {
    activeItem = targetParam;
  }

  if (activeItem) {
    activeItem.classList.add('active');
  }

  closeOrgSidebar();
};

// ── OVERVIEW BOX TRACK SELECTION ──────────────────────────────────────────────
window.selectOverviewTrack = function (trackType) {
  const boxReqs = document.getElementById('box-requirements-track');
  const boxHired = document.getElementById('box-hired-trainers');
  const viewReqs = document.getElementById('view-requirements-table');
  const viewHired = document.getElementById('view-hired-trainers');

  if (trackType === 'requirements') {
    if (boxReqs) boxReqs.classList.add('active');
    if (boxHired) boxHired.classList.remove('active');
    if (viewReqs) viewReqs.style.display = 'block';
    if (viewHired) viewHired.style.display = 'none';
  } else if (trackType === 'hired') {
    if (boxHired) boxHired.classList.add('active');
    if (boxReqs) boxReqs.classList.remove('active');
    if (viewHired) viewHired.style.display = 'block';
    if (viewReqs) viewReqs.style.display = 'none';
  }
};

// ── RENDER REQUIREMENTS TRACK & BOX 1 ─────────────────────────────────────────
function renderRequirementsTrack() {
  const tbody = document.getElementById('requirements-table-body');
  const boxCount = document.getElementById('box-reqs-count');
  const pillPending = document.getElementById('box-pill-pending');
  const pillAccepted = document.getElementById('box-pill-accepted');
  const pillRejected = document.getElementById('box-pill-rejected');
  const countBadge = document.getElementById('count-reqs');

  const total = ORG_REQUIREMENTS_DATA.length;
  const pending = ORG_REQUIREMENTS_DATA.filter(r => r.status === 'Pending').length;
  const accepted = ORG_REQUIREMENTS_DATA.filter(r => r.status === 'Accepted').length;
  const rejected = ORG_REQUIREMENTS_DATA.filter(r => r.status === 'Rejected').length;

  if (boxCount) boxCount.textContent = total;
  if (pillPending) pillPending.textContent = `${pending} Pending`;
  if (pillAccepted) pillAccepted.textContent = `${accepted} Accepted`;
  if (pillRejected) pillRejected.textContent = `${rejected} Rejected`;
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
          <div style="font-size:11px;font-weight:700;color:#c5a57b;letter-spacing:0.5px">${r.reqId || r.id}</div>
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
          <div style="color:#cbd5e1">${r.targetDate} (${r.duration})</div>
        </td>
        <td>
          <span class="badge-status ${badgeClass}">${badgeIcon} ${r.status}</span>
        </td>
        <td>
          <button type="button" class="btn btn-ghost btn-sm" onclick="openReqDetailsModal('${r.reqId || r.id}')">View Details</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── RENDER HIRED TRAINERS VIEW & BOX 2 ────────────────────────────────────────
function renderHiredTrainersView() {
  const container = document.getElementById('hired-trainers-content');
  const boxCount = document.getElementById('box-hired-count');
  const pillScheduled = document.getElementById('box-pill-scheduled');
  const pillCompleted = document.getElementById('box-pill-completed');

  const total = ORG_HIRED_TRAINERS_DATA.length;
  const scheduled = ORG_HIRED_TRAINERS_DATA.filter(t => t.status === 'Scheduled').length;
  const completed = ORG_HIRED_TRAINERS_DATA.filter(t => t.status === 'Completed').length;

  if (boxCount) boxCount.textContent = total;
  if (pillScheduled) pillScheduled.textContent = `${scheduled} Scheduled`;
  if (pillCompleted) pillCompleted.textContent = `${completed} Completed`;

  if (!container) return;

  // EMPTY STATE LOGIC
  if (total === 0) {
    container.innerHTML = `
      <div class="org-empty-state">
        <div class="empty-icon">🤝</div>
        <h3 class="empty-title">You haven't hired any trainers yet</h3>
        <p class="empty-desc">Discover top-rated expert trainers across AI, Leadership, Cloud & DevOps to book for your organization.</p>
        <a href="find-trainers.html" class="btn btn-org-primary">Hire Trainer</a>
      </div>
    `;
    return;
  }

  // HIRED TRAINERS TABLE LOGIC
  container.innerHTML = `
    <div class="table-responsive">
      <table class="org-table">
        <thead>
          <tr>
            <th>Trainer Name</th>
            <th>Topic / Expertise</th>
            <th>Scheduled Date & Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${ORG_HIRED_TRAINERS_DATA.map(t => {
            let badgeClass = 'badge-blue';
            if (t.status === 'Completed') badgeClass = 'badge-amber';

            return `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <img src="${t.trainerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}" alt="${t.trainerName}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid #1f293d">
                    <span style="font-weight:700;color:#ffffff">${t.trainerName}</span>
                  </div>
                </td>
                <td>
                  <div style="font-weight:600;color:#c5a57b">${t.topic}</div>
                </td>
                <td>
                  <div>📅 ${t.scheduledDate}</div>
                  <div style="font-size:11.5px;color:#94a3b8">${t.duration}</div>
                </td>
                <td>
                  <span class="badge-status ${badgeClass}">${t.status}</span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── REQUIREMENT SUBMISSION FORM HANDLER (LIVE POST API) ──────────────────────
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

  const payload = {
    orgName,
    topic,
    budget,
    locationType,
    cityDetails,
    targetDate,
    duration,
    notes: notes || ''
  };

  try {
    const res = await fetch(`${SERVER_ORIGIN}/api/requirements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (window.showToast) {
        window.showToast('Requirement submitted successfully! It is currently under review.', 5000);
      } else {
        alert('Requirement submitted successfully! It is currently under review.');
      }
    } else {
      throw new Error('Server returned error status');
    }
  } catch (err) {
    console.warn('[ReqSubmit] Backend POST failed/offline, saving locally:', err.message);
    
    // Local fallback creation
    const fallbackReq = {
      reqId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      ...payload,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    ORG_REQUIREMENTS_DATA.unshift(fallbackReq);
    localStorage.setItem('ORG_REQUIREMENTS_STORE', JSON.stringify(ORG_REQUIREMENTS_DATA));

    if (window.showToast) {
      window.showToast('Requirement submitted successfully! It is currently under review.', 5000);
    }
  }

  // Reset form
  const form = document.getElementById('org-requirement-form');
  if (form) form.reset();

  // Refresh live requirements list & card metrics
  await fetchLiveRequirements();

  // Switch to Overview tab
  switchOrgTab('overview');
};

// ── REQUIREMENT DETAILS MODAL ─────────────────────────────────────────────────
window.openReqDetailsModal = function (reqId) {
  const req = ORG_REQUIREMENTS_DATA.find(r => (r.reqId || r.id) === reqId);
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
        <p style="margin:2px 0 0 0;font-size:12px;color:#94a3b8">${req.orgName} • Ref: ${req.reqId || req.id}</p>
      </div>
    </div>

    <div style="background:#0a0f1d;border:1px solid #1f293d;border-radius:14px;padding:16px;margin-bottom:20px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px">
        <div>
          <span style="font-size:11px;font-weight:700;color:#c5a57b;text-transform:uppercase">Budget</span>
          <div style="font-size:16px;font-weight:800;color:#34d399;margin-top:2px">$${Number(req.budget).toLocaleString()}</div>
        </div>
        <div>
          <span style="font-size:11px;font-weight:700;color:#c5a57b;text-transform:uppercase">Location</span>
          <div style="font-size:13px;font-weight:600;color:#ffffff;margin-top:2px">📍 ${req.locationType}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px">
        <div>
          <span style="font-size:11px;font-weight:700;color:#c5a57b;text-transform:uppercase">City / Address</span>
          <div style="font-size:13px;color:#cbd5e1;margin-top:2px">${req.cityDetails}</div>
        </div>
        <div>
          <span style="font-size:11px;font-weight:700;color:#c5a57b;text-transform:uppercase">Target Date</span>
          <div style="font-size:13px;color:#cbd5e1;margin-top:2px">📅 ${req.targetDate}</div>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <span style="font-size:11px;font-weight:700;color:#c5a57b;text-transform:uppercase">Time & Duration</span>
        <div style="font-size:13px;color:#cbd5e1;margin-top:2px">⏱️ ${req.duration}</div>
      </div>

      <div>
        <span style="font-size:11px;font-weight:700;color:#c5a57b;text-transform:uppercase">Special Notes / Instructions</span>
        <div style="font-size:13px;color:#cbd5e1;margin-top:4px;line-height:1.5;background:#111827;padding:10px;border-radius:8px;border:1px solid #1f293d">
          ${req.notes || 'No additional notes provided.'}
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
