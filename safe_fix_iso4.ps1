function Replace-ExactBytes {
    param([string]$path, [string]$old, [string]$new)
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $enc = [System.Text.Encoding]::GetEncoding('iso-8859-1')
    $text = $enc.GetString($bytes)
    
    $text = $text.Replace($old, $new)
    
    $newBytes = $enc.GetBytes($text)
    [System.IO.File]::WriteAllBytes($path, $newBytes)
}

$dashOld = '    <div class="logo-area" href="index.html">' + "
" + '      <button class="mobile-menu-btn" onclick="toggleSidebar()" id="mob-menu-btn">?</button>' + "
" + '      <img src="img/logo.svg" alt="World Trainer Form Logo" style="height:34px; margin-right:8px;">' + "
" + '      <div class="logo-txt">World Trainer <span>Form</span></div>' + "
" + '    </div>'

$dashNew = '    <div class="logo-area" style="display:flex; align-items:center;">' + "
" + '      <button class="mobile-menu-btn" onclick="toggleSidebar()" id="mob-menu-btn" style="margin-right:10px;">&#9776;</button>' + "
" + '      <a href="index.html" style="display:flex; align-items:center; text-decoration:none;">' + "
" + '        <img src="img/logo.svg" alt="World Trainer Form Logo" style="height:34px; margin-right:8px;">' + "
" + '        <div class="logo-txt">World Trainer <span>Form</span></div>' + "
" + '      </a>' + "
" + '    </div>'

Replace-ExactBytes -path 'dashboard.html' -old $dashOld -new $dashNew

