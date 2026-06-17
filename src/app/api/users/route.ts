import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, badRequest } from "@/lib/api";
import { canManageUsers } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1, "Tên bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  role: z.enum(["ADMIN", "EDITOR"]).default("EDITOR"),
});

// GET /api/users - danh sách tài khoản (chỉ ADMIN)
export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();
  if (!canManageUsers(session.role))
    return NextResponse.json({ error: "Không có quyền." }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(users);
}

// POST /api/users - tạo tài khoản (chỉ ADMIN)
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  if (!canManageUsers(session.role))
    return NextResponse.json({ error: "Không có quyền." }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ");

  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return badRequest("Email đã được sử dụng.");

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      password: await bcrypt.hash(data.password, 10),
      role: data.role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}
