// Page-number list with … collapse when there are more than 7 pages.
// e.g. pageNums(5, 20) → [1, 2, '…', 4, 5, 6, '…', 19, 20]
export function pageNums(cur: number, pages: number): (number | '…')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const s = new Set([1, 2, pages - 1, pages, cur - 1, cur, cur + 1])
  const arr = [...s].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  for (let i = 0; i < arr.length; i++) {
    if (i && arr[i] - arr[i - 1] > 1) out.push('…')
    out.push(arr[i])
  }
  return out
}
