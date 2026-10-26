import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'
import { cx } from '../../utils/cx'
import s from './Dropdown.module.css'

export interface DropdownItem {
  id: string
  label: string
  icon?: ReactNode
  danger?: boolean
  onSelect: () => void
}

interface DropdownProps {
  /** Accessible name for both the trigger and the menu. */
  label: string
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'start' | 'end'
}

export function Dropdown({ label, trigger, items, align = 'end' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useClickOutside(wrapRef, () => setOpen(false), open)

  useEffect(() => {
    if (open) menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [open])

  const close = (restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const els = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
    const index = els.indexOf(document.activeElement as HTMLElement)
    const move = (to: number) => {
      e.preventDefault()
      els[(to + els.length) % els.length]?.focus()
    }
    if (e.key === 'ArrowDown') move(index + 1)
    else if (e.key === 'ArrowUp') move(index - 1)
    else if (e.key === 'Home') move(0)
    else if (e.key === 'End') move(els.length - 1)
    else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab') close(false)
  }

  return (
    <div ref={wrapRef} className={s.wrap}>
      <button
        ref={triggerRef}
        type="button"
        className={s.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>
      {open && (
        <div ref={menuRef} id={menuId} role="menu" aria-label={label} className={cx(s.menu, s[align])} onKeyDown={onKeyDown}>
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              type="button"
              className={cx(s.item, item.danger && s.danger)}
              onClick={() => {
                close()
                item.onSelect()
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
