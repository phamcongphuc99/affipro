import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={settings.site_name || "AffiPro"} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
