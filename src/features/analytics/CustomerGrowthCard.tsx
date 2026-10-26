import { Users } from 'lucide-react'
import { BarChart } from '../../components/charts'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui'
import { api } from '../../data/api'
import { useAsync } from '../../hooks/useAsync'
import type { CustomerGrowth, RangeKey } from '../../types'
import { formatNumber } from '../../utils/format'
import { PERIOD_LABEL, PREVIOUS_LABEL } from '../../utils/ranges'
import { ChangeIndicator } from '../dashboard/ChangeIndicator'
import { AnalyticsCard, HeadlineValue } from './AnalyticsCard'
import { StatGrid } from './StatGrid'
import { toChartPoints } from './chartPoints'

function summarize(data: CustomerGrowth): string {
  const noun = data.newCustomers === 1 ? 'customer' : 'customers'
  return `${data.newCustomers} new ${noun} joined in the ${PERIOD_LABEL[data.range]}, compared with ${data.previousNew} in the ${PREVIOUS_LABEL[data.range]}. You now have ${data.totalCustomers} customers in total.`
}

export function CustomerGrowthCard({ range }: { range: RangeKey }) {
  const { data, error, loading, reload } = useAsync((signal) => api.getCustomerGrowth(range, { signal }), [range])

  let body
  if (error) body = <ErrorState title="Couldn't load customer growth" message={error.message} onRetry={reload} />
  else if (!data) body = <Skeleton height={260} radius={12} />
  else if (data.newCustomers === 0) {
    body = (
      <>
        <EmptyState icon={<Users size={22} />} title="No new customers" description={`No customers joined in the ${PERIOD_LABEL[data.range]}.`} />
        <StatGrid items={[{ label: 'Total customers', value: formatNumber(data.totalCustomers) }]} />
      </>
    )
  } else {
    body = (
      <>
        <BarChart points={toChartPoints(data.points, data.bucketDays)} title="New customers" summary={summarize(data)} formatValue={formatNumber} integer />
        <StatGrid
          items={[
            { label: 'Total customers', value: formatNumber(data.totalCustomers) },
            { label: PREVIOUS_LABEL[data.range].replace(/^./, (c) => c.toUpperCase()), value: `${formatNumber(data.previousNew)} new` },
          ]}
        />
      </>
    )
  }

  return (
    <AnalyticsCard
      id="analytics-customers"
      title="Customer growth"
      stale={loading && !!data}
      headline={
        data && (
          <>
            <HeadlineValue>+{formatNumber(data.newCustomers)} new</HeadlineValue>
            {data.previousNew > 0 ? (
              <ChangeIndicator value={data.changePct} comparison={`vs ${PREVIOUS_LABEL[data.range]}`} />
            ) : (
              <p>No customers in the {PREVIOUS_LABEL[data.range]}</p>
            )}
          </>
        )
      }
    >
      {body}
    </AnalyticsCard>
  )
}
