const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const integer = new Intl.NumberFormat('en-US')
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const shortDateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short' })
const fullDateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

type DateInput = string | number | Date

export const formatCurrency = (value: number) => currency.format(value)
export const formatNumber = (value: number) => integer.format(value)
export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`

/** Compact axis label: $850, $1.2k, $2M. */
export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `$${+(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${+(value / 1_000).toFixed(1)}k`
  return `$${Math.round(value)}`
}

export const formatDate = (value: DateInput) => dateFmt.format(new Date(value))
export const formatShortDate = (value: DateInput) => shortDateFmt.format(new Date(value))
export const formatMonth = (value: DateInput) => monthFmt.format(new Date(value))
export const formatFullDate = (value: DateInput) => fullDateFmt.format(new Date(value))

export function formatRelative(iso: string, now = Date.now()): string {
  const minutes = Math.floor(Math.max(0, now - Date.parse(iso)) / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days}d ago` : formatDate(iso)
}

const dateTimeFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })
export const formatDateTime = (value: DateInput) => dateTimeFmt.format(new Date(value))

/** First word of a full name, or "there" when empty (for greetings). */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] || 'there'
