import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { useNotifications } from '../../context/NotificationsContext'
import { usePreferences } from '../../context/PreferencesContext'
import { cx } from '../../utils/cx'
import { Avatar, IconButton } from '../ui'
import { Logo } from './Logo'
import { primaryNav, secondaryNav, type NavItem } from './navItems'
import s from './Sidebar.module.css'

interface SidebarProps {
  /** Called after a link is followed (used to close the mobile drawer). */
  onNavigate?: () => void
  /** When provided, a close button is shown (drawer mode). */
  onClose?: () => void
}

export function Sidebar({ onNavigate, onClose }: SidebarProps) {
  const { unreadCount } = useNotifications()
  const { profile } = usePreferences()
  const renderLinks = (items: NavItem[]) =>
    items.map(({ to, label, icon: Icon }) => (
      <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => cx(s.link, isActive && s.active)}>
        <Icon size={18} aria-hidden="true" />
        {label}
        {to === '/notifications' && unreadCount > 0 && (
          <span className={s.count}>
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="sr-only"> unread</span>
          </span>
        )}
      </NavLink>
    ))

  return (
    <div className={s.sidebar}>
      <div className={s.brand}>
        <Logo />
        {onClose && (
          <IconButton label="Close navigation menu" onClick={onClose}>
            <X size={18} />
          </IconButton>
        )}
      </div>
      <nav aria-label="Primary" className={s.nav}>
        {renderLinks(primaryNav)}
      </nav>
      <hr className={s.divider} />
      <nav aria-label="Account" className={s.nav}>
        {renderLinks(secondaryNav)}
      </nav>
      <div className={s.spacer} />
      <p className={s.demo}>Demo data. Nothing in this app is real.</p>
      <div className={s.profile}>
        <Avatar name={profile.name} src={profile.avatar || undefined} decorative />
        <div className={s.who}>
          <strong>{profile.name}</strong>
          <span>{profile.email}</span>
        </div>
      </div>
    </div>
  )
}
