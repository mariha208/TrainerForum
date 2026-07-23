$htmlFiles = Get-ChildItem -Path "c:\Users\The Mars\Desktop\trainers" -Filter "*.html"

$blogLink = '<li><a id="nl-blog" href="blog.html">Blog</a></li>'
$contactLink = "`r`n      <li><a id=`"nl-contact`" href=`"contact.html`">Contact</a></li>"
$desktopBlog = '<li><a href="blog.html" ${currentPage===''blog.html''?''class="active"'':''''}>Blog</a></li>'
$desktopContact = "`r`n    <li><a href=`"contact.html`" `${currentPage==='contact.html'?'class=`"active`"':''}>Contact</a></li>"
$mobileBlog = '              <li><a href="blog.html">Blog</a></li>'
$mobileContact = "`r`n              <li><a href=`"contact.html`">Contact</a></li>"

$updated = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content.Contains($blogLink) -and -not $content.Contains("nl-contact")) {
        $newContent = $content.Replace($blogLink, $blogLink + $contactLink)
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated nav in $($file.Name)"
        $updated++
    }
}

Write-Host "Total HTML files updated: $updated"

$sharedJsPath = "c:\Users\The Mars\Desktop\trainers\js\shared.js"
if (Test-Path $sharedJsPath) {
    $sharedJsContent = Get-Content $sharedJsPath -Raw
    
    $changed = $false
    
    if ($sharedJsContent.Contains($desktopBlog) -and -not $sharedJsContent.Contains("contact.html")) {
        $sharedJsContent = $sharedJsContent.Replace($desktopBlog, $desktopBlog + $desktopContact)
        Write-Host "Updated desktop nav in js/shared.js"
        $changed = $true
    }
    
    if ($sharedJsContent.Contains($mobileBlog) -and -not $sharedJsContent.Contains($mobileContact.Trim())) {
        $sharedJsContent = $sharedJsContent.Replace($mobileBlog, $mobileBlog + $mobileContact)
        Write-Host "Updated mobile nav in js/shared.js"
        $changed = $true
    }
    
    if ($changed) {
        Set-Content -Path $sharedJsPath -Value $sharedJsContent -NoNewline
    }
}
