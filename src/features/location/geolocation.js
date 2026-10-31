/**
 * geolocation.js - Robust Browser Geolocation API Wrapper for Memory Lane
 *
 * Responsibilities:
 * - Request browser GPS permission transparently
 * - Watch patient location using navigator.geolocation.watchPosition()
 * - Clean up watchers on unmount or when tracking toggled off
 * - Handle timeouts gracefully with low-accuracy fallback
 * - Normalize timestamps across browsers and simulation environments
 * - Prevent overlapping requests, duplicate watchers, and timeout storms
 * - NEVER fabricate or fake GPS coordinates
 */

export const GPS_STATUS = {
  IDLE: 'IDLE',
  PROMPT: 'PROMPT',
  REQUESTING: 'REQUESTING',
  ACTIVE: 'ACTIVE',
  STALE: 'STALE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  UNSUPPORTED: 'UNSUPPORTED',
};

/**
 * Standard browser geolocation options for patient tracking:
 * - High accuracy requested where available
 * - Maximum age of 10s to permit recent hardware fixes without obsolete cache
 * - Timeout of 15s to allow sufficient time for hardware or Wi-Fi triangulation
 */
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 15000,
};

/**
 * Threshold in milliseconds after which active GPS data is flagged as stale (e.g. 60 seconds)
 */
export const STALE_LOCATION_THRESHOLD_MS = 60000;

/**
 * Checks the browser's current Geolocation permission status if the Permissions API is available.
 *
 * @returns {Promise<'granted' | 'prompt' | 'denied' | 'unsupported'>}
 */
export async function checkPermissionStatus() {
  if (
    typeof window === 'undefined' ||
    !navigator ||
    !navigator.permissions ||
    !navigator.permissions.query
  ) {
    return 'unsupported';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state; // 'granted' | 'prompt' | 'denied'
  } catch (err) {
    return 'unsupported';
  }
}

/**
 * Categorizes GPS accuracy into elderly-friendly rating and badge
 *
 * @param {number|null} accuracyMeters
 * @returns {{ level: 'high' | 'moderate' | 'low' | 'unknown', label: string, meters: number | null }}
 */
export function getAccuracyRating(accuracyMeters) {
  if (accuracyMeters === null || accuracyMeters === undefined || isNaN(accuracyMeters)) {
    return { level: 'unknown', label: 'Accuracy unknown', meters: null };
  }
  const acc = Math.round(accuracyMeters);
  if (acc <= 20) {
    return { level: 'high', label: `High accuracy (±${acc}m)`, meters: acc };
  }
  if (acc <= 60) {
    return { level: 'moderate', label: `Moderate accuracy (±${acc}m)`, meters: acc };
  }
  return { level: 'low', label: `Broad area (±${acc}m)`, meters: acc };
}

/**
 * Formats a timestamp into human-readable relative time or clock time
 *
 * @param {number|string|Date} timestamp
 * @returns {string} e.g. "Just now", "25s ago", "2m ago", "10:15 AM"
 */
export function formatLastUpdated(timestamp) {
  if (!timestamp) return 'Never';
  try {
    const time = new Date(timestamp).getTime();
    if (isNaN(time)) return 'Unknown';
    const diffSeconds = Math.floor((Date.now() - time) / 1000);

    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;

    return new Date(time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch (err) {
    return 'Unknown';
  }
}

/**
 * Checks whether a given timestamp is considered stale (> 60s)
 *
 * @param {number|string|Date} timestamp
 * @returns {boolean}
 */
export function isLocationStale(timestamp) {
  if (!timestamp) return false;
  try {
    const time = new Date(timestamp).getTime();
    return Date.now() - time > STALE_LOCATION_THRESHOLD_MS;
  } catch (e) {
    return false;
  }
}

/**
 * Subscribes to live GPS updates via navigator.geolocation.watchPosition()
 * with automatic fallback if high accuracy times out on desktop/laptop environments.
 *
 * @param {Object} callbacks
 * @param {Function} callbacks.onPosition - called with normalized position data
 * @param {Function} callbacks.onError - called with standardized error
 * @param {Function} callbacks.onStatusChange - called with GPS_STATUS value
 * @returns {Function} unsubscribe function to stop watching
 */
export function startLocationTracking({ onPosition, onError, onStatusChange }) {
  if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
    onStatusChange?.(GPS_STATUS.UNSUPPORTED);
    onError?.({
      code: 'UNSUPPORTED',
      message: 'Geolocation is not supported by this browser.',
    });
    return () => {};
  }

  onStatusChange?.(GPS_STATUS.REQUESTING);

  let watchId = null;
  let pollIntervalId = null;
  let isFetchingSingle = false;
  let hasReceivedInitialFix = false;
  let isRetryingLowAccuracy = false;
  let lastReceivedTimestamp = 0;

  const successHandler = (position) => {
    hasReceivedInitialFix = true;
    lastReceivedTimestamp = Date.now();
    onStatusChange?.(GPS_STATUS.ACTIVE);
    const { latitude, longitude, accuracy, heading, speed } = position.coords;

    // Normalize timestamp to milliseconds.
    // If rawTs is in seconds (1e8 <= rawTs < 1e11), convert to ms.
    const rawTs = position.timestamp;
    const timestampMs =
      typeof rawTs === 'number' && rawTs > 0
        ? rawTs >= 1e8 && rawTs < 1e11
          ? rawTs * 1000
          : rawTs
        : Date.now();

    onPosition?.({
      lat: latitude,
      lng: longitude,
      accuracy: typeof accuracy === 'number' ? accuracy : null,
      heading: typeof heading === 'number' ? heading : null,
      speed: typeof speed === 'number' ? speed : null,
      timestamp: timestampMs,
      receivedAt: Date.now(),
    });
  };

  const dispatchError = (err) => {
    let status = GPS_STATUS.POSITION_UNAVAILABLE;
    let message = 'Unable to determine GPS location.';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        status = GPS_STATUS.PERMISSION_DENIED;
        message = 'Location permission was denied. Please allow location access in your browser address bar.';
        break;
      case err.POSITION_UNAVAILABLE:
        status = GPS_STATUS.POSITION_UNAVAILABLE;
        message = 'GPS location is temporarily unavailable. Searching for signal...';
        break;
      case err.TIMEOUT:
        status = GPS_STATUS.TIMEOUT;
        message = 'Location request timed out. Searching for signal...';
        break;
      default:
        break;
    }

    onStatusChange?.(status);
    onError?.({
      code: status,
      rawCode: err.code,
      message,
    });
  };

  const errorHandler = (err) => {
    // If high-accuracy timed out and we haven't received a fix yet,
    // seamlessly fall back to standard network accuracy so desktop/laptop testing never hangs.
    if (err.code === err.TIMEOUT && !hasReceivedInitialFix && !isRetryingLowAccuracy) {
      isRetryingLowAccuracy = true;
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      try {
        watchId = navigator.geolocation.watchPosition(
          successHandler,
          (fallbackErr) => dispatchError(fallbackErr),
          { enableHighAccuracy: false, maximumAge: 15000, timeout: 20000 }
        );
        return;
      } catch (e) {}
    }

    dispatchError(err);
  };

  try {
    watchId = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      GEOLOCATION_OPTIONS
    );

    // Single-flight stationary heartbeat:
    // In desktop Chrome or stationary simulation, watchPosition may only emit when coordinates move.
    // If no fix has been received for 15s, quietly request a single fix to keep timestamps fresh.
    pollIntervalId = setInterval(() => {
      if (
        !isFetchingSingle &&
        Date.now() - lastReceivedTimestamp > 15000 &&
        navigator.geolocation
      ) {
        isFetchingSingle = true;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            isFetchingSingle = false;
            successHandler(pos);
          },
          () => {
            isFetchingSingle = false; // Quiet fallback without emitting UI error
          },
          { enableHighAccuracy: false, maximumAge: 15000, timeout: 10000 }
        );
      }
    }, 10000);
  } catch (err) {
    onStatusChange?.(GPS_STATUS.POSITION_UNAVAILABLE);
    onError?.({
      code: GPS_STATUS.POSITION_UNAVAILABLE,
      message: 'Failed to initialize location tracking.',
    });
  }

  // Return clean-up function: clears heartbeat and stops GPS watcher
  return () => {
    if (pollIntervalId !== null) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    onStatusChange?.(GPS_STATUS.IDLE);
  };
}
