function Replace-StringBytes {
    param([string]$path, [string]$old, [string]$new)
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    $text = $text.Replace($old, $new)
    $newBytes = [System.Text.Encoding]::UTF8.GetBytes($text)
    [System.IO.File]::WriteAllBytes($path, $newBytes)
}

function Replace-RegexBytes {
    param([string]$path, [string]$pattern, [string]$replacement)
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    $text = [System.Text.RegularExpressions.Regex]::Replace($text, $pattern, $replacement)
    $newBytes = [System.Text.Encoding]::UTF8.GetBytes($text)
    [System.IO.File]::WriteAllBytes($path, $newBytes)
}

# 1. Update style.css
$styleOld = '.trainers-grid {' + "
" + '  display: grid;' + "
" + '  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));' + "
" + '  gap: 22px' + "
" + '}'
$styleNew = ".trainers-grid {
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
Replace-StringBytes -path 'css/style.css' -old $styleOld -new $styleNew

# 2. Update dashboard.css
Replace-StringBytes -path 'css/dashboard.css' -old '#services-container, #packages-container { grid-template-columns: 1fr !important; }' -new '#services-container, #packages-container { grid-template-columns: 1fr 1fr !important; }'
Replace-StringBytes -path 'css/dashboard.css' -old '.dash-card, .cat-card, .card, .profile-layout, .db-modal, #services-container, #packages-container, form, input, textarea { max-width: 100% !important; box-sizing: border-box !important; }' -new '.db-card, .dash-card, .cat-card, .card, .profile-layout, .db-modal, #services-container, #packages-container, form, input, textarea { max-width: 100% !important; box-sizing: border-box !important; }'
Replace-StringBytes -path 'css/dashboard.css' -old '  /* Enforce single column for dashboard grids that overflow */' -new "  #save-profile-btn { width: 60% !important; margin: 0 auto !important; display: block !important; }
  /* Enforce single column for dashboard grids that overflow */"

# Append to dashboard.css safely
$bytes = [System.IO.File]::ReadAllBytes('css/dashboard.css')
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$text += "

/* Hide global mobile nav on dashboard */
.mobile-nav, .nav-overlay { display: none !important; }
"
$newBytes = [System.Text.Encoding]::UTF8.GetBytes($text)
[System.IO.File]::WriteAllBytes('css/dashboard.css', $newBytes)

# 3. Update dashboard.html
Replace-RegexBytes -path 'dashboard.html' -pattern '(?s)<div class="logo-area">.*?<a href="index\.html">.*?<button class="mobile-menu-btn" onclick="toggleSidebar\(\)" id="mob-menu-btn">.*?</button>.*?<img src="img/logo\.svg" alt="World Trainer Form Logo" style="height:34px; margin-right:8px;">.*?<div class="logo-txt">World Trainer <span>Form</span></div>.*?</a>.*?</div>' -replacement '<div class="logo-area" style="display:flex; align-items:center;"><button class="mobile-menu-btn" onclick="toggleSidebar()" id="mob-menu-btn" style="margin-right:10px;">&#9776;</button><a href="index.html" style="display:flex; align-items:center; text-decoration:none;"><img src="img/logo.svg" alt="World Trainer Form Logo" style="height:34px; margin-right:8px;"><div class="logo-txt">World Trainer <span>Form</span></div></a></div>'

