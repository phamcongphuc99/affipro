import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, badRequest } from "@/lib/api";
import { canManageUsers } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function forbidden() {
  return NextResponse.json({ error: "Không có quyền." }, { status: 403 });
}

// PUT /api/users/[id] - cập nhật tài khoản (chỉ ADMIN). Mật khẩu để trống = giữ nguyên.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  if (!canManageUsers(session.role)) return forbidden();

  const id = Number(params.id);
  const body = await req.json();

  const name = String(body.name || "").trim();
  const email = String(body.email || "").toLowerCase().trim();
  const role = body.role === "ADMIN" ? "ADMIN" : "EDITOR";
  if (!name || !email) return badRequest("Tên và email bắt buộc.");

  // Email trùng người khác?
  const dup = await prisma.user.findFirst({
    where: { email, id: { not: id } },
  });
  if (dup) return badRequest("Email đã được sử dụng bởi tài khoản khác.");

  // Không cho hạ quyền ADMIN cuối cùng
  if (role !== "ADMIN") {
    const current = await prisma.user.findUnique({ where: { id } });
    if (current?.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1)
        return badRequest("Phải còn ít nhất 1 Quản trị viên.");
    }
  }

  const data: any = { name, email, role };
  if (body.password && String(body.password).length > 0) {
    if (String(body.password).length < 6)
      return badRequest("Mật khẩu tối thiểu 6 ký tự.");
    data.password = await bcrypt.hash(String(body.password), 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(user);
}

// DELETE /api/users/[id] - xóa tài khoản (chỉ ADMIN)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  if (!canManageUsers(session.role)) return forbidden();

  const id = Number(params.id);

  // Không cho tự xóa chính mình
  if (id === session.userId)
    return badRequest("Không thể xóa tài khoản đang đăng nhập.");

  // Không cho xóa ADMIN cuối cùng
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return badRequest("Không tìm thấy tài khoản.");
  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) return badRequest("Phải còn ít nhất 1 Quản trị viên.");
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
