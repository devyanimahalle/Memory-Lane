import { useEffect, useRef } from 'react'
import { telHref } from '../../../app/sos/sosStore'
import { useSos } from '../../../app/sos/useSos'
import { Icon } from '../../../ui/icons'
import { PATIENT } from '../mockData'

const TIME = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

const STEPS = [
  'Stay with me and speak calmly.',
  'Please call my caregiver with the button below.',
  'Wait with me until they arrive or call back.',
]

// The assistance screen, shown full page in place of the patient pages while an SOS is active.
// It is written for a person nearby, in the default Mint Daylight look, with large type. It has no
// close button: only the caregiver can resolve an alert, so it cannot be dismissed by accident.
// It makes no medical claims and does not assume the person is lost or upset.
export function SosScreen() {
  const { current } = useSos()
  const headingRef = useRef(null)
  const { caregiver } = PATIENT
  const tel = telHref(caregiver.phone)

  useEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus()
  }, [])

  if (!current) return null
  const seen = current.status === 'acknowledged'

  return (
    <section aria-labelledby="sos-title" className="flex flex-col gap-6 lg:gap-gutter">
      <header className="rounded-xl bg-sunken px-6 py-8 md:px-10 md:py-10">
        <h1
          id="sos-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-5xl leading-tight font-bold text-ink md:text-7xl"
        >
          I need a little help.
        </h1>
        <p className="mt-4 text-title text-ink-soft">My name is {PATIENT.name}.</p>
      </header>

      <div className="rounded-xl bg-surface p-6 shadow-card md:p-10">
        <p className="text-title leading-snug">
          Hello. I may find some things hard to remember. Please stay with me, speak slowly and
          kindly, and help me get in touch with my caregiver.
        </p>
        <ol className="mt-6 flex flex-col gap-4">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-4 text-title leading-snug font-semibold">
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-title font-bold text-on-accent"
              >
                {index + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-title text-ink-soft">Thank you for helping.</p>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-surface p-6 pt-7 shadow-card md:p-10 md:pt-11">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-2 bg-sos" />
        <h2 className="text-title font-bold">My caregiver is {caregiver.name}</h2>
        {tel ? (
          <>
            <p className="mt-2 text-title text-ink-soft">{caregiver.phone}</p>
            <a
              href={tel}
              className="mt-5 inline-flex min-h-20 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-sos px-8 text-title font-bold text-on-accent transition-colors duration-quick ease-gentle hover:bg-sos-strong motion-reduce:transition-none"
            >
              <Icon name="phone" className="size-8" />
              Call {caregiver.name}
            </a>
          </>
        ) : (
          <p className="mt-3 text-title text-ink-soft">
            Demo number: {caregiver.phone || 'not set'}. A real number can be added in the demo
            data, which will turn on the Call button.
          </p>
        )}
        {caregiver.isDemo && tel && (
          <p className="mt-3 text-body text-ink-soft">Demo number, not a real person.</p>
        )}
      </div>

      <div
        role="status"
        aria-live="polite"
        className="flex items-start gap-4 rounded-xl bg-accent-soft p-6 md:p-8"
      >
        <Icon name="check" className="mt-1 size-9 shrink-0 text-accent" />
        <div>
          <p className="text-title leading-snug font-bold text-ink">
            {seen
              ? `${caregiver.name} has seen this alert (at ${TIME.format(new Date(current.acknowledgedAt))}).`
              : `${caregiver.name} has been told.`}
          </p>
          <p className="mt-2 text-lead text-ink-soft">
            This is a demo, so no real message has been sent.
          </p>
        </div>
      </div>
    </section>
  )
}
