/**
 * analyticsLogic.js
 *
 * Simple, deterministic analytics for the Memory Lane caregiver dashboard.
 * Uses SIMULATED data only. It does not diagnose or make medical claims.
 *
 * The frontend only needs one function:
 *   getAnalyticsSummary()
 *
 * Principles:
 * - A day with missing data is never treated as zero activity.
 * - Alerts only use complete days, and a gap in the data breaks a streak.
 * - "Consecutive" means consecutive CALENDAR days.
 * - Everything is compared with the patient's own usual baseline.
 */

import { analyticsPatient, simulatedWeek } from "./analyticsData.js";

// Provisional thresholds. Confirm with the product lead before the demo.
export const THRESHOLDS = {
  baselinePerDay: analyticsPatient.usualEngagementPerDay, // 3
  lowEngagementDaysInARow: 2,
  missedMedicinesPerDayAlert: 1
};

const REQUIRED_FIELDS = [
  "medicineScheduled",
  "medicineConfirmed",
  "gamesPlayed",
  "activitiesCompleted",
  "albumInteractions",
  "mealsLogged"
];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// A day is usable only if it is marked complete AND every number is present.
export function hasData(day) {
  return (
    day.isComplete === true &&
    REQUIRED_FIELDS.every((field) => typeof day[field] === "number")
  );
}

// True only if `current` is exactly one calendar day after `previous`.
// Dates are ISO strings: YYYY-MM-DD.
function isNextDay(previous, current) {
  const diff =
    Date.parse(`${current}T00:00:00Z`) - Date.parse(`${previous}T00:00:00Z`);
  return diff === ONE_DAY_MS;
}

// Daily engagement = games + activities + album interactions.
// Returns null (NOT 0) when the day has no usable data.
export function getDailyEngagement(day) {
  if (!hasData(day)) return null;
  return day.gamesPlayed + day.activitiesCompleted + day.albumInteractions;
}

// Missed medicines = scheduled - confirmed (never below 0). Null when no data.
export function getMissedMedicines(day) {
  if (!hasData(day)) return null;
  return Math.max(0, day.medicineScheduled - day.medicineConfirmed);
}

// Medicine percentage for one day (0 to 100).
// Null when there is no data OR nothing was scheduled (not applicable).
export function getMedicinePercent(day) {
  if (!hasData(day) || day.medicineScheduled === 0) return null;
  const percent = Math.round((day.medicineConfirmed / day.medicineScheduled) * 100);
  return Math.min(100, percent);
}

// Build one summary row per day, sorted by date (oldest first).
export function getDailySummaries(week = simulatedWeek) {
  const sorted = [...week].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((day) => {
    const usable = hasData(day);
    const engagement = getDailyEngagement(day);
    return {
      date: day.date,
      isComplete: usable,
      engagement,
      isLowEngagement:
        engagement === null ? null : engagement < THRESHOLDS.baselinePerDay,
      medicineScheduled: usable ? day.medicineScheduled : null,
      medicineConfirmed: usable ? day.medicineConfirmed : null,
      medicineMissed: getMissedMedicines(day),
      medicinePercent: getMedicinePercent(day),
      mealsLogged: usable ? day.mealsLogged : null
    };
  });
}

// Weekly totals use ONLY complete days.
// With no complete days, totals are null (NOT 0): we cannot calculate them.
export function getWeeklyTotals(dailySummaries) {
  const complete = dailySummaries.filter((d) => d.isComplete);
  const n = complete.length;
  const sum = (field) => complete.reduce((total, d) => total + d[field], 0);

  const totalEngagement = n === 0 ? null : sum("engagement");
  const scheduled = n === 0 ? null : sum("medicineScheduled");
  const confirmed = n === 0 ? null : sum("medicineConfirmed");

  return {
    daysWithData: n,
    daysWithoutData: dailySummaries.length - n,
    totalEngagement,
    averageEngagementPerDay:
      n === 0 ? null : Math.round((totalEngagement / n) * 10) / 10,
    medicineScheduled: scheduled,
    medicineConfirmed: confirmed,
    medicineMissed: n === 0 ? null : Math.max(0, scheduled - confirmed),
    medicinePercent:
      n === 0 || scheduled === 0
        ? null
        : Math.min(100, Math.round((confirmed / scheduled) * 100))
  };
}

// Trend: compare the average of the earlier half with the later half of the
// complete days. Needs at least 4 complete days, otherwise "not-enough-data".
// A change of more than 0.5 activities per day counts as increasing/decreasing.
export function getTrend(dailySummaries) {
  const values = dailySummaries
    .filter((d) => d.isComplete)
    .map((d) => d.engagement);
  if (values.length < 4) return "not-enough-data";

  const mid = Math.floor(values.length / 2);
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const earlier = avg(values.slice(0, mid));
  const later = avg(values.slice(values.length - mid));

  if (later < earlier - 0.5) return "decreasing";
  if (later > earlier + 0.5) return "increasing";
  return "steady";
}

// Alerts: gentle wording, complete days only.
export function getAlerts(dailySummaries) {
  const alerts = [];

  // Alert 1: one or more missed medicines on a single complete day.
  dailySummaries.forEach((d) => {
    if (d.isComplete && d.medicineMissed >= THRESHOLDS.missedMedicinesPerDayAlert) {
      alerts.push({
        type: "missed-medicine",
        date: d.date,
        message: `One or more medicine reminders were not confirmed on ${d.date}. Consider checking in with the patient.`
      });
    }
  });

  // Alert 2: low engagement on consecutive complete CALENDAR days.
  // An incomplete day, or a missing date, breaks the streak.
  let streak = 0;
  let lastLowDate = null;
  dailySummaries.forEach((d) => {
    if (!d.isComplete || !d.isLowEngagement) {
      streak = 0;
      lastLowDate = null;
      return;
    }
    streak = lastLowDate && isNextDay(lastLowDate, d.date) ? streak + 1 : 1;
    lastLowDate = d.date;

    if (streak === THRESHOLDS.lowEngagementDaysInARow) {
      alerts.push({
        type: "low-engagement",
        date: d.date,
        message:
          "Engagement has been below the usual routine for the last two days. Consider checking in with the patient."
      });
    }
  });

  return alerts;
}

// The ONE function the frontend needs.
export function getAnalyticsSummary(week = simulatedWeek) {
  const daily = getDailySummaries(week);
  return {
    patientName: analyticsPatient.displayName,
    baselinePerDay: THRESHOLDS.baselinePerDay,
    daily,
    weekly: getWeeklyTotals(daily),
    trend: getTrend(daily),
    alerts: getAlerts(daily),
    note: "Simulated demo data. This is a caregiver aid, not medical advice."
  };
}