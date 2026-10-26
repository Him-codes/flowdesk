import { PieChart } from 'lucide-react'
import { DonutChart } from '../../components/charts'
import { DataTable, EmptyState, ErrorState, Skeleton, type Column } from '../../components/ui'
import { api } from '../../data/api'
import { CATEGORIES } from '../../data/analytics'
import { useAsync } from '../../hooks/useAsync'
import type { CategoryBreakdown, CategorySlice, RangeKey } from '../../types'
import { formatCompactCurrency, formatCurrency, formatPercent } from '../../utils/format'
import { PERIOD_LABEL, PREVIOUS_LABEL } from '../../utils/ranges'
import { ChangeIndicator } from '../dashboard/ChangeIndicator'
import { AnalyticsCard, HeadlineValue } from './AnalyticsCard'
import s from './CategoryBreakdownCard.module.css'

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']
/** A category keeps its colour whatever its rank, so colours don't swap when the date range changes. */
const colorOf = (category: string) => COLORS[CATEGORIES.findIndex((c) => c.name === category) % COLORS.length]

const COLUMNS: Column<CategorySlice>[] = [
  {
    key: 'category',
    header: 'Category',
    render: (c) => (
      <span className={s.name}>
        <span className={s.swatch} style={{ background: colorOf(c.category) }} aria-hidden="true" />
        {c.category}
      </span>
    ),
  },
  { key: 'revenue', header: 'Revenue', align: 'end', render: (c) => formatCurrency(c.revenue) },
  { key: 'share', header: 'Share', align: 'end', render: (c) => formatPercent(c.share * 100, 1) },
  {
    key: 'change',
    header: 'vs previous',
    align: 'end',
    render: (c) => (c.previousRevenue > 0 ? <ChangeIndicator value={c.changePct} comparison="" /> : <span className={s.muted}>No data</span>),
  },
]

function summarize(data: CategoryBreakdown): string {
  const top = data.slices[0]
  return `Revenue for the ${PERIOD_LABEL[data.range]} totals ${formatCurrency(data.total)} across ${data.slices.length} categories. ${top.category} is the largest at ${formatPercent(top.share * 100, 1)}.`
}

export function CategoryBreakdownCard({ range }: { range: RangeKey }) {
  const { data, error, loading, reload } = useAsync((signal) => api.getCategoryBreakdown(range, { signal }), [range])

  let body
  if (error) body = <ErrorState title="Couldn't load revenue by category" message={error.message} onRetry={reload} />
  else if (!data) body = <Skeleton height={240} radius={12} />
  else if (data.total === 0) body = <EmptyState icon={<PieChart size={22} />} title="No revenue yet" description="Revenue by category appears once payments complete." />
  else {
    body = (
      <div className={s.layout}>
        <DonutChart
          segments={data.slices.map((c) => ({ label: c.category, value: c.revenue, color: colorOf(c.category) }))}
          title="Revenue by category"
          summary={summarize(data)}
          centerValue={formatCompactCurrency(data.total)}
          centerLabel="Total revenue"
          formatValue={formatCurrency}
        />
        <div className={s.table}>
          <DataTable columns={COLUMNS} rows={data.slices} getRowKey={(c) => c.category} caption={`Revenue by category, ${PERIOD_LABEL[data.range]}`} />
        </div>
      </div>
    )
  }

  return (
    <AnalyticsCard
      id="analytics-categories"
      title="Revenue by category"
      stale={loading && !!data}
      headline={
        data && (
          <>
            <HeadlineValue>{formatCurrency(data.total)}</HeadlineValue>
            {data.previousTotal > 0 && <ChangeIndicator value={((data.total - data.previousTotal) / data.previousTotal) * 100} comparison={`vs ${PREVIOUS_LABEL[data.range]}`} />}
          </>
        )
      }
    >
      {body}
    </AnalyticsCard>
  )
}
