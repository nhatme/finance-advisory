export function vnd(n: number | null | undefined): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(n) + 'đ'
}

export function pct(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${n.toFixed(1)}%`
}

export const PRODUCT_TYPE_LABEL: Record<string, string> = {
  savings: 'Tiết kiệm',
  fund: 'Quỹ mở',
  credit_card: 'Thẻ tín dụng',
}

export const RISK_LABEL: Record<string, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
}

export const RISK_COLOR: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
}

export const GOAL_LABEL: Record<string, string> = {
  save: 'Tiết kiệm an toàn',
  grow: 'Tăng trưởng vốn',
  spend: 'Chi tiêu thông minh',
  learn: 'Tập đầu tư',
}
