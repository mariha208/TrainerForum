/* js/org-dashboard.js — Organization Dashboard Frontend Controller */

'use strict';

// ── MOCK DATA STORE ───────────────────────────────────────────────────────────
const ORG_MOCK_TRAINERS = [
  {
    id: 'tr-1',
    name: 'Dr. Aris Thorne',
    headline: 'Principal AI & Machine Learning Architect',
    location: 'Bangalore, India • Virtual',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    badges: ['Verified Expert', 'Top Rated'],
    skills: ['AI/ML', 'Generative AI', 'Python', 'LLM Deployment'],
    dailyRate: 1500,
    rating: 4.98,
    reviewCount: 46,
    deliveryMode: 'Hybrid',
    bio: 'Ex-Google Research Lead with 12+ years delivering enterprise AI transformation workshops for Fortune 500 tech teams.',
    isShortlisted: false
  },
  {
    id: 'tr-2',
    name: 'Elena Rostova',
    headline: 'Executive Leadership & Behavioral Coach',
    location: 'London, UK • Onsite',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    badges: ['Verified Expert', 'Elite Featured'],
    skills: ['Executive Leadership', 'Conflict Resolution', 'EQ', 'Change Management'],
    dailyRate: 1800,
    rating: 4.95,
    reviewCount: 38,
    deliveryMode: 'Onsite',
    bio: 'ICF Master Certified Coach specializing in high-performance leadership alignment and C-suite team dynamics.',
    isShortlisted: true
  },
  {
    id: 'tr-3',
    name: 'Marcus Vance',
    headline: 'Senior Cloud Security & DevOps Consultant',
    location: 'Austin, TX • Virtual',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    badges: ['Verified Expert'],
    skills: ['AWS Security', 'Kubernetes', 'DevSecOps', 'Zero Trust'],
    dailyRate: 1350,
    rating: 4.91,
    reviewCount: 29,
    deliveryMode: 'Virtual',
    bio: 'AWS Certified Security Specialist training engineering teams on zero-trust architectures and cloud compliance.',
    isShortlisted: false
  },
  {
    id: 'tr-4',
    name: 'Priya Sundaram',
    headline: 'Agile Transformation & Product Management Specialist',
    location: 'Singapore • Hybrid',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    badges: ['Top Rated'],
    skills: ['SAFe Agile', 'Product Strategy', 'Scrum Master', 'Design Thinking'],
    dailyRate: 1200,
    rating: 4.88,
    reviewCount: 52,
    deliveryMode: 'Hybrid',
    bio: 'Certified SAFe Program Consultant who has guided 30+ enterprise agile transformations across APAC.',
    isShortlisted: false
  }
];

const ORG_MOCK_PROPOSALS = [
  {
    id: 'prop-1',
    trainerName: 'Dr. Aris Thorne',
    trainerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    trainerHeadline: 'Principal AI & Machine Learning Architect',
    proposedDailyRate: 1450,
    coverLetter: 'We can deliver a customized 3-day Generative AI workshop tailored to your senior engineering stack with hands-on lab environments.',
    submittedDate: '2 hours ago'
  },
  {
    id: 'prop-2',
    trainerName: 'Marcus Vance',
    trainerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    trainerHeadline: 'Senior Cloud Security & DevOps Consultant',
    proposedDailyRate: 1300,
    coverLetter: 'Our hands-on syllabus covers secure LLM deployment, prompt injection defense, and enterprise data privacy compliance.',
    submittedDate: '5 hours ago'
  }
];

const ORG_MOCK_RFPS = [
  {
    id: 'rfp-101',
    title: '3-Day Enterprise Generative AI & LLM Implementation Workshop',
    category: 'AI & Machine Learning',
    targetAudience: 'Senior Software Engineers & Tech Leads (40 Participants)',
    deliveryFormat: 'Hybrid',
    location: 'Bangalore HQ & Virtual',
    startDate: '2026-09-10',
    budgetMin: 4000,
    budgetMax: 5500,
    applicantsCount: 6,
    status: 'OPEN',
    description: 'Looking for a seasoned AI Architect to conduct a 3-day deep dive into fine-tuning LLMs, RAG architecture, and production deployment safety.'
  },
  {
    id: 'rfp-102',
    title: 'Executive Leadership & EQ Retreat for VP & Director Level Leaders',
    category: 'Leadership Development',
    targetAudience: 'VPs and Senior Directors (15 Participants)',
    deliveryFormat: 'Onsite',
    location: 'London Retreat Center',
    startDate: '2026-10-05',
    budgetMin: 5000,
    budgetMax: 7000,
    applicantsCount: 4,
    status: 'UNDER_REVIEW',
    description: 'Immersive 3-day offsite training focused on strategic decision-making under pressure, emotional intelligence, and organizational alignment.'
  }
];

const ORG_MOCK_REVIEWS = [
  {
    id: 'rev-1',
    sessionTitle: 'Cloud Native DevSecOps Masterclass',
    trainerName: 'Marcus Vance',
    trainerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    deliveredDate: '2026-07-25',
    overallRating: 4.75,
    isPublished: true
  },
  {
    id: 'rev-2',
    sessionTitle: 'Strategic Change Management Workshop',
    trainerName: 'Elena Rostova',
    trainerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    deliveredDate: '2026-07-28',
    overallRating: 5.0,
    isPublished: false
  }
];

// Active Star Rating State
let currentRatingState = {
  subjectExpertise: 5,
  audienceEngagement: 5,
  materialQuality: 5,
  punctualityProfessionalism: 5
};

// ── INITIALIZATION ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderRecommendedTrainers();
  renderRecentBids();
  renderMarketplaceTrainers(ORG_MOCK_TRAINERS);
  renderRFPs();
  renderSessionReviews();
});

// ── TAB SWITCHING ─────────────────────────────────────────────────────────────
window.switchOrgTab = function (tabId, btn) {
  const tabs = document.querySelectorAll('.org-tab-panel');
  tabs.forEach(t => t.classList.remove('active'));

  const navItems = document.querySelectorAll('.org-nav-item');
  navItems.forEach(n => n.classList.remove('active'));

  const targetTab = document.getElementById(`org-tab-${tabId}`);
  if (targetTab) targetTab.classList.add('active');

  if (btn) btn.classList.add('active');
};

// ── RENDER OVERVIEW: TOP RECOMMENDED TRAINERS ─────────────────────────────────
function renderRecommendedTrainers() {
  const container = document.getElementById('rec-trainers-container');
  if (!container) return;

  const recs = ORG_MOCK_TRAINERS.slice(0, 3);
  container.innerHTML = recs.map(t => `
    <div class="rec-card">
      <div>
        <div class="rec-header">
          <img src="${t.avatar}" alt="${t.name}" class="rec-avatar">
          <div>
            <h4 class="rec-name">${t.name}</h4>
            <p class="rec-headline">${t.headline}</p>
            <div class="rec-rating">⭐ ${t.rating} <span style="color:#94a3b8;font-weight:400">(${t.reviewCount})</span></div>
          </div>
        </div>
        <div>
          ${t.skills.slice(0, 3).map(s => `<span class="skill-pill">${s}</span>`).join('')}
        </div>
      </div>
      <div class="rec-footer">
        <span class="rec-rate">$${t.dailyRate} <span style="font-weight:400;font-size:11px;color:#64748b">/day</span></span>
        <button type="button" class="btn btn-dark" onclick="switchOrgTab('marketplace')">View Profile</button>
      </div>
    </div>
  `).join('');
}

// ── RENDER OVERVIEW: RECENT BIDS & PROPOSALS ──────────────────────────────────
function renderRecentBids() {
  const container = document.getElementById('recent-bids-container');
  if (!container) return;

  container.innerHTML = ORG_MOCK_PROPOSALS.map(p => `
    <div class="bid-item" id="bid-${p.id}">
      <div class="bid-trainer-box">
        <img src="${p.trainerAvatar}" alt="${p.trainerName}" class="bid-avatar">
        <div>
          <h4 style="margin:0;font-size:14px;font-weight:700">${p.trainerName}</h4>
          <p style="margin:2px 0;font-size:11.5px;color:#64748b">${p.trainerHeadline}</p>
          <p style="margin:4px 0 0 0;font-size:12px;color:#334155;font-style:italic">"${p.coverLetter}"</p>
        </div>
      </div>
      <div style="text-align:right" class="bid-actions">
        <div>
          <div style="font-size:14px;font-weight:800;color:#0f172a">$${p.proposedDailyRate}/day</div>
          <div style="font-size:11px;color:#94a3b8">${p.submittedDate}</div>
        </div>
        <button type="button" class="btn btn-success" onclick="acceptBid('${p.id}')">Accept</button>
        <button type="button" class="btn btn-ghost" onclick="rejectBid('${p.id}')">Reject</button>
      </div>
    </div>
  `).join('');
}

window.acceptBid = function (id) {
  if (window.showToast) window.showToast('Proposal Accepted! Contract generated & sent to trainer.', 4000);
  else alert('Proposal Accepted!');
  const el = document.getElementById(`bid-${id}`);
  if (el) el.style.opacity = '0.5';
};

window.rejectBid = function (id) {
  const el = document.getElementById(`bid-${id}`);
  if (el) el.remove();
};

// ── RENDER MARKETPLACE TRAINERS ───────────────────────────────────────────────
function renderMarketplaceTrainers(list) {
  const container = document.getElementById('marketplace-grid-container');
  const label = document.getElementById('marketplace-count-label');
  if (!container) return;

  if (label) label.textContent = `Showing ${list.length} Expert Trainers`;

  if (list.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#64748b">No trainers match your selected criteria. Try adjusting your filters.</div>`;
    return;
  }

  container.innerHTML = list.map(t => `
    <div class="trainer-card">
      <div>
        <div class="trainer-card-top">
          <div style="display:flex;gap:14px">
            <img src="${t.avatar}" alt="${t.name}" class="trainer-avatar-lg">
            <div>
              <h3 style="margin:0;font-size:15px;font-weight:700">${t.name}</h3>
              <p style="margin:2px 0;font-size:12px;color:#64748b">${t.headline}</p>
              <p style="margin:4px 0 0 0;font-size:11.5px;color:#94a3b8">📍 ${t.location}</p>
            </div>
          </div>
          <button type="button" class="heart-btn ${t.isShortlisted ? 'active' : ''}" onclick="toggleShortlist('${t.id}')">
            ${t.isShortlisted ? '❤️' : '🤍'}
          </button>
        </div>

        <div style="margin-bottom:10px">
          ${t.badges.map(b => `<span class="badge-pill">🛡️ ${b}</span>`).join('')}
        </div>

        <p style="font-size:12px;color:#475569;line-height:1.5;margin-bottom:12px">${t.bio}</p>

        <div style="margin-bottom:16px">
          ${t.skills.map(s => `<span class="skill-pill">${s}</span>`).join('')}
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid #f1f5f9">
        <div>
          <span style="font-size:13px;font-weight:800;color:#d97706">⭐ ${t.rating}</span>
          <span style="font-size:11px;color:#94a3b8">(${t.reviewCount} reviews)</span>
          <div style="font-size:12px;font-weight:700;color:#0f172a">$${t.dailyRate} / day</div>
        </div>
        <button type="button" class="btn btn-org-primary" onclick="openPostRFPModal()">Send Direct RFP</button>
      </div>
    </div>
  `).join('');
}

// ── MARKETPLACE SEARCH & FILTER LOGIC ─────────────────────────────────────────
window.applyMarketplaceFilters = function () {
  const domain = document.getElementById('filter-domain')?.value || 'All';
  const format = document.getElementById('filter-format')?.value || 'All';
  const maxPrice = Number(document.getElementById('filter-price')?.value || 2000);
  const minRating = Number(document.getElementById('filter-rating')?.value || 4.0);

  const filtered = ORG_MOCK_TRAINERS.filter(t => {
    const matchesDomain = domain === 'All' || t.skills.some(s => s.toLowerCase().includes(domain.toLowerCase()));
    const matchesFormat = format === 'All' || t.deliveryMode === format;
    const matchesPrice = t.dailyRate <= maxPrice;
    const matchesRating = t.rating >= minRating;
    return matchesDomain && matchesFormat && matchesPrice && matchesRating;
  });

  renderMarketplaceTrainers(filtered);
};

window.handleOrgSearch = function (query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    applyMarketplaceFilters();
    return;
  }

  const filtered = ORG_MOCK_TRAINERS.filter(t => {
    return t.name.toLowerCase().includes(q) ||
           t.headline.toLowerCase().includes(q) ||
           t.skills.some(s => s.toLowerCase().includes(q));
  });

  renderMarketplaceTrainers(filtered);
};

window.toggleShortlist = function (id) {
  const item = ORG_MOCK_TRAINERS.find(t => t.id === id);
  if (item) {
    item.isShortlisted = !item.isShortlisted;
    applyMarketplaceFilters();
    if (window.showToast) {
      window.showToast(item.isShortlisted ? `Added ${item.name} to Shortlist ❤️` : `Removed ${item.name} from Shortlist`);
    }
  }
};

// ── RENDER RFPS LIST ──────────────────────────────────────────────────────────
function renderRFPs() {
  const container = document.getElementById('rfp-list-container');
  if (!container) return;

  container.innerHTML = ORG_MOCK_RFPS.map(rfp => `
    <div class="org-card mb-16">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #f1f5f9;padding-bottom:12px;margin-bottom:12px">
        <div>
          <span style="font-size:10px;font-weight:800;text-transform:uppercase;padding:2px 8px;border-radius:4px;background:${rfp.status === 'OPEN' ? '#dcfce7' : '#fef3c7'};color:${rfp.status === 'OPEN' ? '#15803d' : '#b45309'}">
            ${rfp.status}
          </span>
          <h3 style="margin:6px 0 0 0;font-size:16px;font-weight:700">${rfp.title}</h3>
        </div>
        <span style="font-size:12px;font-weight:700;color:#2563eb;background:#eff6ff;padding:4px 10px;border-radius:12px;border:1px solid #bfdbfe">
          ${rfp.applicantsCount} Trainers Applied
        </span>
      </div>
      <p style="font-size:12.5px;color:#475569;margin-bottom:14px">${rfp.description}</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:#f8fafc;padding:10px;border-radius:10px;font-size:12px">
        <div><span style="color:#94a3b8;display:block">Audience</span><strong>${rfp.targetAudience}</strong></div>
        <div><span style="color:#94a3b8;display:block">Format</span><strong>${rfp.deliveryFormat}</strong></div>
        <div><span style="color:#94a3b8;display:block">Start Date</span><strong>${rfp.startDate}</strong></div>
        <div><span style="color:#94a3b8;display:block">Budget Range</span><strong style="color:#16a34a">$${rfp.budgetMin} - $${rfp.budgetMax}</strong></div>
      </div>
    </div>
  `).join('');
}

// ── RENDER SESSION REVIEWS ───────────────────────────────────────────────────
function renderSessionReviews() {
  const container = document.getElementById('reviews-list-container');
  if (!container) return;

  container.innerHTML = ORG_MOCK_REVIEWS.map(r => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="${r.trainerAvatar}" alt="${r.trainerName}" style="width:44px;height:44px;border-radius:50%;object-fit:cover">
        <div>
          <h4 style="margin:0;font-size:14px;font-weight:700">${r.sessionTitle}</h4>
          <p style="margin:2px 0 0 0;font-size:11.5px;color:#64748b">Trainer: ${r.trainerName} • Delivered on ${r.deliveredDate}</p>
        </div>
      </div>

      <div>
        ${r.isPublished ? `
          <span style="font-size:12px;font-weight:700;color:#16a34a;background:#dcfce7;padding:6px 12px;border-radius:8px;border:1px solid #bbf7d0">
            ✓ Verified Review Published (${r.overallRating}★)
          </span>
        ` : `
          <button type="button" class="btn btn-success" onclick="openRatingModal('${r.id}', '${r.sessionTitle}')">
            Rate & Evaluate Session ⭐
          </button>
        `}
      </div>
    </div>
  `).join('');
}

// ── POST RFP MODAL CONTROLLER ─────────────────────────────────────────────────
window.openPostRFPModal = function () {
  const m = document.getElementById('modal-post-rfp');
  if (m) m.classList.add('active');
};

window.closePostRFPModal = function () {
  const m = document.getElementById('modal-post-rfp');
  if (m) m.classList.remove('active');
};

window.handleRFPSubmit = function (e) {
  e.preventDefault();
  const title = document.getElementById('rfp-input-title')?.value;
  const category = document.getElementById('rfp-input-domain')?.value;
  const deliveryFormat = document.getElementById('rfp-input-format')?.value;
  const description = document.getElementById('rfp-input-desc')?.value;

  if (!title || !description) return;

  const newRFP = {
    id: `rfp-${Date.now()}`,
    title,
    category,
    targetAudience: 'Enterprise Engineering & Leadership Team',
    deliveryFormat,
    location: 'Corporate HQ',
    startDate: '2026-10-01',
    budgetMin: 3500,
    budgetMax: 5000,
    applicantsCount: 0,
    status: 'OPEN',
    description
  };

  ORG_MOCK_RFPS.unshift(newRFP);
  renderRFPs();
  closePostRFPModal();

  if (window.showToast) window.showToast('Training RFP successfully posted! Trainers notified.', 4000);
  else alert('RFP Posted successfully!');
};

// ── INTERACTIVE 4-PARAMETER RATING MODAL ──────────────────────────────────────
let activeReviewId = null;

window.openRatingModal = function (reviewId, sessionTitle) {
  activeReviewId = reviewId;
  const sub = document.getElementById('rating-modal-subtitle');
  if (sub) sub.textContent = sessionTitle;

  const m = document.getElementById('modal-rating');
  if (m) m.classList.add('active');
};

window.closeRatingModal = function () {
  const m = document.getElementById('modal-rating');
  if (m) m.classList.remove('active');
};

window.setStarRating = function (paramKey, rating) {
  currentRatingState[paramKey] = rating;

  const picker = document.querySelector(`.star-rating-picker[data-param="${paramKey}"]`);
  if (!picker) return;

  const stars = picker.querySelectorAll('span');
  stars.forEach((starEl, index) => {
    if (index < rating) {
      starEl.classList.add('active');
    } else {
      starEl.classList.remove('active');
    }
  });
};

window.handleRatingSubmit = function (e) {
  e.preventDefault();
  const feedback = document.getElementById('rating-input-feedback')?.value;

  const reviewItem = ORG_MOCK_REVIEWS.find(r => r.id === activeReviewId);
  if (reviewItem) {
    reviewItem.isPublished = true;
    renderSessionReviews();
  }

  closeRatingModal();
  if (window.showToast) window.showToast('Thank you! Verified Review & 4-Parameter Rating Published ⭐', 4000);
  else alert('Verified Review Published!');
};
