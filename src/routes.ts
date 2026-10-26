/** App paths, defined once so navigation, notifications, activity and deep links can't drift apart. */
export const ROUTES = {
  dashboard: '/dashboard',
  customers: '/customers',
  transactions: '/transactions',
  analytics: '/analytics',
  tasks: '/tasks',
  notifications: '/notifications',
  settings: '/settings',
} as const

/** Opens the Customers page with this customer's details dialog already open. */
export const customerLink = (customerId: string) => `${ROUTES.customers}?customer=${encodeURIComponent(customerId)}`

/** Opens the Transactions page with the search box pre-filled (and other filters cleared). */
export const transactionsLink = (query: string) => `${ROUTES.transactions}?q=${encodeURIComponent(query)}`
