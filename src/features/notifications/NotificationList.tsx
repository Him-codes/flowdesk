import { useState } from 'react'
import { BellOff, CheckCheck } from 'lucide-react'
import { Card, EmptyState, ErrorState, Skeleton, Tabs, type TabItem } from '../../components/ui'
import { useNotifications } from '../../context/NotificationsContext'
import type { AppNotification } from '../../types'
import { groupByDay } from './grouping'
import { NotificationItem } from './NotificationItem'
import s from './NotificationList.module.css'

type View = 'all' | 'unread'

function Group({ id, title, items }: { id: string; title: string; items: AppNotification[] }) {
  const { isRead, markRead } = useNotifications()
  if (items.length === 0) return null
  return (
    <section className={s.group} aria-labelledby={id}>
      <h2 id={id} className={s.heading}>
        {title}
      </h2>
      <Card padded={false}>
        <ul className={s.list}>
          {items.map((n) => (
            <NotificationItem key={n.id} notification={n} read={isRead(n)} onMarkRead={markRead} />
          ))}
        </ul>
      </Card>
    </section>
  )
}

export function NotificationList() {
  const { notifications, error, reload, unreadCount, isRead } = useNotifications()
  const [view, setView] = useState<View>('all')

  const tabs: TabItem[] = [
    { id: 'all', label: 'All', count: notifications?.length ?? 0 },
    { id: 'unread', label: 'Unread', count: unreadCount },
  ]
  const visible = (notifications ?? []).filter((n) => view === 'all' || !isRead(n))
  const { today, earlier } = groupByDay(visible)

  let body
  if (error) {
    body = (
      <Card padded={false}>
        <ErrorState title="Couldn't load notifications" message={error.message} onRetry={reload} />
      </Card>
    )
  } else if (!notifications) {
    body = (
      <Card padded={false} aria-busy="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={s.skeletonRow}>
            <Skeleton width={40} height={40} radius="50%" />
            <div className={s.skeletonLines}>
              <Skeleton height={14} width="40%" />
              <Skeleton height={12} width="75%" />
            </div>
          </div>
        ))}
      </Card>
    )
  } else if (notifications.length === 0) {
    body = (
      <Card padded={false}>
        <EmptyState icon={<BellOff size={22} />} title="No notifications yet" description="Updates about payments, customers and tasks will appear here." />
      </Card>
    )
  } else if (visible.length === 0) {
    body = (
      <Card padded={false}>
        <EmptyState icon={<CheckCheck size={22} />} title="You’re all caught up" description="There are no unread notifications." />
      </Card>
    )
  } else {
    body = (
      <>
        <Group id="notifications-today" title="Today" items={today} />
        <Group id="notifications-earlier" title="Earlier" items={earlier} />
      </>
    )
  }

  return (
    <>
      {notifications && notifications.length > 0 && !error && (
        <div className={s.toolbar}>
          <Tabs tabs={tabs} value={view} onChange={(id) => setView(id as View)} label="Filter notifications" idPrefix="notifications" />
        </div>
      )}
      <div role="tabpanel" id={`notifications-panel-${view}`} aria-labelledby={`notifications-tab-${view}`}>
        {body}
      </div>
    </>
  )
}
