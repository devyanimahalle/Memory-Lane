import { Icon } from '../../ui/icons'

function greetingFor(minutes) {
  if (minutes < 12 * 60) return 'Good morning'
  if (minutes < 18 * 60) return 'Good afternoon'
  return 'Good evening'
}

// Flat quarter-circle motif (from the CogniCare brand direction).
function QuarterMotif() {
  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute -top-px -right-px size-32 md:size-44"
    >
      <path d="M160 0v160A160 160 0 0 1 0 0z" className="fill-accent-soft" />
      <path d="M160 0v100A100 100 0 0 1 60 0z" className="fill-turquoise/30" />
      <path d="M160 0v50A50 50 0 0 1 110 0z" className="fill-accent/70" />
    </svg>
  )
}

export function GreetingHeader({ name, minutes, date, headingRef }) {
  const evening = minutes >= 18 * 60 || minutes < 6 * 60

  return (
    <header className="relative overflow-hidden rounded-xl bg-sunken px-6 py-8 md:px-10 md:py-10">
      <QuarterMotif />
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="relative max-w-[16ch] text-4xl leading-tight font-bold text-ink md:max-w-none md:text-display"
      >
        {greetingFor(minutes)}, {name}
      </h1>
      <p className="relative mt-3 flex items-center gap-2 text-lead text-ink-soft">
        <Icon name={evening ? 'moon' : 'sun'} className="size-6 shrink-0" />
        <span>Today is {date}.</span>
      </p>
    </header>
  )
}
