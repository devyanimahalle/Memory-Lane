// Patient-side location sharing for the same-browser prototype.
//
// Browser geolocation reports the device the browser runs on, so tracking belongs to the PATIENT
// experience: the patient says yes (see PatientLocationCard), this module starts the browser watcher,
// and stops it again on request. Readings, movement history and safe-zone alerts are written to this
// browser's localStorage; the caregiver view only READS them (LocationModule), live, through the
// `storage` event and a timer. This is a browser-local simulation: nothing is sent to another device
// or browser, and the caregiver's own device is never tracked.
import { useSyncExternalStore } from 'react'
import { calculateHaversineDistance, loadSavedHome, loadSavedRadius } from './geofence.js'
import { GPS_STATUS, startLocationTracking } from './geolocation.js'
import {
  clearActiveBreach,
  evaluateCaregiverBreach,
  formatTimeOutside,
  loadActiveBreach,
  recordAlert,
  saveActiveBreach,
} from './safetyMonitor.js'

const LIVE_KEY = 'memory-lane:location-live'
const HISTORY_KEY = 'memory_lane_location_history_today'
const MAX_HISTORY = 50

const emptyLive = { sharing: false, status: GPS_STATUS.IDLE, error: null, position: null, updatedAt: 0 }

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be full or blocked; the reading simply is not kept.
  }
}

let snapshot = { ...emptyLive, history: [] }
const listeners = new Set()
let stopWatcher = null // set while THIS tab is sharing

function refresh() {
  snapshot = { ...emptyLive, ...readJson(LIVE_KEY, emptyLive), history: readJson(HISTORY_KEY, []) }
  listeners.forEach((listener) => listener())
}

function publish(patch) {
  const live = { ...emptyLive, ...readJson(LIVE_KEY, emptyLive), ...patch, updatedAt: Date.now() }
  writeJson(LIVE_KEY, live)
  refresh()
}

if (typeof window !== 'undefined') {
  refresh()
  window.addEventListener('storage', (event) => {
    if (event.key === LIVE_KEY || event.key === HISTORY_KEY || event.key === null) refresh()
  })
  // If the tab that is sharing closes, stop showing it as live.
  window.addEventListener('pagehide', () => {
    if (stopWatcher) {
      try {
        window.localStorage.removeItem(LIVE_KEY)
      } catch {
        // Nothing to clean up.
      }
    }
  })
}

// One reading from the patient's device: save it, add it to the movement history when it moved, and
// check it against the safe zone. Alerts are only entries in this browser's storage.
function handlePosition(position) {
  publish({ sharing: true, status: GPS_STATUS.ACTIVE, error: null, position })

  const home = loadSavedHome()
  const radius = loadSavedRadius()
  const distanceFromHome = home ? calculateHaversineDistance(position.lat, position.lng, home.lat, home.lng) : null

  const history = readJson(HISTORY_KEY, [])
  const last = history[0]
  const moved = last ? calculateHaversineDistance(last.lat, last.lng, position.lat, position.lng) : Infinity
  const elapsed = last ? (position.timestamp || Date.now()) - last.timestamp : Infinity
  if (!last || moved >= 15 || elapsed > 300000) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      lat: position.lat,
      lng: position.lng,
      accuracy: position.accuracy,
      timestamp: position.timestamp || Date.now(),
      distanceFromHome,
    }
    writeJson(HISTORY_KEY, [entry, ...history].slice(0, MAX_HISTORY))
    refresh()
  }

  const result = evaluateCaregiverBreach(position, home, radius, loadActiveBreach())
  if (!result.isAccurate) return
  if (result.newBreachState) saveActiveBreach(result.newBreachState)
  else clearActiveBreach()
  if (result.shouldAlert) {
    const meters = Math.round(result.distanceFromHome)
    const state = result.newBreachState
    recordAlert({
      type: result.alertType,
      message:
        result.alertType === 'initial_breach'
          ? `Went outside the safe zone: ${meters} m from home (limit ${radius} m). Recorded in this browser only.`
          : result.alertType === 'repeat_breach'
            ? `Still outside the safe zone after ${formatTimeOutside(Date.now() - state.breachStartedAt)} (${meters} m away). Recorded in this browser only.`
            : 'Back inside the safe zone.',
      distanceMeters: result.distanceFromHome,
      radiusMeters: radius,
      alertCount: state?.alertCount,
      timeOutsideMs: state ? Date.now() - state.breachStartedAt : undefined,
      totalBreachDurationMs: result.resolvedSummary?.totalTimeOutsideMs,
    })
  }
}

// Called only after the patient has said yes. Starts the browser watcher in this tab.
export function startSharing() {
  if (stopWatcher) return
  publish({ sharing: true, status: GPS_STATUS.REQUESTING, error: null })
  stopWatcher = startLocationTracking({
    onPosition: handlePosition,
    onError: (err) => publish({ sharing: true, error: err.message }),
    onStatusChange: (status) => publish({ sharing: true, status }),
  })
}

// The patient (or leaving the page) stops sharing: the watcher stops and the live reading is cleared.
export function stopSharing() {
  stopWatcher?.()
  stopWatcher = null
  try {
    window.localStorage.removeItem(LIVE_KEY)
  } catch {
    // Nothing to clear.
  }
  refresh()
}

export function clearSharedHistory() {
  writeJson(HISTORY_KEY, [])
  refresh()
}

// True when THIS tab holds the watcher (the patient device in this prototype).
export const isSharingHere = () => stopWatcher !== null

export function useSharedLocation() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => snapshot,
    () => snapshot,
  )
}
