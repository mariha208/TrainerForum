"""
Fix public page headers:
1. Replace mojibake emoji with HTML entities
2. Fix viewport meta on pages missing maximum-scale
"""
import os

BASE = r"C:\Users\The Mars\Desktop\trainers"

PUBLIC_PAGES = [
    "about.html",
    "find-trainers.html",
    "certificates.html",
    "news-events.html",
    "blog.html",
    "index.html",
]

# Each tuple: (mojibake_string, html_entity_replacement)
# The mojibake strings are what appear when UTF-8 emoji bytes
# are interpreted as Windows-1252
EMOJI_FIXES = [
    ("\u00f0\u0178\u201c\u201c", "&#128276;"),   # 🔔 bell
    ("\u00f0\u0178\u201c\u2026", "&#128197;"),   # 📅 calendar
    ("\u00f0\u0178\u2019\u00ab", "&#128172;"),   # 💬 speech bubble
    ("\u00f0\u0178\u017d\u2030", "&#127881;"),   # 🎉 party popper
    ("\u00f0\u0178\u201c\u008d", "&#128269;"),   # 🔍 search
    ("\u00e2\u00ad\u0090",       "&#11088;"),    # ⭐ star
]

VIEWPORT_OLD = 'content="width=device-width, initial-scale=1.0"'
VIEWPORT_NEW = 'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"'

fixed = []
for page in PUBLIC_PAGES:
    path = os.path.join(BASE, page)
    if not os.path.exists(path):
        print(f"SKIP (not found): {page}")
        continue

    with open(path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    original = content

    # Fix emoji mojibake
    for mojibake, entity in EMOJI_FIXES:
        content = content.replace(mojibake, entity)

    # Fix viewport (only if the old pattern is present without maximum-scale already)
    if VIEWPORT_OLD in content:
        content = content.replace(VIEWPORT_OLD, VIEWPORT_NEW)

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        fixed.append(page)
        print(f"Fixed: {page}")
    else:
        print(f"No change: {page}")

print(f"\nDone. Fixed {len(fixed)} file(s): {', '.join(fixed)}")
