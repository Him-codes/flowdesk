import { useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * Shared "inspect a data point" behaviour for charts: mouse hover, touch drag and keyboard arrows.
 * `indexAt` maps a pointer x (relative to the plot's left edge) to a point index, or null to ignore it.
 * Spread `bind` onto the focusable plot element.
 */
export function useChartScrub(count: number, indexAt: (x: number) => number | null) {
  const [active, setActive] = useState<number | null>(null)
  const clamp = (i: number) => Math.min(count - 1, Math.max(0, i))

  const onPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const index = indexAt(e.clientX - e.currentTarget.getBoundingClientRect().left)
    if (index !== null) setActive(clamp(index))
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const current = active ?? count - 1
    if (e.key === 'ArrowRight') setActive(clamp(current + 1))
    else if (e.key === 'ArrowLeft') setActive(clamp(current - 1))
    else if (e.key === 'Home') setActive(0)
    else if (e.key === 'End') setActive(count - 1)
    else if (e.key === 'Escape') setActive(null)
    else return
    e.preventDefault()
  }

  return {
    active,
    bind: {
      onPointerMove: onPointer,
      onPointerDown: onPointer,
      onPointerLeave: () => setActive(null),
      onFocus: () => setActive((a) => a ?? count - 1),
      onBlur: () => setActive(null),
      onKeyDown,
    },
  }
}
