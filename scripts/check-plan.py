"""Check package dependency DAG, declared waves and local K anchors."""
from pathlib import Path
import re
cards = {}
for path in Path('docs/plan').glob('K*.md'):
    for match in re.finditer(r'^## (K\d\d-\d\d) ·[^\n]*\n(.*?)(?=^## K|\Z)', path.read_text(), re.M | re.S):
        body = match[2]
        dep = re.search(r'^\*\*Başlamadan önce.*?:\*\* (.*)', body, re.M)
        wave = re.search(r'\*\*Dalga:\*\* (\d+)', body)
        cards[match[1]] = (set(re.findall(r'\[(K\d\d-\d\d)\]', dep[1] if dep else '')), int(wave[1]))
depths = {}
def visit(key, stack=()):
    if key in stack:
        raise ValueError(f'Dependency cycle: {stack + (key,)}')
    if key not in depths:
        deps, wave = cards[key]
        depths[key] = max((visit(dep, stack + (key,)) + 1 for dep in deps), default=0)
        if depths[key] != wave:
            raise ValueError(f'{key}: declared wave {wave}, expected {depths[key]}')
    return depths[key]
for key in cards:
    visit(key)
for path in Path('docs/plan').glob('*.md'):
    for url in re.findall(r'\]\(([^)]+)\)', path.read_text()):
        if '://' in url or url.startswith('#'):
            continue
        file, _, anchor = url.partition('#')
        target = path.parent / file
        if not target.exists():
            raise ValueError(f'{path}: missing {url}')
        if re.fullmatch(r'K\d\d-\d\d', anchor) and f'id="{anchor}"' not in target.read_text():
            raise ValueError(f'{path}: missing anchor {url}')
print(f'{len(cards)} packages; DAG and waves valid; local links valid.')
