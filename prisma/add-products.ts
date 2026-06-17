import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ảnh dùng picsum (luôn tải được). Mỗi slug cho 1 ảnh cố định khác nhau.
const img = (slug: string) => `https://picsum.photos/seed/${slug}/600/600`;

type P = {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  store: string;
  rating: number;
  featured?: boolean;
};

// 3 sản phẩm cho mỗi danh mục (theo slug danh mục)
const data: Record<string, P[]> = {
  "an-uong": [
    { name: "Hạt điều rang muối 500g", slug: "hat-dieu-rang-muoi-500g", description: "Hạt điều loại 1, giòn bùi, đóng gói hút chân không.", price: 180000, salePrice: 139000, store: "Shopee", rating: 4.8, featured: true },
    { name: "Cà phê hòa tan 3in1 hộp 20 gói", slug: "ca-phe-hoa-tan-3in1-20-goi", description: "Cà phê sữa đậm đà, tiện lợi pha nhanh.", price: 90000, salePrice: 69000, store: "Tiki", rating: 4.6 },
    { name: "Mật ong rừng nguyên chất 500ml", slug: "mat-ong-rung-nguyen-chat-500ml", description: "Mật ong rừng tự nhiên, không pha trộn.", price: 250000, salePrice: null, store: "Lazada", rating: 4.7 },
  ],
  "dien-tu": [
    { name: "Chuột không dây Bluetooth", slug: "chuot-khong-day-bluetooth", description: "Kết nối kép, pin sạc, click êm chống ồn.", price: 320000, salePrice: 219000, store: "Shopee", rating: 4.5, featured: true },
    { name: "Loa Bluetooth mini chống nước", slug: "loa-bluetooth-mini-chong-nuoc", description: "Âm bass mạnh, chống nước IPX7, pin 12 giờ.", price: 590000, salePrice: 399000, store: "Lazada", rating: 4.6 },
    { name: "Sạc dự phòng 20000mAh", slug: "sac-du-phong-20000mah", description: "Sạc nhanh PD 22.5W, 2 cổng USB, màn LED.", price: 450000, salePrice: 329000, store: "Tiki", rating: 4.7 },
  ],
  "gia-dung": [
    { name: "Bộ dao nhà bếp 6 món", slug: "bo-dao-nha-bep-6-mon", description: "Thép không gỉ, kèm khối gỗ đựng dao.", price: 520000, salePrice: 359000, store: "Shopee", rating: 4.5 },
    { name: "Máy hút bụi cầm tay không dây", slug: "may-hut-bui-cam-tay-khong-day", description: "Lực hút mạnh, nhẹ, dùng cho nhà và ô tô.", price: 890000, salePrice: 649000, store: "Lazada", rating: 4.4, featured: true },
    { name: "Bình giữ nhiệt inox 1L", slug: "binh-giu-nhiet-inox-1l", description: "Giữ nóng/lạnh 12 giờ, inox 304 an toàn.", price: 220000, salePrice: 159000, store: "Tiki", rating: 4.8 },
  ],
  "lam-dep": [
    { name: "Son kem lì lâu trôi", slug: "son-kem-li-lau-troi", description: "Chất son mịn, lên màu chuẩn, không khô môi.", price: 160000, salePrice: 99000, store: "Shopee", rating: 4.6, featured: true },
    { name: "Máy rửa mặt silicon", slug: "may-rua-mat-silicon", description: "Rung sóng âm làm sạch sâu, chống nước.", price: 380000, salePrice: 259000, store: "Lazada", rating: 4.5 },
    { name: "Nước tẩy trang dịu nhẹ 500ml", slug: "nuoc-tay-trang-diu-nhe-500ml", description: "Làm sạch makeup, phù hợp da nhạy cảm.", price: 210000, salePrice: 149000, store: "Tiki", rating: 4.7 },
  ],
  "thoi-trang": [
    { name: "Giày sneaker unisex", slug: "giay-sneaker-unisex", description: "Đế êm, thoáng khí, phối đồ dễ dàng.", price: 650000, salePrice: 429000, store: "Shopee", rating: 4.5 },
    { name: "Balo laptop chống nước", slug: "balo-laptop-chong-nuoc", description: "Ngăn laptop 15.6 inch, cổng sạc USB.", price: 480000, salePrice: 329000, store: "Lazada", rating: 4.6, featured: true },
    { name: "Kính mát phân cực UV400", slug: "kinh-mat-phan-cuc-uv400", description: "Chống tia UV, tròng phân cực, gọng nhẹ.", price: 290000, salePrice: 189000, store: "Tiki", rating: 4.4 },
  ],
};

const storeUrl: Record<string, string> = {
  Shopee: "https://shopee.vn",
  Lazada: "https://lazada.vn",
  Tiki: "https://tiki.vn",
};

async function main() {
  let created = 0;
  for (const [catSlug, products] of Object.entries(data)) {
    const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (!cat) {
      console.log(`⚠ Bỏ qua: không tìm thấy danh mục ${catSlug}`);
      continue;
    }
    for (const p of products) {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          salePrice: p.salePrice ?? null,
          imageUrl: img(p.slug),
          affiliateUrl: storeUrl[p.store] || "https://shopee.vn",
          store: p.store,
          rating: p.rating,
          featured: p.featured ?? false,
          published: true,
          categoryId: cat.id,
        },
      });
      created++;
    }
    console.log(`✔ ${cat.name}: +${products.length} sản phẩm`);
  }
  console.log(`✅ Hoàn tất. Đã thêm/đảm bảo ${created} sản phẩm.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
