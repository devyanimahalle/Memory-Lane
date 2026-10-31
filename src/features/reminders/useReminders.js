import { useSyncExternalStore } from 'react'
import { remindersStore } from './remindersStore'

// The shared reminders (tasks) for any screen. Patient and caregiver read and change the same state.
// `onEngagement(event)` receives the EngagementEvent of an explicit "done" or "later" once, from the
// action handler (never from a render or an effect). Add, edit and delete send no events.
export function useReminders({ onEngagement } = {}) {
  const state = useSyncExternalStore(remindersStore.subscribe, remindersStore.getState, remindersStore.getState)

  return {
    reminders: state,
    markTaken: (id) => {
      const result = remindersStore.markTaken(id)
      if (result) onEngagement?.(result.event)
      return result?.reminder ?? null
    },
    snooze: (id) => {
      const result = remindersStore.snooze(id)
      if (result) onEngagement?.(result.event)
      return result?.reminder ?? null
    },
    add: remindersStore.add,
    update: remindersStore.update,
    remove: remindersStore.remove,
    reset: remindersStore.reset,
  }
}
