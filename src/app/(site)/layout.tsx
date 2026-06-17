import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/lib/settings";
import { parseNav } from "@/lib/nav";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  // Chỉ lấy các mục đang hiển thị cho menu
  const nav = parseNav(settings.nav_menu)
    .filter((i) => i.visible)
    .map((i) => ({ label: i.label, href: i.href }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={settings.site_name || "AffiPro"} nav={nav} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
