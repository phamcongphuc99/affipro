import Link from "next/link";
import { formatCurrency, discountPercent } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    salePrice: number | null;
    imageUrl: string | null;
    store: string | null;
    rating: number | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = discountPercent(product.price, product.salePrice);
  const finalPrice = product.salePrice ?? product.price;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col">
      <Link href={`/san-pham/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        {product.store && (
          <span className="absolute top-2 right-2 bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded">
            {product.store}
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/san-pham/${product.slug}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-brand-700">
            {product.name}
          </h3>
        </Link>

        {product.rating ? (
          <div className="flex items-center gap-1 mt-1 text-amber-500 text-sm">
            <span>★</span>
            <span className="text-gray-600">{product.rating.toFixed(1)}</span>
          </div>
        ) : null}

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-brand-700">
              {formatCurrency(finalPrice)}
            </span>
            {product.salePrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <a
            href={`/api/go/${product.id}`}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="mt-3 block text-center bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 rounded-lg transition"
          >
            Mua ngay
          </a>
        </div>
      </div>
    </div>
  );
}
