import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { DEFAULT_PREFERENCES, parsePreferences } from '../data/preferences'
import { usePersistentState } from '../hooks/usePersistentState'
import type { NotificationPrefs, Preferences, Profile } from '../types'
import { STORAGE_KEYS } from '../utils/storage'

interface PreferencesContextValue extends Preferences {
  updateProfile: (profile: Profile) => void
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void
  setTwoFactor: (enabled: boolean) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

/** Profile, notification preferences and the demo security toggle, saved to localStorage. (Theme has its own context.) */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = usePersistentState<Preferences>(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES, parsePreferences)

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ...prefs,
      updateProfile: (profile) => setPrefs((p) => ({ ...p, profile })),
      setNotificationPref: (key, enabled) => setPrefs((p) => ({ ...p, notifications: { ...p.notifications, [key]: enabled } })),
      setTwoFactor: (twoFactor) => setPrefs((p) => ({ ...p, security: { twoFactor } })),
    }),
    [prefs, setPrefs],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
