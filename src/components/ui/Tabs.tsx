import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { cx } from '../../utils/cx'
import s from './Tabs.module.css'

export interface TabItem {
  id: string
  label: string
  /** Spoken label when the visible text is abbreviated (e.g. "7D" → "7 days"). */
  srLabel?: string
  /** Small count shown after the label. */
  count?: number
}

interface TabsProps {
  tabs: TabItem[]
  value: string
  onChange: (id: string) => void
  /** Accessible name for the tab list. */
  label: string
  /** Prefix used to link tabs to panels: `${idPrefix}-tab-${id}` / `${idPrefix}-panel-${id}`. */
  idPrefix: string
}

export function Tabs({ tabs, value, onChange, label, idPrefix }: TabsProps) {
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === value)
    let next = i
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    else return
    e.preventDefault()
    onChange(tabs[next].id)
    document.getElementById(`${idPrefix}-tab-${tabs[next].id}`)?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className={s.list} onKeyDown={onKeyDown}>
      {tabs.map((tab) => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            id={`${idPrefix}-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={cx(s.tab, selected && s.active)}
            onClick={() => onChange(tab.id)}
          >
            {tab.srLabel ? (
              <>
                <span aria-hidden="true">{tab.label}</span>
                <span className="sr-only">{tab.srLabel}</span>
              </>
            ) : (
              tab.label
            )}
            {tab.count !== undefined && <span className={s.count}>{tab.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
