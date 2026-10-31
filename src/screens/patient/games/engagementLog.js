// Records finished game rounds on this device. The games report events in their own shape
// ({ id, type, action, label, occurredAt, durationMinutes }); this maps them to the proposed shared
// schema { id, type, timestamp, featureId, status, meta } and keeps a small log, so analytics can
// adopt them later without the games changing. Nothing leaves the device.
const KEY = 'memory-lane:engagement'
const MAX_RECORDS = 200

export function toEngagementRecord(event, extra = {}) {
  return {
    id: event.id,
    type: event.type,
    timestamp: event.occurredAt,
    featureId: 'activities',
    status: event.action,
    meta: { label: event.label, durationMinutes: event.durationMinutes, ...extra },
  }
}

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function readEngagementLog(storage = defaultStorage()) {
  try {
    const list = JSON.parse(storage?.getItem(KEY) ?? '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

// Stores one finished round. An id that is already in the log is ignored, so a round can never be
// counted twice. Returns the record when stored and null otherwise.
export function recordEngagement(event, extra, storage = defaultStorage()) {
  if (!event || typeof event.id !== 'string') return null
  const log = readEngagementLog(storage)
  if (log.some((item) => item.id === event.id)) return null
  const record = toEngagementRecord(event, extra)
  try {
    storage?.setItem(KEY, JSON.stringify([...log, record].slice(-MAX_RECORDS)))
  } catch {
    // Storage can be full or blocked; the round is simply not kept.
  }
  return record
}
