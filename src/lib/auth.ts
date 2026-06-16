import { cookies } from "next/headers";
import {
  createToken,
  verifyToken,
  SESSION_COOKIE_NAME,
  type SessionPayload,
} from "./jwt";

// Re-export để các file khác giữ nguyên import từ "@/lib/auth"
export { createToken, verifyToken, SESSION_COOKIE_NAME };
export type { SessionPayload };

// Đặt cookie phiên (gọi trong route handler / server action)
export async function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE_NAME);
}

// Lấy phiên hiện tại từ cookie (dùng trong Server Component / route handler)
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
