// Browser speech helpers from Ishani's module. Speaking uses the on-device speechSynthesis (no network).
// Listening uses SpeechRecognition, which in Chrome sends audio to the browser's speech service, so the
// screens only call it after the patient has said yes (see VoiceAssistant).
const LANG = 'en-US'

export const isSpeechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

export const isRecognitionSupported = () =>
  typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

// Cross-platform voice choice without vendor names: exact language, same language, system default.
function preferredVoice(lang = LANG) {
  const voices = window.speechSynthesis.getVoices()
  if (!voices?.length) return null
  const prefix = lang.split('-')[0].toLowerCase()
  return (
    voices.find((v) => v.lang === lang) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith(prefix)) ||
    voices.find((v) => v.default) ||
    voices[0]
  )
}

export function stopSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.cancel()
}

// Speaks calmly (rate 0.85). Stops anything already being said.
export function speak(text, { onEnd } = {}) {
  if (!isSpeechSupported() || !text) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = LANG
  utterance.rate = 0.85
  utterance.pitch = 1
  const voice = preferredVoice()
  if (voice) utterance.voice = voice
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()
  window.speechSynthesis.speak(utterance)
  return true
}

// One push-to-talk utterance. Returns { start, abort }. onError gets 'denied', 'no-speech' or 'other'.
export function createRecognizer({ onResult, onError, onEnd }) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new Recognition()
  recognition.lang = LANG
  recognition.continuous = false
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript
    if (text) onResult?.(text)
  }
  recognition.onerror = (event) =>
    onError?.(
      event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'denied'
        : event.error === 'no-speech'
          ? 'no-speech'
          : 'other',
    )
  recognition.onend = () => onEnd?.()
  return {
    start: () => recognition.start(),
    abort: () => {
      try {
        recognition.abort()
      } catch {
        // Already stopped.
      }
    },
  }
}
