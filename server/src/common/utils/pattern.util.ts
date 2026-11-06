/**
 * Chuẩn hóa mật khẩu hình vẽ 3x3 thành chuỗi để băm hoặc so khớp với bcrypt.
 * Ví dụ: [1, 2, 3, 6, 9] -> "1-2-3-6-9"
 */
export function normalizePattern(pattern: number[] | string): string {
  if (Array.isArray(pattern)) {
    return pattern.join('-');
  }
  return String(pattern);
}
