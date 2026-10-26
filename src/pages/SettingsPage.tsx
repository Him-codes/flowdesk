import { useState } from 'react'
import { PageHeader } from '../components/layout'
import { Tabs, type TabItem } from '../components/ui'
import { AppearanceSection } from '../features/settings/AppearanceSection'
import { NotificationPrefsSection } from '../features/settings/NotificationPrefsSection'
import { ProfileSection } from '../features/settings/ProfileSection'
import { SecuritySection } from '../features/settings/SecuritySection'
import s from './SettingsPage.module.css'

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'security'

const TABS: TabItem[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
]

const PANELS: Record<SettingsTab, () => JSX.Element> = {
  profile: ProfileSection,
  appearance: AppearanceSection,
  notifications: NotificationPrefsSection,
  security: SecuritySection,
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile')
  const Panel = PANELS[tab]

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, preferences and security." />
      <div className={s.tabs}>
        <Tabs tabs={TABS} value={tab} onChange={(id) => setTab(id as SettingsTab)} label="Settings sections" idPrefix="settings" />
      </div>
      <div role="tabpanel" id={`settings-panel-${tab}`} aria-labelledby={`settings-tab-${tab}`}>
        <Panel />
      </div>
    </>
  )
}
