"use client";

import { useState } from "react";

interface Props {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: string;
}

// Ảnh tự thay bằng placeholder nếu URL lỗi/không tải được (nguồn ngoài chết, sai link...).
export default function SafeImage({
  src,
  alt,
  className,
  fallback = "/placeholder.svg",
}: Props) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored || !src ? fallback : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
