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

/* ── Navbar auth-state sync ────────────────────────────────────────────── */
// NOTE: avatar population (user-avatar-wrap) is handled entirely by app.js.
// mobile-nav.js only manages sign-in/out button visibility.
document.addEventListener('DOMContentLoaded', function () {
  // Always hide the dashboard link in the nav — app.js avatar handles navigation
  ['nl-dash', 'mn-dash'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  var session = localStorage.getItem('userSession');
  if (session) {
    ['btn-signup', 'btn-login', 'btn-logout',
     'mn-btn-signup', 'mn-btn-login'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    var mnLogout = document.getElementById('mn-btn-logout');
    if (mnLogout) mnLogout.style.display = 'flex';
  } else {
    // Not logged in: hide avatar (app.js may not have run yet)
    var avatarWrap = document.getElementById('user-avatar-wrap');
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
