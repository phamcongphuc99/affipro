import { NextRequest, NextResponse } from "next/server";
import { verifyToken, SESSION_COOKIE_NAME } from "@/lib/jwt";

// Bảo vệ tất cả route /admin/* (trừ /admin/login).
// Nếu chưa đăng nhập -> chuyển về trang login.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // Đã đăng nhập mà vào trang login -> đưa về dashboard
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Vào trang admin khác mà chưa đăng nhập -> về login
  if (!isLoginPage && !session) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
