import type { ActivityItem, AppNotification, CategoryBreakdown, ConversionAnalytics, Customer, CustomerGrowth, RevenueAnalytics, CustomerDetail, CustomerSummary, Kpi, NewCustomerInput, NewTransactionInput, RangeKey, RevenueSeries, Transaction, TransactionDetail } from '../types'
import { buildActivity } from './activity'
import { computeCategoryBreakdown, computeConversionAnalytics, computeCustomerGrowth, computeKpis, computeRevenueAnalytics, computeRevenueSeries } from './analytics'
import { customers, nextCustomerId, registerCustomer } from './customers'
import { buildNotifications } from './notifications'
import { getCustomerDetail, getTransactionDetail, listCustomers } from './selectors'
import { registerTransaction, transactions } from './transactions'

export interface RequestOptions {
  signal?: AbortSignal
}

/** Simulated network/server failure. The message is safe to show to the user. */
export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

/** A rejected input, tied to a form field. */
export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

const cannot = (action: string, what: string) => `We couldn't ${action} ${what}. Check your connection and try again.`

// Demo aid: open any page with `?simulateError` and the first request for each resource fails once,
// so loading → error → retry → success can be exercised without a real backend.
const failedOnce = new Set<string>()

function shouldFail(key: string): boolean {
  if (typeof window === 'undefined' || !new URLSearchParams(window.location.search).has('simulateError')) return false
  if (failedOnce.has(key)) return false
  failedOnce.add(key)
  return true
}

/** Resolves `produce()` after a short random delay. Aborting the signal cancels the request. */
function simulate<T>(key: string, failureMessage: string, produce: () => T, { signal }: RequestOptions = {}): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))

    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      try {
        if (shouldFail(key)) reject(new ApiError(failureMessage))
        else resolve(produce())
      } catch (error) {
        reject(error)
      }
    }, 350 + Math.random() * 650)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export const api = {
  // Dashboard
  getKpis: (options?: RequestOptions): Promise<Kpi[]> => simulate('kpis', cannot('load', 'your key metrics'), computeKpis, options),

  getRevenueSeries: (range: RangeKey, options?: RequestOptions): Promise<RevenueSeries> =>
    simulate('revenue', cannot('load', 'revenue data'), () => computeRevenueSeries(range), options),

  getRecentTransactions: (limit = 8, options?: RequestOptions): Promise<Transaction[]> =>
    simulate('recent-transactions', cannot('load', 'recent transactions'), () => transactions.slice(0, limit), options),

  getActivity: (limit = 10, options?: RequestOptions): Promise<ActivityItem[]> =>
    simulate('activity', cannot('load', 'recent activity'), () => buildActivity(limit), options),

  // Analytics
  getRevenueAnalytics: (range: RangeKey, options?: RequestOptions): Promise<RevenueAnalytics> =>
    simulate('analytics-revenue', cannot('load', 'revenue analytics'), () => computeRevenueAnalytics(range), options),

  getCustomerGrowth: (range: RangeKey, options?: RequestOptions): Promise<CustomerGrowth> =>
    simulate('analytics-customers', cannot('load', 'customer growth'), () => computeCustomerGrowth(range), options),

  getConversionAnalytics: (range: RangeKey, options?: RequestOptions): Promise<ConversionAnalytics> =>
    simulate('analytics-conversion', cannot('load', 'conversion data'), () => computeConversionAnalytics(range), options),

  getCategoryBreakdown: (range: RangeKey, options?: RequestOptions): Promise<CategoryBreakdown> =>
    simulate('analytics-categories', cannot('load', 'revenue by category'), () => computeCategoryBreakdown(range), options),

  // Customers
  getCustomers: (options?: RequestOptions): Promise<CustomerSummary[]> =>
    simulate('customers', cannot('load', 'your customers'), listCustomers, options),

  getCustomerDetail: (id: string, options?: RequestOptions): Promise<CustomerDetail> =>
    simulate('customer-detail', cannot('load', 'this customer'), () => {
      const detail = getCustomerDetail(id)
      if (!detail) throw new ApiError('That customer no longer exists.')
      return detail
    }, options),

  createCustomer: (input: NewCustomerInput, options?: RequestOptions): Promise<Customer> =>
    simulate('create-customer', cannot('add', 'the customer'), () => {
      const email = input.email.trim().toLowerCase()
      if (customers.some((c) => c.email.toLowerCase() === email)) {
        throw new ValidationError('email', 'A customer with this email already exists.')
      }
      const customer: Customer = {
        id: nextCustomerId(),
        name: input.name.trim(),
        email,
        company: input.company.trim(),
        status: input.status,
        joinedAt: new Date().toISOString(),
        phone: input.phone.trim(),
        location: input.location.trim(),
      }
      registerCustomer(customer)
      return customer
    }, options),

  // Notifications
  getNotifications: (options?: RequestOptions): Promise<AppNotification[]> =>
    simulate('notifications', cannot('load', 'your notifications'), buildNotifications, options),

  // Transactions
  getTransactions: (options?: RequestOptions): Promise<Transaction[]> =>
    simulate('transactions', cannot('load', 'your transactions'), () => [...transactions].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)), options),

  createTransaction: (input: NewTransactionInput, options?: RequestOptions): Promise<Transaction> =>
    simulate('create-transaction', cannot('save', 'the transaction'), () => {
      const customer = customers.find((item) => item.id === input.customerId)
      if (!customer) throw new ValidationError('customerId', 'Choose an existing customer.')
      if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount > 1_000_000_000) {
        throw new ValidationError('amount', 'Enter an amount greater than zero and below 1,000,000,000.')
      }
      const transaction: Transaction = {
        id: `TXN-${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        amount: Math.round(input.amount * 100) / 100,
        method: input.method,
        date: new Date().toISOString(),
        status: input.status,
      }
      registerTransaction(transaction)
      return transaction
    }, options),

  getTransactionDetail: (id: string, options?: RequestOptions): Promise<TransactionDetail> =>
    simulate('transaction-detail', cannot('load', 'this transaction'), () => {
      const detail = getTransactionDetail(id)
      if (!detail) throw new ApiError('That transaction no longer exists.')
      return detail
    }, options),
}
