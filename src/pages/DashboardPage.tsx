import { useEffect, useState } from 'react'
import { PageHeader } from '../components/layout'
import { usePreferences } from '../context/PreferencesContext'
import { ActivityFeed } from '../features/dashboard/ActivityFeed'
import { KpiGrid } from '../features/dashboard/KpiGrid'
import { RecentTransactions } from '../features/dashboard/RecentTransactions'
import { RevenueChart } from '../features/dashboard/RevenueChart'
import { firstName } from '../utils/format'
import s from './DashboardPage.module.css'

function getGreeting(hour = new Date().getHours()) {
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { profile } = usePreferences()
  const [greeting, setGreeting] = useState(() => getGreeting())

  useEffect(() => {
    // Refresh periodically so the greeting changes even if the dashboard stays open.
    const timer = window.setInterval(() => setGreeting(getGreeting()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <>
      <PageHeader title={`${greeting}, ${firstName(profile.name)} 👋`} subtitle="Here's what's happening with your business today." />
      <div className={s.page}>
        <KpiGrid />
        <div className={s.layout}>
          <div className={s.chart}>
            <RevenueChart />
          </div>
          <div className={s.transactions}>
            <RecentTransactions />
          </div>
          <div className={s.activity}>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </>
  )
}
