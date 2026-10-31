import { dayOf, weekdayOf } from './format'

// Lightweight 7-day bar chart built from CSS boxes (no chart library).
// Days without data are dashed placeholders, never zero-height bars.
// The visual chart is hidden from assistive tech; a table carries the same facts.
export function EngagementChart({ daily, baseline }) {
  const max = Math.max(baseline * 2, ...daily.map((d) => d.engagement ?? 0))
  const scale = max * 1.25

  return (
    <figure>
      <figcaption className="sr-only">
        Daily engagement for the last 7 days. The usual routine is {baseline} a day.
      </figcaption>

      <div aria-hidden="true">
        <div className="relative h-44">
          <div
            className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-ink-soft"
            style={{ bottom: `${(baseline / scale) * 100}%` }}
          >
            <span className="absolute right-0 bottom-0.5 bg-surface/90 px-1 text-caption font-semibold text-ink-soft">
              Usual: {baseline} a day
            </span>
          </div>

          <div className="absolute inset-0 z-10 flex items-end gap-1.5 md:gap-3">
            {daily.map((d) => (
              <div
                key={d.date}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              >
                {d.engagement === null ? (
                  <div className="h-10 w-full rounded-md border-2 border-dashed border-line-strong text-center text-body leading-8 text-ink-soft">
                    –
                  </div>
                ) : (
                  <>
                    <span className="mb-1 bg-surface px-1 text-body font-bold text-ink">{d.engagement}</span>
                    <div
                      className={`w-full rounded-t-md ${d.isLowEngagement ? 'bg-turquoise' : 'bg-accent'}`}
                      style={{ height: `${(d.engagement / scale) * 100}%`, minHeight: 4 }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex gap-1.5 md:gap-3">
          {daily.map((d) => (
            <div
              key={d.date}
              className="min-w-0 flex-1 text-center text-caption leading-tight text-ink-soft"
            >
              <span className="block">{weekdayOf(d.date)}</span>
              <span className="block">{dayOf(d.date)}</span>
            </div>
          ))}
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-caption text-ink-soft">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-accent" /> At or above usual
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-turquoise" /> Below usual
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-sm border-2 border-dashed border-line-strong" /> No data
          </li>
        </ul>
      </div>

      <table className="sr-only">
        <caption>Daily engagement</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Engagement</th>
            <th scope="col">Compared with usual</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((d) => (
            <tr key={d.date}>
              <th scope="row">{d.date}</th>
              <td>{d.engagement === null ? 'No data' : d.engagement}</td>
              <td>
                {d.engagement === null
                  ? 'Not counted'
                  : d.isLowEngagement
                    ? 'Below usual'
                    : 'At or above usual'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
