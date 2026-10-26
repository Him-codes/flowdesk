const SCHEMA_VERSION = 1

/**
 * Every key FlowDesk keeps in the browser. Add new keys here so the full list stays auditable.
 * (The inline script in index.html reads the theme key directly to avoid a flash on load.)
 */
export const STORAGE_KEYS = {
  theme: 'flowdesk:theme',
  preferences: 'flowdesk:preferences',
  tasks: 'flowdesk:tasks',
  notificationsRead: 'flowdesk:notifications-read',
  customers: 'flowdesk:customers',
} as const

/** Keys written by earlier versions that nothing reads any more (chart date ranges are no longer remembered). */
const LEGACY_KEYS = ['flowdesk:dashboard-range', 'flowdesk:analytics-range']

/** Turns untrusted stored data into a valid value, or `undefined` if it can't be used. Must be idempotent. */
export type Parse<T> = (value: unknown) => T | undefined

/** Adapts a type guard into a `Parse` (all-or-nothing). */
export const parseWith =
  <T>(is: (value: unknown) => value is T): Parse<T> =>
  (value) =>
    is(value) ? value : undefined

/**
 * Reads a versioned value from localStorage. Falls back when storage is unavailable, the JSON is corrupt,
 * the schema version differs, or `parse` rejects the data, so bad stored data can never crash the app.
 */
export function readStored<T>(key: string, fallback: () => T, parse?: Parse<T>): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.v === SCHEMA_VERSION) {
        const value = parse ? parse(parsed.data) : (parsed.data as T)
        if (value !== undefined) return value
      }
    }
  } catch {
    /* storage blocked or corrupt: use the fallback */
  }
  return fallback()
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ v: SCHEMA_VERSION, data: value }))
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

/** Runs `onChange` when ANOTHER tab changes (or clears) this key, so open tabs stay in step. Returns an unsubscribe. */
export function subscribeToStorage(key: string, onChange: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === key || event.key === null) onChange()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

/** Removes keys that earlier versions wrote and nothing reads any more. */
export function clearLegacyStorage(): void {
  try {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch {
    /* storage blocked: nothing to clean */
  }
}
