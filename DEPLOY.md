# Hướng dẫn deploy (dành cho người không rành DevOps)

Toàn bộ web + database chạy bằng Docker. Trên server **chỉ cần cài Docker** là đủ.

---

## A. Chuẩn bị server (làm 1 lần)

1. Thuê 1 VPS (Ubuntu) — vd Vultr, DigitalOcean, AWS Lightsail...
2. Cài Docker (gồm Docker Compose):
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. Tải code về server:
   ```bash
   cd ~
   git clone <ĐỊA_CHỈ_GIT_CỦA_BẠN> project_affilate
   cd project_affilate
   ```

---

## B. Cấu hình (sửa file `docker-compose.yml`)

Mở `docker-compose.yml` và đổi các giá trị:
- `MYSQL_ROOT_PASSWORD` và phần mật khẩu trong `DATABASE_URL` (phải **giống nhau**).
- `AUTH_SECRET` → một chuỗi ngẫu nhiên dài (tạo bằng: `openssl rand -base64 32`).
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` → tài khoản đăng nhập quản trị.
- `NEXT_PUBLIC_SITE_URL` → tên miền thật (vd `https://affipro.vn`).

> Lưu ý: nếu mật khẩu có ký tự `@`, trong `DATABASE_URL` phải đổi `@` thành `%40`.

---

## C. Chạy lần đầu

```bash
# Build và bật web + database
docker compose up -d --build

# Tạo tài khoản admin + dữ liệu mẫu (chỉ chạy 1 LẦN duy nhất)
docker compose exec app npx prisma db seed
```

Xong! Mở trình duyệt:
- Web: `http://<IP_SERVER>:3000`
- Quản trị: `http://<IP_SERVER>:3000/admin`

Các lệnh thường dùng:
```bash
docker compose ps           # xem trạng thái
docker compose logs -f app  # xem log web
docker compose down         # tắt
docker compose up -d        # bật lại
```

> Dữ liệu DB và ảnh upload được lưu trong "volume" nên **không mất** khi rebuild.

---

## D. Tự động cập nhật khi có code mới — chọn 1 trong 2 cách

### Cách 1 (đơn giản nhất): server tự kiểm tra git mỗi phút
Trên server, cấp quyền chạy cho script và thêm vào cron:
```bash
chmod +x deploy.sh auto-deploy.sh
crontab -e
```
Thêm dòng này vào cuối (kiểm tra mỗi phút, có code mới thì tự deploy):
```
* * * * * cd ~/project_affilate && ./auto-deploy.sh >> ~/deploy.log 2>&1
```
Từ giờ: bạn chỉ cần `git push`, sau ≤1 phút server tự cập nhật. Xem log: `cat ~/deploy.log`.

### Cách 2: GitHub tự deploy ngay khi push (file `.github/workflows/deploy.yml`)
Trong GitHub repo → **Settings → Secrets and variables → Actions**, thêm 3 secret:
- `SSH_HOST`: IP server
- `SSH_USER`: user SSH (vd `root`)
- `SSH_KEY`: nội dung private key SSH

Mỗi lần push lên nhánh `main`, GitHub sẽ tự SSH vào server chạy deploy. Không cần cron.

---

## E. Deploy thủ công (khi cần)
```bash
./deploy.sh
```
(tự `git pull` + build lại + khởi động lại)

---

## Câu hỏi thường gặp

**Cập nhật code có mất dữ liệu không?**
Không. DB và ảnh nằm trong Docker volume, chỉ container web được build lại.

**Đổi schema (prisma) thì sao?**
Container tự chạy `prisma db push` mỗi lần khởi động để đồng bộ bảng.

**Muốn chạy cổng 80 (không cần gõ :3000)?**
Cách nhanh: sửa `ports` trong compose thành `"80:3000"`. Chuẩn hơn: đặt Nginx/Caddy phía trước để có HTTPS — báo mình nếu cần hướng dẫn.
