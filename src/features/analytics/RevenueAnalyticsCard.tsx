import { DollarSign } from 'lucide-react'
import { AreaChart, ChartLegend } from '../../components/charts'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui'
import { api } from '../../data/api'
import { useAsync } from '../../hooks/useAsync'
import type { RangeKey, RevenueAnalytics } from '../../types'
import { formatCompactCurrency, formatCurrency, formatFullDate } from '../../utils/format'
import { PERIOD_LABEL, PREVIOUS_LABEL } from '../../utils/ranges'
import { ChangeIndicator } from '../dashboard/ChangeIndicator'
import { AnalyticsCard, HeadlineValue } from './AnalyticsCard'
import { StatGrid } from './StatGrid'
import { toChartPoints } from './chartPoints'

function summarize(data: RevenueAnalytics): string {
  const direction = data.changePct >= 0 ? 'up' : 'down'
  return `Revenue for the ${PERIOD_LABEL[data.range]} totals ${formatCurrency(data.total)}, ${direction} ${Math.abs(data.changePct).toFixed(1)}% versus the ${PREVIOUS_LABEL[data.range]}, which was ${formatCurrency(data.previousTotal)}.`
}

export function RevenueAnalyticsCard({ range }: { range: RangeKey }) {
  const { data, error, loading, reload } = useAsync((signal) => api.getRevenueAnalytics(range, { signal }), [range])

  let body
  if (error) body = <ErrorState title="Couldn't load revenue analytics" message={error.message} onRetry={reload} />
  else if (!data) body = <Skeleton height={320} radius={12} />
  else if (data.total === 0 && data.previousTotal === 0) {
    body = <EmptyState icon={<DollarSign size={22} />} title="No revenue yet" description="Completed payments will appear here." />
  } else {
    const peak = data.points.reduce((best, p) => (p.value > best.value ? p : best), data.points[0])
    const days = data.points.length * data.bucketDays
    body = (
      <>
        <ChartLegend items={[{ label: capitalize(PERIOD_LABEL[data.range]) }, { label: capitalize(PREVIOUS_LABEL[data.range]), dashed: true }]} />
        <AreaChart
          points={toChartPoints(data.points, data.bucketDays)}
          previous={data.previous}
          previousLabel={capitalize(PREVIOUS_LABEL[data.range])}
          title="Revenue"
          summary={summarize(data)}
          formatValue={formatCurrency}
          formatAxis={formatCompactCurrency}
          height={320}
        />
        <StatGrid
          items={[
            { label: 'Average per day', value: formatCurrency(data.total / days) },
            { label: data.bucketDays === 1 ? 'Best day' : 'Best period', value: `${formatCurrency(peak.value)}` },
            { label: 'Best period ends', value: formatFullDate(peak.date) },
            { label: capitalize(PREVIOUS_LABEL[data.range]), value: formatCurrency(data.previousTotal) },
          ]}
        />
      </>
    )
  }

  return (
    <AnalyticsCard
      id="analytics-revenue"
      title="Revenue analytics"
      stale={loading && !!data}
      headline={
        data && (
          <>
            <HeadlineValue>{formatCurrency(data.total)}</HeadlineValue>
            <ChangeIndicator value={data.changePct} comparison={`vs ${PREVIOUS_LABEL[data.range]}`} />
          </>
        )
      }
    >
      {body}
    </AnalyticsCard>
  )
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
