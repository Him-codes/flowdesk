import { useState, type FormEvent } from 'react'
import { Badge, Button, Input, Notice, Toggle } from '../../components/ui'
import { usePreferences } from '../../context/PreferencesContext'
import { useToast } from '../../context/ToastContext'
import { SettingsSection } from './SettingsSection'
import { TwoFactorDialog } from './TwoFactorDialog'
import { PASSWORD_FIELD_ORDER, validatePasswordChange, type PasswordErrors, type PasswordField, type PasswordForm } from './validation'
import s from './SecuritySection.module.css'

const EMPTY: PasswordForm = { current: '', next: '', confirm: '' }
const FIELD_IDS: Record<PasswordField, string> = { current: 'password-current', next: 'password-new', confirm: 'password-confirm' }

export function SecuritySection() {
  const { security, setTwoFactor } = usePreferences()
  const toast = useToast()
  const [form, setForm] = useState<PasswordForm>(EMPTY)
  const [errors, setErrors] = useState<PasswordErrors>({})
  const [setupOpen, setSetupOpen] = useState(false)

  const setField = (field: PasswordField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const found = validatePasswordChange(form)
    const firstInvalid = PASSWORD_FIELD_ORDER.find((field) => found[field])
    if (firstInvalid) {
      setErrors(found)
      document.getElementById(FIELD_IDS[firstInvalid])?.focus()
      return
    }
    // Deliberately nothing is sent or stored: the fields are cleared and the user is told so.
    setForm(EMPTY)
    setErrors({})
    toast.info('Demo only: your password was not changed and nothing was stored.')
  }

  return (
    <SettingsSection id="settings-security" title="Security" description="Password and two-factor controls.">
      <Notice tone="warning">These controls are a user-interface demo. They do not provide real authentication or security: no passwords are stored or sent, and two-factor is not enforced.</Notice>

      <div className={s.block}>
        <h3 className={s.blockTitle}>Password</h3>
        <form className={s.form} noValidate onSubmit={onSubmit}>
          <Input id={FIELD_IDS.current} label="Current password" type="password" autoComplete="off" value={form.current} error={errors.current} onChange={(e) => setField('current', e.target.value)} />
          <Input id={FIELD_IDS.next} label="New password" type="password" autoComplete="off" hint="At least 8 characters." value={form.next} error={errors.next} onChange={(e) => setField('next', e.target.value)} />
          <Input id={FIELD_IDS.confirm} label="Confirm new password" type="password" autoComplete="off" value={form.confirm} error={errors.confirm} onChange={(e) => setField('confirm', e.target.value)} />
          <div>
            <Button type="submit" variant="secondary">
              Update password
            </Button>
          </div>
        </form>
      </div>

      <hr className={s.divider} />

      <div className={s.block}>
        <h3 className={s.blockTitle}>Two-factor authentication</h3>
        <Toggle
          label="Two-factor authentication"
          description="Adds a second step at sign-in. Demo UI only."
          checked={security.twoFactor}
          onChange={(enabled) => {
            if (enabled) setSetupOpen(true)
            else {
              setTwoFactor(false)
              toast.info('Two-factor authentication turned off (demo).')
            }
          }}
        />
        <div className={s.status}>
          <Badge tone={security.twoFactor ? 'success' : 'neutral'}>{security.twoFactor ? 'On (demo)' : 'Off'}</Badge>
        </div>
      </div>

      <TwoFactorDialog
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        onEnabled={() => {
          setTwoFactor(true)
          setSetupOpen(false)
          toast.success('Two-factor authentication turned on (demo only).')
        }}
      />
    </SettingsSection>
  )
}
