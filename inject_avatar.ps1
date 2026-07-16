$htmlFiles = @("index.html", "about.html", "find-trainers.html", "certificates.html", "news-events.html", "blog.html")

$newNavR = @"
    <div class="nav-r">
      <button class="notif-btn" id="notif-btn" onclick="toggleNotif()">🔔<span class="notif-dot"></span></button>
      <div class="user-avatar-wrap" id="user-avatar-wrap">
        <button class="user-av-btn" id="user-av-btn" onclick="toggleUserMenu()">MK</button>
        <div class="user-dropdown" id="user-dropdown">
          <div class="ud-header">
            <div class="ud-avatar">MK</div>
            <div class="ud-info">
              <span class="ud-name">Mariyah Khan</span>
              <span class="ud-email">khanmariyah006@gmail.com</span>
            </div>
          </div>
          <hr>
          <a href="dashboard.html" class="ud-link"><i class="fa-solid fa-pen"></i> Edit Profile</a>
          <a href="#" class="ud-link ud-logout" onclick="handleLogout()"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</a>
        </div>
      </div>
      <button class="ham-btn" id="ham-btn" onclick="toggleMobileMenu()" aria-label="Toggle Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
"@

foreach ($file in $htmlFiles) {
    $path = "c:\Users\The Mars\Desktop\trainers\$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        
        # Regex to find <div class="nav-r"> ... </div> before </nav>
        # Note: nav-r contains the bell icon, sign up, log in, dashboard, logout, and ham-btn
        $content = $content -replace '(?s)<div class="nav-r">.*?(?=</nav>)', "$newNavR`n  "
        
        Set-Content $path $content -Encoding UTF8
        Write-Host "Updated $file"
    }
}
