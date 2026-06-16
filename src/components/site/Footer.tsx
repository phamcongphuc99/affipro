import Link from "next/link";

export default function Footer({
  settings,
}: {
  settings: Record<string, string>;
}) {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-xl font-bold text-white mb-3">
            {settings.site_name || "AffiPro"}
          </div>
          <p className="text-sm text-gray-400 max-w-md">
            {settings.site_description ||
              "Trang giới thiệu, đánh giá và tổng hợp ưu đãi sản phẩm từ các sàn thương mại điện tử."}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Liên kết</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/san-pham" className="hover:text-white">Sản phẩm</Link></li>
            <li><Link href="/tin-tuc" className="hover:text-white">Tin tức</Link></li>
            <li><Link href="/gioi-thieu" className="hover:text-white">Giới thiệu</Link></li>
            <li><Link href="/lien-he" className="hover:text-white">Liên hệ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Liên hệ</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            {settings.contact_email && <li>Email: {settings.contact_email}</li>}
            {settings.contact_phone && <li>ĐT: {settings.contact_phone}</li>}
            {settings.contact_address && <li>{settings.contact_address}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container py-4 text-sm text-gray-500 text-center">
          {settings.footer_text || "© 2026 AffiPro. Mọi quyền được bảo lưu."}
        </div>
      </div>
    </footer>
  );
}
