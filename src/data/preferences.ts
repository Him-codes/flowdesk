import type { AppNotification, NotificationPrefs, Preferences } from '../types'
import { demoUser } from './user'

export const DEFAULT_PREFERENCES: Preferences = {
  profile: { name: demoUser.name, email: demoUser.email, company: demoUser.company, avatar: '' },
  notifications: { email: true, payments: true, tasks: true, customers: true },
  security: { twoFactor: false },
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const text = (value: unknown, fallback: string) => (typeof value === 'string' ? value : fallback)
const flag = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback)
/** Only photos this app created (JPEG data URLs) are accepted; anything else is treated as "no photo". */
const photo = (value: unknown) => (typeof value === 'string' && value.startsWith('data:image/') ? value : '')

/**
 * Rebuilds preferences from stored data field by field, using defaults only for what is missing or invalid, so one bad
 * or outdated value never wipes unrelated settings (a damaged notifications section keeps your profile, and so on).
 * Returns undefined only when the stored value isn't an object at all.
 */
export function parsePreferences(value: unknown): Preferences | undefined {
  if (!isObject(value)) return undefined
  const profile = isObject(value.profile) ? value.profile : {}
  const notifications = isObject(value.notifications) ? value.notifications : {}
  const security = isObject(value.security) ? value.security : {}
  const d = DEFAULT_PREFERENCES
  return {
    profile: {
      name: text(profile.name, d.profile.name),
      email: text(profile.email, d.profile.email),
      company: text(profile.company, d.profile.company),
      avatar: photo(profile.avatar),
    },
    notifications: {
      email: flag(notifications.email, d.notifications.email),
      payments: flag(notifications.payments, d.notifications.payments),
      tasks: flag(notifications.tasks, d.notifications.tasks),
      customers: flag(notifications.customers, d.notifications.customers),
    },
    security: { twoFactor: flag(security.twoFactor, d.security.twoFactor) },
  }
}

/** Hides notification types the user has switched off. System notices are always shown. */
export function filterNotifications(list: AppNotification[], prefs: NotificationPrefs): AppNotification[] {
  return list.filter((n) => {
    if (n.type === 'payment') return prefs.payments
    if (n.type === 'task') return prefs.tasks
    if (n.type === 'customer') return prefs.customers
    return true
  })
}
