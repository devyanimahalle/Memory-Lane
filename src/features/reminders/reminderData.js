/**
 * reminderData.js
 * 
 * Mock data conforming strictly to the Memory Lane Member 2 contract.
 * Used for standalone fallback and local preview.
 */

export const simulatedPatientProfile = {
  id: "patient-001",
  displayName: "Mr. Sharma",
  preferredGreeting: "Good morning",
  caregiverName: "Ananya",
  usualEngagementPerDay: 3
};

export const initialReminders = [
  {
    id: "reminder-001",
    type: "medicine",
    title: "Morning medicine",
    scheduledAt: "2026-10-30T09:00:00",
    status: "taken",
    completedAt: "2026-10-30T09:05:00",
    note: "Scheduled for morning time"
  },
  {
    id: "reminder-002",
    type: "routine",
    title: "Gentle morning walk",
    scheduledAt: "2026-10-30T09:30:00",
    status: "taken",
    completedAt: "2026-10-30T09:45:00",
    note: "Time for a gentle walk"
  },
  {
    id: "reminder-003",
    type: "routine",
    title: "Afternoon hydration",
    scheduledAt: "2026-10-30T13:30:00",
    status: "snoozed",
    completedAt: null,
    note: "Time for a glass of water"
  },
  {
    id: "reminder-004",
    type: "routine",
    title: "Quiet relaxation time",
    scheduledAt: "2026-10-30T15:00:00",
    status: "pending",
    completedAt: null,
    note: "Time to rest and relax"
  },
  {
    id: "reminder-005",
    type: "medicine",
    title: "Evening medicine",
    scheduledAt: "2026-10-30T18:00:00",
    status: "pending",
    completedAt: null,
    note: "Scheduled for evening time"
  },
  {
    id: "reminder-006",
    type: "routine",
    title: "Evening wind-down",
    scheduledAt: "2026-10-30T20:00:00",
    status: "pending",
    completedAt: null,
    note: "Time to prepare for bedtime"
  }
];

export const initialEngagementEvents = [
  {
    id: "event-001",
    type: "reminder",
    action: "confirmed",
    label: "Confirmed reminder: Morning medicine",
    occurredAt: "2026-10-30T09:05:00",
    durationMinutes: 1
  },
  {
    id: "event-002",
    type: "routine",
    action: "completed",
    label: "Completed routine: Gentle morning walk",
    occurredAt: "2026-10-30T09:45:00",
    durationMinutes: 15
  }
];
