// Relative-day X-axis labels for an N-point daily series: 「−Nd … 今天」 (3 ticks).
// e.g. relDayLabels(28) → ['−27d', '−14d', '今天']
export function relDayLabels(n: number): string[] {
  if (n <= 1) return ['今天']
  return [`−${n - 1}d`, `−${Math.round((n - 1) / 2)}d`, '今天']
}
