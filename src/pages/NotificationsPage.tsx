import { CheckCheck } from 'lucide-react'
import { PageHeader } from '../components/layout'
import { Button } from '../components/ui'
import { useNotifications } from '../context/NotificationsContext'
import { useToast } from '../context/ToastContext'
import { NotificationList } from '../features/notifications/NotificationList'

export default function NotificationsPage() {
  const { unreadCount, markAllRead } = useNotifications()
  const toast = useToast()

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Stay up to date with activity across your business."
        actions={
          <Button
            variant="secondary"
            icon={<CheckCheck size={16} />}
            disabled={unreadCount === 0}
            onClick={() => {
              markAllRead()
              toast.success('All notifications marked as read.')
            }}
          >
            Mark all as read
          </Button>
        }
      />
      <NotificationList />
    </>
  )
}
