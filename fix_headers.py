import re

def fix_pages():
    # 1. Read index.html to extract navigation HTML
    with open('index.html', 'r', encoding='utf-8') as f:
        idx_content = f.read()
    
    nav_match = re.search(r'(<!-- ═══ NAVBAR ═══ -->.*?)</nav>', idx_content, re.DOTALL)
    nav_html = nav_match.group(1) + '</nav>'
    
    mob_match = re.search(r'(<!-- Mobile Nav Drawer -->\s*<div class="mobile-nav" id="mobile-nav">.*?</div>\s*<!-- Overlay -->)', idx_content, re.DOTALL)
    mob_html = mob_match.group(1) if mob_match else ''
    overlay_match = re.search(r'<div class="nav-overlay"[^>]*></div>', idx_content)
    if overlay_match and overlay_match.group(0) not in mob_html:
        mob_html += '\n  ' + overlay_match.group(0)
        
    full_nav_html = nav_html + '\n\n  ' + mob_html
    
    # 2. Extract CSS for nav and buttons from style.css
    with open('css/style.css', 'r', encoding='utf-8') as f:
        css_content = f.read()
        
    btn_css_match = re.search(r'/\* ══ BUTTONS ══ \*/.*?(?=/\* ══)', css_content, re.DOTALL)
    btn_css = btn_css_match.group(0) if btn_css_match else ''
    
    nav_css_match = re.search(r'/\* ══ NAVBAR ══ \*/.*?(?=/\* ══)', css_content, re.DOTALL)
    nav_css = nav_css_match.group(0) if nav_css_match else ''
    
    mob_css_match = re.search(r'/\* ══ MOBILE NAV ══ \*/.*?(?=/\* ══)', css_content, re.DOTALL)
    mob_css = mob_css_match.group(0) if mob_css_match else ''
    
    mq_css = """
    @media (max-width: 900px) {
      .nav-links { display: none; }
      .ham-btn { display: flex; }
      #btn-login, #btn-signup, #btn-logout { display: none; }
    }
    """
    
    injected_css = "\n\n    /* --- INJECTED NAV CSS --- */\n" + btn_css + "\n" + nav_css + "\n" + mob_css + "\n" + mq_css + "\n    /* ------------------------ */\n"
    
    pages = [
        ('certificates.html', 'nl-cats'),
        ('news-events.html', 'nl-pricing'),
        ('blog.html', 'nl-blog')
    ]
    
    for page, active_id in pages:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace <header> block
        content = re.sub(r'<header>.*?</header>', full_nav_html, content, flags=re.DOTALL)
        
        # Set active class
        content = re.sub(r'id="nl-home" href="index.html" class="active"', 'id="nl-home" href="index.html"', content)
        content = re.sub(r'id="' + active_id + r'" href="([^"]+)"', r'id="' + active_id + r'" href="\1" class="active"', content)
        
        # Replace CSS: remove old header and nav-wrap css
        content = re.sub(r'\s*header\s*\{[^}]*\}\s*\.nav-wrap\s*\{[^}]*\}\s*\.logo\s*\{[^}]*\}\s*header nav\s*\{[^}]*\}\s*header ul\s*\{[^}]*\}\s*header li\s*\{[^}]*\}\s*header a\s*\{[^}]*\}\s*header a:hover\s*\{[^}]*\}\s*\.nav-cta\s*\{[^}]*\}\s*\.nav-cta:hover\s*\{[^}]*\}\s*\.menu-btn\s*\{[^}]*\}', '', content, flags=re.DOTALL)
        
        # Inject our CSS into the <style> block, right before </style>
        content = content.replace('</style>', injected_css + '</style>')
        
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Updated {page}")

if __name__ == '__main__':
    fix_pages()
