#!/usr/bin/env python3
"""
比特币碰撞猎手 🦐
确定性私钥派生 → 地址 → 查余额 → 记录
永不重复，不存私钥，全凭运气
"""

import hashlib
import hmac
import time
from hashlib import sha256

import base58
from coincurve import PrivateKey

from config import (
    HMAC_KEY,
    BATCH_SIZE,
    MAX_BATCHES_PER_SEC,
    MAX_RUN_HOURS,
    LOG_FILE,
)
from state import load, save
from api import check_balances


def derive_privkey(counter: int) -> bytes:
    """用 HMAC-SHA256 从 counter 派生 32 字节私钥"""
    h = hmac.new(HMAC_KEY, str(counter).encode(), "sha256")
    return h.digest()


def privkey_to_address(priv_bytes: bytes) -> str:
    """私钥 → 压缩公钥 → SHA256 → RIPEMD160 → Base58Check 地址"""
    pk = PrivateKey(priv_bytes)
    pub_compressed = pk.public_key.format()
    h = sha256(pub_compressed).digest()
    r = hashlib.new("ripemd160", h).digest()
    net = b"\x00" + r
    c = sha256(sha256(net).digest()).digest()[:4]
    return base58.b58encode(net + c).decode()


def log_entry(counter: int, addr: str, balance: int):
    """追加一行运行日志"""
    with open(LOG_FILE, "a") as f:
        f.write(f"{counter}\t{addr[:12]}...\t{balance}\n")


def log_hit(counter: int, priv_hex: str, addr: str, balance: int):
    """撞到有余额的地址（理论上不会发生）"""
    with open("HIT.txt", "a") as f:
        f.write(f"=== HIT! ===\ncounter={counter}\npriv={priv_hex}\naddr={addr}\nbalance={balance}\n\n")


def privkey_to_pubkey(priv_bytes: bytes) -> str:
    """私钥 → 压缩公钥 hex"""
    pk = PrivateKey(priv_bytes)
    return pk.public_key.format().hex()


def main():
    print("🦐 Bitcoin Collision Hunter 启动")
    print("  速率限制: {} addr/s".format(BATCH_SIZE * MAX_BATCHES_PER_SEC))

    counter = load()
    if counter == 0:
        started_at = time.strftime("%Y-%m-%dT%H:%M:%S%z")
        print("  全新启动")
    else:
        started_at = None  # 从文件读入时会带
        print(f"  从 counter={counter} 恢复")

    hits = 0
    hits_log = []  # 记录所有命中详情
    batch_times = []

    run_deadline = time.time() + MAX_RUN_HOURS * 3600

    while time.time() < run_deadline:
        batch_start = time.time()

        # 1. 生成一批地址
        batch = []
        privs = {}
        for i in range(BATCH_SIZE):
            c = counter + i
            priv = derive_privkey(c)
            addr = privkey_to_address(priv)
            batch.append(addr)
            privs[addr] = (c, priv.hex())

        # 2. 查余额
        results = check_balances(batch)

        if results is None:
            print("  ⚠ API 查询失败，等待重试...")
            time.sleep(5)
            continue

        # 3. 检查是否有余额
        for addr, balance in results.items():
            if balance > 0:
                c, p_hex = privs[addr]
                priv_bytes = derive_privkey(c)
                pub_hex = privkey_to_pubkey(priv_bytes)
                hit_record = {
                    "counter": c,
                    "priv": p_hex,
                    "pub": pub_hex,
                    "addr": addr,
                    "balance": balance,
                    "discovered_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                }
                print(f"  🚨 HIT! counter={c} priv={p_hex[:16]}... addr={addr} balance={balance}")
                log_hit(c, p_hex, addr, balance)
                hits_log.append(hit_record)
                hits += 1

            # 日志只记录最近几条（不在文件里保留太多）
            if counter % 1000 < BATCH_SIZE:
                log_entry(counter, addr, balance)

        # 4. 更新 counter，只保留最新结果供面板读取
        prev_counter = counter
        counter += BATCH_SIZE

        # 每批保存一次状态
        if started_at is None:
            # 尝试从现有文件读取 start 时间
            try:
                import json
                with open("dashboard/data/state.json") as f:
                    existing = json.load(f)
                    started_at = existing.get("started_at")
            except Exception:
                pass
        if started_at is None:
            started_at = time.strftime("%Y-%m-%dT%H:%M:%S%z")

        save(counter, hits, started_at, {
            "counter": prev_counter,
            "priv": privs[batch[0]][1][:16] + "...",
            "addr": batch[0][:16] + "...",
        }, hits_log=hits_log if hits_log else None)

        # 5. 速率控制
        elapsed = time.time() - batch_start
        min_interval = 1.0 / MAX_BATCHES_PER_SEC
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)

        # 进度输出
        if counter % 10000 == 0:
            total_sec = time.time() - batch_start + (sum(batch_times) if batch_times else 0)
            rate = counter / (total_sec + 1)
            print(f"  📊 {counter:,} 地址已检查 ({rate:.0f}/s) | 命中: {hits}")


if __name__ == "__main__":
    main()
