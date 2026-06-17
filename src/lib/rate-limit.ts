// Rate limit đơn giản trong bộ nhớ (theo IP). Đủ để cản brute-force cơ bản.
// Lưu ý: reset khi server khởi động lại và không chia sẻ giữa nhiều instance.
// Để chặt chẽ hơn ở production nhiều máy chủ, dùng Redis/Upstash.

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * @param key      Khóa định danh (vd: "login:1.2.3.4")
 * @param limit    Số lần cho phép trong cửa sổ thời gian
 * @param windowMs Độ dài cửa sổ (ms)
 */
export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 10 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return { allowed: true, remaining: limit - bucket.count, retryAfterSec: 0 };
}

// Đặt lại bộ đếm khi đăng nhập thành công
export function rateLimitReset(key: string) {
  store.delete(key);
}
