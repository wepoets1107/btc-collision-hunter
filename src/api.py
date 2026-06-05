"""区块链余额查询 API 封装"""

import json
import time
import urllib.request
from config import API_URL, API_TIMEOUT, API_MAX_RETRIES, API_RETRY_DELAY


def check_balances(addresses):
    """
    批量查询地址余额
    返回: { address: balance_satoshi, ... }
    出错时返回 None
    """
    url = API_URL.format(addrs="|".join(addresses))

    for attempt in range(API_MAX_RETRIES):
        try:
            req = urllib.request.urlopen(url, timeout=API_TIMEOUT)
            data = json.loads(req.read())
            result = {}
            for addr_str, info in data.items():
                result[addr_str] = info.get("final_balance", 0)
            return result
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = API_RETRY_DELAY * (attempt + 1) * 2
            elif e.code == 403:
                # 可能被 ban，等久一点
                wait = 30
            else:
                wait = API_RETRY_DELAY
            time.sleep(wait)
        except Exception:
            time.sleep(API_RETRY_DELAY)

    return None
