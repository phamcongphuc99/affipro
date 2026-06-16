import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

// GET /uploads/<filename> - đọc file từ thư mục ./uploads và trả về cho trình duyệt.
export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Ghép lại đường dẫn và chặn path traversal (../)
  const segments = (params.path || []).filter(
    (s) => s && s !== ".." && !s.includes("\\") && !s.includes("/")
  );
  if (segments.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const uploadDir = path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadDir, ...segments);

  // Đảm bảo file nằm trong thư mục uploads
  if (!filePath.startsWith(uploadDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");

    const data = await readFile(filePath);
    const ext = (segments[segments.length - 1].split(".").pop() || "").toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
