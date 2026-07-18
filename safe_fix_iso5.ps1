function Replace-RegexExactBytes {
    param([string]$path, [string]$pattern, [string]$replacement)
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $enc = [System.Text.Encoding]::GetEncoding('iso-8859-1')
    $text = $enc.GetString($bytes)
    
    $text = [System.Text.RegularExpressions.Regex]::Replace($text, $pattern, $replacement)
    
    $newBytes = $enc.GetBytes($text)
    [System.IO.File]::WriteAllBytes($path, $newBytes)
}

$dashNew = '<div class="logo-area" style="display:flex; align-items:center;">' + "
" + '      <button class="mobile-menu-btn" onclick="toggleSidebar()" id="mob-menu-btn" style="margin-right:10px;">&#9776;</button>' + "
" + '      <a href="index.html" style="display:flex; align-items:center; text-decoration:none;">' + "
" + '        <img src="img/logo.svg" alt="World Trainer Form Logo" style="height:34px; margin-right:8px;">' + "
" + '        <div class="logo-txt">World Trainer <span>Form</span></div>' + "
" + '      </a>' + "
" + '    </div>'

Replace-RegexExactBytes -path 'dashboard.html' -pattern '(?s)<div class="logo-area" href="index\.html">\s*<button class="mobile-menu-btn"[^>]*>.*?</button>\s*<img src="img/logo\.svg"[^>]*>\s*<div class="logo-txt">World Trainer <span>Form</span></div>\s*</div>' -replacement $dashNew

