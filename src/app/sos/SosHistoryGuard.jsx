import { useEffect } from 'react'
import { guardHistory } from './historyGuard'
import { sosStore } from './sosStore'
import { useSos } from './useSos'

// Keeps browser Back and Forward from dismissing an active SOS or moving the hidden patient page.
// It is mounted once in AppShell, above the view switch, so the protection also holds while the
// caregiver view is showing in the same tab. Renders nothing.
export function SosHistoryGuard() {
  const { current } = useSos()
  const active = Boolean(current)

  useEffect(() => {
    if (!active) return undefined
    return guardHistory()
  }, [active])

  // A guard entry left behind by an alert that ended while no tab was watching.
  useEffect(() => {
    if (!sosStore.getState().current && window.history.state?.sos) window.history.back()
  }, [])

  return null
}
