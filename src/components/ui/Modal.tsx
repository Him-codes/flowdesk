import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { cx } from '../../utils/cx'
import { IconButton } from './IconButton'
import s from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  /** `drawer` is a left-anchored panel used for mobile navigation. */
  variant?: 'dialog' | 'drawer'
  /** Dialog width: `lg` suits dialogs containing tables. */
  size?: 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, footer, variant = 'dialog', size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useFocusTrap(panelRef, open, onClose)

  if (!open) return null
  const isDialog = variant === 'dialog'

  return createPortal(
    <div className={cx(s.root, s[variant], size === 'lg' && s.lg)}>
      <div className={s.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={isDialog ? titleId : undefined}
        aria-label={isDialog ? undefined : title}
        tabIndex={-1}
        className={s.panel}
      >
        {isDialog && (
          <header className={s.header}>
            <h2 id={titleId}>{title}</h2>
            <IconButton label="Close dialog" size="sm" onClick={onClose}>
              <X size={18} />
            </IconButton>
          </header>
        )}
        <div className={s.body}>{children}</div>
        {footer && <footer className={s.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
