export type RangeKey = '7d' | '30d' | '90d' | '12m'

export type CustomerStatus = 'Active' | 'Inactive' | 'New'

export interface Customer {
  id: string
  name: string
  email: string
  company: string
  status: CustomerStatus
  /** ISO timestamp */
  joinedAt: string
  phone: string
  /** Empty when not provided. */
  location: string
}

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed'
export type PaymentMethod = 'Card' | 'Bank transfer' | 'PayPal' | 'Wallet'

export interface Transaction {
  id: string
  customerId: string
  customerName: string
  amount: number
  method: PaymentMethod
  /** ISO timestamp */
  date: string
  status: TransactionStatus
}

export type ActivityType = 'customer' | 'payment' | 'invoice' | 'task'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  /** ISO timestamp */
  timestamp: string
  tone?: 'default' | 'error' | 'warning'
  /** Where "View" leads, when the event has a natural destination. */
  href?: string
  linkLabel?: string
}

export type KpiId = 'revenue' | 'customers' | 'transactions' | 'conversion'
export type KpiFormat = 'currency' | 'number' | 'percent'

export interface Kpi {
  id: KpiId
  label: string
  value: number
  format: KpiFormat
  /** Relative change versus the comparison period, in percent. */
  changePct: number
  comparison: string
  /** Last 30 daily values, oldest first. */
  trend: number[]
}

export interface RevenuePoint {
  /** ISO date of the day (or of the last day of a 30-day bucket for 12m). */
  date: string
  value: number
}

export interface RevenueSeries {
  range: RangeKey
  points: RevenuePoint[]
  total: number
  previousTotal: number
  changePct: number
}

export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

/** Customer plus figures derived from their transactions. */
export interface CustomerSummary extends Customer {
  /** Sum of completed payments. */
  totalSpent: number
  /** All transactions, any status. */
  transactionCount: number
  /** ISO timestamp of the latest transaction, or the join date if there are none. */
  lastActivity: string
}

export interface CustomerDetail {
  customer: CustomerSummary
  recentActivity: ActivityItem[]
  /** Latest transactions, newest first (capped; see `customer.transactionCount` for the total). */
  transactions: Transaction[]
}

export interface NewTransactionInput {
  customerId: string
  amount: number
  method: PaymentMethod
  status: TransactionStatus
}

export interface NewCustomerInput {
  name: string
  email: string
  company: string
  phone: string
  location: string
  status: CustomerStatus
}

export interface TransactionDetail {
  transaction: Transaction
  customer: Pick<Customer, 'id' | 'name' | 'email' | 'company'>
  reference: string
  paymentDetail: string
  /** Processing fee; null unless the payment completed. */
  fee: number | null
  net: number | null
  failureReason?: string
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Completed'
export type TaskPriority = 'Low' | 'Medium' | 'High'

export interface Task {
  id: string
  name: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  /** Local calendar date, `YYYY-MM-DD`. */
  dueDate: string
  /** A team member's name, or '' when unassigned. */
  assignee: string
  /** ISO timestamp */
  createdAt: string
  /** ISO timestamp; set while status is Completed. */
  completedAt?: string
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'completedAt'>

export type NotificationType = 'payment' | 'customer' | 'task' | 'system'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  /** ISO timestamp */
  timestamp: string
  /** Server-side read state; the user's own "mark as read" actions are stored separately in the browser. */
  read: boolean
  tone?: 'default' | 'error' | 'warning'
  href?: string
  linkLabel?: string
}

export interface BucketPoint {
  /** ISO date of the newest day in the bucket. */
  date: string
  value: number
}

export interface AnalyticsSeries {
  range: RangeKey
  /** Days per point: 1 (7d, 30d), 3 (90d) or 30 (12m). */
  bucketDays: number
  points: BucketPoint[]
  /** The preceding period of equal length, one value per point (same order). */
  previous: number[]
}

export interface RevenueAnalytics extends AnalyticsSeries {
  total: number
  previousTotal: number
  changePct: number
}

export interface CustomerGrowth extends AnalyticsSeries {
  /** Customers who joined during the period (the sum of `points`). */
  newCustomers: number
  previousNew: number
  changePct: number
  totalCustomers: number
}

export interface ConversionAnalytics extends AnalyticsSeries {
  /** Completed payments as a percentage of visits. */
  rate: number
  previousRate: number
  changePct: number
  visits: number
  completed: number
  failed: number
}

export interface CategorySlice {
  category: string
  revenue: number
  /** 0–1 */
  share: number
  previousRevenue: number
  changePct: number
}

export interface CategoryBreakdown {
  range: RangeKey
  total: number
  previousTotal: number
  /** Largest first. */
  slices: CategorySlice[]
}

export interface Profile {
  name: string
  email: string
  company: string
  /** Square JPEG data URL, or '' when no photo is set. Stored in this browser only. */
  avatar: string
}

export interface NotificationPrefs {
  email: boolean
  payments: boolean
  tasks: boolean
  customers: boolean
}

export interface Preferences {
  profile: Profile
  notifications: NotificationPrefs
  /** Demo-only state: nothing is enforced. */
  security: { twoFactor: boolean }
}
