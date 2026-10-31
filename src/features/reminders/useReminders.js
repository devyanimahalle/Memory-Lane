import { useEffect, useRef, useState } from 'react'
import { markTaken, snooze } from './reminderLogic'

// Reminder state for a screen. `makeInitial()` returns the Reminder[] to start from. `onEngagement(event)`
// receives each EngagementEvent once, from the action handler (never from a render or an effect).
export function useReminders(makeInitial, onEngagement) {
  const [reminders, setReminders] = useState(makeInitial)
  const latest = useRef(reminders)

  useEffect(() => {
    latest.current = reminders
  }, [reminders])

  function apply(id, change) {
    const current = latest.current.find((r) => r.id === id)
    if (!current) return null
    const { reminder, event } = change(current)
    latest.current = latest.current.map((r) => (r.id === id ? reminder : r))
    setReminders(latest.current)
    onEngagement?.(event)
    return reminder
  }

  return {
    reminders,
    // Ignored when the reminder is already taken, so a repeated tap cannot send a second event.
    markTaken: (id) =>
      latest.current.find((r) => r.id === id)?.status === 'taken' ? null : apply(id, (r) => markTaken(r)),
    snooze: (id) => apply(id, (r) => snooze(r)),
  }
}
