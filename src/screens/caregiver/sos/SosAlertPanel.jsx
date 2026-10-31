import { useState } from 'react'
import { useSos } from '../../../app/sos/useSos'
import { Icon } from '../../../ui/icons'

const WHEN = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
})
const CLOCK = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

// Caregiver buttons: 44px minimum, plain wording.
function ActionButton({ tone = 'primary', className = '', ...props }) {
  const tones = {
    primary: 'bg-accent text-on-accent hover:bg-accent-strong',
    secondary: 'border-2 border-accent bg-surface text-accent hover:bg-accent-soft',
    quiet: 'text-accent hover:bg-accent-soft',
  }
  return (
    <button
      type="button"
      className={`inline-flex min-h-touch cursor-pointer items-center justify-center rounded-full px-5 text-body font-semibold transition-colors duration-quick ease-gentle motion-reduce:transition-none ${tones[tone]} ${className}`}
      {...props}
    />
  )
}

// The SOS alert on the caregiver dashboard. It shows nothing until an SOS has been sent. It reads
// the same store as the patient screen, so it updates live in this tab and, through storage
// events, in other tabs of this browser. Nothing here reaches another device or browser.
export function SosAlertPanel() {
  const { current, history, acknowledge, resolve, clearAll } = useSos()
  const [confirming, setConfirming] = useState(null) // 'resolve' | 'clear' | null

  if (!current && history.length === 0) return null

  const seen = current?.status === 'acknowledged'

  return (
    <section
      aria-labelledby="sos-alert-title"
      className="relative overflow-hidden rounded-lg bg-surface p-gutter pt-[calc(var(--spacing-gutter)+0.25rem)] shadow-card"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-sos" />

      {current ? (
        <div>
          <div role={seen ? undefined : 'alert'}>
            <h2 id="sos-alert-title" className="flex items-center gap-2 text-title font-bold">
              <Icon name="lifebuoy" className="size-7 shrink-0 text-sos" />
              SOS from {current.patientName}
            </h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-body sm:grid-cols-[auto_1fr]">
              <dt className="font-semibold">Alert time</dt>
              <dd>{WHEN.format(new Date(current.createdAt))}</dd>
              <dt className="font-semibold">Patient was using</dt>
              <dd>
                {current.context}
                <span className="block text-caption text-ink-faint">
                  This is where they were in the app, not their physical location.
                </span>
              </dd>
              <dt className="font-semibold">Status</dt>
              <dd className="font-semibold">
                {seen
                  ? `Seen at ${CLOCK.format(new Date(current.acknowledgedAt))}`
                  : 'Waiting for you to acknowledge'}
              </dd>
            </dl>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {!seen && <ActionButton onClick={acknowledge}>I have seen this</ActionButton>}
            {confirming === 'resolve' ? (
              <>
                <span className="text-body font-semibold">Mark this alert as resolved?</span>
                <ActionButton
                  onClick={() => {
                    resolve()
                    setConfirming(null)
                  }}
                >
                  Yes, mark resolved
                </ActionButton>
                <ActionButton tone="secondary" onClick={() => setConfirming(null)}>
                  Keep open
                </ActionButton>
              </>
            ) : (
              <ActionButton tone={seen ? 'primary' : 'secondary'} onClick={() => setConfirming('resolve')}>
                Mark as resolved
              </ActionButton>
            )}
          </div>
        </div>
      ) : (
        <h2 id="sos-alert-title" className="text-title font-bold">
          SOS alerts
        </h2>
      )}

      {history.length > 0 && (
        <div className={current ? 'mt-6 border-t border-line pt-4' : 'mt-3'}>
          <h3 className="text-body font-bold">Recent SOS alerts</h3>
          <ul className="mt-2 flex flex-col gap-1 text-body text-ink-soft">
            {history.slice(0, 5).map((item) => (
              <li key={item.id}>
                {WHEN.format(new Date(item.createdAt))}: {item.context}. Resolved at{' '}
                {CLOCK.format(new Date(item.resolvedAt))}.
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        {confirming === 'clear' ? (
          <>
            <span className="text-body font-semibold">
              Clear every SOS alert, including any active one?
            </span>
            <ActionButton
              onClick={() => {
                clearAll()
                setConfirming(null)
              }}
            >
              Yes, clear demo alerts
            </ActionButton>
            <ActionButton tone="secondary" onClick={() => setConfirming(null)}>
              Keep them
            </ActionButton>
          </>
        ) : (
          <ActionButton tone="quiet" onClick={() => setConfirming('clear')}>
            Clear demo alerts
          </ActionButton>
        )}
      </div>

      <p className="mt-3 text-caption text-ink-faint">
        Demo only. Alerts are shared between tabs of this browser, and nothing is sent to other
        devices or browsers.
      </p>
    </section>
  )
}
