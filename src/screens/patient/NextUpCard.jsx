import { Button } from '../../ui/Button'
import { Icon } from '../../ui/icons'
import { formatTime } from './useDemoClock'

const NOTICE_STYLES = {
  done: 'bg-gentle-soft text-gentle-ink',
  later: 'bg-accent-soft text-accent-strong',
}

function Notice({ notice }) {
  if (!notice) return null
  return (
    <p
      role="status"
      className={`mb-5 flex items-center gap-3 rounded-full px-5 py-3 text-lead font-semibold ${NOTICE_STYLES[notice.kind]}`}
    >
      <Icon name={notice.kind === 'done' ? 'check' : 'clock'} className="size-6 shrink-0" />
      {notice.text}
    </p>
  )
}

export function NextUpCard({ item, notice, highlighted, onDone, onLater }) {
  const ring = highlighted ? 'ring-4 ring-turquoise' : ''

  if (!item) {
    return (
      <section
        aria-labelledby="next-up-title"
        className={`rounded-xl bg-sunken p-6 md:p-8 ${ring}`}
      >
        <Notice notice={notice} />
        <h2 id="next-up-title" className="flex items-center gap-3 text-lead font-bold text-accent">
          <Icon name="moon" className="size-7" />
          All done for today
        </h2>
        <p className="mt-3 font-heading text-title leading-tight font-bold">
          That is everything for today.
        </p>
        <p className="mt-2 text-lead text-ink-soft">
          Rest and enjoy a calm evening. I am here if you need me.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="next-up-title"
      className={`rounded-xl border border-l-8 border-line border-l-accent bg-surface p-6 md:p-8 ${ring}`}
    >
      <Notice notice={notice} />
      <h2
        id="next-up-title"
        className="inline-flex items-center gap-3 rounded-full bg-accent-soft py-2 pr-5 pl-4 text-lead font-bold text-accent-strong"
      >
        <Icon name={item.icon} className="size-7" />
        Next up at {formatTime(item.time)}
      </h2>
      <p className="mt-3 font-heading text-title leading-tight font-bold">{item.title}</p>
      <p className="mt-2 text-lead text-ink-soft">{item.note}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button full onClick={onDone} className="sm:flex-1">
          <Icon name="check" className="size-6" />
          Done
        </Button>
        <Button variant="secondary" full onClick={onLater} className="sm:flex-1">
          Remind me later
        </Button>
      </div>
    </section>
  )
}
