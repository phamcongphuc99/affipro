import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/account/password - người dùng đổi mật khẩu của chính mình.
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword)
    return badRequest("Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới.");
  if (String(newPassword).length < 6)
    return badRequest("Mật khẩu mới tối thiểu 6 ký tự.");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return unauthorized();

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return badRequest("Mật khẩu hiện tại không đúng.");

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(String(newPassword), 10) },
  });
  return NextResponse.json({ ok: true });
}
