import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { sosStore } from './sos/sosStore'
import { useSos } from './sos/useSos'
import { SosButton } from '../screens/patient/sos/SosButton'
import { SosScreen } from '../screens/patient/sos/SosScreen'

// Patient frame: a calm, centred column, up to about 64rem. The screen switches to
// two columns from 1024px; below that the voice control is a fixed bottom bar.
// Bottom padding on phones keeps the fixed voice control from covering content. The right padding
// reserves a gutter for the fixed SOS button (from 73.5rem the page margins are wide enough).
// Content comes from src/screens/patient.
//
// SOS lives here because this layout wraps every patient page (home, memories, games) and never
// unmounts while the patient moves between them. While an SOS is active the patient pages are
// hidden (not unmounted, so a game or scroll position is kept) and the assistance screen shows.
export function PatientLayout({ children }) {
  const { current, history } = useSos()
  const active = Boolean(current)
  const wasActive = useRef(false)
  const [finished, setFinished] = useState(false)

  // Back from an SOS: return to where the person was, and say it has been closed.
  useLayoutEffect(() => {
    if (!active && wasActive.current) {
      window.scrollTo(0, sosStore.getReturnScroll())
      document.getElementById('sos-button')?.focus({ preventScroll: true })
    }
    wasActive.current = active
  }, [active])

  const resolvedId = history[0]?.status === 'resolved' ? history[0].id : null
  const shownFor = useRef(resolvedId)
  useEffect(() => {
    if (resolvedId && resolvedId !== shownFor.current && !active) {
      shownFor.current = resolvedId
      setFinished(true)
      const timer = setTimeout(() => setFinished(false), 8000)
      return () => clearTimeout(timer)
    }
    shownFor.current = resolvedId
  }, [resolvedId, active])

  return (
    <div className="mx-auto w-full max-w-5xl pt-6 pr-[calc(4.5rem+env(safe-area-inset-right))] pb-40 pl-4 md:pt-gutter-lg md:pl-gutter min-[73.5rem]:pr-gutter lg:pb-gutter-lg">
      {active ? (
        <SosScreen />
      ) : (
        <>
          <SosButton />
          {finished && (
            <p
              role="status"
              className="fixed inset-x-4 top-4 z-40 mx-auto max-w-md rounded-lg bg-gentle-soft p-4 text-lead font-semibold text-gentle-ink shadow-raised"
            >
              Your caregiver has marked this as finished. Thank you.
            </p>
          )}
        </>
      )}
      <div hidden={active}>{children}</div>
    </div>
  )
}
