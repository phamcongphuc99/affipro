// Nhóm quyền (role) và mô tả phạm vi.
export type Role = "ADMIN" | "EDITOR";

export const ROLES: { value: Role; label: string; desc: string }[] = [
  {
    value: "ADMIN",
    label: "Quản trị viên",
    desc: "Toàn quyền: quản lý nội dung, tài khoản, cấu hình, menu.",
  },
  {
    value: "EDITOR",
    label: "Biên tập viên",
    desc: "Chỉ quản lý nội dung: sản phẩm, tin tức, danh mục.",
  },
];

export function roleLabel(role: string): string {
  return ROLES.find((r) => r.value === role)?.label || role;
}

// Quyền quản trị tài khoản / cấu hình / menu -> chỉ ADMIN
export function canManageUsers(role?: string): boolean {
  return role === "ADMIN";
}
export function canManageSettings(role?: string): boolean {
  return role === "ADMIN";
}
// Quyền quản lý nội dung -> ADMIN và EDITOR
export function canManageContent(role?: string): boolean {
  return role === "ADMIN" || role === "EDITOR";
}
