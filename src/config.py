# 配置

# 计数器派生私钥的命名空间，改这个可做分叉/分轮
HMAC_KEY = b"btc_collision_hunter_v1"

# 单次批量检查的地址数
BATCH_SIZE = 100

# 每秒最多几批（配合 BATCH_SIZE 控制总速度）
MAX_BATCHES_PER_SEC = 0.1  # 10 addr/s (每10秒一批100个)
MAX_RUN_HOURS = 1  # 每天只跑1小时，其余时间休眠

# 状态文件路径
STATE_FILE = "dashboard/data/state.json"

# 日志文件（追加，每条日志仅存 counter + 前8字符地址）
LOG_FILE = "run.log"

# API 配置
API_URL = "https://blockchain.info/balance?active={addrs}"
API_TIMEOUT = 10
API_MAX_RETRIES = 3
API_RETRY_DELAY = 2  # 秒
