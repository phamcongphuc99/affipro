import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/go/[id] - tăng lượt bấm rồi chuyển hướng tới link affiliate.
// Dùng cho nút "Mua ngay" để theo dõi hiệu quả từng sản phẩm.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const offerId = Number(new URL(req.url).searchParams.get("offer")) || 0;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || !product.affiliateUrl) {
    return NextResponse.redirect(
      new URL("/san-pham", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    );
  }

  // Nếu bấm từ link 1 sàn cụ thể -> dùng url sàn đó; ngược lại dùng link mặc định.
  let target = product.affiliateUrl;
  const writes: Promise<unknown>[] = [
    prisma.product.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    }),
    prisma.clickEvent.create({
      data: { productId: id, categoryId: product.categoryId },
    }),
  ];

  if (offerId) {
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (offer && offer.productId === id) {
      target = offer.url;
      writes.push(
        prisma.offer.update({
          where: { id: offerId },
          data: { clicks: { increment: 1 } },
        })
      );
    }
  }

  // Ghi thống kê (không chặn redirect nếu lỗi)
  Promise.all(writes).catch(() => {});

  return NextResponse.redirect(target);
}
