#!/bin/bash
# 向 Issue #1 汇报本地运行日志
STATE_FILE="dashboard/data/state.json"
ISSUE_URL="https://api.github.com/repos/wepoets1107/btc-collision-hunter/issues/1/comments"

if [ ! -f "$STATE_FILE" ]; then
    echo "state.json not found"
    exit 1
fi

COUNTER=$(python3 -c "import json; print(json.load(open('$STATE_FILE'))['counter'])")
NODE_ID="${NODE_ID:-icefire-server}"
DATE=$(date '+%Y-%m-%d %H:%M UTC')

# 每条记录包含：节点 + 时间 + 当前 counter
# 聚合脚本只累计 "已检查 X 个地址" 中的数字
BODY="📡 节点 \`${NODE_ID}\`
🕐 ${DATE}
✅ 上次运行至 \`${COUNTER}\` 个地址
📊 累计已检查 \`${COUNTER}\` 个地址

新参与者请在 Issue #1 中回复时附上自己的起始 counter，以便全球计数汇总。"

if [ -n "$GITHUB_TOKEN" ]; then
    curl -s -X POST "$ISSUE_URL" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$(python3 -c "import json; print(json.dumps({'body': '$BODY'}))")"
    echo ""
    echo "Reported: counter=${COUNTER}"
else
    echo "GITHUB_TOKEN not set, dry run: counter=${COUNTER}"
fi
