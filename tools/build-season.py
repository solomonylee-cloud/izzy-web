#!/usr/bin/env python3
"""Write data/season.json from the season-calendar agent's table (consumer prod `resort_season_status`).

    python3 tools/build-season.py rows.json [path/to/SkiBuddyGemini/src/data/resorts.ts]

rows.json = a JSON array of {resort_id, projected_open_date, opened_on, projected_close_date, closed_on,
verified} for the current season (a read-only query; this script never touches a database). The page
matches a row by the resort's lower-cased catalog name (the `data-name` build-resorts.py writes), so
this uses the same catalog and the same MERGE rule. A slug the catalog does not have is listed and skipped.
"""
import datetime, json, re, sys

ROWS = sys.argv[1]
SRC = sys.argv[2] if len(sys.argv) > 2 else '../SkiBuddyGemini/src/data/resorts.ts'
MERGE = {'boston-mills': 'Boston Mills / Brandywine', 'brandywine': 'Boston Mills / Brandywine'}

src = re.sub(r'//[^\n]*', '', open(SRC, encoding='utf-8').read())
names = {i: n.replace("\\'", "'") for i, n in re.findall(r"\{\s*id:\s*'([^']+)',\s*name:\s*'((?:[^'\\]|\\.)+)'", src)}
names.update(MERGE)

out, skipped = {}, []
for r in json.load(open(ROWS, encoding='utf-8')):
    name = names.get(r['resort_id'])
    if not name:
        skipped.append(r['resort_id']); continue
    e = {'resort': name, 'opening_date': r.get('opened_on') or r.get('projected_open_date'),
         'opened': bool(r.get('opened_on')), 'closing_date': r.get('closed_on') or r.get('projected_close_date'),
         'as_of': r.get('verified')}
    if not e['opening_date']:
        continue
    prev = out.get(name)  # merged card: an opened row wins, then the earlier date
    if prev is None or (e['opened'], prev['opening_date']) > (prev['opened'], e['opening_date']):
        out[name] = e

doc = {'generated': datetime.date.today().isoformat(), 'source': 'season calendar', 'season': sorted(out.values(), key=lambda e: e['resort'].lower())}
json.dump(doc, open('data/season.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
open('data/season.json', 'a').write('\n')
print(f"data/season.json: {len(doc['season'])} resorts; skipped (not in catalog): {skipped or 'none'}")
