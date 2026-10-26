import { useMemo } from 'react'
import { Activity } from 'lucide-react'
import { Card, EmptyState, ErrorState, Skeleton } from '../../components/ui'
import { useTasks } from '../../context/TasksContext'
import { api } from '../../data/api'
import { buildTaskActivity } from '../../data/activity'
import { useAsync } from '../../hooks/useAsync'
import { ActivityRow } from '../activity/ActivityRow'
import s from './ActivityFeed.module.css'

export function ActivityFeed() {
  const { data, error, reload } = useAsync((signal) => api.getActivity(10, { signal }), [])
  const { tasks } = useTasks()
  // Task events come straight from the live task list (local data, no simulated delay); the rest from the "server".
  const feed = useMemo(
    () => (data ? [...data, ...buildTaskActivity(tasks)].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 10) : undefined),
    [data, tasks],
  )

  return (
    <Card as="section" aria-labelledby="activity-heading" aria-busy={!feed && !error}>
      <h2 id="activity-heading" className={s.title}>
        Recent activity
      </h2>
      {error ? (
        <ErrorState title="Couldn't load activity" message={error.message} onRetry={reload} />
      ) : !feed ? (
        <div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={s.skeletonItem}>
              <Skeleton width={36} height={36} radius="50%" />
              <div className={s.skeletonLines}>
                <Skeleton height={14} width="50%" />
                <Skeleton height={12} width="80%" />
              </div>
            </div>
          ))}
        </div>
      ) : feed.length === 0 ? (
        <EmptyState icon={<Activity size={22} />} title="No activity yet" description="New customers, payments and completed tasks will show up here." />
      ) : (
        <ul className={s.list}>
          {feed.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Card>
  )
}
