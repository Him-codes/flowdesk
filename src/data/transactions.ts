import type { PaymentMethod, Transaction, TransactionStatus } from '../types'
import { bumpDataRevision } from './revision'
import { DAY_MS, HOUR_MS, NOW, START_OF_TODAY } from './clock'
import { countJoinedBy, customers } from './customers'
import { createRng } from './prng'

export const HISTORY_DAYS = 730
const NEWEST_ID = 20481

const rng = createRng(4839)

function pickMethod(r: number): PaymentMethod {
  if (r < 0.58) return 'Card'
  if (r < 0.8) return 'Bank transfer'
  if (r < 0.92) return 'PayPal'
  return 'Wallet'
}

type Draft = Omit<Transaction, 'id'>
const drafts: Draft[] = []

const gauss = () => Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng())

// Volume grows steadily over the two years, weekends are quieter, and the last ~6 weeks carry a small
// lift (think: a recent campaign) so month-over-month comparisons read as a healthy, growing business.
for (let d = HISTORY_DAYS - 1; d >= 0; d--) {
  const dayStart = START_OF_TODAY - d * DAY_MS
  const weekday = new Date(dayStart).getDay()
  const weekendFactor = weekday === 0 ? 0.5 : weekday === 6 ? 0.65 : 1
  const lift = d < 45 ? 1 + 0.05 * (1 - d / 45) : 1
  const perDay = (1.3 + 2.6 * (1 - d / (HISTORY_DAYS - 1))) * weekendFactor * lift
  const count = Math.floor(perDay + rng())

  for (let k = 0; k < count; k++) {
    let ts = dayStart + rng() * DAY_MS
    // Keep generated rows out of the last 10 minutes so the featured newest transaction stays newest.
    if (ts > NOW - 10 * 60_000) ts = NOW - 10 * 60_000 - rng() * 4 * HOUR_MS

    const eligible = countJoinedBy(ts)
    let customer = customers[Math.floor(rng() * eligible)]
    for (let tries = 0; tries < 6 && customer.status === 'Inactive' && ts > NOW - 120 * DAY_MS; tries++) {
      customer = customers[Math.floor(rng() * eligible)]
    }

    const age = NOW - ts
    const roll = rng()
    let status: TransactionStatus = 'Completed'
    if (roll < 0.05) status = 'Failed'
    else if (roll < 0.3 && age < 36 * HOUR_MS) status = 'Pending'

    drafts.push({
      customerId: customer.id,
      customerName: customer.name,
      amount: Math.round(Math.min(4800, Math.max(25, Math.exp(5.93 + 0.7 * gauss()))) * 100) / 100,
      method: pickMethod(rng()),
      date: new Date(ts).toISOString(),
      status,
    })
  }
}

// Hand-placed rows so the newest entries always show a realistic mix of statuses.
const activeCustomer = (after: number) => customers.find((c, i) => i > after && c.status === 'Active') ?? customers[0]
const featured: Array<[(typeof customers)[number], number, PaymentMethod, TransactionStatus, number]> = [
  [customers[0], 1240, 'Card', 'Completed', 3 * 60_000],
  [activeCustomer(40), 389, 'PayPal', 'Pending', 26 * 60_000],
  [activeCustomer(70), 2150, 'Bank transfer', 'Completed', 95 * 60_000],
  [activeCustomer(95), 64.5, 'Card', 'Failed', 3 * HOUR_MS],
]
for (const [customer, amount, method, status, msAgo] of featured) {
  drafts.push({ customerId: customer.id, customerName: customer.name, amount, method, date: new Date(NOW - msAgo).toISOString(), status })
}

/** Newest first. IDs descend from TXN-20481. */
const seededTransactions: Transaction[] = drafts
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  .map((draft, index) => ({ id: `TXN-${NEWEST_ID - index}`, ...draft }))

const STORAGE_KEY = 'flowdesk:transactions'

function readSavedTransactions(): Transaction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is Transaction => {
      if (!item || typeof item !== 'object') return false
      const t = item as Partial<Transaction>
      return typeof t.id === 'string' && typeof t.customerId === 'string' && typeof t.customerName === 'string' &&
        typeof t.amount === 'number' && Number.isFinite(t.amount) && t.amount > 0 &&
        (['Card', 'Bank transfer', 'PayPal', 'Wallet'] as string[]).includes(t.method ?? '') &&
        (['Completed', 'Pending', 'Failed'] as string[]).includes(t.status ?? '') && typeof t.date === 'string' && Number.isFinite(Date.parse(t.date))
    })
  } catch {
    return []
  }
}

/** Seeded demo rows plus user-created demo transactions. */
export const transactions: Transaction[] = [...seededTransactions, ...readSavedTransactions()]
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

export function registerTransaction(transaction: Transaction): void {
  transactions.unshift(transaction)
  try {
    const saved = transactions.filter((item) => !seededTransactions.some((seed) => seed.id === item.id))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  } catch {
    // Keep the current session usable if browser storage is unavailable or full.
  }
  bumpDataRevision()
}
