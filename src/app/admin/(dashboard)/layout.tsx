import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";

export const metadata = { title: "Quản trị" };

// Toàn bộ khu vực quản trị render động (đọc DB + kiểm tra phiên đăng nhập).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar name={session.name} />
      <div className="flex-1 min-w-0">
        <div className="p-6 md:p-8 max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
