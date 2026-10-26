import { useToast } from '../../context/ToastContext'
import { useTheme, type Theme } from '../../context/ThemeContext'
import { cx } from '../../utils/cx'
import { SettingsSection } from './SettingsSection'
import s from './AppearanceSection.module.css'

const OPTIONS: { value: Theme; label: string; description: string }[] = [
  { value: 'dark', label: 'Dark mode', description: 'Easier on the eyes in low light.' },
  { value: 'light', label: 'Light mode', description: 'Bright and high-contrast.' },
]

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const toast = useToast()

  return (
    <SettingsSection id="settings-appearance" title="Appearance" description="Choose how FlowDesk looks. Your choice is applied immediately and remembered.">
      <fieldset className={s.group}>
        <legend className="sr-only">Theme</legend>
        {OPTIONS.map((option) => (
          <label key={option.value} className={cx(s.option, theme === option.value && s.selected)}>
            <input
              type="radio"
              name="theme"
              className={s.radio}
              value={option.value}
              checked={theme === option.value}
              onChange={() => {
                setTheme(option.value)
                toast.success('Preferences saved.')
              }}
            />
            <span className={cx(s.preview, s[option.value])} aria-hidden="true">
              <span className={s.side} />
              <span className={s.main}>
                <span className={s.bar} />
                <span className={s.body}>
                  <i style={{ height: '40%' }} />
                  <i style={{ height: '70%' }} />
                  <i style={{ height: '55%' }} />
                  <i style={{ height: '90%' }} />
                </span>
              </span>
            </span>
            <span className={s.label}>
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </span>
          </label>
        ))}
      </fieldset>
    </SettingsSection>
  )
}
