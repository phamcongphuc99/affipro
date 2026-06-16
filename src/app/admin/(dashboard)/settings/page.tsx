import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cấu hình website</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
