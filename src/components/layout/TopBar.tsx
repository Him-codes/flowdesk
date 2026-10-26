import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, Moon, Settings, Sun } from 'lucide-react'
import { useNotifications } from '../../context/NotificationsContext'
import { usePreferences } from '../../context/PreferencesContext'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { firstName } from '../../utils/format'
import { Avatar, Dropdown, IconButton, IconLink, type DropdownItem } from '../ui'
import { Logo } from './Logo'
import s from './TopBar.module.css'

/** `onOpenNav` is only passed when the persistent sidebar is hidden. */
export function TopBar({ onOpenNav }: { onOpenNav?: () => void }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { theme, toggleTheme } = useTheme()
  const { unreadCount } = useNotifications()
  const { profile } = usePreferences()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  const accountItems: DropdownItem[] = [
    { id: 'settings', label: 'Settings', icon: <Settings size={16} aria-hidden="true" />, onSelect: () => navigate('/settings') },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} aria-hidden="true" />, onSelect: () => navigate('/notifications') },
    {
      id: 'signout',
      label: 'Sign out',
      icon: <LogOut size={16} aria-hidden="true" />,
      danger: true,
      onSelect: () => toast.info('Sign-out is disabled. This demo has no authentication.'),
    },
  ]

  return (
    <header className={s.bar}>
      <div className={s.left}>
        {onOpenNav && (
          <>
            <IconButton label="Open navigation menu" onClick={onOpenNav}>
              <Menu size={20} />
            </IconButton>
            <Logo collapse />
          </>
        )}
        <span className={s.demo}>
          <span className={s.long}>Demo data</span>
          <span className={s.short}>Demo</span>
        </span>
      </div>
      <div className={s.right}>
        <IconButton label={`Switch to ${nextTheme} theme`} onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
        <IconLink to="/notifications" label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'} badge={unreadCount}>
          <Bell size={18} />
        </IconLink>
        <Dropdown
          label="Account menu"
          items={accountItems}
          trigger={
            <>
              <Avatar name={profile.name} src={profile.avatar || undefined} size={32} decorative />
              <span className={s.name}>{firstName(profile.name)}</span>
              <ChevronDown size={16} className={s.chev} aria-hidden="true" />
            </>
          }
        />
      </div>
    </header>
  )
}
