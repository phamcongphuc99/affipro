"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import MultiImageUpload from "./MultiImageUpload";
import RichTextEditor from "./RichTextEditor";

interface Category {
  id: number;
  name: string;
}

interface Offer {
  store: string;
  url: string;
  image?: string | null;
  price?: number | string | null;
}

interface ProductData {
  id?: number;
  name?: string;
  slug?: string;
  description?: string | null;
  content?: string | null;
  price?: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  gallery?: string | null;
  affiliateUrl?: string;
  store?: string | null;
  rating?: number | null;
  pros?: string | null;
  cons?: string | null;
  bestFor?: string | null;
  compareIds?: string | null;
  featured?: boolean;
  published?: boolean;
  categoryId?: number | null;
  offers?: Offer[];
}

export default function ProductForm({
  product,
  categories,
  allProducts = [],
}: {
  product?: ProductData;
  categories: Category[];
  allProducts?: { id: number; name: string }[];
}) {
  const router = useRouter();
  const isEdit = !!product?.id;

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    content: product?.content || "",
    price: product?.price ?? 0,
    salePrice: product?.salePrice ?? "",
    imageUrl: product?.imageUrl || "",
    affiliateUrl: product?.affiliateUrl || "",
    store: product?.store || "",
    rating: product?.rating ?? "",
    pros: product?.pros || "",
    cons: product?.cons || "",
    bestFor: product?.bestFor || "",
    featured: product?.featured ?? false,
    published: product?.published ?? true,
    categoryId: product?.categoryId ?? "",
  });
  // Thư viện ảnh (tối đa 5) lưu riêng dưới dạng mảng, gửi lên dưới dạng JSON.
  const [gallery, setGallery] = useState<string[]>(() => {
    try {
      return product?.gallery ? JSON.parse(product.gallery) : [];
    } catch {
      return [];
    }
  });
  // Link mua ở nhiều sàn (Shopee/Lazada/Tiki) để so giá. Đây cũng là dữ liệu cho
  // bảng "So sánh nhanh" trên trang sản phẩm.
  const [offers, setOffers] = useState<Offer[]>(
    () =>
      product?.offers?.map((o) => ({
        store: o.store,
        url: o.url,
        image: o.image ?? "",
        price: o.price ?? "",
      })) || []
  );

  function setOffer(i: number, key: keyof Offer, value: string) {
    setOffers((list) => list.map((o, idx) => (idx === i ? { ...o, [key]: value } : o)));
  }
  function addOffer() {
    setOffers((list) => [...list, { store: "", url: "", image: "", price: "" }]);
  }
  function removeOffer(i: number) {
    setOffers((list) => list.filter((_, idx) => idx !== i));
  }
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      price: Number(form.price) || 0,
      salePrice: form.salePrice === "" ? null : Number(form.salePrice),
      rating: form.rating === "" ? null : Number(form.rating),
      categoryId: form.categoryId === "" ? null : Number(form.categoryId),
      gallery: gallery.length ? JSON.stringify(gallery) : null,
      // chỉ gửi link sàn có đủ tên sàn + url
      offers: offers
        .filter((o) => o.store.trim() && String(o.url).trim())
        .map((o) => ({
          store: o.store.trim(),
          url: String(o.url).trim(),
          image: o.image ? String(o.image).trim() : null,
          price: o.price === "" || o.price == null ? null : Number(o.price),
        })),
    };

    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lưu thất bại.");
        setSaving(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Lỗi kết nối máy chủ.");
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl">
      {/* Thanh hành động dính trên cùng - luôn thấy khi cuộn */}
      <div className="sticky top-0 z-20 -mx-6 md:-mx-8 px-6 md:px-8 py-3 bg-gray-100/95 backdrop-blur border-b border-gray-200 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo sản phẩm"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className={labelCls}>Tên sản phẩm *</label>
          <input
            className={input}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelCls}>Slug (để trống sẽ tự tạo)</label>
          <input
            className={input}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="vd: tai-nghe-bluetooth"
          />
        </div>

        <div>
          <label className={labelCls}>Mô tả ngắn</label>
          <textarea
            className={input}
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <ImageUpload
          label="Ảnh đại diện"
          value={form.imageUrl}
          onChange={(url) => set("imageUrl", url)}
        />

        <MultiImageUpload
          label="Thư viện ảnh (hiển thị dưới ảnh chính)"
          value={gallery}
          onChange={setGallery}
          max={5}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Giá gốc (VND) *</label>
          <input
            type="number"
            min={0}
            className={input}
            value={form.price}
            onChange={(e) => set("price", e.target.value as any)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Giá khuyến mãi (VND)</label>
          <input
            type="number"
            min={0}
            className={input}
            value={form.salePrice}
            onChange={(e) => set("salePrice", e.target.value as any)}
            placeholder="Để trống nếu không giảm giá"
          />
        </div>
        <div>
          <label className={labelCls}>Sàn / Cửa hàng</label>
          <input
            className={input}
            value={form.store}
            onChange={(e) => set("store", e.target.value)}
            placeholder="Shopee, Lazada, Tiki..."
          />
        </div>
        <div>
          <label className={labelCls}>Đánh giá (0 - 5)</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            className={input}
            value={form.rating}
            onChange={(e) => set("rating", e.target.value as any)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Link affiliate (Mua ngay) *</label>
          <input
            className={input}
            value={form.affiliateUrl}
            onChange={(e) => set("affiliateUrl", e.target.value)}
            placeholder="https://shopee.vn/..."
            required
          />
        </div>
        <div>
          <label className={labelCls}>Danh mục</label>
          <select
            className={input}
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value as any)}
          >
            <option value="">-- Không có --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>

      {/* Review kiểu Wirecutter: ưu điểm / nhược điểm / ai nên mua */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Ưu điểm (mỗi dòng 1 ý)</label>
          <textarea
            className={input}
            rows={4}
            value={form.pros}
            onChange={(e) => set("pros", e.target.value)}
            placeholder={"Pin trâu\nÂm thanh hay\nChống ồn tốt"}
          />
        </div>
        <div>
          <label className={labelCls}>Nhược điểm (mỗi dòng 1 ý)</label>
          <textarea
            className={input}
            rows={4}
            value={form.cons}
            onChange={(e) => set("cons", e.target.value)}
            placeholder={"Giá cao\nHơi nặng"}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Ai nên mua / Phù hợp với ai</label>
          <textarea
            className={input}
            rows={2}
            value={form.bestFor}
            onChange={(e) => set("bestFor", e.target.value)}
            placeholder="Người cần tai nghe chống ồn để đi làm, di chuyển nhiều..."
          />
        </div>
      </div>

      {/* Link mua ở các sàn — cũng là dữ liệu cho bảng "So sánh nhanh" trên trang sản phẩm */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className={labelCls + " mb-0"}>Link mua ở các sàn (so giá)</label>
            <p className="text-xs text-gray-500">
              Mỗi sàn nhập: tên sàn, link mua, ảnh (để trống dùng ảnh sản phẩm) và giá.
              Đây chính là dữ liệu cho bảng "So sánh nhanh" trên trang sản phẩm.
            </p>
          </div>
          <button
            type="button"
            onClick={addOffer}
            className="shrink-0 rounded-lg border border-brand-300 bg-brand-50 text-brand-700 px-3 py-1.5 text-sm font-medium hover:bg-brand-100"
          >
            + Thêm sàn
          </button>
        </div>
        {offers.length === 0 && (
          <p className="text-sm text-gray-400">Chưa có link sàn nào.</p>
        )}
        {offers.map((o, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
            {/* Hàng 1: ảnh xem trước · tên sàn · giá · nút xóa */}
            <div className="grid grid-cols-[2.5rem_1fr_8rem_2.5rem] gap-2 items-center">
              <div className="h-[38px] w-[38px] rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                {o.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={String(o.image)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] text-gray-400">ảnh</span>
                )}
              </div>
              <input
                className={input}
                value={o.store}
                onChange={(e) => setOffer(i, "store", e.target.value)}
                placeholder="Tên sàn (Shopee)"
              />
              <input
                type="number"
                min={0}
                className={input}
                value={o.price == null ? "" : String(o.price)}
                onChange={(e) => setOffer(i, "price", e.target.value)}
                placeholder="Giá"
              />
              <button
                type="button"
                onClick={() => removeOffer(i)}
                className="h-[38px] w-[38px] rounded-lg border border-gray-300 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                title="Xóa sàn này"
              >
                ✕
              </button>
            </div>
            {/* Hàng 2: link mua */}
            <input
              className={input}
              value={String(o.url)}
              onChange={(e) => setOffer(i, "url", e.target.value)}
              placeholder="Link mua: https://shopee.vn/..."
            />
            {/* Hàng 3: URL ảnh riêng của sàn (tùy chọn) */}
            <input
              className={input}
              value={o.image ? String(o.image) : ""}
              onChange={(e) => setOffer(i, "image", e.target.value)}
              placeholder="URL ảnh của sàn này (tùy chọn, để trống dùng ảnh sản phẩm)"
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <RichTextEditor
          label="Mô tả chi tiết"
          value={form.content}
          onChange={(html) => set("content", html)}
        />
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            Sản phẩm nổi bật
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Hiển thị (đã xuất bản)
          </label>
        </div>
      </div>
    </form>
  );
}
