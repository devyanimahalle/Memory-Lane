// Simulated SOS state for the Memory Lane prototype. Nothing is sent anywhere.
//
// One small external store, read with useSyncExternalStore (see useSos.js). It is kept in
// localStorage so an alert survives a reload, and the `storage` event keeps every tab and window
// of the same browser origin in step. It does NOT reach other devices or other browsers.
//
// An alert moves sent -> acknowledged -> resolved. There is no automatic expiry: an active alert
// stays active until the caregiver resolves it or someone uses the labelled demo reset.
const KEY = 'memory-lane:sos'
const MAX_HISTORY = 20
const DEFAULT_CONTEXT = 'Patient Home'

const emptyState = () => ({ current: null, history: [] })

const createId = () =>
  globalThis.crypto?.randomUUID?.() || `sos-${Date.now()}-${Math.random().toString(36).slice(2)}`

function isAlert(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.status === 'string'
  )
}

// Reads a stored state defensively: anything unexpected becomes "no alerts".
export function parseState(raw) {
  try {
    const value = JSON.parse(raw)
    const current = isAlert(value?.current) && value.current.status !== 'resolved' ? value.current : null
    const history = Array.isArray(value?.history) ? value.history.filter(isAlert).slice(0, MAX_HISTORY) : []
    return { current, history }
  } catch {
    return emptyState()
  }
}

function browserStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

// `storage` and `listenToStorageEvents` are injectable so the store can be tested without a browser.
export function createSosStore({
  storage = browserStorage(),
  now = () => new Date(),
  makeId = createId,
  listenToStorageEvents = false,
} = {}) {
  let state = storage ? parseState(storage.getItem(KEY)) : emptyState()
  let context = DEFAULT_CONTEXT // the patient's current place in the app (never saved)
  let returnScroll = 0
  const listeners = new Set()

  function commit(next) {
    state = next
    try {
      storage?.setItem(KEY, JSON.stringify(state))
    } catch {
      // Storage can be full or blocked; the alert still works in this tab.
    }
    listeners.forEach((listener) => listener())
  }

  if (listenToStorageEvents && typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== KEY && event.key !== null) return
      state = parseState(event.key === null ? null : event.newValue)
      listeners.forEach((listener) => listener())
    })
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    // The patient's current page or activity inside the app. Not a physical location.
    setContext(label) {
      context = label || DEFAULT_CONTEXT
    },
    getContext: () => context,

    // Where to scroll back to once an alert has been resolved.
    rememberScroll(y) {
      returnScroll = Number.isFinite(y) ? y : 0
    },
    getReturnScroll: () => returnScroll,

    // Creates the alert. Ignored (returns null) while one is already active, so a double press,
    // a re-render or a second tab cannot create a duplicate. The id is made here, never in render.
    trigger({ patientName }) {
      if (state.current) return null
      const alert = {
        id: makeId(),
        createdAt: now().toISOString(),
        patientName,
        context,
        status: 'sent',
        acknowledgedAt: null,
        resolvedAt: null,
      }
      commit({ ...state, current: alert })
      return alert
    },

    acknowledge() {
      if (state.current?.status !== 'sent') return null
      const alert = { ...state.current, status: 'acknowledged', acknowledgedAt: now().toISOString() }
      commit({ ...state, current: alert })
      return alert
    },

    resolve() {
      if (!state.current) return null
      const alert = { ...state.current, status: 'resolved', resolvedAt: now().toISOString() }
      commit({ current: null, history: [alert, ...state.history].slice(0, MAX_HISTORY) })
      return alert
    },

    // Demo reset: clears the active alert and the history.
    clearAll() {
      commit(emptyState())
    },
  }
}

export const sosStore = createSosStore({ listenToStorageEvents: true })

// A phone number becomes a tel: link only when it has 7 to 15 digits (and nothing but digits,
// spaces, dashes, brackets and one leading +). Anything else, including a placeholder, gives null.
export function telHref(phone) {
  if (typeof phone !== 'string') return null
  const trimmed = phone.trim()
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) return null
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return null
  return `tel:${trimmed.startsWith('+') ? '+' : ''}${digits}`
}
