export const CENTER = 100
export const R_OUT = 92
export const R_IN = 62
export const FULL = Math.PI * 2
const GAP = 0.03

/** Point on a circle around the donut centre; angles are radians clockwise from 12 o'clock. */
export const polar = (radius: number, angle: number): [number, number] => [CENTER + radius * Math.sin(angle), CENTER - radius * Math.cos(angle)]

/** SVG path for a ring segment from `start` to `end` radians. */
export function arcPath(start: number, end: number): string {
  const sweep = Math.min(end - start, FULL - 0.0001)
  const stop = start + sweep
  const [x1, y1] = polar(R_OUT, start)
  const [x2, y2] = polar(R_OUT, stop)
  const [x3, y3] = polar(R_IN, stop)
  const [x4, y4] = polar(R_IN, start)
  const large = sweep > Math.PI ? 1 : 0
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${R_OUT} ${R_OUT} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}L${x3.toFixed(2)} ${y3.toFixed(2)}A${R_IN} ${R_IN} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}Z`
}

export interface DonutArc {
  /** Index into the original values array. */
  index: number
  start: number
  end: number
  /** 0–1 share of the total. */
  share: number
  /** False for zero-value segments, which are not drawn. */
  visible: boolean
}

/** Angles for each segment. A small gap separates segments when more than one is drawn. */
export function computeArcs(values: number[]): DonutArc[] {
  const total = values.reduce((t, v) => t + (v > 0 ? v : 0), 0)
  const gap = values.filter((v) => v > 0).length > 1 ? GAP : 0
  let cursor = 0
  return values.map((value, index) => {
    const share = total > 0 && value > 0 ? value / total : 0
    const start = cursor + gap / 2
    const end = Math.max(cursor + share * FULL - gap / 2, start + 0.001)
    cursor += share * FULL
    return { index, start, end, share, visible: share > 0 }
  })
}

/** Middle of a segment's ring, in viewBox units (where a keyboard-driven tooltip points). */
export const centroid = (arc: Pick<DonutArc, 'start' | 'end'>): [number, number] => polar((R_OUT + R_IN) / 2, (arc.start + arc.end) / 2)
