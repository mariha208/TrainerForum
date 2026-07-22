// -----------------------------------------------------------------------------
// WORLD TRAINER FORUM � Shared Navigation & Notification JS
// Loaded on: certificates.html, news-events.html, blog.html + any other pages
// -----------------------------------------------------------------------------

/* -- Mobile Menu Toggle ----------------------------------------------------- */
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

/* -- Notification Bell Toggle ----------------------------------------------- */
window.toggleNotif = async function (e) {
  if (e) e.stopPropagation();
  const panel = document.getElementById('notif-panel') || document.getElementById('notif-dropdown');
  if (!panel) return;

  const isPanelOpen = panel.classList.contains('open') || panel.style.display === 'block';

  if (!isPanelOpen) {
    if (panel.id === 'notif-panel') {
      panel.classList.add('open');
    } else {
      panel.style.display = 'block';
    }
    if (typeof window.renderNotifications === 'function') {
      await window.renderNotifications(panel);
    }
  } else {
    if (panel.id === 'notif-panel') {
      panel.classList.remove('open');
    } else {
      panel.style.display = 'none';
    }
  }
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

/* -- openModal Bridge ------------------------------------------------------- */
if (typeof window.openModal !== 'function') {
  window.openModal = function (mode) {
    const resolvedMode = (mode === 'login') ? 'login' : 'register';
    if (typeof openAuthModal === 'function') {
      openAuthModal(resolvedMode);
    }
  };
}

/* -- handleLogout Bridge ---------------------------------------------------- */
if (typeof window.handleLogout !== 'function') {
  window.handleLogout = function () {
    localStorage.removeItem('userSession');
    localStorage.removeItem('currentTrainer');
    localStorage.removeItem('authToken');
    window.location.reload();
  };
}

/* -- Navbar auth-state sync & Auto-Inject Mobile Nav ------------------------ */
document.addEventListener('DOMContentLoaded', function () {
  
  // 1. Inject Overlay if missing
  if (!document.getElementById('nav-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.id = 'nav-overlay';
    overlay.onclick = window.toggleMobileMenu;
    document.body.appendChild(overlay);
  }

  // 2. Inject Mobile Nav Drawer if missing
  if (!document.getElementById('mobile-nav')) {
    const mn = document.createElement('div');
    mn.className = 'mobile-nav';
    mn.id = 'mobile-nav';
    mn.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">
      <a href="index.html" onclick="toggleMobileMenu()" style="display:flex; align-items:center; text-decoration:none;">
        <img src="img/logo.svg" alt="World Trainer Forum Logo" style="height:32px; margin-right:8px;">
        <span style="color:#fff; font-weight:700; font-size:1.05rem;">World Trainer <span style="color:#C5A059;">Forum</span></span>
      </a>
      <button onclick="toggleMobileMenu()"
        style="background:none; border:none; color:#fff; font-size:1.8rem; cursor:pointer; padding:4px;"
        aria-label="Close Menu">&times;</button>
    </div>
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="find-trainers.html">Find Trainers</a>
    <a href="certificates.html">Certificates</a>
    <a href="news-events.html">News & Events</a>
    <a href="blog.html">Blog</a>
    <a href="dashboard.html" id="mn-dash" style="display:none; color:var(--gold);">Dashboard</a>

    <div class="mn-actions" style="margin-top:30px; display:flex; flex-direction:column; gap:12px;">
      <button class="btn btn-ghost" id="mn-btn-signup" onclick="toggleMobileMenu(); openModal('register')">Sign Up</button>
      <button class="btn btn-gold" id="mn-btn-login" onclick="toggleMobileMenu(); openModal('login')">Log In</button>
      <button class="btn btn-dark" id="mn-btn-logout" onclick="handleLogout()" style="display:none;">Log Out</button>
    </div>`;
    document.body.appendChild(mn);
    var mnNavLinks = document.querySelectorAll('#mobile-nav a');
    mnNavLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        var mn = document.getElementById('mobile-nav');
        if (mn && mn.classList.contains('open')) {
          window.toggleMobileMenu();
        }
      });
    });
  }

  // Always hide the dashboard link in the nav
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
    var avatarWrap = document.getElementById('user-avatar-wrap');
    if (avatarWrap) avatarWrap.style.display = 'none';
  }
});

/* -- User Avatar Dropdown Toggle -------------------------------------------- */
window.toggleUserMenu = function (e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const drop = document.getElementById('user-dropdown');
  if (drop) drop.classList.toggle('show');
};

document.addEventListener('click', function (e) {
  const drop = document.getElementById('user-dropdown');
  const btn  = document.getElementById('user-av-btn');
  if (drop && drop.classList.contains('show')) {
    if ((!btn || !btn.contains(e.target)) && !drop.contains(e.target)) {
      drop.classList.remove('show');
    }
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const drop = document.getElementById('user-dropdown');
    if (drop) drop.classList.remove('show');
  }
});
