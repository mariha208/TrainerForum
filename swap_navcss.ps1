$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$pages = @("certificates.html", "news-events.html", "blog.html")

foreach ($file in $pages) {
    $content = [System.IO.File]::ReadAllText($file, $utf8NoBom)
    
    # Replace link to nav.css with link to style.css (which has the actual nav styles)
    if ($content -match 'css/nav\.css' -and -not ($content -match 'css/style\.css')) {
        $content = $content -replace 'css/nav\.css', 'css/style.css'
        [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
        Write-Host "Swapped nav.css -> style.css in: $file"
    } elseif ($content -match 'css/style\.css') {
        Write-Host "$file already has style.css"
    } else {
        # Add style.css link before auth-modal.css
        $content = $content -replace '(<link rel="stylesheet" href="css/auth-modal\.css">)', '<link rel="stylesheet" href="css/style.css">' + "`n  " + '$1'
        [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
        Write-Host "Added style.css to: $file"
    }
}
