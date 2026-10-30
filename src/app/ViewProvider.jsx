import { useCallback, useMemo, useState } from 'react'
import { ViewContext, VIEWS } from './ViewContext'

const STORAGE_KEY = 'memory-lane:view'

function readInitialView() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('view')
    if (VIEWS.includes(fromQuery)) return fromQuery
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (VIEWS.includes(stored)) return stored
  } catch {
    // Storage or URL access can be blocked; fall back to the default.
  }
  return 'patient'
}

export function ViewProvider({ children }) {
  const [view, setViewState] = useState(readInitialView)

  const setView = useCallback((next) => {
    if (!VIEWS.includes(next)) return
    setViewState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Persisting is best-effort only.
    }
  }, [])

  const value = useMemo(() => ({ view, setView }), [view, setView])

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
}
