import type { ReactNode } from 'react'
import { PageHeader } from '../components/layout'
import { Card, EmptyState } from '../components/ui'

interface PlaceholderPageProps {
  title: string
  subtitle: string
  icon: ReactNode
}

/** Route stand-in until the page's own build phase. */
export function PlaceholderPage({ title, subtitle, icon }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <Card padded={false}>
        <EmptyState icon={icon} title={`${title} is coming up next`} description="This section will be built in an upcoming phase of the project." />
      </Card>
    </>
  )
}
