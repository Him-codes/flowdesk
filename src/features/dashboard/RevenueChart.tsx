import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { AreaChart, type ChartPoint } from '../../components/charts'
import { Card, EmptyState, ErrorState, Skeleton, Tabs } from '../../components/ui'
import { api } from '../../data/api'
import { useAsync } from '../../hooks/useAsync'
import type { RangeKey, RevenueSeries } from '../../types'
import { cx } from '../../utils/cx'
import { PERIOD_LABEL, PREVIOUS_LABEL, RANGE_TABS, isRangeKey } from '../../utils/ranges'
import { formatCompactCurrency, formatCurrency, formatDate, formatFullDate, formatMonth, formatShortDate } from '../../utils/format'
import { ChangeIndicator } from './ChangeIndicator'
import s from './RevenueChart.module.css'

function toChartPoints(series: RevenueSeries): ChartPoint[] {
  return series.points.map((p) =>
    series.range === '12m'
      ? { label: formatMonth(p.date), detail: `30 days ending ${formatDate(p.date)}`, value: p.value }
      : { label: formatShortDate(p.date), detail: formatFullDate(p.date), value: p.value },
  )
}

function summarize(series: RevenueSeries): string {
  const peak = series.points.reduce((best, p) => (p.value > best.value ? p : best), series.points[0])
  const direction = series.changePct >= 0 ? 'up' : 'down'
  const peakLabel = series.range === '12m' ? `the 30 days ending ${formatDate(peak.date)}` : formatFullDate(peak.date)
  return `Revenue for the ${PERIOD_LABEL[series.range]} totals ${formatCurrency(series.total)}, ${direction} ${Math.abs(series.changePct).toFixed(1)}% versus the ${PREVIOUS_LABEL[series.range]}. The highest point is ${formatCurrency(peak.value)} for ${peakLabel}.`
}

export function RevenueChart() {
  const [range, setRange] = useState<RangeKey>('30d')
  const { data, error, loading, reload } = useAsync((signal) => api.getRevenueSeries(range, { signal }), [range])
  const refreshing = loading && !!data

  return (
    <Card as="section" aria-labelledby="revenue-heading">
      <div className={s.header}>
        <div>
          <h2 id="revenue-heading" className={s.title}>
            Revenue
          </h2>
          {data ? (
            <div className={cx(refreshing && s.stale)}>
              <p className={s.total}>{formatCurrency(data.total)}</p>
              <ChangeIndicator value={data.changePct} comparison={`vs ${PREVIOUS_LABEL[data.range]}`} />
            </div>
          ) : (
            !error && (
              <div className={s.skeletonHead}>
                <Skeleton height={32} width={170} />
                <Skeleton height={16} width={200} />
              </div>
            )
          )}
        </div>
        <Tabs tabs={RANGE_TABS} value={range} onChange={(id) => isRangeKey(id) && setRange(id)} label="Revenue date range" idPrefix="revenue" />
      </div>

      <div role="tabpanel" id={`revenue-panel-${range}`} aria-labelledby={`revenue-tab-${range}`} aria-busy={loading}>
        {error ? (
          <ErrorState title="Couldn't load revenue" message={error.message} onRetry={reload} />
        ) : !data ? (
          <Skeleton height={280} radius={12} />
        ) : data.total === 0 ? (
          <EmptyState icon={<DollarSign size={22} />} title="No revenue yet" description="Completed payments will appear here." />
        ) : (
          <div className={cx(refreshing && s.stale)}>
            <AreaChart
              points={toChartPoints(data)}
              title="Revenue"
              summary={summarize(data)}
              formatValue={formatCurrency}
              formatAxis={formatCompactCurrency}
            />
          </div>
        )}
      </div>
    </Card>
  )
}
