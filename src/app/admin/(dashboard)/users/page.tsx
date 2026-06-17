import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";
import UsersManager from "@/components/admin/UsersManager";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  // Chỉ Quản trị viên mới được quản lý tài khoản
  if (!canManageUsers(session.role)) redirect("/admin");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản lý tài khoản</h1>
      <p className="text-sm text-gray-500 mb-6">
        Tạo, sửa, xóa tài khoản và phân nhóm quyền truy cập.
      </p>
      <UsersManager currentUserId={session.userId} />
    </div>
  );
}
