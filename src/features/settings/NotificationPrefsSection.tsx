import { Toggle } from '../../components/ui'
import { usePreferences } from '../../context/PreferencesContext'
import { useToast } from '../../context/ToastContext'
import type { NotificationPrefs } from '../../types'
import { SettingsSection } from './SettingsSection'
import s from './NotificationPrefsSection.module.css'

const ITEMS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: 'email', label: 'Email notifications', description: 'Simulated only. FlowDesk never sends real email in this demo.' },
  { key: 'payments', label: 'Payment notifications', description: 'Show payment updates in your Notifications feed.' },
  { key: 'tasks', label: 'Task notifications', description: 'Show task reminders and completions in your feed.' },
  { key: 'customers', label: 'Customer notifications', description: 'Show new customer sign-ups in your feed.' },
]

export function NotificationPrefsSection() {
  const { notifications, setNotificationPref } = usePreferences()
  const toast = useToast()

  return (
    <SettingsSection
      id="settings-notifications"
      title="Notifications"
      description="Choose which updates appear in your Notifications page. Turning a type off hides it there and in the unread counts straight away."
    >
      <ul className={s.list}>
        {ITEMS.map((item) => (
          <li key={item.key} className={s.item}>
            <Toggle
              label={item.label}
              description={item.description}
              checked={notifications[item.key]}
              onChange={(enabled) => {
                setNotificationPref(item.key, enabled)
                toast.success('Preferences saved.')
              }}
            />
          </li>
        ))}
      </ul>
    </SettingsSection>
  )
}
