import { ALERT_LABEL, friendlyMessage } from './format'

// Gentle alerts from the analytics summary, with an empty state.
export function AlertList({ alerts }) {
  if (alerts.length === 0) {
    return <p>Nothing unusual compared with the usual routine.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {alerts.map((alert) => (
        <li key={`${alert.type}-${alert.date}`} className="border-l-4 border-deep pl-3">
          <span className="inline-block rounded-full bg-accent-soft px-3 py-0.5 text-caption font-semibold text-accent-strong">
            {ALERT_LABEL[alert.type] ?? 'Note'}
          </span>
          <p className="mt-1 text-ink">{friendlyMessage(alert.message)}</p>
        </li>
      ))}
    </ul>
  )
}
