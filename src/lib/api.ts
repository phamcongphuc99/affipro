import { NextResponse } from "next/server";
import { getSession, SessionPayload } from "./auth";

// Kiểm tra đăng nhập cho API. Trả về session hoặc null.
export async function requireAuth(): Promise<SessionPayload | null> {
  return getSession();
}

// Trả về response 401 chuẩn
export function unauthorized() {
  return NextResponse.json(
    { error: "Bạn cần đăng nhập để thực hiện thao tác này." },
    { status: 401 }
  );
}

// Bọc handler cần xác thực: nếu chưa đăng nhập trả 401, ngược lại chạy handler.
export async function withAuth<T>(
  handler: (session: SessionPayload) => Promise<T>
) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  return handler(session);
}

// Định dạng lỗi chung
export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message = "Lỗi máy chủ") {
  return NextResponse.json({ error: message }, { status: 500 });
}
