$utf8 = [System.Text.Encoding]::UTF8
$cssFile = "css/about.css"
$content = [System.IO.File]::ReadAllText($cssFile, $utf8)

$cssFix = @"

/* ══ FIX DARK SECTION TEXT VISIBILITY ══ */
.hero h1,
.hero h2,
.hero h3,
.hero h4,
.promise-section h1,
.promise-section h2,
.promise-section h3,
.promise-section h4,
.section--navy .benefit-block h4 {
  color: var(--ivory, #FAF6EC) !important;
}

.hero p,
.hero .lead,
.promise-section p,
.promise-section .lead,
.section--navy .benefit-block p {
  color: rgba(250, 246, 236, 0.75) !important;
}

.hero .eyebrow,
.promise-section .eyebrow {
  color: var(--gold-light, #E7C878) !important;
}
"@

if (-not $content.Contains("FIX DARK SECTION TEXT VISIBILITY")) {
    $content += $cssFix
    [System.IO.File]::WriteAllText($cssFile, $content, $utf8)
    Write-Host "Appended text color fixes to css/about.css"
} else {
    Write-Host "Fixes already present in css/about.css"
}
