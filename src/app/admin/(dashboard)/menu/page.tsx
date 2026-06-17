import { getSettings } from "@/lib/settings";
import { parseNav } from "@/lib/nav";
import MenuManager from "@/components/admin/MenuManager";

export default async function AdminMenuPage() {
  const settings = await getSettings();
  const nav = parseNav(settings.nav_menu);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý menu</h1>
      <MenuManager initial={nav} />
    </div>
  );
}
