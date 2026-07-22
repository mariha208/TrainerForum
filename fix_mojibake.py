# -*- coding: utf-8 -*-
import os

files = ['certificates.html', 'news-events.html', 'blog.html']

for fn in files:
    fpath = os.path.join(r'c:\Users\The Mars\Desktop\trainers', fn)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    # Replace double-encoded Mojibake strings
    content = content.replace('Ã¢â‚¬â€', '—')
    content = content.replace('Ã¢â€ â€™', '→')
    content = content.replace('Ã¢Â­Â ', '⭐')
    content = content.replace('Ã¢â€¢Â ', '═')
    content = content.replace('Ã¢Ëœâ€¦', '★')
    content = content.replace('Ã¢Å“â€œ', '✓')
    content = content.replace('24Ã¢â‚¬â€œ72h', '24-72h')
    content = content.replace('24Ã¢â‚¬â€œ72 hours', '24-72 hours')
    content = content.replace('Ã¢â‚¬â€œ', '-')

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully cleaned {fn}")
