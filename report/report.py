#!/usr/bin/env python3
"""
向 GitHub Issue #1 汇报本地运行状态

Token 发现顺序：
  1. $GITHUB_TOKEN 环境变量
  2. gh auth token（gh CLI 登录态）

重试：最多 3 次，指数退避
"""
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

STATE_FILE = "dashboard/data/state.json"
ISSUE_URL = "https://api.github.com/repos/wepoets1107/btc-collision-hunter/issues/1/comments"
MAX_RETRIES = 3
RETRY_BASE_DELAY = 2  # seconds


def get_token():
    """获取 GITHUB_TOKEN：先查环境变量，再试 gh CLI"""
    env_token = os.environ.get("GITHUB_TOKEN")
    if env_token:
        return env_token

    try:
        result = subprocess.run(
            ["gh", "auth", "token"],
            capture_output=True, text=True, timeout=5,
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    return None


def build_body(state, node_id, date_str):
    """构造 Issue 评论内容"""
    counter = state["counter"]
    return (
        f"📡 节点 `{node_id}`\n"
        f"🕐 {date_str}\n"
        f"✅ 上次运行至 `{counter}` 个地址\n"
        f"📊 累计已检查 `{counter}` 个地址\n\n"
        f"新参与者请在 Issue #1 中回复时附上自己的起始 counter，以便全球计数汇总。"
    )


def post_comment(token, body):
    """POST 到 Issue，带重试"""
    payload = json.dumps({"body": body}).encode()
    req = urllib.request.Request(
        ISSUE_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )

    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = urllib.request.urlopen(req, timeout=10)
            print(f"Reported: HTTP {resp.status}")
            return True
        except urllib.error.HTTPError as e:
            # 4xx 非重试可恢复的不再重试
            if 400 <= e.code < 500 and e.code not in (429,):
                print(f"HTTP {e.code}: {e.reason}", file=sys.stderr)
                return False
            last_err = e
        except (urllib.error.URLError, OSError) as e:
            last_err = e

        if attempt < MAX_RETRIES:
            delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
            print(f"Retry {attempt}/{MAX_RETRIES} after {delay}s ...", file=sys.stderr)
            time.sleep(delay)

    print(f"Failed after {MAX_RETRIES} attempts: {last_err}", file=sys.stderr)
    return False


def main():
    if not os.path.exists(STATE_FILE):
        print("state.json not found", file=sys.stderr)
        sys.exit(1)

    with open(STATE_FILE) as f:
        state = json.load(f)

    counter = state.get("counter", "?")
    node_id = os.environ.get("NODE_ID", "icefire-server")
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    token = get_token()
    if not token:
        print(f"GITHUB_TOKEN not set and gh CLI unavailable, dry run: counter={counter}")
        # dry-run 也输出现状，方便调试
        print(f"  node:  {node_id}")
        print(f"  time:  {date_str}")
        print(f"  state: {json.dumps(state, indent=2)}")
        return

    body = build_body(state, node_id, date_str)
    success = post_comment(token, body)

    if success:
        print(f"Done: counter={counter}")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
