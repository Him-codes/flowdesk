import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      tone="error"
      role="alert"
      icon={<AlertTriangle size={22} />}
      title={title}
      description={message}
      action={
        onRetry && (
          <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  )
}
