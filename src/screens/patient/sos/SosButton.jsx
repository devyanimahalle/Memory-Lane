import { useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { sosStore } from '../../../app/sos/sosStore'
import { useSos } from '../../../app/sos/useSos'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { PATIENT } from '../mockData'

// The SOS button, shown on every patient page (it lives in PatientLayout, which never unmounts
// while the patient moves around). It is a compact 56px circle fixed to the right edge of the
// viewport and centred vertically, so it stays put while scrolling and does not depend on any
// page content. PatientLayout reserves a right gutter for it (and the Ask me bar leaves the same
// room on phones), so it never covers content. It respects the right safe-area inset.
// Pressing it only opens a confirmation; nothing is sent until the person says yes.
export function SosButton() {
  const { trigger } = useSos()
  const reduceMotion = useReducedMotion()
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)

  function ask() {
    dialogRef.current?.showModal()
    cancelRef.current?.focus()
  }

  function cancel() {
    dialogRef.current?.close()
  }

  // The alert is created here, in the click handler, never during render. A second press is
  // ignored by the store while an alert is active, so it can only ever create one.
  function confirm() {
    sosStore.rememberScroll(window.scrollY)
    dialogRef.current?.close()
    trigger({ patientName: PATIENT.name })
  }

  return (
    <>
      <div className="group fixed top-1/2 right-[max(0.5rem,env(safe-area-inset-right))] z-30 -translate-y-1/2">
        <div className="relative">
          {!reduceMotion && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full border-4 border-sos group-focus-within:hidden group-hover:hidden"
              animate={{ scale: [1, 1.22], opacity: [0.55, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: 'easeOut' }}
            />
          )}
          <button
            id="sos-button"
            type="button"
            onClick={ask}
            className="relative flex size-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full border-2 border-surface bg-sos text-caption leading-none font-bold text-on-accent shadow-raised transition-colors duration-quick ease-gentle hover:bg-sos-strong focus-visible:shadow-[0_0_0_3px_var(--color-surface)] motion-reduce:transition-none">
            <Icon name="lifebuoy" className="size-6" />
            <span aria-hidden="true">SOS</span>
            <span className="sr-only">SOS, ask for help</span>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="sos-confirm-title"
        aria-describedby="sos-confirm-text"
        onClick={(event) => {
          if (event.target === dialogRef.current) cancel()
        }}
        className="m-auto w-[min(92vw,28rem)] rounded-xl border-0 bg-surface p-gutter text-ink shadow-raised backdrop:bg-ink/60"
      >
        <h2 id="sos-confirm-title" className="text-title font-bold">
          Do you need help now?
        </h2>
        <p id="sos-confirm-text" className="mt-2 text-lead text-ink-soft">
          We will tell your caregiver, {PATIENT.caregiver.name}, and show a message for people
          nearby.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={confirm}
            className="inline-flex min-h-touch-lg cursor-pointer items-center justify-center gap-2 rounded-full bg-sos px-8 text-lead font-bold text-on-accent transition-colors duration-quick ease-gentle hover:bg-sos-strong motion-reduce:transition-none"
          >
            <Icon name="lifebuoy" className="size-6" />
            Yes, ask for help
          </button>
          <Button ref={cancelRef} variant="secondary" onClick={cancel}>
            No, go back
          </Button>
        </div>
      </dialog>
    </>
  )
}
