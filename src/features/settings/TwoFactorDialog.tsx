import { useState, type FormEvent } from 'react'
import { QrCode } from 'lucide-react'
import { Button, Input, Modal, Notice } from '../../components/ui'
import { validateTwoFactorCode } from './validation'
import s from './TwoFactorDialog.module.css'

const FORM_ID = 'two-factor-form'

interface TwoFactorDialogProps {
  open: boolean
  onClose: () => void
  onEnabled: () => void
}

function TwoFactorForm({ onClose, onEnabled }: Omit<TwoFactorDialogProps, 'open'>) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const problem = validateTwoFactorCode(code)
    if (problem) {
      setError(problem)
      document.getElementById('two-factor-code')?.focus()
      return
    }
    onEnabled()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Set up two-factor authentication"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID}>
            Turn on
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={s.content} noValidate onSubmit={onSubmit}>
        <Notice tone="warning">Demo only. This does not create a real second factor, and nothing is verified or enforced.</Notice>
        <div className={s.qr} role="img" aria-label="Placeholder for a QR code. This demo does not generate real codes.">
          <QrCode size={48} aria-hidden="true" />
          <span>QR code placeholder</span>
        </div>
        <p className={s.help}>In a real app you would scan the code with an authenticator app, then enter the 6-digit code it shows.</p>
        <Input
          id="two-factor-code"
          label="6-digit code"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          placeholder="123456"
          value={code}
          error={error}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ''))
            setError(undefined)
          }}
        />
      </form>
    </Modal>
  )
}

export function TwoFactorDialog({ open, ...rest }: TwoFactorDialogProps) {
  return open ? <TwoFactorForm {...rest} /> : null
}
