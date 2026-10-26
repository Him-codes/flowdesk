import { ArrowLeftRight, DollarSign, Percent, Users, type LucideIcon } from 'lucide-react'
import { Sparkline } from '../../components/charts'
import { Card, Skeleton } from '../../components/ui'
import type { Kpi, KpiId } from '../../types'
import { formatCurrency, formatNumber, formatPercent } from '../../utils/format'
import { ChangeIndicator } from './ChangeIndicator'
import s from './KpiCard.module.css'

const ICONS: Record<KpiId, LucideIcon> = { revenue: DollarSign, customers: Users, transactions: ArrowLeftRight, conversion: Percent }

function formatValue(kpi: Kpi): string {
  if (kpi.format === 'currency') return formatCurrency(kpi.value)
  if (kpi.format === 'percent') return formatPercent(kpi.value, 2)
  return formatNumber(kpi.value)
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = ICONS[kpi.id]
  return (
    <Card as="article" className={s.card}>
      <div className={s.top}>
        <h3 className={s.label}>{kpi.label}</h3>
        <span className={s.icon} aria-hidden="true">
          <Icon size={16} />
        </span>
      </div>
      <p className={s.value}>{formatValue(kpi)}</p>
      <ChangeIndicator value={kpi.changePct} comparison={kpi.comparison} />
      <div className={s.spark}>
        <Sparkline values={kpi.trend} tone={kpi.changePct >= 0 ? 'up' : 'down'} />
      </div>
    </Card>
  )
}

export function KpiCardSkeleton() {
  return (
    <Card className={s.card}>
      <Skeleton height={16} width="45%" />
      <Skeleton height={32} width="70%" />
      <Skeleton height={16} width="55%" />
      <Skeleton height={32} />
    </Card>
  )
}
