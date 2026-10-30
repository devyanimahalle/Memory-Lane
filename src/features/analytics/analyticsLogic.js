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
 * - Everything is calculated from the patient's own usual baseline.
 */

import { analyticsPatient, simulatedWeek } from "./analyticsData.js";

// Provisional thresholds. Confirm with the product lead before the demo.
export const THRESHOLDS = {
  baselinePerDay: analyticsPatient.usualEngagementPerDay, // 3
  lowEngagementDaysInARow: 2,
  missedMedicinesPerDayAlert: 2
};

const REQUIRED_FIELDS = [
  "medicineScheduled",
  "medicineConfirmed",
  "gamesPlayed",
  "activitiesCompleted",
  "albumInteractions",
  "mealsLogged"
];

// A day is usable only if it is marked complete AND every number is present.
// This protects against half-filled days creating misleading results.
export function hasData(day) {
  return (
    day.isComplete === true &&
    REQUIRED_FIELDS.every((field) => typeof day[field] === "number")
  );
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

// Medicine confirmation percentage for one day. Null when no data.
export function getMedicinePercent(day) {
  if (!hasData(day) || day.medicineScheduled === 0) return null;
  return Math.round((day.medicineConfirmed / day.medicineScheduled) * 100);
}

// Build one summary row per day (the dashboard charts can use these).
export function getDailySummaries(week = simulatedWeek) {
  return week.map((day) => {
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

// Weekly totals use ONLY complete days, so missing data is never counted as zero.
export function getWeeklyTotals(dailySummaries) {
  const complete = dailySummaries.filter((d) => d.isComplete);
  const totalEngagement = complete.reduce((sum, d) => sum + d.engagement, 0);
  const scheduled = complete.reduce((sum, d) => sum + d.medicineScheduled, 0);
  const confirmed = complete.reduce((sum, d) => sum + d.medicineConfirmed, 0);

  return {
    daysWithData: complete.length,
    daysWithoutData: dailySummaries.length - complete.length,
    totalEngagement,
    averageEngagementPerDay:
      complete.length === 0
        ? null
        : Math.round((totalEngagement / complete.length) * 10) / 10,
    medicineScheduled: scheduled,
    medicineConfirmed: confirmed,
    medicineMissed: Math.max(0, scheduled - confirmed),
    medicinePercent:
      scheduled === 0 ? null : Math.round((confirmed / scheduled) * 100)
  };
}

// Trend: compare the earlier and later halves of the complete days.
// Needs at least 4 complete days, otherwise we say there is not enough data.
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

  // Alert 1: two or more missed medicines on a single complete day.
  dailySummaries.forEach((d) => {
    if (d.isComplete && d.medicineMissed >= THRESHOLDS.missedMedicinesPerDayAlert) {
      alerts.push({
        type: "missed-medicine",
        date: d.date,
        message: `Several medicine reminders were not confirmed on ${d.date}. Consider checking in with the patient.`
      });
    }
  });

  // Alert 2: low engagement on consecutive complete days.
  // A day with missing data BREAKS the streak, so we never claim a
  // pattern across a gap we cannot see.
  let streak = 0;
  dailySummaries.forEach((d) => {
    if (!d.isComplete) {
      streak = 0;
      return;
    }
    streak = d.isLowEngagement ? streak + 1 : 0;
    if (streak === THRESHOLDS.lowEngagementDaysInARow) {
      alerts.push({
        type: "low-engagement",
        date: d.date,
        message:
          "Engagement has decreased over the last two days compared with the usual routine. Consider checking in with the patient."
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