import type { ActivityItem, CustomerDetail, CustomerSummary, TransactionDetail, TransactionStatus } from '../types'
import { formatCurrency } from '../utils/format'
import { customers } from './customers'
import { transactions } from './transactions'


const summarize = (c: (typeof customers)[number]): CustomerSummary => {
  const own = transactions.filter((t) => t.customerId === c.id).sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  const spent = own.reduce((total, t) => total + (t.status === 'Completed' ? t.amount : 0), 0)
  return {
    ...c,
    totalSpent: Math.round(spent * 100) / 100,
    transactionCount: own.length,
    lastActivity: own[0]?.date ?? c.joinedAt,
  }
}

export const listCustomers = (): CustomerSummary[] => customers.map(summarize)

const PAYMENT_TITLES: Record<TransactionStatus, string> = { Completed: 'Payment received', Pending: 'Payment pending', Failed: 'Payment failed' }

export function getCustomerDetail(id: string): CustomerDetail | null {
  const customer = customers.find((c) => c.id === id)
  if (!customer) return null
  const own = transactions.filter((t) => t.customerId === id).sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

  const activity: ActivityItem[] = own.slice(0, 5).map((t) => ({
    id: `act-${t.id}`,
    type: 'payment',
    title: PAYMENT_TITLES[t.status],
    description: `${formatCurrency(t.amount)} via ${t.method}`,
    timestamp: t.date,
    tone: t.status === 'Failed' ? 'error' : t.status === 'Pending' ? 'warning' : 'default',
  }))
  activity.push({ id: 'joined', type: 'customer', title: 'Joined FlowDesk', description: customer.company, timestamp: customer.joinedAt })

  return {
    customer: summarize(customer),
    recentActivity: activity.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 5),
    transactions: own.slice(0, 10),
  }
}

const BANKS = ['Harbor Bank', 'Union Trust', 'Meridian Bank', 'First City Bank']
const BRANDS = ['Visa', 'Mastercard', 'Amex']
const FAILURES: Record<string, string[]> = {
  Card: ['Card declined by issuer', 'Card verification failed'],
  'Bank transfer': ['Bank rejected the transfer', 'Transfer timed out'],
  PayPal: ['PayPal funding source declined', 'Payment authorisation expired'],
  Wallet: ['Insufficient wallet balance', 'Wallet is temporarily unavailable'],
}

/** Illustrative processing fee by method. Simulated; not a real fee schedule. */
function processingFee(amount: number, method: string): number {
  const fee =
    method === 'Card' ? amount * 0.029 + 0.3 : method === 'PayPal' ? amount * 0.034 + 0.3 : method === 'Wallet' ? amount * 0.015 : Math.min(amount * 0.008, 5)
  return Math.round(fee * 100) / 100
}

export function getTransactionDetail(id: string): TransactionDetail | null {
  const transaction = transactions.find((item) => item.id === id)
  if (!transaction) return null
  const customer = customers.find((c) => c.id === transaction.customerId)
  if (!customer) return null

  const n = Number(id.slice(4))
  const paymentDetail =
    transaction.method === 'Card'
      ? `${BRANDS[n % BRANDS.length]} •••• ${String((n * 37) % 10000).padStart(4, '0')}`
      : transaction.method === 'Bank transfer'
        ? `Bank transfer · ${BANKS[n % BANKS.length]}`
        : transaction.method === 'PayPal'
          ? 'PayPal account'
          : 'FlowDesk wallet'

  const completed = transaction.status === 'Completed'
  const fee = completed ? processingFee(transaction.amount, transaction.method) : null
  return {
    transaction,
    customer: { id: customer.id, name: customer.name, email: customer.email, company: customer.company },
    reference: `REF-${(n * 7919) % 900000 + 100000}`,
    paymentDetail,
    fee,
    net: fee === null ? null : Math.round((transaction.amount - fee) * 100) / 100,
    failureReason: transaction.status === 'Failed' ? FAILURES[transaction.method][n % 2] : undefined,
  }
}
