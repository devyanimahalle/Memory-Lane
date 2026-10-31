import { dayOf, weekdayOf } from './format'

const TONES = {
  good: 'bg-accent-soft text-accent-strong',
  quiet: 'border border-line-strong bg-sunken text-ink',
  none: 'border border-dashed border-line-strong text-ink-soft',
}

// Seven small day cells. Each item: { date, value (string or null), tone ('good' | 'quiet') }.
// A null value is shown as a dashed "no data" cell, never as zero.
export function DayStrip({ items, label }) {
  return (
    <ul aria-label={label} className="grid grid-cols-7 gap-1 md:gap-2">
      {items.map(({ date, value, tone }) => {
        const empty = value === null
        return (
          <li
            key={date}
            className={`min-w-0 rounded-md px-0.5 py-2 text-center ${TONES[empty ? 'none' : tone]}`}
          >
            <span className="block text-caption leading-tight">{weekdayOf(date)}</span>
            <span className="block text-caption leading-tight">{dayOf(date)}</span>
            <span className="mt-1 block text-body leading-tight font-bold">
              {empty ? '–' : value}
              {empty && <span className="sr-only">No data</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
