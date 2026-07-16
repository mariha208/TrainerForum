// ─────────────────────────────────────────────────────────────────────────────
// WORLD TRAINER FORUM — Shared Navigation & Notification JS
// Loaded on: certificates.html, news-events.html, blog.html + any other pages
// ─────────────────────────────────────────────────────────────────────────────

/* ── Mobile Menu Toggle ───────────────────────────────────────────────────── */
window.toggleMobileMenu = function () {
  const mn      = document.getElementById('mobile-nav');
  const ham     = document.getElementById('ham-btn');
  const overlay = document.getElementById('nav-overlay');
  if (!mn) return;

  const isOpen = mn.classList.contains('open');
  if (isOpen) {
    mn.classList.remove('open');
    if (ham)     ham.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    mn.classList.add('open');
    if (ham)     ham.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

/* ── Notification Bell Toggle ─────────────────────────────────────────────── */
window.toggleNotif = function (e) {
  if (e) e.stopPropagation();
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  panel.classList.toggle('open');
};

// Close notification panel when clicking outside
document.addEventListener('click', function (e) {
  const panel = document.getElementById('notif-panel');
  const btn   = document.getElementById('notif-btn');
  if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
    panel.classList.remove('open');
  }
});

// Close notification panel on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const panel = document.getElementById('notif-panel');
    const mn    = document.getElementById('mobile-nav');
    if (panel) panel.classList.remove('open');
    if (mn && mn.classList.contains('open')) window.toggleMobileMenu();
  }
});

/* ── openModal Bridge ─────────────────────────────────────────────────────── */
// Pages that load auth-modal.js but NOT app.js need this alias.
// Guard: don't overwrite if app.js already defined it.
if (typeof window.openModal !== 'function') {
  window.openModal = function (mode) {
    const resolvedMode = (mode === 'login') ? 'login' : 'register';
    if (typeof openAuthModal === 'function') {
      openAuthModal(resolvedMode);
    }
  };
}

/* ── handleLogout Bridge ──────────────────────────────────────────────────── */
if (typeof window.handleLogout !== 'function') {
  window.handleLogout = function () {
    localStorage.removeItem('userSession');
    localStorage.removeItem('currentTrainer');
    localStorage.removeItem('authToken');
    window.location.reload();
  };
}

/* ── Navbar auth-state sync ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  const session = localStorage.getItem('userSession');
  const avatarWrap = document.getElementById('user-avatar-wrap');
  const signupBtn  = document.getElementById('btn-signup');
  const loginBtn   = document.getElementById('btn-login');

  if (session) {
    // Logged in: show avatar, hide sign-up/log-in/logout buttons
    ['btn-signup', 'btn-login', 'btn-logout', 'mn-btn-signup', 'mn-btn-login'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    ['nl-dash', 'mn-dash'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });

    // Populate initials and email dynamically
    try {
      var trainer = JSON.parse(localStorage.getItem('currentTrainer')) || {};
      var email   = trainer.email || session;
      var name    = trainer.name || trainer.fullName || '';
      var initials = name
        ? name.split(' ').map(function(w){ return w[0]; }).join('').substring(0,2).toUpperCase()
        : email.substring(0,2).toUpperCase();

      var avBtn = document.getElementById('user-av-btn');
      if (avBtn) avBtn.textContent = initials;

      var udAvatar = document.querySelector('#user-dropdown .ud-avatar');
      if (udAvatar) udAvatar.textContent = initials;

      var udName = document.querySelector('#user-dropdown .ud-name');
      if (udName) udName.textContent = name || 'My Account';

      var udEmail = document.querySelector('#user-dropdown .ud-email');
      if (udEmail) udEmail.textContent = email;
    } catch(ex) {}

    if (avatarWrap) avatarWrap.style.display = 'inline-block';
    if (signupBtn)  signupBtn.style.display  = 'none';
    if (loginBtn)   loginBtn.style.display   = 'none';

  } else {
    // Not logged in: hide avatar
    if (avatarWrap) avatarWrap.style.display = 'none';
  }
});

/* ── User Avatar Dropdown Toggle ──────────────────────────────────────────── */
window.toggleUserMenu = function (e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const drop = document.getElementById('user-dropdown');
  if (drop) drop.classList.toggle('show');
};

// Close user-dropdown when clicking outside
document.addEventListener('click', function (e) {
  const drop = document.getElementById('user-dropdown');
  const btn  = document.getElementById('user-av-btn');
  if (drop && drop.classList.contains('show')) {
    if ((!btn || !btn.contains(e.target)) && !drop.contains(e.target)) {
      drop.classList.remove('show');
    }
  }
});

// Escape key also closes user-dropdown
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const drop = document.getElementById('user-dropdown');
    if (drop) drop.classList.remove('show');
  }
});
