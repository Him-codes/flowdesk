import { NavLink } from 'react-router-dom'
import { cx } from '../../utils/cx'
import { Modal } from '../ui'
import { Sidebar } from './Sidebar'
import { primaryNav } from './navItems'
import s from './MobileNav.module.css'

interface MobileNavProps {
  drawerOpen: boolean
  onCloseDrawer: () => void
  /** Bottom tab bar is shown on phones only; the drawer covers all routes at every size below desktop. */
  showTabs: boolean
}

export function MobileNav({ drawerOpen, onCloseDrawer, showTabs }: MobileNavProps) {
  return (
    <>
      <Modal open={drawerOpen} onClose={onCloseDrawer} title="Navigation menu" variant="drawer">
        <Sidebar onNavigate={onCloseDrawer} onClose={onCloseDrawer} />
      </Modal>
      {showTabs && (
        <nav aria-label="Main tabs" className={s.tabs}>
          {primaryNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => cx(s.tab, isActive && s.active)}>
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </>
  )
}
