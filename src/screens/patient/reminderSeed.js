import { remindersStore, toReminder } from '../../features/reminders'
import { SCHEDULE } from './mockData'
import { getDemoMinutes, parseTime } from './useDemoClock'

// The starting tasks (the Patient Home lane items, as Reminders for today). Items before the demo
// time start as taken, like the lane always did; `leftOpen` items stay open.
export function buildSeedReminders(today = new Date(), minutes = getDemoMinutes()) {
  return SCHEDULE.map((item) => toReminder(item, { today, taken: parseTime(item.time) < minutes && !item.leftOpen }))
}

// Called once when the app starts: fills the shared task list only if nothing was ever saved.
export function seedReminders() {
  remindersStore.seedIfEmpty(buildSeedReminders())
}
