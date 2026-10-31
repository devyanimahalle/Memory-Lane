// Public API of the reminders feature (Ishani's logic, adapted for the existing Patient Home UI).
// One shared Reminder state (remindersStore) is used by the patient and caregiver screens.
export { useReminders } from './useReminders.js'
export { remindersStore } from './remindersStore.js'
export { toReminder, markTaken, snooze, getNextReminder, matchVoiceCommand, minutesOf } from './reminderLogic.js'
export { speak, stopSpeaking, isSpeechSupported, isRecognitionSupported, createRecognizer } from './speech.js'
