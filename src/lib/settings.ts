import { cache } from "react";
import { prisma } from "./prisma";

// Lấy toàn bộ cấu hình site dưới dạng object key-value.
// Bọc trong React cache() để nhiều lần gọi trong cùng 1 request chỉ truy vấn DB 1 lần
// (vd layout + nhiều trang con cùng cần settings).
export const getSettings = cache(
  async (): Promise<Record<string, string>> => {
    try {
      const rows = await prisma.setting.findMany();
      const result: Record<string, string> = {};
      for (const row of rows) result[row.key] = row.value;
      return result;
    } catch {
      // Trả về object rỗng nếu DB chưa sẵn sàng (tránh vỡ trang)
      return {};
    }
  }
);

// Lấy một giá trị cấu hình kèm giá trị mặc định
export async function getSetting(
  key: string,
  fallback = ""
): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}
