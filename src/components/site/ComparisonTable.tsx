import SafeImage from "./SafeImage";
import { formatCurrency } from "@/lib/utils";

interface OfferRow {
  id: number;
  store: string;
  image: string | null;
  price: number | null;
}

// Bảng "So sánh nhanh": so giá CÙNG một sản phẩm trên nhiều sàn (Shopee/Lazada/Tiki...).
// Mỗi dòng là 1 sàn: ảnh, tên sàn, giá, nút mua (đếm click theo sàn).
export default function ComparisonTable({
  productId,
  productImage,
  offers,
}: {
  productId: number;
  productImage: string | null;
  offers: OfferRow[];
}) {
  if (offers.length === 0) return null;

  // Sàn rẻ nhất để gắn nhãn "Giá tốt"
  const prices = offers.map((o) => o.price).filter((p): p is number => p != null);
  const minPrice = prices.length ? Math.min(...prices) : null;

  return (
    <div className="mt-14">
      <h2 className="text-xl font-bold text-gray-900 mb-5">So sánh nhanh giá các sàn</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left font-medium px-4 py-3">Sàn</th>
              <th className="text-left font-medium px-4 py-3 whitespace-nowrap">Giá</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offers.map((o) => {
              const isCheapest = minPrice != null && o.price === minPrice;
              return (
                <tr key={o.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <SafeImage
                          src={o.image || productImage}
                          alt={o.store}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-gray-800">
                        {o.store}
                        {isCheapest && (
                          <span className="ml-2 align-middle text-[11px] bg-green-600 text-white px-1.5 py-0.5 rounded">
                            Giá tốt
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-brand-700">
                    {o.price != null ? formatCurrency(o.price) : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <a
                      href={`/api/go/${productId}?offer=${o.id}`}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-1.5 rounded-lg"
                    >
                      Mua tại {o.store}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        * Khi mua qua liên kết này, chúng tôi có thể nhận hoa hồng mà không làm tăng giá của bạn.
      </p>
    </div>
  );
}
