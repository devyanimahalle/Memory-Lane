/**
 * safetyMonitor.js - Caregiver GPS Safe-Zone Breach Alert & Tracking Logic
 *
 * Responsibilities:
 * - Continuously evaluate patient GPS position against caregiver-configured home & safe radius.
 * - Strict accuracy filtering: only accept GPS readings with accuracy <= 50m.
 * - IMMEDIATELY alert caregiver when patient exits safe radius.
 * - Repeat caregiver alerts every 2 minutes while patient remains outside.
 * - Track continuous time outside and alert history in localStorage.
 * - Immediately stop repeated alerts when patient reliably returns inside safe radius.
 * - Start a fresh alert sequence if patient leaves again.
 * - Manage caregiver emergency contact and active breach state.
 */

import { calculateHaversineDistance } from './geofence.js';

export const ACCURACY_THRESHOLD_METERS = 50;
export const REPEAT_ALERT_INTERVAL_MS = 120000; // Repeat alerts every 2 minutes
export const MAX_READING_GAP_MS = 60000; // 60s max gap between fixes

const STORAGE_KEY_ACTIVE_BREACH = 'memory_lane_active_breach';
const STORAGE_KEY_ALERT_HISTORY = 'memory_lane_alert_history';
const STORAGE_KEY_CAREGIVER_CONTACT = 'memory_lane_caregiver_contact';

/**
 * Formats elapsed milliseconds outside into readable text (e.g. "45s", "2m 15s", "1h 10m")
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatTimeOutside(ms) {
  if (!ms || ms <= 0 || isNaN(ms)) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return `${hours}h ${remMins}m`;
}

/**
 * Loads current active breach state from localStorage
 * @returns {{
 *   active: boolean,
 *   breachStartedAt: number,
 *   lastAlertAt: number,
 *   alertCount: number,
 *   initialDistance: number,
 *   currentDistance: number,
 *   lastLocation: { lat: number, lng: number, accuracy: number }
 * } | null}
 */
export function loadActiveBreach() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_BREACH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persists active breach state to localStorage
 */
export function saveActiveBreach(breachState) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (breachState && breachState.active) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_BREACH, JSON.stringify(breachState));
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_BREACH);
    }
  } catch {}
}

/**
 * Clears active breach state
 */
export function clearActiveBreach() {
  saveActiveBreach(null);
}

/**
 * Loads alert history log from localStorage (newest first)
 * @returns {Array<Object>}
 */
export function loadAlertHistory() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERT_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves alert history to localStorage (capped to last 50 items)
 */
export function saveAlertHistory(history) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const capped = Array.isArray(history) ? history.slice(0, 50) : [];
    localStorage.setItem(STORAGE_KEY_ALERT_HISTORY, JSON.stringify(capped));
  } catch {}
}

/**
 * Appends a new alert record to the alert history
 */
export function recordAlert(alertEntry) {
  const prev = loadAlertHistory();
  const entryWithId = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now(),
    ...alertEntry,
  };
  const updated = [entryWithId, ...prev].slice(0, 50);
  saveAlertHistory(updated);
  return entryWithId;
}

/**
 * Clears the alert history
 */
export function clearAlertHistory() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(STORAGE_KEY_ALERT_HISTORY);
  } catch {}
}

/**
 * Loads configured caregiver contact information
 * @returns {{ name: string, phone: string, relationship?: string } | null}
 */
export function loadCaregiverContact() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CAREGIVER_CONTACT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves caregiver contact information
 */
export function saveCaregiverContact(contact) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (contact && (contact.name || contact.phone)) {
      localStorage.setItem(STORAGE_KEY_CAREGIVER_CONTACT, JSON.stringify(contact));
    } else {
      localStorage.removeItem(STORAGE_KEY_CAREGIVER_CONTACT);
    }
  } catch {}
}

/**
 * Evaluates patient location for caregiver safe-zone breach alerts:
 * 1. Checks accuracy filter (<= 50m).
 * 2. Calculates distance from caregiver home base.
 * 3. Immediately triggers Alert #1 on initial exit from safe radius.
 * 4. Repeats alerts every 2 minutes while patient remains outside.
 * 5. Stops repeated alerts when patient reliably returns inside safe radius.
 * 6. Starts a new alert sequence if patient leaves again.
 *
 * @param {Object} pos - { lat, lng, accuracy, timestamp }
 * @param {Object|null} home - { lat, lng }
 * @param {number} radius - radius in meters
 * @param {Object|null} activeBreach - current active breach state
 * @param {number|null} currentTime - optional deterministic time for testing
 * @returns {{
 *   isAccurate: boolean,
 *   distanceFromHome: number|null,
 *   isOutside: boolean,
 *   shouldAlert: boolean,
 *   alertType: 'initial_breach' | 'repeat_breach' | 'resolved' | null,
 *   alertMessage: string|null,
 *   newBreachState: Object|null
 * }}
 */
export function evaluateCaregiverBreach(
  pos,
  home,
  radius,
  activeBreach = null,
  currentTime = null
) {
  if (!pos || !home || typeof pos.lat !== 'number' || typeof home.lat !== 'number') {
    return {
      isAccurate: false,
      distanceFromHome: null,
      isOutside: false,
      shouldAlert: false,
      alertType: null,
      alertMessage: null,
      newBreachState: activeBreach,
    };
  }

  // 1. Strict Accuracy Filter (ignore GPS jitter > 50m)
  const isAccurate = typeof pos.accuracy === 'number' && pos.accuracy <= ACCURACY_THRESHOLD_METERS;
  if (!isAccurate) {
    return {
      isAccurate: false,
      distanceFromHome: null,
      isOutside: false,
      shouldAlert: false,
      alertType: null,
      alertMessage: null,
      newBreachState: activeBreach,
    };
  }

  const now = typeof currentTime === 'number' ? currentTime : Date.now();
  const distance = calculateHaversineDistance(pos.lat, pos.lng, home.lat, home.lng);
  const isOutside = distance > radius;

  // 2. Patient is reliably INSIDE safe radius
  if (!isOutside) {
    const wasBreached = Boolean(activeBreach && activeBreach.active);
    return {
      isAccurate: true,
      distanceFromHome: distance,
      isOutside: false,
      shouldAlert: wasBreached,
      alertType: wasBreached ? 'resolved' : null,
      alertMessage: wasBreached ? 'Patient has safely returned inside the safe radius.' : null,
      newBreachState: null, // Clears active breach; stops repeat alerts
      resolvedSummary: wasBreached ? {
        totalTimeOutsideMs: now - activeBreach.breachStartedAt,
        totalAlertsSent: activeBreach.alertCount,
      } : null,
    };
  }

  // 3. Patient is OUTSIDE safe radius
  if (!activeBreach || !activeBreach.active) {
    // Initial breach: immediately alert caregiver
    const newBreachState = {
      active: true,
      breachStartedAt: now,
      lastAlertAt: now,
      alertCount: 1,
      initialDistance: distance,
      currentDistance: distance,
      lastLocation: { lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy },
    };

    return {
      isAccurate: true,
      distanceFromHome: distance,
      isOutside: true,
      shouldAlert: true,
      alertType: 'initial_breach',
      alertMessage: `Safe Zone Breach: Patient is ${Math.round(distance)}m from home (safe radius: ${radius}m).`,
      newBreachState,
    };
  }

  // 4. Ongoing breach: check if 2 minutes has elapsed since previous alert
  const timeSinceLastAlert = now - activeBreach.lastAlertAt;
  const shouldRepeatAlert = timeSinceLastAlert >= REPEAT_ALERT_INTERVAL_MS;
  const totalTimeOutside = now - activeBreach.breachStartedAt;

  const newBreachState = {
    ...activeBreach,
    currentDistance: distance,
    lastLocation: { lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy },
    lastAlertAt: shouldRepeatAlert ? now : activeBreach.lastAlertAt,
    alertCount: shouldRepeatAlert ? activeBreach.alertCount + 1 : activeBreach.alertCount,
  };

  return {
    isAccurate: true,
    distanceFromHome: distance,
    isOutside: true,
    shouldAlert: shouldRepeatAlert,
    alertType: shouldRepeatAlert ? 'repeat_breach' : null,
    alertMessage: shouldRepeatAlert
      ? `Repeat Breach Alert #${newBreachState.alertCount}: Patient remains outside safe radius for ${formatTimeOutside(totalTimeOutside)} (${Math.round(distance)}m away).`
      : null,
    newBreachState,
  };
}
