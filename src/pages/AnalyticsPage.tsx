import { useState } from 'react'
import { PageHeader } from '../components/layout'
import { Tabs } from '../components/ui'
import { CategoryBreakdownCard } from '../features/analytics/CategoryBreakdownCard'
import { ConversionCard } from '../features/analytics/ConversionCard'
import { CustomerGrowthCard } from '../features/analytics/CustomerGrowthCard'
import { RevenueAnalyticsCard } from '../features/analytics/RevenueAnalyticsCard'
import type { RangeKey } from '../types'
import { RANGE_TABS, isRangeKey } from '../utils/ranges'
import s from './AnalyticsPage.module.css'

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>('30d')

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="See how revenue, customers and conversion are trending."
        actions={<Tabs tabs={RANGE_TABS} value={range} onChange={(id) => isRangeKey(id) && setRange(id)} label="Analytics date range" idPrefix="analytics" />}
      />
      <div role="tabpanel" id={`analytics-panel-${range}`} aria-labelledby={`analytics-tab-${range}`} className={s.grid}>
        <div className={s.full}>
          <RevenueAnalyticsCard range={range} />
        </div>
        <div className={s.half}>
          <CustomerGrowthCard range={range} />
        </div>
        <div className={s.half}>
          <ConversionCard range={range} />
        </div>
        <div className={s.full}>
          <CategoryBreakdownCard range={range} />
        </div>
      </div>
    </>
  )
}
