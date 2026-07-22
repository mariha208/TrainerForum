#!/usr/bin/env python3
"""
inject_footer.py
Adds <script src="js/footer.js"></script> to every .html file in the
trainers directory that does not already have it, just before </body>.
"""

import os
import re

ROOT = r'c:\Users\The Mars\Desktop\trainers'
SCRIPT_TAG = '<script src="js/footer.js"></script>'

# Pages to SKIP (admin-only, non-public, already handled, etc.)
SKIP_FILES = {'dashboard.html', 'admin.html'}

added   = []
skipped = []
already = []

for fname in sorted(os.listdir(ROOT)):
    if not fname.endswith('.html'):
        continue
    if fname in SKIP_FILES:
        skipped.append(fname)
        continue

    fpath = os.path.join(ROOT, fname)
    with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()

    # Already injected?
    if 'footer.js' in content:
        already.append(fname)
        continue

    # Insert just before </body> (case-insensitive)
    new_content, count = re.subn(
        r'(</body\s*>)',
        f'  {SCRIPT_TAG}\n\\1',
        content,
        count=1,
        flags=re.IGNORECASE
    )

    if count == 0:
        # No </body> found — append at end
        new_content = content + f'\n  {SCRIPT_TAG}\n'

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    added.append(fname)

print(f'\n✅  footer.js injected into {len(added)} files:')
for fn in added:
    print(f'   + {fn}')

if already:
    print(f'\n⏭️   Already had footer.js ({len(already)} files):')
    for fn in already:
        print(f'   ~ {fn}')

if skipped:
    print(f'\n⏩  Skipped ({len(skipped)} files):')
    for fn in skipped:
        print(f'   - {fn}')

print('\nDone.')
