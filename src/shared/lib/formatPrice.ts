export function formatPrice(value: number | null | undefined, currency = '₽'): string {
  if (value == null) return '—'
  return `${value.toLocaleString('ru-RU')} ${currency}`
}
