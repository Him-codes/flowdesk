import { useEffect, type RefObject } from 'react'

export function useClickOutside(ref: RefObject<HTMLElement>, handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [ref, handler, active])
}
