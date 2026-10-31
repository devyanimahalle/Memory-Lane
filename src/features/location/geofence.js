/**
 * geofence.js - Geofencing & Distance Utilities for Memory Lane GPS
 *
 * Responsibilities:
 * - Calculate great-circle distance between two GPS coordinates using Haversine formula
 * - Determine if patient coordinates are within caregiver safe radius
 * - Manage default safe radius presets
 * - Local storage persistence for home coordinates and safe radius
 *
 * NOTE: Leaving the safe radius is strictly a visual reference for caregivers.
 * It NEVER triggers automated sirens, alarms, or emergency notifications.
 */

export const RADIUS_PRESETS = [
  { label: '100 m', value: 100 },
  { label: '200 m', value: 200 },
  { label: '500 m', value: 500 },
  { label: '1 km', value: 1000 },
];

export const DEFAULT_RADIUS_METERS = 200;

const STORAGE_KEY_HOME = 'memory_lane_home_location';
const STORAGE_KEY_RADIUS = 'memory_lane_safe_radius';

/**
 * Calculates the distance between two coordinates in meters using the Haversine formula.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in meters
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return null;
  }

  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formats a distance in meters into friendly, readable text (e.g. "85 m", "1.4 km").
 *
 * @param {number|null} meters
 * @returns {string}
 */
export function formatDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) {
    return 'Distance unavailable';
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Evaluates whether a location is within the configured safe radius.
 *
 * @param {number} distanceMeters
 * @param {number} radiusMeters
 * @returns {{ isInside: boolean, label: string, statusType: 'safe' | 'outside' | 'unknown' }}
 */
export function evaluateSafeZone(distanceMeters, radiusMeters, isGpsUnavailable = false) {
  if (isGpsUnavailable || distanceMeters === null || radiusMeters === null || isNaN(distanceMeters)) {
    return {
      isInside: false,
      label: 'Location unavailable',
      statusType: 'unavailable',
    };
  }

  const isInside = distanceMeters <= radiusMeters;
  return {
    isInside,
    label: isInside ? 'Inside Safe Zone' : 'Outside Safe Zone',
    statusType: isInside ? 'safe' : 'outside',
  };
}

/**
 * Retrieves saved home coordinates from localStorage.
 *
 * @returns {{ lat: number, lng: number, address?: string, setAt?: string } | null}
 */
export function loadSavedHome() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOME);
    return raw ? JSON.parse(raw) : null;
  } catch {
    console.warn('Failed to load home location from localStorage', err);
    return null;
  }
}

/**
 * Saves home coordinates to localStorage.
 *
 * @param {{ lat: number, lng: number, address?: string }} homeData
 */
export function saveHome(homeData) {
  if (typeof window === 'undefined' || !window.localStorage || !homeData) return;
  try {
    const dataToSave = {
      lat: Number(homeData.lat),
      lng: Number(homeData.lng),
      address: homeData.address || 'Configured Home Base',
      setAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_HOME, JSON.stringify(dataToSave));
  } catch {
    console.warn('Failed to save home location to localStorage', err);
  }
}

/**
 * Retrieves saved safe radius (in meters) from localStorage.
 *
 * @returns {number} radius in meters
 */
export function loadSavedRadius() {
  if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_RADIUS_METERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RADIUS);
    const parsed = Number(raw);
    return parsed && !isNaN(parsed) && parsed > 0 ? parsed : DEFAULT_RADIUS_METERS;
  } catch {
    return DEFAULT_RADIUS_METERS;
  }
}

/**
 * Saves safe radius (in meters) to localStorage.
 *
 * @param {number} radiusMeters
 */
export function saveRadius(radiusMeters) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_RADIUS, String(radiusMeters));
  } catch {
    console.warn('Failed to save radius to localStorage', err);
  }
}
