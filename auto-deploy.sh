#!/usr/bin/env bash
# Tự động kiểm tra git: nếu có code mới thì deploy lại.
# Dùng với cron để server tự cập nhật khi bạn push code lên.
set -e
cd "$(dirname "$0")"

git fetch origin >/dev/null 2>&1
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') - Phát hiện code mới, đang deploy..."
  git pull
  docker compose up -d --build
  docker image prune -f
  echo "$(date '+%Y-%m-%d %H:%M:%S') - ✅ Đã cập nhật xong."
else
  echo "$(date '+%Y-%m-%d %H:%M:%S') - Không có thay đổi."
fi
