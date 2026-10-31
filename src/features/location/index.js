// Public API of the location feature (Ishani's GPS safety dashboard, adapted).
//
// Patient side:   startSharing / stopSharing (only after the patient has said yes), useSharedLocation.
// Caregiver side: LocationModule shows what this browser shared: position, safe-zone status, history.
// Browser-local simulation: nothing is sent to another device or browser.
export { default as LocationModule } from './LocationModule.jsx'
export { clearSharedHistory, isSharingHere, startSharing, stopSharing, useSharedLocation } from './locationShare.js'
export { GPS_STATUS, isLocationStale } from './geolocation.js'
