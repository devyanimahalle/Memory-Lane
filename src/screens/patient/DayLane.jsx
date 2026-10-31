import { Icon } from '../../ui/icons'
import { formatTime } from './useDemoClock'

// Category tint by activity: medicine, meals, outdoors, social and rest.
const CATEGORY_TINT = {
  pill: 'bg-tint-sky',
  bowl: 'bg-tint-sage',
  tree: 'bg-sunken',
  cup: 'bg-accent-soft',
  phone: 'bg-accent-soft',
}

const STATUS = {
  done: {
    label: 'Done',
    dot: 'bg-gentle text-on-gentle',
    text: 'text-gentle-ink',
  },
  next: {
    label: 'Next',
    dot: 'bg-accent text-on-accent',
    text: 'text-accent',
  },
  still: {
    label: 'Still to do, whenever you are ready',
    dot: 'border-2 border-line-strong text-ink',
    text: 'text-ink-soft',
  },
  later: {
    label: 'Later',
    dot: 'text-ink',
    text: 'text-ink-soft',
  },
}

export function DayLane({ stops, highlightId }) {
  return (
    <section aria-labelledby="lane-title">
      <h2 id="lane-title" className="mb-5 text-title font-bold">
        Today&rsquo;s lane
      </h2>
      <ol>
        {stops.map(({ item, status }, index) => {
          const s = STATUS[status]
          const tint = status === 'still' || status === 'later' ? CATEGORY_TINT[item.icon] : ''
          const last = index === stops.length - 1
          const pathTone = status === 'done' ? 'before:bg-gentle/50' : 'before:bg-line'
          const highlight =
            highlightId === item.id ? 'ring-4 ring-turquoise ring-offset-4 ring-offset-canvas' : ''

          return (
            <li
              key={item.id}
              aria-current={status === 'next' ? 'step' : undefined}
              className={`relative min-h-touch-lg rounded-lg pl-16 ${last ? '' : 'pb-6'} ${
                last ? '' : `before:absolute before:top-12 before:bottom-0 before:left-[1.1875rem] before:w-1 before:rounded-full ${pathTone}`
              } ${highlight}`}
            >
              <span
                className={`absolute top-0 left-0 flex size-12 items-center justify-center rounded-full ${s.dot} ${tint}`}
              >
                <Icon name={status === 'done' ? 'check' : item.icon} className="size-6" />
              </span>
              <p className="text-body font-semibold text-ink-soft">{formatTime(item.time)}</p>
              <p className="font-heading text-lead leading-snug font-bold">{item.title}</p>
              <p className={`text-body font-semibold ${s.text}`}>{s.label}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
