import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'

/** Traps Tab focus inside `ref`, closes on Escape, locks page scroll, and restores focus on close. */
export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean, onClose: () => void) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const node = ref.current
    if (!active || !node) return
    const previous = document.activeElement as HTMLElement | null
    const focusable = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
    ;(focusable()[0] ?? node).focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return e.preventDefault()
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [active, ref])
}
