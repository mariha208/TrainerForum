$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# ── Full nav HTML to inject (matches index.html exactly) ──────────────────────
$navHtml = @'
  <!-- ═══ NAVBAR ═══ -->
  <nav id="nav">
    <a class="logo" href="index.html">
      <img src="img/logo.svg" alt="World Trainer Forum Logo" style="height:42px; margin-right:10px;">World Trainer <span class="g">Forum</span>
    </a>
    <ul class="nav-links">
      <li><a id="nl-home"    href="index.html">Home</a></li>
      <li><a id="nl-about"   href="about.html">About</a></li>
      <li><a id="nl-browse"  href="find-trainers.html">Find Trainers</a></li>
      <li><a id="nl-cats"    href="certificates.html">Certificates</a></li>
      <li><a id="nl-pricing" href="news-events.html">News &amp; Events</a></li>
      <li><a id="nl-blog"    href="blog.html">Blog</a></li>
      <li><a id="nl-dash"    href="dashboard.html" target="_blank" style="display:none;">Dashboard</a></li>
    </ul>
    <div class="nav-r">
      <button class="notif-btn" id="notif-btn" onclick="toggleNotif()">🔔<span class="notif-dot"></span></button>
      <button class="btn btn-ghost btn-sm" id="btn-signup" onclick="openModal('register')">Sign Up</button>
      <button class="btn btn-gold  btn-sm" id="btn-login"  onclick="openModal('login')">Log In</button>
      <button class="btn btn-dark  btn-sm" id="btn-logout" onclick="handleLogout()" style="display:none;">Log Out</button>
      <button class="ham-btn" id="ham-btn" onclick="toggleMobileMenu()" aria-label="Toggle Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <!-- Mobile Nav Drawer -->
  <div class="mobile-nav" id="mobile-nav">
    <div style="display:flex; justify-content:flex-end; margin-bottom: 20px;">
      <button onclick="toggleMobileMenu()" style="background:none; border:none; color:#fff; font-size:2rem; cursor:pointer;" aria-label="Close Menu">&times;</button>
    </div>
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="find-trainers.html">Find Trainers</a>
    <a href="certificates.html">Certificates</a>
    <a href="news-events.html">News &amp; Events</a>
    <a href="blog.html">Blog</a>
    <a href="dashboard.html" id="mn-dash" style="display:none; color:var(--gold);">Dashboard</a>
    <div class="mn-actions" style="margin-top:30px; display:flex; flex-direction:column; gap:12px;">
      <button class="btn btn-ghost" id="mn-btn-signup" onclick="toggleMobileMenu(); openModal('register')">Sign Up</button>
      <button class="btn btn-gold"  id="mn-btn-login"  onclick="toggleMobileMenu(); openModal('login')">Log In</button>
      <button class="btn btn-dark"  id="mn-btn-logout" onclick="handleLogout()" style="display:none;">Log Out</button>
    </div>
  </div>
  <div class="nav-overlay" id="nav-overlay" onclick="toggleMobileMenu()"></div>

'@

# ── Pages to fix: file => which link should be active ─────────────────────────
$pages = @{
  "certificates.html" = "nl-cats"
  "news-events.html"  = "nl-pricing"
  "blog.html"         = "nl-blog"
}

foreach ($file in $pages.Keys) {
    $activeId = $pages[$file]
    $content  = [System.IO.File]::ReadAllText($file, $utf8NoBom)

    # Build page-specific nav (set active class on the right link)
    $pageNav = $navHtml -replace ('id="' + $activeId + '" href="([^"]+)"'), ('id="' + $activeId + '" href="$1" class="active"')

    # Ensure css/style.css is linked (nav styles live there or in nav.css)
    if (-not ($content -match 'css/style\.css|css/nav\.css')) {
        $content = $content -replace '(<link[^>]+auth-modal\.css[^>]*>)', ('<link rel="stylesheet" href="css/style.css">' + "`n  " + '$1')
    }

    # Ensure css/nav.css is present (fallback)
    if (-not ($content -match 'css/nav\.css')) {
        $content = $content -replace '(<style>)', ('<link rel="stylesheet" href="css/nav.css">' + "`n  " + '$1')
    }

    # Replace the broken </nav> (or old header) right after <body> with the full nav
    # Pattern: after <body>, optional whitespace, then </nav> or <header>...</header>
    $content = $content -replace '(?s)(<body[^>]*>)\s*</nav>', ('$1' + "`n`n" + $pageNav)
    $content = $content -replace '(?s)(<body[^>]*>)\s*<header>.*?</header>', ('$1' + "`n`n" + $pageNav)

    [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
    Write-Host "Fixed nav in: $file"
}

Write-Host "`nDone! All pages updated."
