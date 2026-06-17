#!/usr/bin/env bash
# Kéo code mới nhất rồi build & khởi động lại. Chạy thủ công: ./deploy.sh
set -e
cd "$(dirname "$0")"

echo "==> Kéo code mới từ git..."
git pull

echo "==> Build & khởi động lại container..."
docker compose up -d --build

echo "==> Dọn image cũ không dùng..."
docker image prune -f

echo "✅ Deploy hoàn tất! Web đang chạy ở cổng 3000."
