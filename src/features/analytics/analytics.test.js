/**
 * analytics.test.js
 *
 * Tests for the analytics logic, using Node's built-in test runner.
 * Run with:  node --test src/features/analytics/
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getAnalyticsSummary,
  getDailyEngagement,
  getMissedMedicines,
  getAlerts,
  getDailySummaries,
  getTrend
} from "./analyticsLogic.js";

// Helper: build a complete day with sensible defaults.
function makeDay(date, overrides = {}) {
  return {
    date,
    isComplete: true,
    medicineScheduled: 2,
    medicineConfirmed: 2,
    gamesPlayed: 2,
    activitiesCompleted: 2,
    albumInteractions: 2,
    mealsLogged: 3,
    ...overrides
  };
}

// Helper: a day with no data (all null).
function makeGapDay(date) {
  return {
    date,
    isComplete: false,
    medicineScheduled: null,
    medicineConfirmed: null,
    gamesPlayed: null,
    activitiesCompleted: null,
    albumInteractions: null,
    mealsLogged: null
  };
}

// A low day: engagement of 1 (below baseline of 3).
const low = { gamesPlayed: 1, activitiesCompleted: 0, albumInteractions: 0 };

test("daily engagement adds games, activities and album interactions", () => {
  assert.equal(getDailyEngagement(makeDay("2026-10-24")), 6);
});

test("a day with missing data gives null engagement, not zero", () => {
  assert.equal(getDailyEngagement(makeGapDay("2026-10-27")), null);
});

test("a half-filled day is treated as missing data", () => {
  const half = makeDay("2026-10-27", { gamesPlayed: null });
  assert.equal(getDailyEngagement(half), null);
});

test("missed medicines = scheduled minus confirmed", () => {
  const day = makeDay("2026-10-28", { medicineConfirmed: 1 });
  assert.equal(getMissedMedicines(day), 1);
});

test("two low complete days in a row create one gentle alert", () => {
  const week = [
    makeDay("2026-10-24"),
    makeDay("2026-10-25", low),
    makeDay("2026-10-26", low)
  ];
  const alerts = getAlerts(getDailySummaries(week));
  const lowAlerts = alerts.filter((a) => a.type === "low-engagement");
  assert.equal(lowAlerts.length, 1);
  assert.equal(lowAlerts[0].date, "2026-10-26");
});

test("a missing-data day BREAKS the low-engagement streak (no false alert)", () => {
  const week = [
    makeDay("2026-10-26", low),
    makeGapDay("2026-10-27"),
    makeDay("2026-10-28", low)
  ];
  const alerts = getAlerts(getDailySummaries(week));
  const lowAlerts = alerts.filter((a) => a.type === "low-engagement");
  assert.equal(lowAlerts.length, 0);
});

test("one low day alone does not create an alert", () => {
  const week = [makeDay("2026-10-25"), makeDay("2026-10-26", low)];
  const alerts = getAlerts(getDailySummaries(week));
  assert.equal(alerts.length, 0);
});

test("two missed medicines in one day create a missed-medicine alert", () => {
  const week = [makeDay("2026-10-29", { medicineConfirmed: 0 })];
  const alerts = getAlerts(getDailySummaries(week));
  assert.equal(alerts.filter((a) => a.type === "missed-medicine").length, 1);
});

test("one missed medicine alone does not create an alert", () => {
  const week = [makeDay("2026-10-29", { medicineConfirmed: 1 })];
  const alerts = getAlerts(getDailySummaries(week));
  assert.equal(alerts.length, 0);
});

test("incomplete days never create missed-medicine alerts", () => {
  const week = [makeGapDay("2026-10-30")];
  assert.equal(getAlerts(getDailySummaries(week)).length, 0);
});

test("trend says not-enough-data with fewer than 4 complete days", () => {
  const week = [makeDay("2026-10-24"), makeDay("2026-10-25")];
  assert.equal(getTrend(getDailySummaries(week)), "not-enough-data");
});

test("demo week: 5 complete days, decreasing trend, 2 alerts", () => {
  const s = getAnalyticsSummary();
  assert.equal(s.weekly.daysWithData, 5);
  assert.equal(s.weekly.daysWithoutData, 2);
  assert.equal(s.weekly.totalEngagement, 17);
  assert.equal(s.weekly.medicinePercent, 70);
  assert.equal(s.trend, "decreasing");
  assert.equal(s.alerts.length, 2);
});

test("alert wording is gentle and makes no diagnosis", () => {
  const s = getAnalyticsSummary();
  s.alerts.forEach((a) => {
    assert.match(a.message, /Consider checking in/);
    assert.doesNotMatch(a.message, /dementia|diagnos|disease|worsen/i);
  });
});
test("no complete days: weekly totals are null, not zero", () => {
  const week = [makeGapDay("2026-10-24"), makeGapDay("2026-10-25")];
  const weekly = getAnalyticsSummary(week).weekly;
  assert.equal(weekly.daysWithData, 0);
  assert.equal(weekly.daysWithoutData, 2);
  assert.equal(weekly.totalEngagement, null);
  assert.equal(weekly.averageEngagementPerDay, null);
  assert.equal(weekly.medicineScheduled, null);
  assert.equal(weekly.medicinePercent, null);
});

test("a missing calendar date breaks the low-engagement streak", () => {
  // 10-26 and 10-28 are both low, but 10-27 has no row at all.
  const week = [makeDay("2026-10-26", low), makeDay("2026-10-28", low)];
  const alerts = getAlerts(getDailySummaries(week));
  assert.equal(alerts.filter((a) => a.type === "low-engagement").length, 0);
});

test("rows given out of order are sorted by date before alerts", () => {
  const week = [
    makeDay("2026-10-26", low),
    makeDay("2026-10-24"),
    makeDay("2026-10-25", low)
  ];
  const daily = getDailySummaries(week);
  assert.deepEqual(
    daily.map((d) => d.date),
    ["2026-10-24", "2026-10-25", "2026-10-26"]
  );
  const lowAlerts = getAlerts(daily).filter((a) => a.type === "low-engagement");
  assert.equal(lowAlerts.length, 1);
  assert.equal(lowAlerts[0].date, "2026-10-26");
});

test("zero medicines scheduled gives null percent, and zero confirmed gives 0", () => {
  const none = makeDay("2026-10-24", { medicineScheduled: 0, medicineConfirmed: 0 });
  const missedAll = makeDay("2026-10-25", { medicineScheduled: 2, medicineConfirmed: 0 });
  const [a, b] = getDailySummaries([none, missedAll]);
  assert.equal(a.medicinePercent, null);
  assert.equal(b.medicinePercent, 0);
});