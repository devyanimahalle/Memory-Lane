import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { seedReminders } from '../screens/patient/reminderSeed'
import { SosHistoryGuard } from './sos/SosHistoryGuard'
import { useView } from './useView'
import { ViewSwitcher } from './ViewSwitcher'
import { PatientLayout } from './PatientLayout'
import { CaregiverLayout } from './CaregiverLayout'
import { PatientHome } from '../screens/patient/PatientHome'
import { CaregiverDashboard } from '../screens/caregiver/CaregiverDashboard'

// The starting tasks are put in place once, only when no tasks were ever saved in this browser.
seedReminders()

const VIEW_LABELS = { patient: 'Patient view', caregiver: 'Caregiver view' }

function focusHeading() {
  requestAnimationFrame(() => {
    document.querySelector('#main h1')?.focus()
  })
}

export function AppShell() {
  const { view } = useView()
  const reduceMotion = useReducedMotion()
  const offset = reduceMotion ? 0 : 8

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:shadow-card"
      >
        Skip to main content
      </a>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-gutter py-2">
        <p className="font-heading text-2xl leading-none font-bold text-ink">CogniCare</p>
        <ViewSwitcher />
      </div>

      <SosHistoryGuard />

      <p className="sr-only" role="status" aria-live="polite">
        Showing {VIEW_LABELS[view]}
      </p>

      <AnimatePresence mode="wait" onExitComplete={focusHeading}>
        <motion.main
          key={view}
          id="main"
          initial={{ opacity: 0, y: offset }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -offset }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {view === 'patient' ? (
            <PatientLayout>
              <PatientHome />
            </PatientLayout>
          ) : (
            <CaregiverLayout>
              <CaregiverDashboard />
            </CaregiverLayout>
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
