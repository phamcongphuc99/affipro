# AffiPro — Website Affiliate + CMS quản trị

Website giới thiệu / đánh giá / bán hàng theo mô hình affiliate, kèm trang quản trị nội dung (CMS) để quản lý sản phẩm, tin tức, danh mục, hình ảnh, giá và cấu hình website.

Công nghệ: **Next.js 14 (App Router) + TypeScript + Prisma + MySQL + Tailwind CSS**.

---

## Tính năng

### Website công khai
- Trang chủ: banner, danh mục, sản phẩm nổi bật, tin tức mới.
- Sản phẩm: danh sách, lọc theo danh mục, tìm kiếm, trang chi tiết với nút **"Mua ngay"** (link affiliate có đếm lượt bấm).
- Tin tức: danh sách và trang chi tiết bài viết.
- Trang Giới thiệu và Liên hệ (nội dung lấy từ CMS).
- SEO cơ bản (title/description động theo cấu hình).

### CMS quản trị (`/admin`)
- Đăng nhập bằng email/mật khẩu (JWT + cookie httpOnly).
- Tổng quan: số liệu thống kê, sản phẩm được bấm mua nhiều nhất.
- Quản lý **Sản phẩm**: thêm/sửa/xóa, giá gốc/giá KM, ảnh, danh mục, link affiliate, nổi bật, ẩn/hiện.
- Quản lý **Tin tức**: thêm/sửa/xóa bài viết, ảnh bìa, xuất bản/nháp.
- Quản lý **Danh mục** sản phẩm.
- **Cấu hình site**: tên, logo, banner, nội dung trang giới thiệu, thông tin liên hệ, chân trang.
- **Upload ảnh** lên `/public/uploads` hoặc dán URL ảnh ngoài.

---

## Yêu cầu môi trường
- Node.js >= 18 (khuyến nghị 20+)
- MySQL >= 8 (hoặc MariaDB tương đương)

---

## Cài đặt & chạy

### 1. Cài thư viện
```bash
npm install
```

### 2. Tạo database MySQL
Đăng nhập MySQL và tạo database (charset utf8mb4 để hỗ trợ tiếng Việt và emoji):
```sql
CREATE DATABASE affiliate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Cấu hình biến môi trường
File `.env` đã được tạo sẵn. Hãy mở và sửa cho đúng máy của bạn:
```env
DATABASE_URL="mysql://root:matkhau@localhost:3306/affiliate_db"
AUTH_SECRET="mot-chuoi-bi-mat-ngau-nhien-dai-toi-thieu-32-ky-tu"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"
ADMIN_NAME="Quản trị viên"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```
> Tạo `AUTH_SECRET` an toàn: `openssl rand -base64 32`

### 4. Tạo bảng và dữ liệu mẫu
```bash
npm run db:push      # tạo bảng trong MySQL theo schema
npm run db:seed      # tạo tài khoản admin + dữ liệu mẫu (sản phẩm, tin tức, cấu hình)
```

### 5. Chạy ở chế độ phát triển
```bash
npm run dev
```
Mở:
- Website: http://localhost:3000
- Trang quản trị: http://localhost:3000/admin
  (đăng nhập bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env`)

---

## Chạy ở môi trường production
```bash
npm run build
npm run start
```

---

## Lệnh hữu ích
| Lệnh | Mô tả |
|------|------|
| `npm run dev` | Chạy chế độ phát triển |
| `npm run build` | Build production (đã tự `prisma generate`) |
| `npm run start` | Chạy bản build |
| `npm run db:push` | Đồng bộ schema vào DB (không tạo migration) |
| `npm run db:migrate` | Tạo & chạy migration |
| `npm run db:seed` | Nạp dữ liệu mẫu |
| `npm run db:studio` | Mở Prisma Studio để xem/sửa dữ liệu trực quan |

---

## Cấu trúc thư mục
```
prisma/
  schema.prisma        # mô hình dữ liệu
  seed.ts              # dữ liệu mẫu + tài khoản admin
src/
  middleware.ts        # bảo vệ route /admin
  lib/                 # prisma, auth (JWT), settings, helpers
  components/
    site/              # Header, Footer, ProductCard, PostCard
    admin/             # Sidebar, các form, upload ảnh
  app/
    (site)/            # các trang công khai (trang chủ, sản phẩm, tin tức...)
    admin/             # CMS: login + (dashboard)
    api/               # API: auth, products, posts, categories, settings, upload, go
public/
  uploads/             # nơi lưu ảnh tải lên
```

---

## Ghi chú về affiliate
- Nút "Mua ngay" trỏ tới `/api/go/[id]`: tăng bộ đếm `clicks` rồi chuyển hướng tới link affiliate thật.
- Trang **Tổng quan** trong CMS hiển thị sản phẩm được bấm nhiều nhất để đánh giá hiệu quả.
- Link affiliate dùng `rel="nofollow noopener"` đúng chuẩn.

## Bảo mật
- Mật khẩu được hash bằng bcrypt.
- Phiên đăng nhập dùng JWT lưu trong cookie `httpOnly`, hết hạn sau 7 ngày.
- Mọi route `/admin/*` được middleware kiểm tra; mọi API ghi dữ liệu đều yêu cầu đăng nhập.
- **Nhớ đổi `ADMIN_PASSWORD` và `AUTH_SECRET`** trước khi đưa lên production.
