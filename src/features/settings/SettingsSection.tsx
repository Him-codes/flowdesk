import type { ReactNode } from 'react'
import { Card } from '../../components/ui'
import s from './SettingsSection.module.css'

interface SettingsSectionProps {
  id: string
  title: string
  description: string
  children: ReactNode
}

export function SettingsSection({ id, title, description, children }: SettingsSectionProps) {
  return (
    <Card as="section" aria-labelledby={id} className={s.section}>
      <div>
        <h2 id={id} className={s.title}>
          {title}
        </h2>
        <p className={s.description}>{description}</p>
      </div>
      {children}
    </Card>
  )
}
