import { SCHEDULE } from '../patient/mockData'

// Small helpers shared by the patient and caregiver task screens. Reminders keep local ISO-like
// timestamps ("YYYY-MM-DDTHH:MM:00"), so plain string comparison sorts them chronologically.
const pad = (n) => String(n).padStart(2, '0')

export const todayString = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const dateOf = (r) => r.scheduledAt.slice(0, 10)
export const timeOf = (r) => r.scheduledAt.slice(11, 16)
export const minutesOfDay = (r) => Number(timeOf(r).slice(0, 2)) * 60 + Number(timeOf(r).slice(3, 5))
export const byTime = (a, b) => a.scheduledAt.localeCompare(b.scheduledAt)
export const toScheduledAt = (date, time) => `${date}T${time}:00`

// pending, snoozed and done come from the Reminder; "missed" is worked out (a pending task whose time
// has passed). It is only ever worded gently ("Still to do" for the patient, amber for the caregiver).
export function statusOf(reminder, nowMinutes, today = todayString()) {
  if (reminder.status === 'taken') return 'done'
  if (reminder.status === 'snoozed') return 'snoozed'
  const date = dateOf(reminder)
  if (date < today || (date === today && minutesOfDay(reminder) < nowMinutes)) return 'missed'
  return 'pending'
}

// Lane icon: the original icon for the starting tasks, a sensible one for new tasks.
export function iconFor(reminder) {
  return SCHEDULE.find((i) => i.id === reminder.id)?.icon ?? (reminder.type === 'medicine' ? 'pill' : 'tree')
}

const DAY = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
export function friendlyDay(dateString, today = todayString()) {
  if (dateString === today) return 'Today'
  return DAY.format(new Date(`${dateString}T00:00:00`))
}
