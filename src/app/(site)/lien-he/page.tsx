import { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Liên hệ" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const s = await getSettings();

  const items = [
    { label: "Email", value: s.contact_email },
    { label: "Điện thoại", value: s.contact_phone },
    { label: "Địa chỉ", value: s.contact_address },
    { label: "Facebook", value: s.facebook_url },
  ].filter((i) => i.value);

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Liên hệ</h1>
      <p className="text-gray-600 mb-8">
        Mọi thắc mắc hoặc hợp tác, vui lòng liên hệ với chúng tôi qua các kênh dưới đây.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl divide-y">
        {items.length > 0 ? (
          items.map((i) => (
            <div key={i.label} className="flex justify-between gap-4 px-5 py-4">
              <span className="font-medium text-gray-500">{i.label}</span>
              <span className="text-gray-900 text-right break-all">{i.value}</span>
            </div>
          ))
        ) : (
          <p className="px-5 py-4 text-gray-500">Chưa cập nhật thông tin liên hệ.</p>
        )}
      </div>
    </div>
  );
}
