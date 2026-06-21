import type { WeightEntry } from './types'

/** Current weight = newest weightLog entry (log is stored newest-first). */
export function currentWeight(log: WeightEntry[]): number | undefined {
  return log[0]?.kg
}

/** BMI = kg / (height_m)^2, rounded to 1 decimal. */
export function bmi(kg: number, heightCm: number): number {
  const m = heightCm / 100
  return +(kg / (m * m)).toFixed(1)
}

/** Signed number with explicit + / − sign (uses figure dash for negatives). */
export function signed(n: number, digits = 0): string {
  const s = n.toFixed(digits)
  if (n > 0) return `+${s}`
  if (n < 0) return `−${Math.abs(n).toFixed(digits)}`
  return s
}

/** Clamp helper. */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
