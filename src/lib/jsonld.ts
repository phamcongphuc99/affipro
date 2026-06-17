// Chuyển object thành chuỗi JSON-LD an toàn để nhúng trong <script>.
// Escape "<" thành < để dữ liệu chứa "</script>" không thể thoát khỏi thẻ.
export function jsonLdString(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
