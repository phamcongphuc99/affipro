# ====== Dockerfile cho Next.js + Prisma ======
# Image gọn, dễ hiểu cho người mới.

FROM node:20-slim

WORKDIR /app

# Prisma cần openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 1) Cài thư viện (tách bước này để tận dụng cache khi code đổi mà package không đổi)
COPY package*.json ./
RUN npm ci

# 2) Copy toàn bộ source và build
COPY . .
# DATABASE_URL tạm chỉ để bước build không lỗi; runtime dùng giá trị thật từ docker-compose.
ENV DATABASE_URL="mysql://build:build@localhost:3306/build"
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Khi container khởi động: đồng bộ schema vào MySQL rồi chạy Next.js production.
CMD ["sh", "-c", "npx prisma db push && npm run start"]
