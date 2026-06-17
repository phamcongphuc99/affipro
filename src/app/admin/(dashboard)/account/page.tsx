import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { roleLabel } from "@/lib/permissions";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tài khoản của tôi</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 max-w-md">
        <dl className="text-sm space-y-2">
          <div className="flex justify-between">
            <dt className="text-gray-500">Tên</dt>
            <dd className="font-medium text-gray-800">{session.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-800">{session.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Nhóm quyền</dt>
            <dd className="font-medium text-gray-800">{roleLabel(session.role)}</dd>
          </div>
        </dl>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Đổi mật khẩu</h2>
      <ChangePasswordForm />
    </div>
  );
}
