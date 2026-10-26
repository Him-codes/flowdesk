import { ROUTES } from '../../routes'
import { BarChart3, Bell, CheckSquare, CreditCard, LayoutDashboard, Settings, Users, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const primaryNav: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.customers, label: 'Customers', icon: Users },
  { to: ROUTES.transactions, label: 'Transactions', icon: CreditCard },
  { to: ROUTES.analytics, label: 'Analytics', icon: BarChart3 },
  { to: ROUTES.tasks, label: 'Tasks', icon: CheckSquare },
]

export const secondaryNav: NavItem[] = [
  { to: ROUTES.notifications, label: 'Notifications', icon: Bell },
  { to: ROUTES.settings, label: 'Settings', icon: Settings },
]
