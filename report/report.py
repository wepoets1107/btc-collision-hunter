#!/usr/bin/env python3
"""向 GitHub Issue #1 汇报本地运行状态"""
import json
import os
import sys
import urllib.request

STATE_FILE = "dashboard/data/state.json"
ISSUE_URL = "https://api.github.com/repos/wepoets1107/btc-collision-hunter/issues/1/comments"

def main():
    if not os.path.exists(STATE_FILE):
        print("state.json not found")
        sys.exit(1)

    with open(STATE_FILE) as f:
        state = json.load(f)

    counter = state["counter"]
    node_id = os.environ.get("NODE_ID", "icefire-server")
    date = __import__("datetime").datetime.now().strftime("%Y-%m-%d %H:%M UTC%z")

    token = os.environ.get("GITHUB_TOKEN") or os.popen("gh auth token 2>/dev/null").read().strip()

    if not token:
        print(f"GITHUB_TOKEN not set, dry run: counter={counter}")
        return

    body = (
        f"📡 节点 `{node_id}`\n"
        f"🕐 {date}\n"
        f"✅ 上次运行至 `{counter}` 个地址\n"
        f"📊 累计已检查 `{counter}` 个地址\n\n"
        f"新参与者请在 Issue #1 中回复时附上自己的起始 counter，以便全球计数汇总。"
    )

    payload = json.dumps({"body": body}).encode()
    req = urllib.request.Request(
        ISSUE_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )

    resp = urllib.request.urlopen(req)
    print(f"Reported: counter={counter} (HTTP {resp.status})")

if __name__ == "__main__":
    main()
