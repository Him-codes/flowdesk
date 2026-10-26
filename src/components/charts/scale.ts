const NICE = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10]
const INTEGER_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]

/** Rounds up to a "nice" axis maximum (1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8 × a power of ten). */
export function niceCeil(value: number): number {
  const exp = Math.floor(Math.log10(value))
  const fraction = value / 10 ** exp
  return (NICE.find((n) => n >= fraction) ?? 10) * 10 ** exp
}

/** Five evenly spaced ticks from 0 to `max`. */
export const quarterTicks = (max: number): number[] => [0, 1, 2, 3, 4].map((i) => (max / 4) * i)

/** Whole-number ticks from 0 (at most six), for counts such as "new customers". */
export function integerTicks(max: number): number[] {
  const top = Math.max(1, Math.ceil(max))
  const step = INTEGER_STEPS.find((s) => top / s <= 5) ?? 100000
  return Array.from({ length: Math.ceil(top / step) + 1 }, (_, i) => i * step)
}

/** Up to `count` evenly spread indexes of an `n`-item series, always including the first and last. */
export function evenIndexes(n: number, count: number): number[] {
  const c = Math.min(n, count)
  return c <= 1 ? [0] : Array.from({ length: c }, (_, i) => Math.round((i * (n - 1)) / (c - 1)))
}
