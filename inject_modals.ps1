$utf8 = [System.Text.Encoding]::UTF8
$pages = @("certificates.html", "news-events.html", "blog.html")

$modalHtml = @"

  <!-- Auth Modals & Scripts for Navigation -->
  <div id="auth-modal"></div>
  <script src="js/auth-modal.js"></script>
  <script src="js/mobile-nav.js"></script>

</body>
"@

foreach ($file in $pages) {
    $content = [System.IO.File]::ReadAllText($file, $utf8)
    
    # Check if we already injected it
    if (-not $content.Contains('<div id="auth-modal"></div>')) {
        $content = $content -replace '(?i)\s*</body>', $modalHtml
        [System.IO.File]::WriteAllText($file, $content, $utf8)
        Write-Host "Injected modals to $file"
    } else {
        Write-Host "$file already has modals"
    }
}
