// Reminder logic taken from Ishani's ReminderModule (origin/feature/reminders), without its UI, so the
// existing Patient Home (NextUpCard, DayLane, VoiceAssistant) can use it. Pure functions, no React.
//
// Shared contracts (Member 2):
//   Reminder        { id, type: 'medicine' | 'routine', title, scheduledAt (ISO), status: 'pending' | 'taken' | 'snoozed',
//                     completedAt (ISO | null), note }
//   EngagementEvent { id, type: 'reminder' | 'routine', action: 'confirmed' | 'completed' | 'viewed', label,
//                     occurredAt (ISO), durationMinutes }

const createId = () =>
  globalThis.crypto?.randomUUID?.() || `event-${Date.now()}-${Math.random().toString(36).slice(2)}`

const pad = (n) => String(n).padStart(2, '0')

// A local ISO-like timestamp for `time` ("HH:MM") on the day of `day`.
function atTime(day, time) {
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}T${time}:00`
}

// Builds a Reminder from a lane item { id, type, title, time: 'HH:MM', note }, for today.
export function toReminder(item, { today = new Date(), taken = false } = {}) {
  const scheduledAt = atTime(today, item.time)
  return {
    id: item.id,
    type: item.type === 'medicine' ? 'medicine' : 'routine',
    title: item.title,
    scheduledAt,
    status: taken ? 'taken' : 'pending',
    completedAt: taken ? scheduledAt : null,
    note: item.note ?? '',
  }
}

function buildEvent(reminder, action, label, occurredAt, makeId) {
  return {
    id: makeId(),
    type: reminder.type === 'routine' ? 'routine' : 'reminder',
    action,
    label,
    occurredAt,
    durationMinutes: 1,
  }
}

// "I've done this": the reminder becomes taken and a confirmed/completed event is made.
export function markTaken(reminder, now = new Date(), makeId = createId) {
  const occurredAt = now.toISOString()
  const routine = reminder.type === 'routine'
  return {
    reminder: { ...reminder, status: 'taken', completedAt: occurredAt },
    event: buildEvent(
      reminder,
      routine ? 'completed' : 'confirmed',
      `${routine ? 'Completed routine' : 'Confirmed reminder'}: ${reminder.title}`,
      occurredAt,
      makeId,
    ),
  }
}

// "Remind me later": the reminder is snoozed (schema-compatible 'viewed' event).
export function snooze(reminder, now = new Date(), makeId = createId) {
  const occurredAt = now.toISOString()
  return {
    reminder: { ...reminder, status: 'snoozed', completedAt: null },
    event: buildEvent(reminder, 'viewed', `Snoozed reminder: ${reminder.title}`, occurredAt, makeId),
  }
}

export const minutesOf = (reminder) => {
  const d = new Date(reminder.scheduledAt)
  return d.getHours() * 60 + d.getMinutes()
}

// The next reminder to show: the earliest pending one still ahead of `nowMinutes`; when none is left,
// the earliest snoozed one (Ishani's rule: pending first, then snoozed).
export function getNextReminder(reminders, nowMinutes) {
  const byTime = (a, b) => minutesOf(a) - minutesOf(b)
  const pending = reminders.filter((r) => r.status === 'pending' && minutesOf(r) >= nowMinutes).sort(byTime)
  if (pending[0]) return pending[0]
  return reminders.filter((r) => r.status === 'snoozed').sort(byTime)[0] ?? null
}

// Conservative phrase matching (Ishani's phrases plus the Patient Home commands). Whole phrases only, so
// a stray "yes" or "done" never triggers anything. Returns a Patient Home command id or 'unknown'.
const PHRASES = {
  done: ['ive done this', 'i have done this', 'im done', 'i am done'],
  later: ['remind me later', 'snooze this', 'snooze'],
  reminders: ['read my reminders', 'read my reminder', 'read reminders'],
  stop: ['stop', 'stop playback', 'stop reading'],
  next: ['whats next', 'what is next', 'what is next for me'],
  photos: ['show photos', 'show my photos', 'show me my photos'],
  games: ['play a game', 'play games', 'show my games'],
}

export function matchVoiceCommand(raw) {
  if (!raw) return 'unknown'
  const clean = raw
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"’]/g, '')
    .replace(/\s+/g, ' ')
  for (const [id, phrases] of Object.entries(PHRASES)) {
    if (phrases.includes(clean)) return id
  }
  return 'unknown'
}
