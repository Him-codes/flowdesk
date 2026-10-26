import type { Customer, CustomerStatus } from '../types'
import { DAY_MS, NOW } from './clock'
import { createRng } from './prng'
import { bumpDataRevision } from './revision'
import { readStored, writeStored, STORAGE_KEYS, subscribeToStorage } from '../utils/storage'

const FIRST_NAMES = ['Amina', 'Chidi', 'Tunde', 'Ngozi', 'Emeka', 'Fatima', 'Kemi', 'Sade', 'Ifeanyi', 'Zainab', 'Oluwaseun', 'Bola', 'Daniel', 'Sofia', 'Liam', 'Priya', 'Mateo', 'Hannah', 'Kenji', 'Elena', 'Omar', 'Grace', 'Noah', 'Aisha', 'Lucas', 'Mei', 'Samuel', 'Zara', 'Ethan', 'Chloe']
const LAST_NAMES = ['Okafor', 'Adeyemi', 'Bello', 'Nwosu', 'Eze', 'Ibrahim', 'Balogun', 'Chukwu', 'Okoye', 'Lawal', 'Johnson', 'Silva', 'Patel', 'Nguyen', 'Garcia', 'Kim', 'Mueller', 'Rossi', 'Haddad', 'Brown', 'Singh', 'Tanaka', 'Cohen', 'Walker', 'Moreau']
const COMPANIES = ['Northstar Studio', 'Bluepeak Logistics', 'Kora Foods', 'Lumen Labs', 'Harbor & Co', 'Greenleaf Market', 'Orbit Digital', 'Sundial Health', 'Atlas Print', 'Mosaic Agency', 'Pinecrest Realty', 'Ember Coffee', 'Vertex Fabrication', 'Nimbus Cloud', 'Riverbend Dental', 'Copperline Fitness', 'Halcyon Travel', 'Ironwood Supply', 'Saffron Kitchen', 'Quill Publishing', 'Zenith Tutors', 'Tidewater Marine', 'Juniper Design', 'Fable Games', 'Meridian Capital', 'Cobalt Security', 'Wavelength Radio', 'Terra Organics', 'Foundry Works', 'Skylark Events']

const LOCATIONS = [
  { place: 'Lagos, Nigeria', dial: '+234' }, { place: 'Abuja, Nigeria', dial: '+234' }, { place: 'London, UK', dial: '+44' },
  { place: 'Accra, Ghana', dial: '+233' }, { place: 'Nairobi, Kenya', dial: '+254' }, { place: 'Toronto, Canada', dial: '+1' },
  { place: 'Austin, USA', dial: '+1' }, { place: 'Berlin, Germany', dial: '+49' }, { place: 'Dubai, UAE', dial: '+971' },
  { place: 'Singapore', dial: '+65' }, { place: 'Johannesburg, South Africa', dial: '+27' }, { place: 'Lisbon, Portugal', dial: '+351' },
]

const TOTAL = 144
const rng = createRng(1207)
// Separate stream so adding contact details never changes the dates/statuses the other datasets depend on.
const contactRng = createRng(9001)

// First/last/company index patterns give 144 unique name pairs. Join dates are spread over ~26 months,
// with growth slowing over time, so the newest ~14 customers joined in the last 30 days.
const seededCustomers: Customer[] = Array.from({ length: TOTAL }, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length]
  const last = LAST_NAMES[(i * 7) % LAST_NAMES.length]
  const company = COMPANIES[(i * 11) % COMPANIES.length]
  const domain = `${company.split(/[\s&]+/)[0].toLowerCase()}.co`
  const daysAgo = Math.round(780 * Math.pow(1 - i / TOTAL, 1.4))
  const joinedAt = new Date(NOW - daysAgo * DAY_MS - rng() * 0.9 * DAY_MS).toISOString()

  let status: CustomerStatus = 'Active'
  if (daysAgo <= 30) status = 'New'
  else if (i > 0 && daysAgo > 90 && rng() < 0.18) status = 'Inactive'

  const place = i === 0 ? LOCATIONS[0] : LOCATIONS[Math.floor(contactRng() * LOCATIONS.length)]
  const digits = (n: number) => Array.from({ length: n }, () => Math.floor(contactRng() * 10)).join('')

  return {
    id: `CUS-${1001 + i}`,
    name: `${first} ${last}`,
    email: i === 0 ? 'amina@northstar.co' : `${first}.${last}@${domain}`.toLowerCase(),
    company,
    status,
    joinedAt,
    phone: `${place.dial} ${digits(3)} ${digits(3)} ${digits(4)}`,
    location: place.place,
  }
}).sort((a, b) => Date.parse(a.joinedAt) - Date.parse(b.joinedAt))

const isCustomer = (value: unknown): value is Customer => {
  if (!value || typeof value !== 'object') return false
  const c = value as Partial<Customer>
  return typeof c.id === 'string' && typeof c.name === 'string' && typeof c.email === 'string' &&
    typeof c.company === 'string' && typeof c.phone === 'string' && typeof c.location === 'string' &&
    typeof c.joinedAt === 'string' && Number.isFinite(Date.parse(c.joinedAt)) &&
    (['New', 'Active', 'Inactive'] as string[]).includes(c.status ?? '')
}

const seededIds = new Set(seededCustomers.map((customer) => customer.id))
const savedCustomers = readStored<Customer[]>(STORAGE_KEYS.customers, () => [], (value) =>
  Array.isArray(value) && value.every(isCustomer) ? value.filter((customer) => !seededIds.has(customer.id)) : undefined,
)

/** Seeded demo customers plus user-created customers persisted in this browser. */
export const customers: Customer[] = [...seededCustomers, ...savedCustomers]
  .sort((a, b) => Date.parse(a.joinedAt) - Date.parse(b.joinedAt))

const joinedMs = customers.map((c) => Date.parse(c.joinedAt))

/** Number of customers who had joined by `timestamp` (customers are sorted by join date). */
export function countJoinedBy(timestamp: number): number {
  let lo = 0
  let hi = joinedMs.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (joinedMs[mid] <= timestamp) lo = mid + 1
    else hi = mid
  }
  return lo
}

export const nextCustomerId = () => `CUS-${1001 + customers.length}`

/** Adds and persists a customer. New customers join now, so append order stays chronological. */
export function registerCustomer(customer: Customer): void {
  customers.push(customer)
  joinedMs.push(Date.parse(customer.joinedAt))
  writeStored(STORAGE_KEYS.customers, customers.filter((item) => !seededIds.has(item.id)))
  bumpDataRevision()
}

// Keep already-open tabs in sync when another tab creates a customer.
if (typeof window !== 'undefined') {
  subscribeToStorage(STORAGE_KEYS.customers, () => {
    const latest = readStored<Customer[]>(STORAGE_KEYS.customers, () => [], (value) =>
      Array.isArray(value) && value.every(isCustomer) ? value.filter((customer) => !seededIds.has(customer.id)) : undefined,
    )
    const known = new Set(customers.map((customer) => customer.id))
    latest.forEach((customer) => {
      if (!known.has(customer.id)) customers.push(customer)
    })
    customers.sort((a, b) => Date.parse(a.joinedAt) - Date.parse(b.joinedAt))
    joinedMs.splice(0, joinedMs.length, ...customers.map((customer) => Date.parse(customer.joinedAt)))
    bumpDataRevision()
  })
}
