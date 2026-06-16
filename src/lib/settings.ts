import { prisma } from "./prisma";

// Lấy toàn bộ cấu hình site dưới dạng object key-value
export async function getSettings(): Promise<Record<string, string>> {
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
