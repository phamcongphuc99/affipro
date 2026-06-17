import DOMPurify from "isomorphic-dompurify";

// Làm sạch HTML do CMS sinh ra trước khi render, loại bỏ <script>, sự kiện onclick,
// javascript: ... để chống tấn công XSS (kể cả khi nội dung do người dùng nội bộ nhập).
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    // Cho phép các thẻ định dạng văn bản thường dùng trong bài viết
    ALLOWED_TAGS: [
      "p", "br", "b", "strong", "i", "em", "u", "s", "strike", "del",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "hr",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div", "code", "pre",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class", "width", "height"],
    // Chặn các giao thức nguy hiểm (javascript:, data:text/html...)
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ["target"],
  });
}
