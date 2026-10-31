// Shared task/reminder state for the same-browser prototype. ONE data model: the Reminder contract
// { id, type: 'medicine' | 'routine', title, scheduledAt, status: 'pending' | 'taken' | 'snoozed',
//   completedAt, note }, used by the patient and the caregiver screens alike. Saved in localStorage and
// kept in step across tabs of the same browser origin with the `storage` event. It is NOT synchronised
// between different devices, browsers or people.
//
// Safety rules: a reminder only becomes 'taken' through markTaken(), which the patient screens call
// after an explicit tap (and, for medicine, an explicit confirmation); nothing here ever marks anything
// taken by itself, and editing, adding or deleting never creates an engagement event.
import { markTaken as markTakenLogic, snooze as snoozeLogic } from './reminderLogic.js'

const KEY = 'memory-lane:reminders'
const MAX_TITLE = 80
const MAX_NOTE = 200

const createId = () =>
  globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(36).slice(2)}`

const TYPES = ['medicine', 'routine']
const STATUSES = ['pending', 'taken', 'snoozed']

function isReminder(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    TYPES.includes(value.type) &&
    STATUSES.includes(value.status) &&
    typeof value.scheduledAt === 'string' &&
    !Number.isNaN(new Date(value.scheduledAt).getTime())
  )
}

export function parseReminders(raw) {
  try {
    const value = JSON.parse(raw)
    return Array.isArray(value?.reminders) ? value.reminders.filter(isReminder) : null
  } catch {
    return null
  }
}

// Validates and cleans user input. Returns { ok: true, value } or { ok: false, error }.
export function cleanInput(input, { partial = false } = {}) {
  const value = {}
  if (!partial || 'title' in input) {
    const title = String(input.title ?? '').trim().slice(0, MAX_TITLE)
    if (!title) return { ok: false, error: 'Please give the task a name.' }
    value.title = title
  }
  if (!partial || 'note' in input) value.note = String(input.note ?? '').trim().slice(0, MAX_NOTE)
  if (!partial || 'type' in input) {
    if (!TYPES.includes(input.type)) return { ok: false, error: 'Please choose medicine or routine.' }
    value.type = input.type
  }
  if (!partial || 'scheduledAt' in input) {
    if (typeof input.scheduledAt !== 'string' || Number.isNaN(new Date(input.scheduledAt).getTime())) {
      return { ok: false, error: 'Please choose a date and time.' }
    }
    value.scheduledAt = input.scheduledAt
  }
  return { ok: true, value }
}

export function createRemindersStore({
  storage = typeof window !== 'undefined' ? window.localStorage : null,
  makeId = createId,
  now = () => new Date(),
  listenToStorageEvents = false,
} = {}) {
  const read = () => {
    try {
      return storage ? parseReminders(storage.getItem(KEY)) : null
    } catch {
      return null
    }
  }
  let state = read() ?? []
  const listeners = new Set()

  function commit(reminders) {
    state = reminders
    try {
      storage?.setItem(KEY, JSON.stringify({ version: 1, reminders }))
    } catch {
      // Storage can be full or blocked; the change still works in this tab.
    }
    listeners.forEach((listener) => listener())
  }

  if (listenToStorageEvents && typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== KEY && event.key !== null) return
      state = read() ?? []
      listeners.forEach((listener) => listener())
    })
  }

  const find = (id) => state.find((r) => r.id === id)
  const replace = (reminder) => commit(state.map((r) => (r.id === reminder.id ? reminder : r)))

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    // Puts the starting tasks in place once, only when nothing has ever been saved. Deleting every task
    // later does not bring them back (the saved list is then empty, not missing).
    seedIfEmpty(list) {
      let saved = null
      try {
        saved = storage?.getItem(KEY) ?? null
      } catch {
        saved = null
      }
      if (saved === null && state.length === 0) commit(list)
    },

    // Demo reset: replaces every task with the given list.
    reset(list) {
      commit(list)
    },

    add(input) {
      const cleaned = cleanInput(input)
      if (!cleaned.ok) return cleaned
      const reminder = { id: makeId(), status: 'pending', completedAt: null, ...cleaned.value }
      commit([...state, reminder])
      return { ok: true, reminder }
    },

    // Edits details only. Status, completion time and id are never touched, so editing cannot
    // complete a task, undo one, or create a copy.
    update(id, patch) {
      const current = find(id)
      if (!current) return { ok: false, error: 'That task is no longer there.' }
      const allowed = {}
      for (const key of ['title', 'note', 'type', 'scheduledAt']) if (key in patch) allowed[key] = patch[key]
      const cleaned = cleanInput(allowed, { partial: true })
      if (!cleaned.ok) return cleaned
      const reminder = { ...current, ...cleaned.value }
      replace(reminder)
      return { ok: true, reminder }
    },

    remove(id) {
      if (!find(id)) return false
      commit(state.filter((r) => r.id !== id))
      return true
    },

    // The patient's explicit "I've done this". Returns { reminder, event } or null (already taken).
    markTaken(id) {
      const current = find(id)
      if (!current || current.status === 'taken') return null
      const result = markTakenLogic(current, now())
      replace(result.reminder)
      return result
    },

    snooze(id) {
      const current = find(id)
      if (!current || current.status === 'taken') return null
      const result = snoozeLogic(current, now())
      replace(result.reminder)
      return result
    },
  }
}

export const remindersStore = createRemindersStore({ listenToStorageEvents: true })
