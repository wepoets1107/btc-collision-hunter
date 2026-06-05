# 🦐 Bitcoin Collision Hunter

> **密码学行为艺术 / Cryptographic Performance Art**
>
> 生成私钥 → 查余额 → 发现命中概率为 0 → 继续。无限循环。
>
> *Generate a private key → check the balance → discover the hit probability is zero → continue. Loop forever.*

---

## 🔬 数学事实 / The Math

| 数字 / Number | 含义 / Meaning |
|---|---|
| 2¹⁶⁰ | 比特币地址空间 / Bitcoin address space |
| ≈ 5×10⁷ | 全球有资产地址数 / Funded addresses worldwide |
| ≈ 2¹³³ | 期望撞到一个所需的尝试次数 / Expected attempts for one collision |
| 10²⁰ × 宇宙年龄 / Age of universe | 每秒 100 次，跑完所需时间 / Time needed at 100 addr/s |

**不可能撞到。这正是运行它的意义。 / The probability is zero. That's the whole point.**

---

## 🚀 如何参与 / How to Join

### 方式一：Python / Option 1: Python

```bash
git clone https://github.com/wepoets1107/btc-collision-hunter.git
cd btc-collision-hunter
pip install coincurve base58
python3 src/hunter.py
```

程序默认每天运行 **1 小时**（10:00–11:00 UTC+8），每秒 10 个地址。
修改 `src/config.py` 可调整速率和时长。

*Runs 1 hour/day by default (10:00–11:00 UTC+8), 10 addresses per second. Adjust in `src/config.py`.*

### 方式二：Docker / Option 2: Docker

```bash
docker run -d --name hunter wepoets1107/btc-collision-hunter
```

> ⚠️ Docker 镜像将随着社区活跃度发布。
> *Docker images will be published as the community grows.*

---

## 📊 汇报贡献 / Report Your Contribution

加入全球计数面板：

*Join the global counter board by reporting your result in [GitHub Issues](https://github.com/wepoets1107/btc-collision-hunter/issues/1):*

```
📡 节点 / Node: `my-pc-1`
🕐 运行时间 / Run time: 2026-06-06 10:00 UTC
✅ 上次运行至 / Checked up to: `86400`
📊 累计已检查 / Total: `86400`
```

GitHub Actions 每 10 分钟自动聚合所有人的计数。
*GitHub Actions aggregates all reports every 10 minutes.*

或通过脚本自动汇报（需配置 `GITHUB_TOKEN`）：
*Or automate with the report script (requires `GITHUB_TOKEN`):*

```bash
GITHUB_TOKEN=your_token NODE_ID=my-pc-1 ./report/report.sh
```

**问题：从哪里开始？ / Starting point?**

查看 [Issue #1](https://github.com/wepoets1107/btc-collision-hunter/issues/1) 最新一条汇报中的 counter，从该值继续递增。

*Check the latest counter in [Issue #1](https://github.com/wepoets1107/btc-collision-hunter/issues/1) and start from there.*

---

## 🔐 隐私 / Privacy

- **不存储任何私钥** — 私钥由 HMAC-SHA256(counter) 实时派生，用完即弃
- **counter 可恢复** — 重启时从 `state.json` 恢复计数，永不重复
- **即使撞到了** — counter 值可重新推导私钥

*No private keys are ever stored on disk. Keys are derived on-the-fly via HMAC-SHA256(counter) and discarded immediately.*

---

## 🧰 技术栈 / Tech Stack

| 组件 / Component | 用途 / Purpose |
|---|---|
| `coincurve` | secp256k1 椭圆曲线运算 / Elliptic curve operations |
| `blockchain.info` API | 免费余额查询 / Free balance lookup |
| HMAC-SHA256 | 确定性私钥派生 / Deterministic key derivation |
| GitHub Actions | 全球计数聚合 / Global counter aggregation |

---

## 🎭 行为艺术声明 / Artistic Statement

> 比特币的安全性建立在椭圆曲线离散对数问题的计算困难性之上。
> 本项目的全部意义在于：
>
> **用无限的努力，证明有限的不可能。**
>
> *Bitcoin's security rests on the computational hardness of the elliptic curve discrete logarithm problem.*
> *This project exists for one reason only:*
>
> ***To prove, through infinite effort, a finite impossibility.***

---

## 🌐 全球看板 / Global Dashboard

https://wepoets1107.github.io/btc-collision-hunter/

实时查看全球已检查地址总数、参与节点数和命中记录。

*Real-time view of total addresses checked, active nodes, and any hit records.*

---

🦐 冰火岛 / IceFire Island · 2026
