/**
 * analyticsData.js
 *
 * SIMULATED seven-day activity data for the Memory Lane caregiver dashboard.
 * This is demo data only. No real patient information is used.
 *
 * Rules for this data:
 * - A value of null means "we do not have this data".
 *   It does NOT mean zero. The analytics code skips null days.
 * - isComplete: false means the day is partial or has missing data.
 *   Those days are never used to create alerts.
 * - "Missed" medicine is not stored. It is calculated as
 *   medicineScheduled - medicineConfirmed.
 */

export const analyticsPatient = {
  id: "patient-001", // matches the reminders team's patient profile
  displayName: "Mr. Sharma",
  usualEngagementPerDay: 3 // provisional baseline, to be confirmed with the product lead
};

export const simulatedWeek = [
  {
    date: "2026-10-24",
    isComplete: true,
    medicineScheduled: 2,
    medicineConfirmed: 2,
    gamesPlayed: 2,
    activitiesCompleted: 2,
    albumInteractions: 2,
    mealsLogged: 3
  },
  {
    date: "2026-10-25",
    isComplete: true,
    medicineScheduled: 2,
    medicineConfirmed: 2,
    gamesPlayed: 1,
    activitiesCompleted: 2,
    albumInteractions: 1,
    mealsLogged: 3
  },
  {
    date: "2026-10-26",
    isComplete: true,
    medicineScheduled: 2,
    medicineConfirmed: 2,
    gamesPlayed: 2,
    activitiesCompleted: 1,
    albumInteractions: 1,
    mealsLogged: 3
  },
  {
    // Data for this day is missing (for example, the device was offline).
    // Every value is null on purpose. This is NOT a day of zero activity.
    date: "2026-10-27",
    isComplete: false,
    medicineScheduled: null,
    medicineConfirmed: null,
    gamesPlayed: null,
    activitiesCompleted: null,
    albumInteractions: null,
    mealsLogged: null
  },
  {
    // Quieter day: one medicine reminder was not confirmed.
    date: "2026-10-28",
    isComplete: true,
    medicineScheduled: 2,
    medicineConfirmed: 1,
    gamesPlayed: 1,
    activitiesCompleted: 1,
    albumInteractions: 0,
    mealsLogged: 2
  },
  {
    // Even quieter day: both medicine reminders were not confirmed.
    date: "2026-10-29",
    isComplete: true,
    medicineScheduled: 2,
    medicineConfirmed: 0,
    gamesPlayed: 0,
    activitiesCompleted: 1,
    albumInteractions: 0,
    mealsLogged: 1
  },
  {
    // Today: the day is still in progress, so it is marked incomplete
    // and is ignored by alerts.
    date: "2026-10-30",
    isComplete: false,
    medicineScheduled: null,
    medicineConfirmed: null,
    gamesPlayed: null,
    activitiesCompleted: null,
    albumInteractions: null,
    mealsLogged: null
  }
];