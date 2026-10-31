// Public API of the reminders feature (Ishani's logic, adapted for the existing Patient Home UI).
export { useReminders } from './useReminders.js'
export { toReminder, markTaken, snooze, getNextReminder, matchVoiceCommand, minutesOf } from './reminderLogic.js'
export { speak, stopSpeaking, isSpeechSupported, isRecognitionSupported, createRecognizer } from './speech.js'
