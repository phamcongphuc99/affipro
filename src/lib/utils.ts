import slugify from "slugify";

// Định dạng tiền VND
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Tính % giảm giá
export function discountPercent(
  price: number,
  salePrice: number | null | undefined
): number | null {
  if (!salePrice || salePrice >= price || price <= 0) return null;
  return Math.round(((price - salePrice) / price) * 100);
}

// Tạo slug từ chuỗi tiếng Việt
export function toSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "vi",
    trim: true,
  });
}

// Định dạng ngày tháng kiểu Việt Nam
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

// Rút gọn văn bản
export function truncate(text: string, length = 120): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "...";
}

// Loại bỏ thẻ HTML để tạo tóm tắt
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
