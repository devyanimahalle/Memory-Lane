import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/icons'
import {
  createRecognizer,
  isRecognitionSupported,
  isSpeechSupported,
  matchVoiceCommand,
  speak,
  stopSpeaking,
} from '../../features/reminders'
import { COMMANDS } from './mockData'

const REPLIES_KEY = 'memory-lane:voice-replies'
const LISTEN_KEY = 'memory-lane:voice-listening'

function readFlag(key, expected) {
  try {
    return window.localStorage.getItem(key) === expected
  } catch {
    return false
  }
}

function writeFlag(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Persisting is best-effort only.
  }
}

const PHASE_LABEL = {
  idle: 'Ask me',
  listening: 'Listening… tap to stop',
  understood: 'Got it',
  speaking: 'Speaking…',
}

// The voice assistant. `onCommand(intentId)` runs the command and returns the reply text to show.
// Replies are spoken with the on-device speech engine (a "Voice replies" button turns that off).
// Listening is off until the patient says yes to a short notice: the browser's speech recognition
// may send what is said to the browser's own speech service (Chrome does). Without it, or when the
// browser cannot listen, the on-screen buttons do the same things.
//
// variant "panel": a fixed bottom bar on phones and tablets, a deep-teal side panel from 1024px.
// variant "bar": a fixed bottom bar at every width (used on full-page views).
// tone "dark" (bar only) is the Dark Midnight look, used while a game page is open; the default
// "light" look is unchanged everywhere else.
export function VoiceAssistant({ onCommand, variant = 'panel', tone = 'light' }) {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState('idle')
  const [open, setOpen] = useState(false)
  const [heard, setHeard] = useState('')
  const [reply, setReply] = useState('')
  const timers = useRef([])
  const recognizerRef = useRef(null)
  const dialogRef = useRef(null)
  const [speakOn, setSpeakOn] = useState(() => !readFlag(REPLIES_KEY, 'off'))
  const panel = variant === 'panel'
  const dark = tone === 'dark' && !panel

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(
    () => () => {
      clearTimers()
      recognizerRef.current?.abort()
      stopSpeaking()
    },
    [],
  )

  function after(ms, fn) {
    timers.current.push(setTimeout(fn, ms))
  }

  function run(command) {
    clearTimers()
    setOpen(true)
    setHeard(command.label)
    setReply('')
    setPhase('understood')
    after(700, () => {
      const text = onCommand(command.id)
      setReply(text)
      setPhase('speaking')
      if (speakOn) speak(text)
    })
    after(3700, () => setPhase('idle'))
  }

  function startListening() {
    setOpen(true)
    setHeard('')
    setReply('')
    setPhase('listening')
    const recognizer = createRecognizer({
      onResult: (text) => {
        const id = matchVoiceCommand(text)
        if (id === 'unknown') {
          setHeard(text)
          setReply('I did not catch that. Please try again, or use the buttons.')
          setPhase('idle')
        } else {
          run({ id, label: text })
        }
      },
      onError: (kind) => {
        setPhase('idle')
        setReply(
          kind === 'denied'
            ? 'The microphone is not allowed. You can use the buttons.'
            : kind === 'no-speech'
              ? 'I did not hear anything. Tap Ask me when you are ready.'
              : 'Listening stopped. You can try again or use the buttons.',
        )
      },
      onEnd: () => setPhase((current) => (current === 'listening' ? 'idle' : current)),
    })
    recognizerRef.current = recognizer
    try {
      recognizer.start()
    } catch {
      setPhase('idle')
      setReply('I could not start the microphone. Please use the buttons.')
    }
  }

  function toggleListening() {
    clearTimers()
    if (phase === 'listening') {
      recognizerRef.current?.abort()
      setPhase('idle')
      return
    }
    stopSpeaking()
    setOpen(true)
    setHeard('')
    if (!isRecognitionSupported()) {
      setReply('Listening is not available in this browser. Please use the buttons.')
      return
    }
    if (!readFlag(LISTEN_KEY, 'granted')) {
      dialogRef.current?.showModal()
      return
    }
    startListening()
  }

  function allowListening() {
    writeFlag(LISTEN_KEY, 'granted')
    dialogRef.current?.close()
    startListening()
  }

  function toggleReplies() {
    if (speakOn) stopSpeaking()
    writeFlag(REPLIES_KEY, speakOn ? 'off' : 'on')
    setSpeakOn(!speakOn)
  }

  let caption = 'Tap Ask me and say, “What’s next?”'
  if (phase === 'listening') caption = 'I am listening…'
  else if (reply) caption = reply
  else if (heard) caption = 'One moment…'

  const rootClass = dark
    ? 'fixed inset-x-0 bottom-0 z-20 border-t border-line-strong bg-ink px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:pr-[calc(4.5rem+env(safe-area-inset-right))] text-on-deep [&_:focus-visible]:outline-sunken'
    : panel
    ? 'fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:pr-[calc(4.5rem+env(safe-area-inset-right))] lg:static lg:z-auto lg:rounded-xl lg:border-0 lg:bg-deep lg:p-6 lg:text-on-deep'
    : 'fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:pr-[calc(4.5rem+env(safe-area-inset-right))]'
  const sheetClass = dark
    ? `${open ? 'mb-3 block' : 'hidden'} mx-auto max-w-xl rounded-xl border border-line-strong p-4 text-on-deep`
    : panel
    ? `${open ? 'mb-3 block' : 'hidden'} mx-auto max-w-xl rounded-xl bg-surface p-4 text-ink shadow-raised lg:mb-5 lg:block lg:max-w-none lg:bg-transparent lg:p-0 lg:text-on-deep lg:shadow-none`
    : `${open ? 'mb-3 block' : 'hidden'} mx-auto max-w-xl rounded-xl bg-surface p-4 text-ink shadow-raised`
  const micClass = dark
    ? 'relative mx-auto flex min-h-16 w-full max-w-xl cursor-pointer items-center justify-center gap-3 rounded-full bg-sunken px-8 text-lead font-bold text-ink transition-colors duration-quick ease-gentle hover:bg-accent-soft'
    : panel
    ? 'relative mx-auto flex min-h-16 w-full max-w-xl cursor-pointer items-center justify-center gap-3 rounded-full bg-accent px-8 text-lead font-bold text-on-accent transition-colors duration-quick ease-gentle hover:bg-accent-strong lg:max-w-none lg:bg-surface lg:text-accent lg:hover:bg-accent-soft'
    : 'relative mx-auto flex min-h-16 w-full max-w-xl cursor-pointer items-center justify-center gap-3 rounded-full bg-accent px-8 text-lead font-bold text-on-accent transition-colors duration-quick ease-gentle hover:bg-accent-strong'

  return (
    <section aria-label="Voice assistant" className={rootClass}>
      <div className={sheetClass}>
        {panel && <h2 className="hidden text-title font-bold lg:block">Ask me</h2>}

        {heard && (
          <p
            className={`text-body font-semibold ${dark ? 'text-on-deep-soft' : 'text-ink-soft'} ${panel ? 'lg:mt-3 lg:text-on-deep-soft' : ''}`}
          >
            You said: “{heard}”
          </p>
        )}
        <p
          aria-live="polite"
          className={`mt-1 min-h-14 text-lead leading-snug font-semibold ${panel ? 'lg:mt-3' : ''}`}
        >
          {caption}
        </p>

        <ul className="mt-3 grid grid-cols-2 gap-2">
          {COMMANDS.map((command) => (
            <li key={command.id}>
              <Button variant={dark ? 'dark-secondary' : 'secondary'} size="sm" full onClick={() => run(command)}>
                {command.label}
              </Button>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {isSpeechSupported() && (
            <Button
              variant={dark ? 'dark-secondary' : 'secondary'}
              size="sm"
              aria-pressed={speakOn}
              onClick={toggleReplies}
            >
              <Icon name="volume" className="size-5" />
              {speakOn ? 'Voice replies on' : 'Voice replies off'}
            </Button>
          )}
          <Button
            variant={dark ? 'dark-quiet' : 'quiet'}
            size="sm"
            className={panel ? 'lg:hidden' : ''}
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="listen-title"
        aria-describedby="listen-text"
        className="m-auto w-[min(92vw,28rem)] rounded-xl border-0 bg-surface p-gutter text-ink shadow-raised backdrop:bg-ink/60"
      >
        <h2 id="listen-title" className="text-title font-bold">
          Use the microphone?
        </h2>
        <p id="listen-text" className="mt-2 text-lead text-ink-soft">
          Your browser may send what you say to its own speech service so it can understand you. Memory
          Lane does not keep it. You can always use the buttons instead.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={allowListening}>Allow listening</Button>
          <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
            Not now
          </Button>
        </div>
      </dialog>

      <button type="button" onClick={toggleListening} className={micClass}>
        {phase === 'listening' && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-4 border-turquoise"
            animate={
              reduceMotion ? { opacity: 0.7 } : { scale: [1, 1.12], opacity: [0.7, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.6, repeat: Infinity, ease: 'easeOut' }
            }
          />
        )}
        <Icon name={phase === 'speaking' ? 'volume' : 'mic'} className="size-7" />
        {PHASE_LABEL[phase]}
      </button>
    </section>
  )
}
