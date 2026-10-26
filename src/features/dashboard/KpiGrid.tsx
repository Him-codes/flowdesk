import { Card, ErrorState } from '../../components/ui'
import { api } from '../../data/api'
import { useAsync } from '../../hooks/useAsync'
import { KpiCard, KpiCardSkeleton } from './KpiCard'
import s from './KpiGrid.module.css'

export function KpiGrid() {
  const { data, error, reload } = useAsync((signal) => api.getKpis({ signal }), [])

  return (
    <section className={s.grid} aria-label="Key metrics" aria-busy={!data && !error}>
      {error ? (
        <Card className={s.error}>
          <ErrorState title="Couldn't load key metrics" message={error.message} onRetry={reload} />
        </Card>
      ) : data ? (
        data.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)
      ) : (
        [0, 1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)
      )}
    </section>
  )
}
