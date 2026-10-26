import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { STORAGE_KEYS, parseWith } from '../utils/storage'

export type Theme = 'dark' | 'light'

const parseTheme = parseWith((value: unknown): value is Theme => value === 'dark' || value === 'light')

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = usePersistentState<Theme>(STORAGE_KEYS.theme, 'dark', parseTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }),
    [theme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
