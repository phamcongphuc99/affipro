import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu...");

  // ===== 1. Tài khoản admin =====
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123456";
  const name = process.env.ADMIN_NAME || "Quản trị viên";
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hashed, name, role: "ADMIN" },
  });
  console.log(`✔ Tài khoản admin: ${email} / ${password}`);

  // ===== 2. Cấu hình site =====
  const settings: Record<string, string> = {
    site_name: "AffiPro",
    site_tagline: "Khám phá sản phẩm tốt - Giá hời mỗi ngày",
    site_description:
      "AffiPro là trang giới thiệu và đánh giá sản phẩm, giúp bạn tìm được ưu đãi tốt nhất từ các sàn thương mại điện tử.",
    logo_url: "",
    hero_title: "Mua sắm thông minh, tiết kiệm hơn mỗi ngày",
    hero_subtitle:
      "Tổng hợp sản phẩm chất lượng, đánh giá khách quan và đường dẫn ưu đãi tốt nhất từ Shopee, Lazada, Tiki.",
    hero_image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    about_content: `<h2>Về chúng tôi</h2>
<p>AffiPro được thành lập với sứ mệnh giúp người tiêu dùng Việt Nam mua sắm thông minh hơn. Chúng tôi tổng hợp, đánh giá và giới thiệu những sản phẩm chất lượng cùng các chương trình ưu đãi tốt nhất.</p>
<h3>Chúng tôi làm gì?</h3>
<ul>
  <li>Đánh giá sản phẩm khách quan, chi tiết.</li>
  <li>Tổng hợp ưu đãi từ nhiều sàn thương mại điện tử.</li>
  <li>Cập nhật tin tức, mẹo mua sắm hữu ích.</li>
</ul>
<p>Khi bạn mua hàng qua đường dẫn của chúng tôi, chúng tôi có thể nhận được một khoản hoa hồng nhỏ mà <strong>không làm tăng giá</strong> bạn phải trả.</p>`,
    contact_email: "lienhe@affipro.vn",
    contact_phone: "0900 000 000",
    contact_address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
    facebook_url: "https://facebook.com",
    footer_text: "© 2026 AffiPro. Mọi sản phẩm được giới thiệu vì mục đích tham khảo.",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log("✔ Đã tạo cấu hình site");

  // ===== 3. Danh mục =====
  const categoriesData = [
    { name: "Điện tử", slug: "dien-tu" },
    { name: "Thời trang", slug: "thoi-trang" },
    { name: "Gia dụng", slug: "gia-dung" },
    { name: "Làm đẹp", slug: "lam-dep" },
  ];
  const categories: Record<string, number> = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
    categories[c.slug] = cat.id;
  }
  console.log("✔ Đã tạo danh mục");

  // ===== 4. Sản phẩm mẫu =====
  const products = [
    {
      name: "Tai nghe Bluetooth chống ồn ProMax",
      slug: "tai-nghe-bluetooth-promax",
      description: "Tai nghe chụp tai chống ồn chủ động, pin 40 giờ, âm thanh Hi-Res.",
      price: 1990000,
      salePrice: 1290000,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      affiliateUrl: "https://shopee.vn",
      store: "Shopee",
      rating: 4.7,
      featured: true,
      categorySlug: "dien-tu",
    },
    {
      name: "Đồng hồ thông minh Smart Watch S9",
      slug: "dong-ho-thong-minh-s9",
      description: "Theo dõi sức khỏe, đo SpO2, chống nước IP68, màn hình AMOLED.",
      price: 2490000,
      salePrice: 1799000,
      imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
      affiliateUrl: "https://lazada.vn",
      store: "Lazada",
      rating: 4.5,
      featured: true,
      categorySlug: "dien-tu",
    },
    {
      name: "Áo khoác gió nam unisex",
      slug: "ao-khoac-gio-nam-unisex",
      description: "Chất liệu chống nước nhẹ, form rộng Hàn Quốc, nhiều màu.",
      price: 450000,
      salePrice: 299000,
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      affiliateUrl: "https://tiki.vn",
      store: "Tiki",
      rating: 4.6,
      featured: true,
      categorySlug: "thoi-trang",
    },
    {
      name: "Nồi chiên không dầu 5L",
      slug: "noi-chien-khong-dau-5l",
      description: "Dung tích lớn 5L, 8 chế độ nấu tự động, tiết kiệm điện.",
      price: 1590000,
      salePrice: 990000,
      imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&q=80",
      affiliateUrl: "https://shopee.vn",
      store: "Shopee",
      rating: 4.8,
      featured: false,
      categorySlug: "gia-dung",
    },
    {
      name: "Bộ chăm sóc da Vitamin C",
      slug: "bo-cham-soc-da-vitamin-c",
      description: "Serum + kem dưỡng làm sáng da, phục hồi, an toàn cho da nhạy cảm.",
      price: 690000,
      salePrice: 459000,
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
      affiliateUrl: "https://lazada.vn",
      store: "Lazada",
      rating: 4.4,
      featured: true,
      categorySlug: "lam-dep",
    },
    {
      name: "Bàn phím cơ không dây RGB",
      slug: "ban-phim-co-khong-day-rgb",
      description: "Switch hot-swap, kết nối 3 chế độ, LED RGB, pin 4000mAh.",
      price: 1290000,
      salePrice: null,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
      affiliateUrl: "https://tiki.vn",
      store: "Tiki",
      rating: 4.6,
      featured: false,
      categorySlug: "dien-tu",
    },
  ];

  for (const p of products) {
    const { categorySlug, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...rest, categoryId: categories[categorySlug] },
      create: { ...rest, categoryId: categories[categorySlug] },
    });
  }
  console.log("✔ Đã tạo sản phẩm mẫu");

  // ===== 5. Tin tức mẫu =====
  const posts = [
    {
      title: "Top 5 mẹo mua sắm online tiết kiệm trong năm 2026",
      slug: "top-5-meo-mua-sam-online-tiet-kiem-2026",
      excerpt: "Những bí quyết giúp bạn săn sale hiệu quả và tránh mua hớ.",
      content:
        "<p>Mua sắm online ngày càng phổ biến. Dưới đây là 5 mẹo giúp bạn tiết kiệm:</p><ol><li>So sánh giá giữa các sàn.</li><li>Săn mã giảm giá và hoàn tiền.</li><li>Mua vào các đợt sale lớn (9.9, 11.11...).</li><li>Đọc đánh giá trước khi mua.</li><li>Theo dõi lịch sử giá sản phẩm.</li></ol>",
      coverImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80",
    },
    {
      title: "Đánh giá chi tiết tai nghe chống ồn đáng mua nhất",
      slug: "danh-gia-tai-nghe-chong-on-dang-mua-nhat",
      excerpt: "Phân tích ưu nhược điểm các mẫu tai nghe chống ồn phổ biến.",
      content:
        "<p>Tai nghe chống ồn chủ động (ANC) đang là xu hướng. Trong bài này chúng tôi so sánh các tiêu chí: chất âm, khả năng chống ồn, thời lượng pin và mức giá.</p><p>Kết luận: với tầm giá dưới 1.5 triệu, đây là lựa chọn cân bằng nhất.</p>",
      coverImage: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=80",
    },
    {
      title: "Cách chọn nồi chiên không dầu phù hợp cho gia đình",
      slug: "cach-chon-noi-chien-khong-dau-phu-hop",
      excerpt: "Hướng dẫn chọn dung tích, công suất và tính năng phù hợp.",
      content:
        "<p>Nồi chiên không dầu giúp nấu ăn nhanh và lành mạnh hơn. Khi chọn mua, hãy lưu ý dung tích (gia đình 3-4 người nên chọn 4-5L), công suất và các chế độ nấu tự động.</p>",
      coverImage: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=1200&q=80",
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { ...post, published: true, publishedAt: new Date() },
      create: { ...post, published: true, publishedAt: new Date() },
    });
  }
  console.log("✔ Đã tạo tin tức mẫu");

  // ===== 6. Lượt click mẫu (chỉ tạo khi bảng còn trống) =====
  const existingEvents = await prisma.clickEvent.count();
  if (existingEvents === 0) {
    const allProducts = await prisma.product.findMany({
      select: { id: true, categoryId: true },
    });
    const rows: { productId: number; categoryId: number | null; createdAt: Date }[] = [];
    const DAYS = 30;
    for (let d = 0; d < DAYS; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      // mỗi ngày sinh ngẫu nhiên một số lượt click
      const clicksToday = Math.floor(Math.random() * 12);
      for (let i = 0; i < clicksToday; i++) {
        const p = allProducts[Math.floor(Math.random() * allProducts.length)];
        if (!p) continue;
        const when = new Date(date);
        when.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        rows.push({ productId: p.id, categoryId: p.categoryId, createdAt: when });
      }
    }
    if (rows.length) {
      await prisma.clickEvent.createMany({ data: rows });
      // Cập nhật lại bộ đếm tổng cho khớp
      const counts = rows.reduce<Record<number, number>>((acc, r) => {
        acc[r.productId] = (acc[r.productId] || 0) + 1;
        return acc;
      }, {});
      for (const [pid, c] of Object.entries(counts)) {
        await prisma.product.update({
          where: { id: Number(pid) },
          data: { clicks: { increment: c } },
        });
      }
    }
    console.log(`✔ Đã tạo ${rows.length} lượt click mẫu`);
  }

  console.log("✅ Seed hoàn tất!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
