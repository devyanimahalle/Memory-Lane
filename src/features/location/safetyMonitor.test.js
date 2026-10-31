/**
 * safetyMonitor.test.js - Comprehensive Automated Unit Tests for CogniCare GPS Alert System
 *
 * Verifies all 10 core requirements:
 * 1. Inside safe radius (no alerts, breach remains null)
 * 2. Immediate alert to caregiver when patient exits safe radius (alertType: 'initial_breach')
 * 3. 2-minute repeat interval (no alert before 2m elapsed, triggers repeat alert at 2m mark)
 * 4. Subsequent repeat alerts every 2 minutes while remaining outside (alert #3 at 4m, etc.)
 * 5. Resolution alert when patient reliably returns inside safe radius (stops repeat alerts)
 * 6. Starting a fresh alert sequence if patient leaves again after returning
 * 7. GPS accuracy check (readings with accuracy > 50m are rejected)
 * 8. Missing home location safety (no false alerts if home is unconfigured)
 * 9. Location unavailable status when GPS is disabled/lost (NEVER marks patient safe)
 * 10. Time outside formatting utility
 */

import {
  evaluateCaregiverBreach,
  formatTimeOutside,
  REPEAT_ALERT_INTERVAL_MS,
} from './safetyMonitor.js';
import { evaluateSafeZone } from './geofence.js';

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

console.log('\n--- Running Automated CogniCare GPS Alert System Tests ---\n');

// Standard test coordinates (Home at Bengaluru center)
const HOME = { lat: 12.9716, lng: 77.5946 };
const RADIUS = 100; // 100m safe radius

// Coordinate approximately 50m from home (INSIDE safe zone)
const POS_INSIDE = { lat: 12.9719, lng: 77.5946, accuracy: 10, timestamp: 1000000 };

// Coordinate approximately 695m from home (OUTSIDE safe zone)
const POS_OUTSIDE = { lat: 12.9778, lng: 77.5946, accuracy: 10, timestamp: 1000000 };

// 1. Patient inside safe zone
console.log('Test 1: Patient inside safe zone (no breach, no alert)');
{
  const result = evaluateCaregiverBreach(POS_INSIDE, HOME, RADIUS, null, 1000000);
  assert(result.isAccurate === true, 'Reading is accurate');
  assert(result.isOutside === false, 'Patient is inside safe zone');
  assert(result.shouldAlert === false, 'No alert generated');
  assert(result.alertType === null, 'alertType is null');
  assert(result.newBreachState === null, 'Breach state is null');
}

// 2. Immediate alert to caregiver when patient exits safe radius
console.log('\nTest 2: Patient exits safe radius (Immediate initial alert)');
let activeBreach = null;
const t0 = 1000000;
{
  const result = evaluateCaregiverBreach(POS_OUTSIDE, HOME, RADIUS, null, t0);
  assert(result.isAccurate === true, 'Reading is accurate (10m <= 50m)');
  assert(result.isOutside === true, 'Patient is outside safe radius');
  assert(result.shouldAlert === true, 'IMMEDIATE alert triggered to caregiver');
  assert(result.alertType === 'initial_breach', 'alertType is "initial_breach"');
  assert(result.newBreachState !== null, 'newBreachState created');
  assert(result.newBreachState.active === true, 'Breach is active');
  assert(result.newBreachState.alertCount === 1, 'Alert count is 1');
  assert(result.newBreachState.breachStartedAt === t0, 'breachStartedAt recorded as t0');
  assert(result.newBreachState.lastAlertAt === t0, 'lastAlertAt recorded as t0');
  activeBreach = result.newBreachState;
}

// 3. Continuous outside at 60s (no alert before 2 minutes)
console.log('\nTest 3: Patient still outside at 60s (No repeat alert before 2 minutes)');
{
  const t60s = t0 + 60 * 1000;
  const result = evaluateCaregiverBreach(POS_OUTSIDE, HOME, RADIUS, activeBreach, t60s);
  assert(result.isOutside === true, 'Still outside safe zone');
  assert(result.shouldAlert === false, 'No repeat alert at 60s (must wait for 2m)');
  assert(result.newBreachState.active === true, 'Breach remains active');
  assert(result.newBreachState.alertCount === 1, 'Alert count remains 1');
  assert(result.newBreachState.breachStartedAt === t0, 'Original breach time preserved');
  activeBreach = result.newBreachState;
}

// 4. Continuous outside at 120s (Repeat alert #2 triggers)
console.log('\nTest 4: Patient still outside at 120s (Repeat alert #2 triggers)');
{
  const t120s = t0 + REPEAT_ALERT_INTERVAL_MS; // 120,000ms
  const result = evaluateCaregiverBreach(POS_OUTSIDE, HOME, RADIUS, activeBreach, t120s);
  assert(result.shouldAlert === true, 'Repeat alert triggered at 2-minute mark');
  assert(result.alertType === 'repeat_breach', 'alertType is "repeat_breach"');
  assert(result.newBreachState.alertCount === 2, 'Alert count incremented to 2');
  assert(result.newBreachState.lastAlertAt === t120s, 'lastAlertAt updated to 120s mark');
  activeBreach = result.newBreachState;
}

// 5. Continuous outside at 240s (Repeat alert #3 triggers)
console.log('\nTest 5: Patient still outside at 240s (Repeat alert #3 triggers)');
{
  const t240s = t0 + 2 * REPEAT_ALERT_INTERVAL_MS;
  const result = evaluateCaregiverBreach(POS_OUTSIDE, HOME, RADIUS, activeBreach, t240s);
  assert(result.shouldAlert === true, 'Repeat alert #3 triggered at 4-minute mark');
  assert(result.alertType === 'repeat_breach', 'alertType is "repeat_breach"');
  assert(result.newBreachState.alertCount === 3, 'Alert count incremented to 3');
  activeBreach = result.newBreachState;
}

// 6. Patient reliably returns inside safe radius (stops repeat alerts & fires resolved alert)
console.log('\nTest 6: Patient returns inside safe zone (Resolves breach, stops alerts)');
{
  const tReturn = t0 + 260 * 1000;
  const result = evaluateCaregiverBreach(POS_INSIDE, HOME, RADIUS, activeBreach, tReturn);
  assert(result.isOutside === false, 'Patient is safely back inside');
  assert(result.shouldAlert === true, 'Resolved alert triggered for caregiver');
  assert(result.alertType === 'resolved', 'alertType is "resolved"');
  assert(result.newBreachState === null, 'Breach state is cleared to null');
  activeBreach = result.newBreachState;
}

// 7. Patient leaves again (starts a completely fresh alert sequence)
console.log('\nTest 7: Patient leaves safe zone again (Starts fresh alert sequence)');
{
  const tLeaveAgain = t0 + 500 * 1000;
  const result = evaluateCaregiverBreach(POS_OUTSIDE, HOME, RADIUS, activeBreach, tLeaveAgain);
  assert(result.isOutside === true, 'Patient outside again');
  assert(result.shouldAlert === true, 'Fresh immediate alert triggered');
  assert(result.alertType === 'initial_breach', 'alertType is "initial_breach" (starts new cycle)');
  assert(result.newBreachState.alertCount === 1, 'Alert count restarts at 1');
  assert(result.newBreachState.breachStartedAt === tLeaveAgain, 'New breachStartedAt timestamp set');
}

// 8. GPS accuracy filtering (accuracy > 50m rejected)
console.log('\nTest 8: Poor GPS accuracy (>50m) ignored from breach decisions');
{
  const poorGps = { ...POS_OUTSIDE, accuracy: 80 };
  const result = evaluateCaregiverBreach(poorGps, HOME, RADIUS, null, 1000000);
  assert(result.isAccurate === false, 'Reading marked inaccurate');
  assert(result.shouldAlert === false, 'No alert triggered on noisy GPS');
  assert(result.newBreachState === null, 'No breach state set');
}

// 9. Missing home location safety
console.log('\nTest 9: Missing home location safety');
{
  const result = evaluateCaregiverBreach(POS_OUTSIDE, null, RADIUS, null, 1000000);
  assert(result.shouldAlert === false, 'No alert if caregiver has not configured home');
  assert(result.newBreachState === null, 'No breach recorded');
}

// 10. Requirement 9: When GPS is unavailable, show "Location unavailable" instead of marking safe
console.log('\nTest 10: evaluateSafeZone shows "Location unavailable" when GPS is unavailable');
{
  // When isGpsUnavailable is true:
  const resUnavailable = evaluateSafeZone(null, 100, true);
  assert(resUnavailable.isInside === false, 'Patient is NOT marked inside safe zone');
  assert(resUnavailable.label === 'Location unavailable', 'Label is "Location unavailable"');
  assert(resUnavailable.statusType === 'unavailable', 'statusType is "unavailable"');

  // When GPS distance is valid and inside:
  const resInside = evaluateSafeZone(45, 100, false);
  assert(resInside.isInside === true, 'Patient is marked inside safe zone');
  assert(resInside.label === 'Inside Safe Zone', 'Label is "Inside Safe Zone"');

  // When GPS distance is valid and outside:
  const resOutside = evaluateSafeZone(350, 100, false);
  assert(resOutside.isInside === false, 'Patient is marked outside safe zone');
  assert(resOutside.label === 'Outside Safe Zone', 'Label is "Outside Safe Zone"');
}

// 11. formatTimeOutside helper
console.log('\nTest 11: formatTimeOutside formatting');
{
  assert(formatTimeOutside(45 * 1000) === '45s', 'Formats 45s');
  assert(formatTimeOutside(120 * 1000) === '2m 0s', 'Formats 2m 0s');
  assert(formatTimeOutside(145 * 1000) === '2m 25s', 'Formats 2m 25s');
  assert(formatTimeOutside(3600 * 1000) === '1h 0m', 'Formats 1h 0m');
  assert(formatTimeOutside(0) === '0s', 'Formats 0s');
  assert(formatTimeOutside(-100) === '0s', 'Handles negative/falsy gracefully');
}

console.log(`\n========================================`);
console.log(`Tests Finished: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
