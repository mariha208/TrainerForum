$enc = [System.Text.Encoding]::UTF8
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# Update style.css
$stylePath = 'css/style.css'
$styleContent = [IO.File]::ReadAllText($stylePath, $enc)
$styleContent = $styleContent -replace '\.trainers-grid\s*\{[\s\S]*?gap:\s*22px\s*\}', ".trainers-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 22px;
}
@media (max-width: 1024px) {
  .trainers-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .trainers-grid { grid-template-columns: repeat(2, 1fr); }
}"
[IO.File]::WriteAllText($stylePath, $styleContent, $utf8NoBom)

# Update dashboard.css
$dashCssPath = 'css/dashboard.css'
$dashCssContent = [IO.File]::ReadAllText($dashCssPath, $enc)
$dashCssContent = $dashCssContent -replace '#services-container, #packages-container { grid-template-columns: 1fr !important; }', '#services-container, #packages-container { grid-template-columns: 1fr 1fr !important; }'
$dashCssContent = $dashCssContent -replace '\.dash-card, \.cat-card, \.card, \.profile-layout, \.db-modal, #services-container, #packages-container, form, input, textarea { max-width: 100% !important; box-sizing: border-box !important; }', '.db-card, .dash-card, .cat-card, .card, .profile-layout, .db-modal, #services-container, #packages-container, form, input, textarea { max-width: 100% !important; box-sizing: border-box !important; }'
$dashCssContent = $dashCssContent -replace '  /\* Enforce single column for dashboard grids that overflow \*/', "  #save-profile-btn { width: 60% !important; margin: 0 auto !important; display: block !important; }
  /* Enforce single column for dashboard grids that overflow */"
$dashCssContent += "

/* Hide global mobile nav on dashboard */
.mobile-nav, .nav-overlay { display: none !important; }
"
[IO.File]::WriteAllText($dashCssPath, $dashCssContent, $utf8NoBom)

# Update dashboard.html
$dashHtmlPath = 'dashboard.html'
$dashHtmlContent = [IO.File]::ReadAllText($dashHtmlPath, $enc)
$dashHtmlContent = $dashHtmlContent -replace '(?s)<div class="logo-area">.*?<a href="index.html">.*?<button class="mobile-menu-btn" onclick="toggleSidebar\(\)" id="mob-menu-btn">.*?</button>.*?<img src="img/logo.svg" alt="World Trainer Form Logo" style="height:34px; margin-right:8px;">.*?<div class="logo-txt">World Trainer <span>Form</span></div>.*?</a>.*?</div>', '<div class="logo-area" style="display:flex; align-items:center;"><button class="mobile-menu-btn" onclick="toggleSidebar()" id="mob-menu-btn" style="margin-right:10px;">&#9776;</button><a href="index.html" style="display:flex; align-items:center; text-decoration:none;"><img src="img/logo.svg" alt="World Trainer Form Logo" style="height:34px; margin-right:8px;"><div class="logo-txt">World Trainer <span>Form</span></div></a></div>'
[IO.File]::WriteAllText($dashHtmlPath, $dashHtmlContent, $utf8NoBom)

