import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/go/[id] - tăng lượt bấm rồi chuyển hướng tới link affiliate.
// Dùng cho nút "Mua ngay" để theo dõi hiệu quả từng sản phẩm.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || !product.affiliateUrl) {
    return NextResponse.redirect(
      new URL("/san-pham", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    );
  }

  // Tăng bộ đếm (không chặn redirect nếu lỗi)
  prisma.product
    .update({ where: { id }, data: { clicks: { increment: 1 } } })
    .catch(() => {});

  return NextResponse.redirect(product.affiliateUrl);
}
