import json, os, re
cfg = json.load(open('vercel.json'))
dests = {r['destination'] for r in cfg['rewrites']}
found = []
for root, _, files in os.walk('public'):
    for f in files:
        if not f.endswith('.html') or f == 'index.html':
            continue
        rel = '/' + os.path.relpath(os.path.join(root, f), 'public').replace(os.sep, '/')
        if rel not in dests:
            s = open(os.path.join(root, f), encoding='utf-8', errors='replace').read()
            w = len(re.sub(r'<[^>]+>', ' ',
                    re.sub(r'<(script|style).*?</\1>', '', s, flags=re.S)).split())
            found.append((rel, w))
if not found:
    print("  none - every html file is routed")
for rel, w in sorted(found, key=lambda x: -x[1]):
    print(f"  {rel:<50} {w:>5} words  NOT SERVED")
