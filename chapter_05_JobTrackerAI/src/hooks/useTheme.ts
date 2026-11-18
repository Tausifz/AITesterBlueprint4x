import { useCallback, useState } from 'react'
import { THEME_STORAGE_KEY } from '../constants'

export interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
}

export function useTheme(): ThemeState {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  const toggleTheme = useCallback(() => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
    setIsDark(next)
  }, [])

  return { isDark, toggleTheme }
}
