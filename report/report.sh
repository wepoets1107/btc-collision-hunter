#!/bin/bash
# 每5分钟向 GitHub Issue 汇报本地 counter
# 配合 .github/workflows/aggregate.yml 做全球聚合

STATE_FILE="dashboard/data/state.json"
ISSUE_URL="https://api.github.com/repos/wepoets1107/btc-collision-hunter/issues/1/comments"

if [ ! -f "$STATE_FILE" ]; then
    echo "state.json not found"
    exit 1
fi

COUNTER=$(python3 -c "import json; print(json.load(open('$STATE_FILE'))['counter'])")
NODE_ID=$(hostname)

COMMENT="📡 节点 \`${NODE_ID}\` 已检查 \`${COUNTER}\` 个地址"

# 需要配置 GITHUB_TOKEN 环境变量
if [ -n "$GITHUB_TOKEN" ]; then
    curl -s -X POST "$ISSUE_URL" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"body\": \"$COMMENT\"}"
fi

echo "$COMMENT"
