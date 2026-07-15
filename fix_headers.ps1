$utf8 = [System.Text.Encoding]::UTF8
$indexContent = [System.IO.File]::ReadAllText("index.html", $utf8)
$navMatch = [regex]::Match($indexContent, '(?s)(<!-- ═══ NAVBAR ═══ -->.*?)</nav>')
$navHtml = $navMatch.Groups[1].Value + '</nav>'

$mobMatch = [regex]::Match($indexContent, '(?s)(<!-- Mobile Nav Drawer -->\s*<div class="mobile-nav" id="mobile-nav">.*?</div>\s*<!-- Overlay -->)')
$mobHtml = $mobMatch.Groups[1].Value

$overlayMatch = [regex]::Match($indexContent, '<div class="nav-overlay"[^>]*></div>')
if (-not $mobHtml.Contains($overlayMatch.Groups[0].Value)) {
    $mobHtml += "`n  " + $overlayMatch.Groups[0].Value
}

$fullNavHtml = $navHtml + "`n`n  " + $mobHtml

$cssContent = [System.IO.File]::ReadAllText("css/style.css", $utf8)
$btnCss = [regex]::Match($cssContent, '(?s)/\* ══ BUTTONS ══ \*/.*?(?=/\* ══)').Groups[0].Value
$navCss = [regex]::Match($cssContent, '(?s)/\* ══ NAVBAR ══ \*/.*?(?=/\* ══)').Groups[0].Value
$mobCss = [regex]::Match($cssContent, '(?s)/\* ══ MOBILE NAV ══ \*/.*?(?=/\* ══)').Groups[0].Value

$mqCss = @"
    @media (max-width: 900px) {
      .nav-links { display: none; }
      .ham-btn { display: flex; }
      #btn-login, #btn-signup, #btn-logout { display: none; }
    }
"@

$injectedCss = "`n`n    /* --- INJECTED NAV CSS --- */`n" + $btnCss + "`n" + $navCss + "`n" + $mobCss + "`n" + $mqCss + "`n    /* ------------------------ */`n"

$pages = @(
    @("certificates.html", "nl-cats"),
    @("news-events.html", "nl-pricing"),
    @("blog.html", "nl-blog")
)

foreach ($page in $pages) {
    $file = $page[0]
    $activeId = $page[1]
    
    $content = [System.IO.File]::ReadAllText($file, $utf8)
    
    $content = $content -replace '(?s)<header>.*?</header>', $fullNavHtml
    
    # Remove active class from home
    $content = $content.Replace('id="nl-home" href="index.html" class="active"', 'id="nl-home" href="index.html"')
    # Add active to the specific page
    $content = $content -replace ('id="' + $activeId + '" href="([^"]+)"'), ('id="' + $activeId + '" href="$1" class="active"')
    
    # Remove old header styles
    $content = $content -replace '(?s)\s*header\s*\{[^}]*\}\s*\.nav-wrap\s*\{[^}]*\}\s*\.logo\s*\{[^}]*\}\s*header nav\s*\{[^}]*\}\s*header ul\s*\{[^}]*\}\s*header li\s*\{[^}]*\}\s*header a\s*\{[^}]*\}\s*header a:hover\s*\{[^}]*\}\s*\.nav-cta\s*\{[^}]*\}\s*\.nav-cta:hover\s*\{[^}]*\}\s*\.menu-btn\s*\{[^}]*\}', ''
    
    $content = $content.Replace("</style>", $injectedCss + "</style>")
    
    [System.IO.File]::WriteAllText($file, $content, $utf8)
    Write-Host "Updated $file (UTF-8 safe)"
}
