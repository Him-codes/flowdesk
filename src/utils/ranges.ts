import type { RangeKey } from '../types'

export const RANGE_TABS: { id: RangeKey; label: string; srLabel: string }[] = [
  { id: '7d', label: '7D', srLabel: '7 days' },
  { id: '30d', label: '30D', srLabel: '30 days' },
  { id: '90d', label: '90D', srLabel: '90 days' },
  { id: '12m', label: '12M', srLabel: '12 months' },
]

export const isRangeKey = (value: unknown): value is RangeKey => RANGE_TABS.some((tab) => tab.id === value)

export const PERIOD_LABEL: Record<RangeKey, string> = { '7d': 'last 7 days', '30d': 'last 30 days', '90d': 'last 90 days', '12m': 'last 12 months' }
export const PREVIOUS_LABEL: Record<RangeKey, string> = { '7d': 'previous 7 days', '30d': 'previous 30 days', '90d': 'previous 90 days', '12m': 'previous 12 months' }
