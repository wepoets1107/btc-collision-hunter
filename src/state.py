"""状态管理：counter 持久化与恢复"""

import json
import os
from config import STATE_FILE


def load():
    """从文件恢复 counter，文件不存在则返回 0"""
    if not os.path.exists(STATE_FILE):
        return 0

    with open(STATE_FILE, "r") as f:
        data = json.load(f)
        return data.get("counter", 0)


def save(counter, hits, started_at, extra_hit_info=None):
    """写状态文件（原子写入）"""
    data = {
        "counter": counter,
        "hits": hits,
        "started_at": started_at,
        "last_updated_at": __import__("time").strftime(
            "%Y-%m-%dT%H:%M:%S%z"
        ),
    }
    if extra_hit_info:
        data["last_hit"] = extra_hit_info

    tmp = STATE_FILE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, STATE_FILE)
