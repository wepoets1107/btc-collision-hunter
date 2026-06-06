#!/bin/bash
# 向 Issue #1 汇报本地运行日志
cd "$(dirname "$0")/.." || exit 1
exec python3 report/report.py
