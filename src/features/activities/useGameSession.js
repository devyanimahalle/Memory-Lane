import { useCallback, useEffect, useRef } from 'react'

const createEventId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `event-${Date.now()}-${Math.random().toString(36).slice(2)}`

// Shared engagement reporting for the games. Each game calls `start()` when a new round begins and
// `reportCompleted(label)` when the person finishes it; a round is reported at most once, so a
// re-render can never send a duplicate.
//
// Event contract (unchanged from the original activities module):
//   { id, type: 'game', action: 'completed', label, occurredAt (ISO), durationMinutes (>= 1) }
export function useGameSession(onEngagement) {
  const startedAt = useRef(0)
  const sent = useRef(false)
  const handler = useRef(onEngagement)

  useEffect(() => {
    handler.current = onEngagement
  }, [onEngagement])

  const start = useCallback(() => {
    startedAt.current = Date.now()
    sent.current = false
  }, [])

  const reportCompleted = useCallback((label) => {
    if (sent.current) return
    sent.current = true
    if (typeof handler.current !== 'function') return
    const began = startedAt.current || Date.now()
    handler.current({
      id: createEventId(),
      type: 'game',
      action: 'completed',
      label,
      occurredAt: new Date().toISOString(),
      durationMinutes: Math.max(1, Math.round((Date.now() - began) / 60000)),
    })
  }, [])

  useEffect(() => {
    start()
  }, [start])

  return { start, reportCompleted }
}
