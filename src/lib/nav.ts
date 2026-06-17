// Cấu hình menu điều hướng trên header. Lưu trong Setting (key: nav_menu) dạng JSON.

export interface NavItem {
  label: string;
  href: string;
  visible: boolean;
}

// Menu mặc định khi chưa cấu hình
export const DEFAULT_NAV: NavItem[] = [
  { label: "Trang chủ", href: "/", visible: true },
  { label: "Sản phẩm", href: "/san-pham", visible: true },
  { label: "Tin tức", href: "/tin-tuc", visible: true },
  { label: "Giới thiệu", href: "/gioi-thieu", visible: true },
  { label: "Liên hệ", href: "/lien-he", visible: true },
];

// Phân tích JSON menu từ Setting; trả về mặc định nếu lỗi/rỗng.
export function parseNav(raw?: string | null): NavItem[] {
  if (!raw) return DEFAULT_NAV;
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) {
      return arr
        .filter((i) => i && typeof i.label === "string" && typeof i.href === "string")
        .map((i) => ({
          label: String(i.label),
          href: String(i.href),
          visible: i.visible !== false,
        }));
    }
  } catch {
    // bỏ qua, dùng mặc định
  }
  return DEFAULT_NAV;
}
