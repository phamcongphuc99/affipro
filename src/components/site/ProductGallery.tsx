"use client";

import { useState } from "react";

interface Props {
  main: string | null;
  images: string[]; // thư viện ảnh phụ
  name: string;
}

export default function ProductGallery({ main, images, name }: Props) {
  // Gộp ảnh đại diện + thư viện, loại trùng và rỗng.
  const all = [main, ...images].filter(
    (src, i, arr): src is string => !!src && arr.indexOf(src) === i
  );
  const list = all.length > 0 ? all : ["/placeholder.svg"];

  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div>
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={name} className="h-full w-full object-cover" />
      </div>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                i === active
                  ? "border-brand-600 ring-1 ring-brand-600"
                  : "border-gray-200 hover:border-brand-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${name} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
