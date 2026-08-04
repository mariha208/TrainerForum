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

/* -- Pricing Plan Action Handler -------------------------------------------- */
window.selectPricingPlan = function (planName) {
  if (planName) {
    localStorage.setItem('selectedPlan', planName);
  }
  if (typeof window.openAuthModal === 'function') {
    window.openAuthModal('register', 'Trainer');
  } else if (typeof window.openModal === 'function') {
    window.openModal('register');
  } else {
    window.location.href = 'index.html#register';
  }
};

/* -- Navbar auth-state sync & Auto-Inject Mobile Nav ------------------------ */
document.addEventListener('DOMContentLoaded', function () {
  
  // 1. Dynamic Active Link Highlighting
  var rawPath = window.location.pathname.split('/').pop() || 'index.html';
  var currentPath = (rawPath === '' || rawPath === '/') ? 'index.html' : rawPath.toLowerCase();

  var desktopLinks = document.querySelectorAll('.nav-links a');
  desktopLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href) {
      var linkPath = href.split('/').pop().toLowerCase();
      if (linkPath === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });

  // 2. Inject Overlay if missing
  if (!document.getElementById('nav-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.id = 'nav-overlay';
    overlay.onclick = window.toggleMobileMenu;
    document.body.appendChild(overlay);
  }

  // 3. Inject Mobile Nav Drawer if missing
  if (!document.getElementById('mobile-nav')) {
    const mn = document.createElement('div');
    mn.className = 'mobile-nav';
    mn.id = 'mobile-nav';
    mn.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">
      <a href="index.html" onclick="toggleMobileMenu()" style="display:flex; align-items:center; text-decoration:none;">
        <img src="img/logo.svg" alt="World Trainer Forum Logo" style="height:32px; margin-right:8px;" onerror="this.onerror=null;this.src='bglogo.png';">
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
    <a href="news-events.html">News &amp; Events</a>
    <a href="blog.html">Blog</a>
    <a href="contact.html">Contact</a>
    <a href="dashboard.html" id="mn-dash" style="display:none; color:var(--gold);">Dashboard</a>

    <div class="mn-actions" style="margin-top:30px; display:flex; flex-direction:column; gap:12px;">
      <button class="btn btn-ghost" id="mn-btn-signup" onclick="toggleMobileMenu(); openModal('register')">Sign Up</button>
      <button class="btn btn-gold" id="mn-btn-login" onclick="toggleMobileMenu(); openModal('login')">Log In</button>
      <button class="btn btn-dark" id="mn-btn-logout" onclick="handleLogout()" style="display:none;">Log Out</button>
    </div>`;
    document.body.appendChild(mn);
  }

  var mobileLinks = document.querySelectorAll('#mobile-nav a');
  mobileLinks.forEach(function(link) {
    var href = link.getAttribute('href');
    if (href) {
      var linkPath = href.split('/').pop().toLowerCase();
      if (linkPath === currentPath) {
        link.classList.add('active');
        link.style.color = 'var(--gold, #C5A059)';
      }
    }
    link.addEventListener('click', function() {
      var mn = document.getElementById('mobile-nav');
      if (mn && mn.classList.contains('open')) {
        window.toggleMobileMenu();
      }
    });
  });

  // Always hide the dashboard link in the nav
  ['nl-dash', 'mn-dash'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 4. Sync Header Auth State
  window.syncHeaderAuthState();
});

/* -- Header Auth State Sync Function ---------------------------------------- */
window.syncHeaderAuthState = function () {
  var sessionData = localStorage.getItem('userSession');
  var sessionUser = null;
  try { sessionUser = JSON.parse(sessionData); } catch (e) {}

  var btnSignup  = document.getElementById('btn-signup');
  var btnLogin   = document.getElementById('btn-login');
  var notifBtn   = document.getElementById('notif-btn');
  var avatarWrap = document.getElementById('user-avatar-wrap');
  var avBtn      = document.getElementById('user-av-btn');
  var udAvatar   = document.getElementById('ud-av-initials');
  var udName     = document.getElementById('ud-display-name');
  var udEmail    = document.getElementById('ud-display-email');

  var mnSignup = document.getElementById('mn-btn-signup');
  var mnLogin  = document.getElementById('mn-btn-login');
  var mnLogout = document.getElementById('mn-btn-logout');

  if (sessionUser) {
    // Logged In State: Hide sign up/login, show bell notification icon & user profile avatar
    if (btnSignup)  btnSignup.style.display  = 'none';
    if (btnLogin)   btnLogin.style.display   = 'none';
    if (notifBtn)   notifBtn.style.display   = 'flex';
    if (avatarWrap) avatarWrap.style.display = 'inline-block';

    if (mnSignup) mnSignup.style.display = 'none';
    if (mnLogin)  mnLogin.style.display  = 'none';
    if (mnLogout) mnLogout.style.display = 'flex';

    // Populate user profile info
    try {
      var trainer = {};
      try { trainer = JSON.parse(localStorage.getItem('currentTrainer') || '{}'); } catch (e) {}

      var name = trainer.name || trainer.fullName ||
        ((sessionUser.firstName || '') + ' ' + (sessionUser.lastName || '')).trim() ||
        sessionUser.name || 'User';
      var email = trainer.email || sessionUser.email || sessionUser.trainerEmail || 'user@example.com';
      var initials = name.trim().split(/\s+/).map(function (w) { return w[0] || ''; }).join('').substring(0, 2).toUpperCase() || 'U';
      var picUrl = sessionUser.profileImageUrl || sessionUser.photoUrl || sessionUser.profilePic ||
        trainer.profilePictureUrl || trainer.profilePic || '';

      if (avBtn) {
        if (picUrl) {
          avBtn.style.backgroundImage = "url('" + picUrl + "')";
          avBtn.style.backgroundSize = 'cover';
          avBtn.style.backgroundPosition = 'center';
          avBtn.textContent = '';
        } else {
          avBtn.style.backgroundImage = '';
          avBtn.textContent = initials;
        }
      }

      if (udAvatar) {
        if (picUrl) {
          udAvatar.style.backgroundImage = "url('" + picUrl + "')";
          udAvatar.style.backgroundSize = 'cover';
          udAvatar.style.backgroundPosition = 'center';
          udAvatar.textContent = '';
        } else {
          udAvatar.style.backgroundImage = '';
          udAvatar.textContent = initials;
        }
      }

      if (udName) udName.textContent = name;
      if (udEmail) udEmail.textContent = email;

    } catch (ex) {
      console.warn('Avatar populate error:', ex);
    }
  } else {
    // Logged Out State: Show sign up & log in buttons, hide notification bell & avatar
    if (btnSignup)  btnSignup.style.display  = 'inline-block';
    if (btnLogin)   btnLogin.style.display   = 'inline-block';
    if (notifBtn)   notifBtn.style.display   = 'none';
    if (avatarWrap) avatarWrap.style.display = 'none';

    if (mnSignup) mnSignup.style.display = 'flex';
    if (mnLogin)  mnLogin.style.display  = 'flex';
    if (mnLogout) mnLogout.style.display = 'none';
  }
};

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
