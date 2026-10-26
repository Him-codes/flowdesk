import { Percent } from 'lucide-react'
import { AreaChart, ChartLegend } from '../../components/charts'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui'
import { api } from '../../data/api'
import { useAsync } from '../../hooks/useAsync'
import type { ConversionAnalytics, RangeKey } from '../../types'
import { formatNumber, formatPercent } from '../../utils/format'
import { PERIOD_LABEL, PREVIOUS_LABEL } from '../../utils/ranges'
import { ChangeIndicator } from '../dashboard/ChangeIndicator'
import { AnalyticsCard, HeadlineValue } from './AnalyticsCard'
import { StatGrid } from './StatGrid'
import { toChartPoints } from './chartPoints'

function summarize(data: ConversionAnalytics): string {
  const direction = data.changePct >= 0 ? 'up' : 'down'
  return `Conversion rate for the ${PERIOD_LABEL[data.range]} is ${formatPercent(data.rate, 2)}, ${direction} ${Math.abs(data.changePct).toFixed(1)}% versus ${formatPercent(data.previousRate, 2)} in the ${PREVIOUS_LABEL[data.range]}. ${formatNumber(data.completed)} of ${formatNumber(data.visits)} visits ended in a completed payment.`
}

export function ConversionCard({ range }: { range: RangeKey }) {
  const { data, error, loading, reload } = useAsync((signal) => api.getConversionAnalytics(range, { signal }), [range])

  let body
  if (error) body = <ErrorState title="Couldn't load conversion data" message={error.message} onRetry={reload} />
  else if (!data) body = <Skeleton height={260} radius={12} />
  else if (data.visits === 0) body = <EmptyState icon={<Percent size={22} />} title="No visits yet" description="Conversion appears once people start visiting." />
  else {
    body = (
      <>
        <ChartLegend items={[{ label: 'Conversion rate' }, { label: 'Previous period', dashed: true }]} />
        <AreaChart
          points={toChartPoints(data.points, data.bucketDays)}
          previous={data.previous}
          title="Conversion rate"
          summary={summarize(data)}
          formatValue={(v) => formatPercent(v, 2)}
          formatAxis={(v) => formatPercent(v, 1)}
          height={240}
        />
        <StatGrid
          items={[
            { label: 'Visitors', value: formatNumber(data.visits) },
            { label: 'Completed payments', value: formatNumber(data.completed) },
            { label: 'Failed payments', value: formatNumber(data.failed) },
          ]}
        />
      </>
    )
  }

  return (
    <AnalyticsCard
      id="analytics-conversion"
      title="Conversion rate"
      stale={loading && !!data}
      headline={
        data && (
          <>
            <HeadlineValue>{formatPercent(data.rate, 2)}</HeadlineValue>
            <ChangeIndicator value={data.changePct} comparison={`vs ${PREVIOUS_LABEL[data.range]}`} />
          </>
        )
      }
    >
      {body}
    </AnalyticsCard>
  )
}
