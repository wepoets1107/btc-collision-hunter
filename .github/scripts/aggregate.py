#!/usr/bin/env python3
"""Aggregate counters from Issue #1 comments and write global.json"""

import json
import os
import re
import urllib.request

GH_TOKEN = os.environ.get("GH_TOKEN", "")
if not GH_TOKEN:
    print("GH_TOKEN not set")
    exit(1)

# Fetch all Issue #1 comments
url = "https://api.github.com/repos/wepoets1107/btc-collision-hunter/issues/1/comments?per_page=100"
req = urllib.request.Request(
    url,
    headers={
        "Authorization": "Bearer " + GH_TOKEN,
        "Accept": "application/vnd.github.v3+json",
    },
)
resp = urllib.request.urlopen(req)
comments = json.loads(resp.read())

total = 0
last_updated = ""
for c in comments:
    body = c.get("body", "")
    # 新格式：累计已检查 \`123\` → 优先匹配
    m = re.search(r"累计已检查[\s\`]+(\d+)", body)
    # 旧格式兼容
    if not m:
        m = re.search(r"已检查[\s\`]+(\d+)", body)
    if m:
        total += int(m.group(1))
        last_updated = c.get("created_at", "")

# Write global.json
os.makedirs("dashboard/data", exist_ok=True)
with open("dashboard/data/global.json", "w") as f:
    json.dump(
        {"global_counter": total, "updated_at": last_updated}, f, indent=2
    )
print(f"Aggregated: {total} from {len(comments)} comments")
