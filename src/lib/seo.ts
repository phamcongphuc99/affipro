import { toSlug } from "./utils";

// Một mục trong checklist SEO
export interface SeoCheck {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn";
  hint?: string;
}

export interface SeoInput {
  focusKeyword: string;
  title: string; // tiêu đề bài viết
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: string; // nội dung HTML
}

// Chuẩn hóa chuỗi: bỏ dấu tiếng Việt + viết thường -> so khớp "không dấu".
export function normalizeText(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

// Bỏ thẻ HTML để lấy text thuần
function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Kiểm tra từ khóa (đã chuẩn hóa) có nằm trong đoạn text (đã chuẩn hóa) không
function contains(haystack: string, keyword: string): boolean {
  if (!keyword) return false;
  return normalizeText(haystack).includes(normalizeText(keyword));
}

/**
 * Phân tích SEO của bài viết dựa trên từ khóa chính.
 * Trả về danh sách check để hiển thị màu xanh/đỏ.
 */
export function analyzeSeo(input: SeoInput): SeoCheck[] {
  const { focusKeyword, title, metaTitle, metaDescription, slug, content } =
    input;

  const effectiveTitle = metaTitle || title;
  const effectiveDesc = metaDescription;
  const contentText = stripHtml(content);
  const hasKeyword = !!focusKeyword.trim();

  const checks: SeoCheck[] = [];

  // 0. Đã đặt từ khóa chính chưa?
  checks.push({
    id: "keyword-set",
    label: "Đã đặt từ khóa chính (focus keyword)",
    status: hasKeyword ? "pass" : "fail",
    hint: hasKeyword
      ? undefined
      : "Nhập từ khóa chính để bật các kiểm tra bên dưới.",
  });

  // 1. Từ khóa trong Meta Title
  checks.push({
    id: "keyword-in-title",
    label: "Từ khóa chính xuất hiện trong Meta Title",
    status: !hasKeyword
      ? "warn"
      : contains(effectiveTitle, focusKeyword)
      ? "pass"
      : "fail",
    hint:
      hasKeyword && !contains(effectiveTitle, focusKeyword)
        ? "Nên thêm từ khóa vào tiêu đề, tốt nhất ở gần đầu."
        : undefined,
  });

  // 2. Từ khóa trong Meta Description
  checks.push({
    id: "keyword-in-desc",
    label: "Từ khóa chính xuất hiện trong Meta Description",
    status: !hasKeyword
      ? "warn"
      : contains(effectiveDesc, focusKeyword)
      ? "pass"
      : "fail",
    hint:
      hasKeyword && !contains(effectiveDesc, focusKeyword)
        ? "Thêm từ khóa vào mô tả để tăng độ liên quan."
        : undefined,
  });

  // 3. Từ khóa trong URL (slug) — so sánh dạng slug
  const keywordSlug = toSlug(focusKeyword);
  checks.push({
    id: "keyword-in-slug",
    label: "Từ khóa chính nằm trong URL (slug)",
    status: !hasKeyword
      ? "warn"
      : keywordSlug && slug.includes(keywordSlug)
      ? "pass"
      : "fail",
    hint:
      hasKeyword && !(keywordSlug && slug.includes(keywordSlug))
        ? `Slug nên chứa "${keywordSlug}".`
        : undefined,
  });

  // 4. (Nâng cao) Từ khóa xuất hiện trong nội dung
  checks.push({
    id: "keyword-in-content",
    label: "Từ khóa chính xuất hiện trong nội dung bài viết",
    status: !hasKeyword
      ? "warn"
      : contains(contentText, focusKeyword)
      ? "pass"
      : "fail",
    hint:
      hasKeyword && !contains(contentText, focusKeyword)
        ? "Dùng từ khóa tự nhiên trong nội dung (đặc biệt đoạn mở đầu)."
        : undefined,
  });

  // 5. Độ dài Meta Title (50–60 lý tưởng, tối đa 60)
  const tLen = effectiveTitle.length;
  checks.push({
    id: "title-length",
    label: `Độ dài Meta Title hợp lý (${tLen}/60)`,
    status: tLen === 0 ? "fail" : tLen <= 60 ? (tLen >= 30 ? "pass" : "warn") : "fail",
    hint:
      tLen > 60
        ? "Tiêu đề quá dài, Google sẽ cắt bớt."
        : tLen > 0 && tLen < 30
        ? "Tiêu đề hơi ngắn, nên 30–60 ký tự."
        : undefined,
  });

  // 6. Độ dài Meta Description (50–160)
  const dLen = effectiveDesc.length;
  checks.push({
    id: "desc-length",
    label: `Độ dài Meta Description hợp lý (${dLen}/160)`,
    status:
      dLen === 0 ? "fail" : dLen <= 160 ? (dLen >= 50 ? "pass" : "warn") : "fail",
    hint:
      dLen > 160
        ? "Mô tả quá dài, sẽ bị cắt."
        : dLen > 0 && dLen < 50
        ? "Mô tả hơi ngắn, nên 50–160 ký tự."
        : dLen === 0
        ? "Chưa có mô tả."
        : undefined,
  });

  return checks;
}

// Tính điểm SEO tổng quát (0–100) để hiển thị nhanh
export function seoScore(checks: SeoCheck[]): number {
  const scored = checks.filter((c) => c.status !== "warn");
  if (scored.length === 0) return 0;
  const passed = scored.filter((c) => c.status === "pass").length;
  return Math.round((passed / scored.length) * 100);
}
