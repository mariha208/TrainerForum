$files = Get-ChildItem -Filter *.html -Exclude "dashboard.html","admin.html","trainer-cards.html","public-profile.html"; $inject = @"
  <!-- Modals -->
  <div id="trainer-modal"></div>
  <div id="auth-modal"></div>

  <script src="js/app.js?v=4"></script>
  <script src="js/trainer-modal.js?v=4"></script>
  <script src="js/auth-modal.js"></script>
  <script src="js/theme.js"></script>
  <script>applyTheme();</script>
</body>
"@; foreach ($f in $files) { $content = Get-Content $f.FullName -Raw; if ($content -notlike "*js/app.js*") { $newContent = $content -replace "</body>", $inject; Set-Content -Path $f.FullName -Value $newContent -NoNewline; Write-Host "Injected $($f.Name)" } }
