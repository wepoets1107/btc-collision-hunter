#!/bin/bash
# 向 Issue #1 汇报本地 counter
STATE_FILE="dashboard/data/state.json"
ISSUE_URL="https://api.github.com/repos/wepoets1107/btc-collision-hunter/issues/1/comments"

if [ ! -f "$STATE_FILE" ]; then
    echo "state.json not found"
    exit 1
fi

COUNTER=$(python3 -c "import json; print(json.load(open('$STATE_FILE'))['counter'])")
NODE_ID="${NODE_ID:-icefire-server}"

# 格式必须与 workflow 正则匹配
BODY="📡 节点 \`${NODE_ID}\` 已检查 \`${COUNTER}\` 个地址"

if [ -n "$GITHUB_TOKEN" ]; then
    curl -s -X POST "$ISSUE_URL" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$(python3 -c "import json; print(json.dumps({'body': '$BODY'}))")"
    echo ""
    echo "Reported: $BODY"
else
    echo "GITHUB_TOKEN not set, dry run: $BODY"
fi
