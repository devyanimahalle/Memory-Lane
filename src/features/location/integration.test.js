/**
 * integration.test.js - Automated tests for geofence, persistence, caregiver contact & event state
 */

import {
  calculateHaversineDistance,
  formatDistance,
  evaluateSafeZone,
} from './geofence.js';

import {
  loadSafetyEvent,
  saveSafetyEvent,
  loadCaregiverContact,
  saveCaregiverContact,
} from './safetyMonitor.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n--- Running Geofence & Architecture Integration Tests ---\n');

// Mock localStorage on globalThis for Node test environment
const mockStorage = {};
const storageInstance = {
  getItem: (key) => (Object.prototype.hasOwnProperty.call(mockStorage, key) ? mockStorage[key] : null),
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
};
globalThis.localStorage = storageInstance;
globalThis.window = { localStorage: storageInstance };

// 1. Haversine Calculations
console.log('Test 1: Haversine distance accuracy');
{
  const distZero = calculateHaversineDistance(12.9716, 77.5946, 12.9716, 77.5946);
  assert(distZero === 0, 'Distance between identical points is 0m');

  // ~689m north
  const distOutside = calculateHaversineDistance(12.9716, 77.5946, 12.9778, 77.5946);
  assert(distOutside > 680 && distOutside < 700, `Calculated distance (~${distOutside}m) matches great-circle geometry`);

  // Invalid coordinates return null safely
  const distInvalid = calculateHaversineDistance(null, 77.5946, 12.9778, 'abc');
  assert(distInvalid === null, 'Handled non-numeric inputs gracefully (returned null)');
}

// 2. Distance Formatting
console.log('\nTest 2: Distance formatting');
{
  assert(formatDistance(45) === '45 m', 'Formats meters < 1000 correctly');
  assert(formatDistance(1450) === '1.45 km', 'Formats kilometers correctly');
  assert(formatDistance(null) === 'Distance unavailable', 'Handles null gracefully');
}

// 3. Safe Zone Evaluation
console.log('\nTest 3: Safe Zone boundary evaluation');
{
  const inside = evaluateSafeZone(85, 100);
  assert(inside.isInside === true && inside.statusType === 'safe', '85m <= 100m is Inside Safe Zone');

  const outside = evaluateSafeZone(105, 100);
  assert(outside.isInside === false && outside.statusType === 'outside', '105m > 100m is Outside Safe Zone');

  const exact = evaluateSafeZone(100, 100);
  assert(exact.isInside === true, 'Exact 100m boundary is Inside Safe Zone');
}

// 4. Caregiver Contact Persistence
console.log('\nTest 4: Caregiver contact handling');
{
  saveCaregiverContact({ name: 'Jane Doe', phone: '+1234567890', relationship: 'Daughter' });
  const loaded = loadCaregiverContact();
  assert(loaded !== null && loaded.name === 'Jane Doe' && loaded.phone === '+1234567890', 'Caregiver contact saved and loaded accurately');

  saveCaregiverContact(null);
  assert(loadCaregiverContact() === null, 'Caregiver contact cleared properly');
}

// 5. Safety Event Lifecycle
console.log('\nTest 5: Safety event lifecycle');
{
  const event = {
    active: true,
    triggeredAt: Date.now(),
    acknowledged: false,
    helpRequested: false,
  };
  saveSafetyEvent(event);
  const loaded = loadSafetyEvent();
  assert(loaded.active === true && loaded.acknowledged === false, 'Saved active safety event');

  // Patient dismisses ("I am okay")
  saveSafetyEvent({ ...loaded, acknowledged: true });
  const dismissed = loadSafetyEvent();
  assert(dismissed.acknowledged === true, 'Event marked acknowledged upon dismissal');

  // Patient requests help ("I NEED HELP")
  saveSafetyEvent({ ...dismissed, helpRequested: true });
  const helpReq = loadSafetyEvent();
  assert(helpReq.helpRequested === true, 'Event marked helpRequested');

  // Clear event on return
  saveSafetyEvent(null);
  assert(loadSafetyEvent() === null, 'Event removed cleanly');
}

console.log(`\n========================================`);
console.log(`Integration Test Summary: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
