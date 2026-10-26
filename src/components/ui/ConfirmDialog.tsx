import { Button } from './Button'
import { Modal } from './Modal'
import s from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** Confirmation for destructive actions. Built on Modal, so it traps focus and closes on Escape. */
export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className={s.text}>{description}</p>
    </Modal>
  )
}
