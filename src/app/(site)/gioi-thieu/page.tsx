import { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { sanitizeHtml } from "@/lib/sanitize";

export const metadata: Metadata = { title: "Giới thiệu" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSettings();
  const content = sanitizeHtml(
    settings.about_content ||
      "<p>Nội dung giới thiệu chưa được cập nhật. Vui lòng vào trang quản trị để chỉnh sửa.</p>"
  );

  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Giới thiệu về {settings.site_name || "chúng tôi"}
      </h1>
      <div
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
