$utf8 = [System.Text.Encoding]::UTF8
$indexContent = [System.IO.File]::ReadAllText("index.html", $utf8)

# Extract full nav HTML
$navMatch = [regex]::Match($indexContent, '(?s)(<!-- ═══ NAVBAR ═══ -->.*?)</nav>')
$navHtml = $navMatch.Groups[1].Value + '</nav>'
$mobMatch = [regex]::Match($indexContent, '(?s)(<!-- Mobile Nav Drawer -->\s*<div class="mobile-nav" id="mobile-nav">.*?</div>\s*<!-- Overlay -->)')
$mobHtml = $mobMatch.Groups[1].Value
$overlayMatch = [regex]::Match($indexContent, '<div class="nav-overlay"[^>]*></div>')
if (-not $mobHtml.Contains($overlayMatch.Groups[0].Value)) {
    $mobHtml += "`n  " + $overlayMatch.Groups[0].Value
}
$fullNavHtml = $navHtml + "`n`n  " + $mobHtml

$pages = @(
    @("certificates.html", "nl-cats"),
    @("news-events.html", "nl-pricing"),
    @("blog.html", "nl-blog")
)

foreach ($page in $pages) {
    $file = $page[0]
    $activeId = $page[1]
    
    $content = [System.IO.File]::ReadAllText($file, $utf8)
    
    # 1. Add <link rel="stylesheet" href="css/nav.css"> after <link rel="stylesheet"> or <style>
    if (-not $content.Contains("css/nav.css")) {
        $content = $content -replace '(?i)(<style>)', "<link rel=`"stylesheet`" href=`"css/nav.css`">`n  `$1"
    }
    
    # 2. Add auth-modal.css if not present
    if (-not $content.Contains("auth-modal.css")) {
        $content = $content -replace '(?i)(<style>)', "<link rel=`"stylesheet`" href=`"css/auth-modal.css`">`n  `$1"
    }
    
    # 3. Replace <header> with nav
    $content = $content -replace '(?s)<header>.*?</header>', $fullNavHtml
    
    # 4. Set active link correctly
    $content = $content.Replace('id="nl-home" href="index.html" class="active"', 'id="nl-home" href="index.html"')
    $content = $content -replace ('id="' + $activeId + '" href="([^"]+)"'), ('id="' + $activeId + '" href="$1" class="active"')
    
    # 5. Remove conflicting inline css
    $content = $content -replace '(?s)\s*header\s*\{[^}]*\}\s*\.nav-wrap\s*\{[^}]*\}\s*\.logo\s*\{[^}]*\}\s*header nav\s*\{[^}]*\}\s*header ul\s*\{[^}]*\}\s*header li\s*\{[^}]*\}\s*header a\s*\{[^}]*\}\s*header a:hover\s*\{[^}]*\}\s*\.nav-cta\s*\{[^}]*\}\s*\.nav-cta:hover\s*\{[^}]*\}\s*\.menu-btn\s*\{[^}]*\}', ''
    
    [System.IO.File]::WriteAllText($file, $content, $utf8)
    Write-Host "Replaced header in $file"
}
