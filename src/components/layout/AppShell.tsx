import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { primaryNav, secondaryNav } from './navItems'
import s from './AppShell.module.css'

export function AppShell() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isPhone = useMediaQuery('(max-width: 639px)')
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (isDesktop) setNavOpen(false)
  }, [isDesktop])

 // Update the page title and reset scroll on every route change.
useLayoutEffect(() => {
  const current = [...primaryNav, ...secondaryNav].find(
    (item) => pathname.startsWith(item.to),
  )

  document.title = current ? `${current.label} · FlowDesk` : 'FlowDesk'

  // Reset both possible scroll containers.
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  if (mainRef.current) {
    mainRef.current.scrollTop = 0
    mainRef.current.scrollLeft = 0
  }

  if (firstRender.current) {
    firstRender.current = false
    return
  }

  mainRef.current?.focus({ preventScroll: true })
}, [pathname])
  return (
    <div className={s.shell}>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      {isDesktop && (
        <aside className={s.aside}>
          <Sidebar />
        </aside>
      )}
      <div className={s.column}>
        <TopBar onOpenNav={isDesktop ? undefined : () => setNavOpen(true)} />
        <main id="main" ref={mainRef} tabIndex={-1} className={s.main}>
          <Outlet />
        </main>
      </div>
      {!isDesktop && <MobileNav drawerOpen={navOpen} onCloseDrawer={() => setNavOpen(false)} showTabs={isPhone} />}
    </div>
  )
}
