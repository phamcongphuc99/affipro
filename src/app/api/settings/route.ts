import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api";
import { getSettings } from "@/lib/settings";

// Luôn đọc dữ liệu mới từ DB, không cache tĩnh.
export const dynamic = "force-dynamic";

// GET /api/settings  (công khai)
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

// PUT /api/settings  - nhận object { key: value } và lưu tất cả
export async function PUT(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const body = (await req.json()) as Record<string, string>;

  const entries = Object.entries(body).filter(([k]) => k);
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value ?? "") },
        create: { key, value: String(value ?? "") },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
