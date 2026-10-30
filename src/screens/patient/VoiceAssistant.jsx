import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/icons'
import { COMMANDS } from './mockData'

const PHASE_LABEL = {
  idle: 'Ask me',
  listening: 'Listening… tap to stop',
  understood: 'Got it',
  speaking: 'Speaking…',
}

// UI-only mock of the voice assistant: it never uses the microphone or speech APIs.
// `onCommand(intentId)` runs the command and returns the reply text to show.
// The real voice feature can call the same handler later.
//
// variant "panel": a fixed bottom bar on phones and tablets, a deep-teal side panel from 1024px.
// variant "bar": a fixed bottom bar at every width (used on full-page views).
export function VoiceAssistant({ onCommand, variant = 'panel' }) {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState('idle')
  const [open, setOpen] = useState(false)
  const [heard, setHeard] = useState('')
  const [reply, setReply] = useState('')
  const timers = useRef([])
  const panel = variant === 'panel'

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => clearTimers, [])

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
      setReply(onCommand(command.id))
      setPhase('speaking')
    })
    after(3700, () => setPhase('idle'))
  }

  function toggleListening() {
    clearTimers()
    if (phase === 'listening') {
      setPhase('idle')
      return
    }
    setOpen(true)
    setHeard('')
    setReply('')
    setPhase('listening')
    after(2200, () => run(COMMANDS[0]))
  }

  let caption = 'Tap Ask me and say, “What’s next?”'
  if (phase === 'listening') caption = 'I am listening…'
  else if (reply) caption = reply
  else if (heard) caption = 'One moment…'

  const rootClass = panel
    ? 'fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:z-auto lg:rounded-xl lg:border-0 lg:bg-deep lg:p-6 lg:text-on-deep'
    : 'fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]'
  const sheetClass = panel
    ? `${open ? 'mb-3 block' : 'hidden'} mx-auto max-w-xl rounded-xl bg-surface p-4 text-ink shadow-raised lg:mb-5 lg:block lg:max-w-none lg:bg-transparent lg:p-0 lg:text-on-deep lg:shadow-none`
    : `${open ? 'mb-3 block' : 'hidden'} mx-auto max-w-xl rounded-xl bg-surface p-4 text-ink shadow-raised`
  const micClass = panel
    ? 'relative mx-auto flex min-h-16 w-full max-w-xl cursor-pointer items-center justify-center gap-3 rounded-full bg-accent px-8 text-lead font-bold text-on-accent transition-colors duration-quick ease-gentle hover:bg-accent-strong lg:max-w-none lg:bg-surface lg:text-accent lg:hover:bg-accent-soft'
    : 'relative mx-auto flex min-h-16 w-full max-w-xl cursor-pointer items-center justify-center gap-3 rounded-full bg-accent px-8 text-lead font-bold text-on-accent transition-colors duration-quick ease-gentle hover:bg-accent-strong'

  return (
    <section aria-label="Voice assistant" className={rootClass}>
      <div className={sheetClass}>
        {panel && <h2 className="hidden text-title font-bold lg:block">Ask me</h2>}

        {heard && (
          <p
            className={`text-body font-semibold text-ink-soft ${panel ? 'lg:mt-3 lg:text-on-deep-soft' : ''}`}
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
              <Button variant="secondary" size="sm" full onClick={() => run(command)}>
                {command.label}
              </Button>
            </li>
          ))}
        </ul>

        <Button
          variant="quiet"
          size="sm"
          className={`mt-2 ${panel ? 'lg:hidden' : ''}`}
          onClick={() => setOpen(false)}
        >
          Close
        </Button>
      </div>

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
