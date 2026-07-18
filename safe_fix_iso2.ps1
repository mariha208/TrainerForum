function Replace-RegexExactBytes {
    param([string]$path, [string]$pattern, [string]$replacement)
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $enc = [System.Text.Encoding]::GetEncoding('iso-8859-1')
    $text = $enc.GetString($bytes)
    
    $text = [System.Text.RegularExpressions.Regex]::Replace($text, $pattern, $replacement)
    
    $newBytes = $enc.GetBytes($text)
    [System.IO.File]::WriteAllBytes($path, $newBytes)
}

$styleNew = ".trainers-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 22px;
}
@media (max-width: 1024px) {
  .trainers-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .trainers-grid { grid-template-columns: repeat(2, 1fr); }
}"
Replace-RegexExactBytes -path 'css/style.css' -pattern '(?s)\.trainers-grid\s*\{.*?gap:\s*22px\s*\}' -replacement $styleNew

