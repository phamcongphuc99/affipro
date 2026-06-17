import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Map slug sản phẩm -> ảnh Unsplash đúng chủ đề (đã kiểm tra tải được).
const u = (id: string) => `https://images.unsplash.com/${id}?w=600&q=80`;

const map: Record<string, string> = {
  "hat-dieu-rang-muoi-500g": u("photo-1599599810769-bcde5a160d32"),
  "ca-phe-hoa-tan-3in1-20-goi": u("photo-1495474472287-4d71bcdd2085"),
  "mat-ong-rung-nguyen-chat-500ml": u("photo-1587049352846-4a222e784d38"),
  "chuot-khong-day-bluetooth": u("photo-1527814050087-3793815479db"),
  "loa-bluetooth-mini-chong-nuoc": u("photo-1608043152269-423dbba4e7e1"),
  "sac-du-phong-20000mah": u("photo-1609091839311-d5365f9ff1c5"),
  "bo-dao-nha-bep-6-mon": u("photo-1593618998160-e34014e67546"),
  "may-hut-bui-cam-tay-khong-day": u("photo-1558317374-067fb5f30001"),
  "binh-giu-nhiet-inox-1l": u("photo-1602143407151-7111542de6e8"),
  "son-kem-li-lau-troi": u("photo-1586495777744-4413f21062fa"),
  "may-rua-mat-silicon": u("photo-1556228720-195a672e8a03"),
  "nuoc-tay-trang-diu-nhe-500ml": u("photo-1556228578-8c89e6adf883"),
  "giay-sneaker-unisex": u("photo-1542291026-7eec264c27ff"),
  "balo-laptop-chong-nuoc": u("photo-1553062407-98eeb64c6a62"),
  "kinh-mat-phan-cuc-uv400": u("photo-1511499767150-a48a237f0083"),
};

async function main() {
  let updated = 0;
  for (const [slug, imageUrl] of Object.entries(map)) {
    const res = await prisma.product.updateMany({
      where: { slug },
      data: { imageUrl },
    });
    if (res.count) updated++;
  }
  // Đề phòng: thay mọi ảnh picsum còn sót thành ảnh mặc định an toàn
  const leftover = await prisma.product.updateMany({
    where: { imageUrl: { contains: "picsum.photos" } },
    data: { imageUrl: u("photo-1556742049-0cfed4f6a45d") },
  });
  console.log(`✅ Đã cập nhật ${updated} sản phẩm sang ảnh Unsplash.`);
  if (leftover.count) console.log(`   (Thay thêm ${leftover.count} ảnh picsum còn sót)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
