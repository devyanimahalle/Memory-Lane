import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { splitSentences } from './memoryContent'
import { claimPlayback } from './playbackBus'

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

// Reads the saved description aloud with the browser's own voice (on this device, no service).
// Sentence by sentence, so Pause can stop at a sentence and Resume can carry on from it
// (the browser's own pause is unreliable in some browsers). The parent keys this component by
// the text and the editing state, so speech stops and resets when either changes.
export function DescriptionSpeech({ text, disabled }) {
  const [status, setStatus] = useState('idle') // idle | playing | paused
  const [position, setPosition] = useState(0)
  const sentences = useRef(splitSentences(text))
  const index = useRef(0)
  const token = useRef(0) // ignores events from speech that was cancelled
  const release = useRef(null)

  function halt() {
    token.current += 1
    window.speechSynthesis?.cancel()
  }

  function speakFrom(start) {
    const mine = ++token.current
    window.speechSynthesis.cancel()
    if (start >= sentences.current.length) {
      index.current = 0
      setPosition(0)
      setStatus('idle')
      release.current?.()
      return
    }
    index.current = start
    setPosition(start)
    const utterance = new SpeechSynthesisUtterance(sentences.current[start])
    utterance.rate = 0.9
    utterance.onend = () => {
      if (token.current === mine) speakFrom(start + 1)
    }
    utterance.onerror = () => {
      if (token.current !== mine) return
      setStatus('idle')
      release.current?.()
    }
    window.speechSynthesis.speak(utterance)
  }

  function claim() {
    release.current?.() // drop our own earlier claim first so its stop callback does not run
    release.current = claimPlayback(() => {
      halt()
      setStatus('idle')
      index.current = 0
      setPosition(0)
    })
  }

  function play() {
    claim()
    setStatus('playing')
    speakFrom(0)
  }

  function pause() {
    halt()
    setStatus('paused')
  }

  function resume() {
    claim()
    setStatus('playing')
    speakFrom(index.current)
  }

  function stop() {
    halt()
    index.current = 0
    setPosition(0)
    setStatus('idle')
    release.current?.()
  }

  useEffect(
    () => () => {
      token.current += 1
      window.speechSynthesis?.cancel()
      release.current?.()
    },
    [],
  )

  if (!canSpeak) {
    return (
      <p className="mt-6 text-body text-ink-soft">
        Reading aloud is not available in this browser.
      </p>
    )
  }

  const total = sentences.current.length

  return (
    <div className="mt-5">
      <div className="grid grid-cols-2 gap-3">
        {status === 'idle' && (
          <Button size="sm" className="col-span-2" onClick={play} disabled={disabled || total === 0}>
            <Icon name="volume" className="size-5" />
            Read to me
          </Button>
        )}
        {status === 'playing' && (
          <Button size="sm" onClick={pause}>
            <Icon name="pause" className="size-5" />
            Pause
          </Button>
        )}
        {status === 'paused' && (
          <Button size="sm" onClick={resume}>
            <Icon name="play" className="size-5" />
            Resume
          </Button>
        )}
        {status !== 'idle' && (
          <Button size="sm" variant="secondary" onClick={stop}>
            <Icon name="stop" className="size-5" />
            Stop
          </Button>
        )}
      </div>
      <p role="status" className="mt-2 min-h-6 text-body text-ink-soft">
        {status === 'playing' && `Reading, part ${position + 1} of ${total}`}
        {status === 'paused' && `Paused at part ${position + 1} of ${total}`}
      </p>
    </div>
  )
}
