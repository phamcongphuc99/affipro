import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: "Đăng nhập quản trị" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Suspense fallback={<div className="text-gray-500">Đang tải...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
