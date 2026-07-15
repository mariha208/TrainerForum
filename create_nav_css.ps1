$utf8 = [System.Text.Encoding]::UTF8
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

$navFileCss = $btnCss + "`n" + $navCss + "`n" + $mobCss + "`n" + $mqCss
[System.IO.File]::WriteAllText("css/nav.css", $navFileCss, $utf8)
Write-Host "Created css/nav.css"
