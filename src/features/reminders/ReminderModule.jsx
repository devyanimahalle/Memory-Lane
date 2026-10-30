import React, { useState, useEffect, useRef } from 'react';
import { initialReminders, initialEngagementEvents } from './reminderData';
import './reminders.css';

/**
 * Canonical demo date from the Memory Lane hackathon brief.
 * Used as an explicit fallback when running in simulated demo environments.
 */
const CANONICAL_DEMO_DATE = '2026-10-30';

/**
 * Default voice language (English).
 * Structured cleanly so Kannada ('kn-IN') can be configured later.
 */
const DEFAULT_VOICE_LANG = 'en-US';

/**
 * Helper to check if two dates fall on the exact same calendar day.
 * Returns false for missing, null, or invalid dates.
 */
function isSameDay(isoString, refDate) {
  if (!isoString || !refDate) return false;
  try {
    const d1 = new Date(isoString);
    const d2 = new Date(refDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return false;
    }
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  } catch (error) {
    return false;
  }
}

/**
 * Determines the consistent date reference for "today".
 * 1. If any reminder matches the real calendar date (new Date()), uses real date.
 * 2. Otherwise uses the canonical hackathon demo date (2026-10-30).
 */
function getEffectiveToday(items) {
  const now = new Date();
  if (Array.isArray(items) && items.some((item) => isSameDay(item.scheduledAt, now))) {
    return now;
  }
  return new Date(`${CANONICAL_DEMO_DATE}T00:00:00`);
}

/**
 * Formats an ISO datetime string to gentle, readable time (e.g., "9:00 AM").
 */
function formatReminderTime(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch (error) {
    return isoString;
  }
}

/**
 * Formats an ISO datetime string for event history display (e.g., "9:05 AM").
 */
function formatEventTime(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch (error) {
    return isoString;
  }
}

/**
 * Determines the daily timeline period for a scheduled reminder:
 * - morning: before 12:00 PM (hour < 12)
 * - afternoon: 12:00 PM to before 5:00 PM (12 <= hour < 17)
 * - evening: 5:00 PM onwards (hour >= 17)
 */
function getTimelinePeriod(isoString) {
  if (!isoString) return 'morning';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'morning';
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  } catch (error) {
    return 'morning';
  }
}

/**
 * Cross-platform voice selector using the browser's native Web Speech API.
 * Does NOT hardcode vendor-specific voice names (works on Windows, macOS, Android, iOS).
 */
function getPreferredVoice(lang = DEFAULT_VOICE_LANG) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact match for requested language (e.g. 'en-US' or future 'kn-IN')
  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;

  // 2. Language prefix match (any voice matching 'en')
  const prefix = lang.split('-')[0].toLowerCase();
  const prefixMatch = voices.find(
    (v) => v.lang && v.lang.toLowerCase().startsWith(prefix)
  );
  if (prefixMatch) return prefixMatch;

  // 3. System default voice
  const defaultVoice = voices.find((v) => v.default);
  return defaultVoice || voices[0] || null;
}

/**
 * Conservative phrase matching for voice commands.
 * Avoids accidental triggers from vague isolated words like "yes" or "done" alone.
 * Supported commands:
 * - "I've done this" / "I'm done"
 * - "Remind me later" / "Snooze this"
 * - "Read my reminders"
 * - "Stop"
 */
function matchVoiceCommand(rawTranscript) {
  if (!rawTranscript) return { command: 'unknown', raw: '' };

  const clean = rawTranscript
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"’]/g, '')
    .replace(/\s+/g, ' ');

  // 1. Mark complete: strictly approved full phrases
  if (
    clean === 'ive done this' ||
    clean === 'i have done this' ||
    clean === 'im done' ||
    clean === 'i am done'
  ) {
    return { command: 'complete', raw: rawTranscript };
  }

  // 2. Snooze: strictly approved full phrases
  if (
    clean === 'remind me later' ||
    clean === 'snooze this' ||
    clean === 'snooze'
  ) {
    return { command: 'snooze', raw: rawTranscript };
  }

  // 3. Read reminders aloud: strictly approved phrases
  if (
    clean === 'read my reminders' ||
    clean === 'read my reminder' ||
    clean === 'read reminders'
  ) {
    return { command: 'read', raw: rawTranscript };
  }

  // 4. Stop speech: strictly approved phrases
  if (
    clean === 'stop' ||
    clean === 'stop playback' ||
    clean === 'stop reading'
  ) {
    return { command: 'stop', raw: rawTranscript };
  }

  return { command: 'unrecognized', raw: rawTranscript };
}

/**
 * ReminderModule Component
 * 
 * Part of Memory Lane prototype (Member 2).
 * Handles patient reminders, daily routine timeline, text-to-speech,
 * push-to-talk voice commands, and caregiver event history.
 * 
 * @param {Object} props
 * @param {Array} [props.reminders] - Array of Reminder objects. If omitted/undefined, falls back to mock data.
 * @param {Array} [props.events] - Optional array of EngagementEvent objects. If omitted/undefined, falls back to mock events.
 * @param {Function} [props.onReminderUpdate] - Callback emitting complete updated Reminder object.
 * @param {Function} [props.onEngagement] - Callback emitting EngagementEvent object.
 */
export default function ReminderModule({
  reminders,
  events,
  onReminderUpdate,
  onEngagement
}) {
  // Rule: Use mock data ONLY when props.reminders is omitted or undefined.
  const isPropProvided = reminders !== undefined && reminders !== null;
  const [items, setItems] = useState(() => {
    return isPropProvided ? reminders : initialReminders;
  });

  // Task 7: Caregiver Event History State
  const isEventsPropProvided = events !== undefined && events !== null;
  const [eventList, setEventList] = useState(() => {
    return isEventsPropProvided ? events : initialEngagementEvents;
  });

  // Task 5: Web Speech API - Text to Speech state
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingReminderId, setSpeakingReminderId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Voice Commands - Push-to-Talk Speech Recognition state
  const isRecognitionSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [voiceFeedbackType, setVoiceFeedbackType] = useState('info'); // 'info' | 'success' | 'error'

  const recognitionRef = useRef(null);

  // Synchronize state when parent passes updated props
  useEffect(() => {
    if (reminders !== undefined && reminders !== null) {
      setItems(reminders);
    }
  }, [reminders]);

  useEffect(() => {
    if (events !== undefined && events !== null) {
      setEventList(events);
    }
  }, [events]);

  // Handle asynchronous voice loading in browsers like Chrome
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const handleVoicesChanged = () => {};
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  // Cleanup: Cancel any ongoing speech and abort speech recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  /**
   * Action: Stop speech immediately
   */
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingReminderId(null);
  };

  /**
   * Action: Stop speech recognition listening
   */
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  /**
   * Action: "Read reminder aloud"
   * Speaks reminder title and note at a calm, slightly slower rate (0.85).
   * Stops previous speech before starting a new one.
   * Stops microphone listening if active to prevent audio feedback loop.
   */
  const speakReminder = (reminder) => {
    if (!isSpeechSupported || isMuted || !reminder) return;

    // Rule 6: Prevent feedback loop - stop listening while speaking
    if (isListening) {
      stopListening();
    }

    // Stop previous speech before playing new reminder
    window.speechSynthesis.cancel();

    // If tapping the reminder currently speaking, stop it
    if (isSpeaking && speakingReminderId === reminder.id) {
      setIsSpeaking(false);
      setSpeakingReminderId(null);
      return;
    }

    // Speak title and note only. Never invent medication instructions or dosages.
    const textToSpeak = reminder.note
      ? `${reminder.title}. ${reminder.note}.`
      : `${reminder.title}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = DEFAULT_VOICE_LANG;
    utterance.rate = 0.85; // Slower, calm cadence for elderly comprehension
    utterance.pitch = 1.0;

    const voice = getPreferredVoice(DEFAULT_VOICE_LANG);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingReminderId(reminder.id);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingReminderId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingReminderId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  /**
   * Action: Toggle mute/unmute
   */
  const toggleMute = () => {
    if (!isMuted && isSpeaking) {
      stopSpeaking();
    }
    setIsMuted((prev) => !prev);
  };

  /**
   * Action: "I've done this" (Mark as taken/completed)
   */
  const handleMarkTaken = (reminder) => {
    if (speakingReminderId === reminder.id) {
      stopSpeaking();
    }

    const completedTimestamp = new Date().toISOString();

    const updatedReminder = {
      ...reminder,
      status: 'taken',
      completedAt: completedTimestamp
    };

    // 1. Update internal reminder state immediately
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === reminder.id ? updatedReminder : item))
    );

    // 2. Emit complete updated reminder to parent (all original fields preserved)
    if (typeof onReminderUpdate === 'function') {
      onReminderUpdate(updatedReminder);
    }

    // 3. Create engagement event adhering strictly to shared EngagementEvent schema
    const isRoutine = reminder.type === 'routine';
    const engagementEvent = {
      id: `event-${Date.now()}`,
      type: isRoutine ? 'routine' : 'reminder',
      action: isRoutine ? 'completed' : 'confirmed',
      label: `${isRoutine ? 'Completed routine' : 'Confirmed reminder'}: ${reminder.title}`,
      occurredAt: completedTimestamp,
      durationMinutes: 1
    };

    // 4. Append to local caregiver event history
    setEventList((prevEvents) => [engagementEvent, ...prevEvents]);

    // 5. Emit engagement event to parent callback
    if (typeof onEngagement === 'function') {
      onEngagement(engagementEvent);
    }
  };

  /**
   * Action: "Remind me later" (Snooze)
   */
  const handleSnooze = (reminder) => {
    if (speakingReminderId === reminder.id) {
      stopSpeaking();
    }

    const updatedReminder = {
      ...reminder,
      status: 'snoozed',
      completedAt: null
    };

    // 1. Update internal reminder state
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === reminder.id ? updatedReminder : item))
    );

    // 2. Emit complete updated reminder to parent (all original fields preserved)
    if (typeof onReminderUpdate === 'function') {
      onReminderUpdate(updatedReminder);
    }

    // 3. Create engagement event using schema-compatible 'viewed' action
    const engagementEvent = {
      id: `event-${Date.now()}`,
      type: reminder.type === 'routine' ? 'routine' : 'reminder',
      action: 'viewed',
      label: `Snoozed reminder: ${reminder.title}`,
      occurredAt: new Date().toISOString(),
      durationMinutes: 1
    };

    // 4. Append to local caregiver event history
    setEventList((prevEvents) => [engagementEvent, ...prevEvents]);

    // 5. Emit engagement event to parent callback
    if (typeof onEngagement === 'function') {
      onEngagement(engagementEvent);
    }
  };

  // Filter reminders for today using explicit demo-date strategy
  const effectiveToday = getEffectiveToday(items);
  const todayReminders = items.filter((item) => isSameDay(item.scheduledAt, effectiveToday));

  const completedReminders = todayReminders.filter((item) => item.status === 'taken');

  // Next Reminder Identification:
  // 1. Find all pending reminders for today, sorted chronologically ascending
  const pendingReminders = todayReminders
    .filter((item) => item.status === 'pending')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  // 2. Find all snoozed reminders for today, sorted chronologically ascending
  const snoozedReminders = todayReminders
    .filter((item) => item.status === 'snoozed')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  // 3. Prioritize genuinely upcoming pending reminder first; if none pending, earliest snoozed reminder
  const nextReminder = pendingReminders[0] || snoozedReminders[0] || null;

  /**
   * Dispatches recognized voice commands to existing handlers.
   * Reuses handleMarkTaken, handleSnooze, speakReminder, and stopSpeaking without duplicating logic.
   */
  const processVoiceCommand = (rawTranscript) => {
    const match = matchVoiceCommand(rawTranscript);

    switch (match.command) {
      case 'complete':
        if (nextReminder) {
          setVoiceFeedbackType('success');
          setVoiceFeedback(`✓ Confirmed "${nextReminder.title}" as done.`);
          handleMarkTaken(nextReminder);
        } else {
          setVoiceFeedbackType('info');
          setVoiceFeedback('All reminders are already completed for today. Wonderful!');
        }
        break;

      case 'snooze':
        if (nextReminder) {
          setVoiceFeedbackType('success');
          setVoiceFeedback(`⏱ Snoozed "${nextReminder.title}" for a little while.`);
          handleSnooze(nextReminder);
        } else {
          setVoiceFeedbackType('info');
          setVoiceFeedback('No active reminders to snooze at this moment.');
        }
        break;

      case 'read':
        if (nextReminder) {
          setVoiceFeedbackType('success');
          setVoiceFeedback(`🔊 Reading reminder: "${nextReminder.title}".`);
          speakReminder(nextReminder);
        } else {
          setVoiceFeedbackType('info');
          setVoiceFeedback('No upcoming reminders to read. You are all caught up.');
        }
        break;

      case 'stop':
        setVoiceFeedbackType('info');
        setVoiceFeedback('⏹ Stopped speech playback.');
        stopSpeaking();
        break;

      default:
        setVoiceFeedbackType('error');
        setVoiceFeedback(
          'Command not recognized. Please say: "I\'ve done this", "Remind me later", "Read my reminders", or "Stop".'
        );
        break;
    }
  };

  /**
   * Action: Start push-to-talk speech recognition
   * Listens for a single command, then stops automatically.
   */
  const startListening = () => {
    if (!isRecognitionSupported) return;

    // Rule 6: If TTS is speaking, stop it before listening to avoid feedback loops
    stopSpeaking();

    setVoiceTranscript('');
    setVoiceFeedback('');

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = DEFAULT_VOICE_LANG;
      recognition.continuous = false; // Push-to-talk: single utterance
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback('');
      };

      recognition.onresult = (event) => {
        if (event.results && event.results.length > 0) {
          const transcriptText = event.results[0][0].transcript;
          setVoiceTranscript(transcriptText);
          processVoiceCommand(transcriptText);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceFeedbackType('error');
          setVoiceFeedback('Microphone permission was denied. You can use the buttons below.');
        } else if (event.error === 'no-speech') {
          setVoiceFeedbackType('info');
          setVoiceFeedback('No speech was detected. Tap the button when you are ready to speak.');
        } else {
          setVoiceFeedbackType('info');
          setVoiceFeedback('Voice listening stopped. You can tap again or use the buttons below.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setVoiceFeedbackType('error');
      setVoiceFeedback('Could not start microphone. Buttons are available below.');
    }
  };

  /**
   * Action: Toggle push-to-talk listening
   */
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Task 6: Daily Routine Timeline Grouping
  const morningReminders = todayReminders
    .filter((item) => getTimelinePeriod(item.scheduledAt) === 'morning')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const afternoonReminders = todayReminders
    .filter((item) => getTimelinePeriod(item.scheduledAt) === 'afternoon')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const eveningReminders = todayReminders
    .filter((item) => getTimelinePeriod(item.scheduledAt) === 'evening')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  /**
   * Helper component to render a single timeline period section
   */
  const renderTimelineSection = (title, timeSubtitle, icon, reminderList, emptyMessage) => {
    const periodCompletedCount = reminderList.filter((r) => r.status === 'taken').length;
    const allDone = reminderList.length > 0 && periodCompletedCount === reminderList.length;

    return (
      <div className="ml-timeline-section" role="region" aria-label={title}>
        <div className="ml-timeline-section-header">
          <div className="ml-timeline-title-group">
            <span className="ml-timeline-icon" aria-hidden="true">{icon}</span>
            <div>
              <h4 className="ml-timeline-period-title">{title}</h4>
              <span className="ml-timeline-period-subtitle">{timeSubtitle}</span>
            </div>
          </div>
          {reminderList.length > 0 && (
            <span className={`ml-period-counter ${allDone ? 'ml-period-all-done' : ''}`}>
              {allDone ? '✓ All done' : `${periodCompletedCount} of ${reminderList.length} done`}
            </span>
          )}
        </div>

        {reminderList.length === 0 ? (
          <div className="ml-timeline-empty">
            <p className="ml-timeline-empty-text">{emptyMessage}</p>
          </div>
        ) : (
          <ul className="ml-reminders-list">
            {reminderList.map((reminder) => {
              const isTaken = reminder.status === 'taken';
              const isSnoozed = reminder.status === 'snoozed';
              const isMissed = reminder.status === 'missed';
              const isCurrentSpeaking = isSpeaking && speakingReminderId === reminder.id;

              return (
                <li
                  key={reminder.id}
                  className={`ml-reminder-item ml-item-${reminder.status} ${isCurrentSpeaking ? 'ml-item-speaking' : ''}`}
                >
                  <div className="ml-item-main">
                    <div className="ml-item-meta">
                      <span className="ml-item-type">
                        {reminder.type === 'medicine' ? 'Medicine' : 'Routine'}
                      </span>
                      <span className="ml-item-time">
                        {formatReminderTime(reminder.scheduledAt)}
                      </span>
                    </div>

                    <h5 className="ml-item-title">{reminder.title}</h5>
                    {reminder.note && (
                      <p className="ml-item-instruction">{reminder.note}</p>
                    )}

                    {isTaken && reminder.completedAt && (
                      <p className="ml-item-completed-note">
                        Completed at {formatReminderTime(reminder.completedAt)}
                      </p>
                    )}
                  </div>

                  <div className="ml-item-aside">
                    <div className="ml-item-status-row">
                      <span className={`ml-status-pill ml-status-${reminder.status}`}>
                        {isTaken && '✓ Done'}
                        {isSnoozed && '⏱ Snoozed'}
                        {isMissed && 'Missed'}
                        {reminder.status === 'pending' && 'Pending'}
                      </span>

                      {/* Voice Listen Button */}
                      {isSpeechSupported && !isTaken && (
                        <button
                          type="button"
                          className={`ml-btn-listen-sm ${isCurrentSpeaking ? 'ml-listening' : ''}`}
                          onClick={() => (isCurrentSpeaking ? stopSpeaking() : speakReminder(reminder))}
                          disabled={isMuted}
                          aria-label={isCurrentSpeaking ? `Stop reading ${reminder.title}` : `Listen to ${reminder.title}`}
                          title={isMuted ? 'Voice is muted' : 'Listen aloud'}
                        >
                          {isCurrentSpeaking ? '⏹ Stop' : '🔊 Listen'}
                        </button>
                      )}
                    </div>

                    {!isTaken && !isMissed && (
                      <div className="ml-item-buttons">
                        <button
                          type="button"
                          className="ml-btn ml-btn-sm ml-btn-primary"
                          onClick={() => handleMarkTaken(reminder)}
                        >
                          I've done this
                        </button>
                        <button
                          type="button"
                          className="ml-btn ml-btn-sm ml-btn-secondary"
                          onClick={() => handleSnooze(reminder)}
                        >
                          Later
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  return (
    <section className="ml-reminders-module" aria-label="Daily Reminders and Routine">
      <header className="ml-reminders-header">
        <div className="ml-header-top">
          <h2 className="ml-reminders-title">Today's Schedule</h2>
          {isSpeechSupported && (
            <button
              type="button"
              className={`ml-btn-mute ${isMuted ? 'ml-btn-muted' : ''}`}
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute voice reminders' : 'Mute voice reminders'}
              title={isMuted ? 'Voice is currently muted. Click to turn on.' : 'Voice is on. Click to mute.'}
            >
              {isMuted ? '🔇 Voice Muted' : '🔊 Voice Enabled'}
            </button>
          )}
        </div>
        <p className="ml-reminders-subtitle">
          Here is your gentle schedule for today. Take your time.
        </p>
      </header>

      {/* Featured Next Reminder Card */}
      {nextReminder ? (
        <div className="ml-next-reminder-card" role="region" aria-label="Next upcoming reminder">
          <div className="ml-badge-next">Next up</div>
          <div className="ml-card-header">
            <span className="ml-card-type">
              {nextReminder.type === 'medicine' ? 'Medicine' : 'Routine'}
            </span>
            <span className="ml-card-time">{formatReminderTime(nextReminder.scheduledAt)}</span>
          </div>

          <h3 className="ml-card-title">{nextReminder.title}</h3>

          {nextReminder.note && (
            <p className="ml-card-instruction">{nextReminder.note}</p>
          )}

          <div className="ml-card-status">
            <span className={`ml-status-pill ml-status-${nextReminder.status}`}>
              {nextReminder.status === 'snoozed' ? 'Snoozed for later' : 'Waiting for you'}
            </span>
          </div>

          {/* Voice Reminder Controls (Task 5: TTS) */}
          <div className="ml-voice-section">
            {isSpeechSupported ? (
              <div className="ml-voice-controls">
                {isSpeaking && speakingReminderId === nextReminder.id ? (
                  <button
                    type="button"
                    className="ml-btn ml-btn-stop"
                    onClick={stopSpeaking}
                    aria-label={`Stop reading ${nextReminder.title} aloud`}
                  >
                    ⏹ Stop Reading
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ml-btn ml-btn-voice"
                    onClick={() => speakReminder(nextReminder)}
                    disabled={isMuted}
                    aria-label={`Read ${nextReminder.title} aloud`}
                  >
                    {isMuted ? '🔇 Voice is Muted (Click above to unmute)' : '🔊 Read reminder aloud'}
                  </button>
                )}

                {isSpeaking && speakingReminderId === nextReminder.id && (
                  <span className="ml-speaking-indicator" aria-live="polite">
                    Reading aloud...
                  </span>
                )}
              </div>
            ) : (
              <p className="ml-voice-fallback" role="status">
                ℹ Spoken voice prompts are not supported by this browser. All reminder instructions remain visible above.
              </p>
            )}
          </div>

          {/* Push-to-Talk Voice Commands Box */}
          {isRecognitionSupported && (
            <div className="ml-voice-command-box" role="region" aria-label="Voice Command Assistant">
              <div className="ml-voice-command-header">
                <span className="ml-voice-command-title">🎙️ Voice Commands</span>
                <span className="ml-voice-command-hint">Tap below and speak</span>
              </div>

              <button
                type="button"
                className={`ml-btn ml-btn-mic ${isListening ? 'ml-btn-mic-active' : ''}`}
                onClick={toggleListening}
                aria-label={isListening ? 'Stop listening for voice commands' : 'Tap to speak a voice command'}
              >
                {isListening ? '🛑 Stop Listening' : '🎙️ Tap to Speak Command'}
              </button>

              {isListening && (
                <div className="ml-voice-listening-status" aria-live="polite">
                  <span className="ml-pulse-dot" aria-hidden="true"></span>
                  Listening... Speak your command clearly.
                </div>
              )}

              {voiceTranscript && (
                <p className="ml-voice-transcript">
                  <strong>Heard:</strong> "{voiceTranscript}"
                </p>
              )}

              {voiceFeedback && (
                <p className={`ml-voice-feedback ml-feedback-${voiceFeedbackType}`} role="status">
                  {voiceFeedback}
                </p>
              )}

              <div className="ml-voice-examples">
                <span className="ml-examples-label">Say:</span>
                <span className="ml-example-chip">"I've done this"</span>
                <span className="ml-example-chip">"Remind me later"</span>
                <span className="ml-example-chip">"Read my reminders"</span>
                <span className="ml-example-chip">"Stop"</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="ml-card-actions">
            <button
              type="button"
              className="ml-btn ml-btn-primary"
              onClick={() => handleMarkTaken(nextReminder)}
              aria-label={`Confirm done for ${nextReminder.title}`}
            >
              ✓ I've done this
            </button>
            <button
              type="button"
              className="ml-btn ml-btn-secondary"
              onClick={() => handleSnooze(nextReminder)}
              aria-label={`Remind me later for ${nextReminder.title}`}
            >
              ⏱ Remind me later
            </button>
          </div>
        </div>
      ) : (
        <div className="ml-empty-card" role="status">
          <p className="ml-empty-title">All caught up for now</p>
          <p className="ml-empty-text">
            {completedReminders.length > 0
              ? 'You have completed all your scheduled items for today. Wonderful!'
              : 'There are no reminders scheduled for today. Rest and relax.'}
          </p>
        </div>
      )}

      {/* Task 6: Daily Routine Timeline */}
      <div className="ml-timeline-container">
        <h3 className="ml-section-heading">Daily Routine Timeline</h3>

        {todayReminders.length === 0 ? (
          <div className="ml-empty-card" role="status">
            <p className="ml-empty-title">No reminders scheduled</p>
            <p className="ml-empty-text">There are no reminders or routines set for today.</p>
          </div>
        ) : (
          <div className="ml-timeline-sections">
            {/* 1. Morning Section (before 12 PM) */}
            {renderTimelineSection(
              'Morning',
              'Before 12:00 PM',
              '🌅',
              morningReminders,
              'No morning reminders scheduled. Enjoy a calm and gentle morning.'
            )}

            {/* 2. Afternoon Section (12 PM to before 5 PM) */}
            {renderTimelineSection(
              'Afternoon',
              '12:00 PM – 5:00 PM',
              '☀️',
              afternoonReminders,
              'No afternoon reminders scheduled. Take time to relax and recharge.'
            )}

            {/* 3. Evening Section (5 PM onwards) */}
            {renderTimelineSection(
              'Evening',
              '5:00 PM onwards',
              '🌙',
              eveningReminders,
              'No evening reminders scheduled. Have a restful, cozy evening.'
            )}
          </div>
        )}
      </div>

      {/* Task 7: Caregiver Event History */}
      <div className="ml-history-section" role="region" aria-label="Caregiver Activity History">
        <div className="ml-history-header">
          <h3 className="ml-history-title">Recent Activity History</h3>
          <p className="ml-history-subtitle">
            Caregiver overview of completed routines and confirmed reminders for today.
          </p>
        </div>

        {eventList.length === 0 ? (
          <div className="ml-history-empty" role="status">
            <p className="ml-history-empty-text">
              No activity recorded yet today. Completed routines and reminders will appear here.
            </p>
          </div>
        ) : (
          <ul className="ml-history-list">
            {eventList.map((event) => {
              const isConfirmed = event.action === 'confirmed';
              const isCompleted = event.action === 'completed';
              const isViewed = event.action === 'viewed';
              const isMissed = event.action === 'missed';

              return (
                <li key={event.id} className="ml-history-item">
                  <div className="ml-history-item-main">
                    <span className="ml-history-item-label">{event.label}</span>
                    <span className="ml-history-item-time">
                      Recorded at {formatEventTime(event.occurredAt)}
                    </span>
                  </div>

                  <span
                    className={`ml-history-badge ml-history-badge-${event.action}`}
                  >
                    {isConfirmed && '✓ Confirmed'}
                    {isCompleted && '✓ Completed'}
                    {isViewed && '⏱ Snoozed'}
                    {isMissed && 'Missed'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
