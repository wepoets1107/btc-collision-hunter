# 🦐 Bitcoin Collision Hunter

> **密码学行为艺术。** 生成私钥→查余额→发现命中概率为0→继续。无限循环。

## 数学事实

| 数字 | 含义 |
|------|------|
| 2¹⁶⁰ | 比特币地址空间 |
| ≈ 5×10⁷ | 全球有资产地址数 |
| ≈ 2¹³³ | 期望撞到一个所需的尝试次数 |
| 10²⁰ 倍宇宙年龄  | 每秒100次，跑完所需时间 |

不可能撞到。这正是运行它的意义。

## 如何参与

### 方式一：Python

```bash
git clone https://github.com/wepoets1107/btc-collision-hunter.git
cd btc-collision-hunter
pip install coincurve base58
python3 src/hunter.py
```

程序默认每天运行 **1 小时**（10:00-11:00），每秒检查 10 个地址。
可修改 `src/config.py` 调整速率和运行时长。

### 方式二：Docker

```bash
docker run -d --name hunter wepoets1107/btc-collision-hunter
```

### 汇报贡献

加入全球计数面板，只需在 [GitHub Issues](https://github.com/wepoets1107/btc-collision-hunter/issues/new?template=report.md) 提交一条 Issue，填写你的 `counter` 值：

```
节点 ID：my-pc-1
已检查地址数：86400
运行时长：1天
命中数：0
```

GitHub Actions 会自动聚合所有人的计数，更新全球面板。

也可通过脚本自动汇报（需配置 `GITHUB_TOKEN`）：

```bash
./report/report.sh
```

## 隐私

- **不存储任何私钥** — 私钥由 HMAC-SHA256(counter) 实时派生，用完即弃
- **counter 可恢复** — 重启时从 `state.json` 恢复计数，永不重复
- **即使撞到了** — counter 值可重新推导私钥

## 技术栈

- `coincurve` — secp256k1 椭圆曲线运算
- `blockchain.info` — 免费余额查询 API
- HMAC-SHA256 — 确定性私钥派生

## 行为艺术声明

> 比特币的安全性建立在椭圆曲线离散对数问题的计算困难性之上。
> 本项目的全部意义在于：**用无限的努力，证明有限的不可能。**

🦐 冰火岛 · 2026
