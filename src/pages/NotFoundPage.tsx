import { useNavigate } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { Button, Card, EmptyState } from '../components/ui'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Card padded={false}>
      <EmptyState
        icon={<SearchX size={22} />}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={<Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>}
      />
    </Card>
  )
}
