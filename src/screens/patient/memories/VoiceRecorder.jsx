import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { AudioPlayer } from './AudioPlayer'
import { LIMITS, formatDuration, pickRecorderMimeType } from './memoryContent'
import { stopAllPlayback } from './playbackBus'

const supported =
  typeof window !== 'undefined' &&
  window.isSecureContext &&
  Boolean(navigator.mediaDevices?.getUserMedia) &&
  typeof MediaRecorder !== 'undefined'

function microphoneMessage(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'The microphone is blocked. Allow microphone access for this page in your browser settings, then try again.'
    case 'NotFoundError':
      return 'No microphone was found. Connect one and try again.'
    case 'NotReadableError':
      return 'The microphone is being used by another app. Close it and try again.'
    default:
      return 'The microphone could not be started. Please try again.'
  }
}

// Records a voice note with the microphone (MediaRecorder). Steps: record (with pause and
// resume), stop, listen back, then Save or discard. `onSave({ blob, mimeType, durationMs })`
// returns a promise. Everything stays on this device.
export function VoiceRecorder({ onSave }) {
  const [phase, setPhase] = useState('idle') // idle | requesting | recording | paused | review | saving
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [take, setTake] = useState(null)

  const recorder = useRef(null)
  const stream = useRef(null)
  const chunks = useRef([])
  const segmentStart = useRef(0)
  const accumulated = useRef(0)
  const timer = useRef(null)
  const alive = useRef(true)
  const takeUrl = useRef('')

  function releaseMicrophone() {
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
  }

  function clearTimer() {
    clearInterval(timer.current)
    timer.current = null
  }

  function currentElapsed() {
    return accumulated.current + (segmentStart.current ? performance.now() - segmentStart.current : 0)
  }

  function forgetTake() {
    if (takeUrl.current) URL.revokeObjectURL(takeUrl.current)
    takeUrl.current = ''
    setTake(null)
  }

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      clearInterval(timer.current)
      const active = recorder.current
      if (active) {
        active.ondataavailable = null
        active.onstop = null
        if (active.state !== 'inactive') active.stop()
      }
      stream.current?.getTracks().forEach((track) => track.stop())
      if (takeUrl.current) URL.revokeObjectURL(takeUrl.current)
    }
  }, [])

  function stop() {
    if (!recorder.current || recorder.current.state === 'inactive') return
    accumulated.current = currentElapsed()
    segmentStart.current = 0
    clearTimer()
    recorder.current.stop() // onstop builds the take
  }

  function finishTake(mimeType) {
    releaseMicrophone()
    if (!alive.current) return
    const blob = new Blob(chunks.current, { type: mimeType || chunks.current[0]?.type || 'audio/webm' })
    chunks.current = []
    if (blob.size === 0) {
      setError('Nothing was recorded. Please try again.')
      setPhase('idle')
      return
    }
    const url = URL.createObjectURL(blob)
    takeUrl.current = url
    const durationMs = Math.round(accumulated.current)
    setElapsed(durationMs)
    setTake({ url, blob, mimeType: blob.type, durationMs })
    setPhase('review')
    setNotice('Recording stopped. You can listen to it before saving.')
  }

  async function start() {
    stopAllPlayback()
    setError('')
    setNotice('')
    setPhase('requesting')
    let media
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (failure) {
      if (alive.current) {
        setError(microphoneMessage(failure))
        setPhase('idle')
      }
      return
    }
    if (!alive.current) {
      media.getTracks().forEach((track) => track.stop())
      return
    }

    try {
      const mimeType = pickRecorderMimeType((type) => MediaRecorder.isTypeSupported(type))
      const next = new MediaRecorder(media, mimeType ? { mimeType } : undefined)
      stream.current = media
      recorder.current = next
      chunks.current = []
      accumulated.current = 0
      next.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data)
      }
      next.onstop = () => finishTake(next.mimeType)
      media.getAudioTracks().forEach((track) => {
        track.onended = () => stop()
      })
      next.start(1000)
      segmentStart.current = performance.now()
      setElapsed(0)
      setPhase('recording')
      setNotice('Recording started.')
      timer.current = setInterval(() => {
        const now = currentElapsed()
        setElapsed(now)
        if (now >= LIMITS.maxRecordingMs) {
          stop()
          setError('That is the longest a voice note can be (5 minutes), so it was stopped there.')
        }
      }, 250)
    } catch {
      media.getTracks().forEach((track) => track.stop())
      setError('Recording is not supported in this browser.')
      setPhase('idle')
    }
  }

  function pause() {
    if (recorder.current?.state !== 'recording') return
    recorder.current.pause()
    accumulated.current = currentElapsed()
    segmentStart.current = 0
    clearTimer()
    setElapsed(accumulated.current)
    setPhase('paused')
    setNotice('Recording paused.')
  }

  function resume() {
    if (recorder.current?.state !== 'paused') return
    recorder.current.resume()
    segmentStart.current = performance.now()
    setPhase('recording')
    setNotice('Recording resumed.')
    timer.current = setInterval(() => {
      const now = currentElapsed()
      setElapsed(now)
      if (now >= LIMITS.maxRecordingMs) {
        stop()
        setError('That is the longest a voice note can be (5 minutes), so it was stopped there.')
      }
    }, 250)
  }

  function discard() {
    forgetTake()
    setElapsed(0)
    setError('')
    setNotice('Recording discarded.')
    setPhase('idle')
  }

  function recordAgain() {
    forgetTake()
    start()
  }

  async function save() {
    setPhase('saving')
    setError('')
    try {
      await onSave({ blob: take.blob, mimeType: take.mimeType, durationMs: take.durationMs })
      if (!alive.current) return
      forgetTake()
      setElapsed(0)
      setNotice('Voice note saved.')
      setPhase('idle')
    } catch (failure) {
      if (!alive.current) return
      setError(failure.message)
      setPhase('review')
    }
  }

  if (!supported) {
    return (
      <p className="rounded-lg bg-sunken p-4 text-body">
        Voice notes need a secure page and a browser that can record sound. The rest of this page still works.
      </p>
    )
  }

  const live = phase === 'recording' || phase === 'paused'

  return (
    <div>
      <p role="status" className="sr-only">
        {notice}
      </p>

      {(phase === 'idle' || phase === 'requesting') && (
        <Button size="sm" full onClick={start} disabled={phase === 'requesting'}>
          <Icon name="mic" className="size-5" />
          {phase === 'requesting' ? 'Waiting for the microphone…' : 'Record a voice note'}
        </Button>
      )}

      {live && (
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`size-4 rounded-full ${phase === 'recording' ? 'bg-accent motion-safe:animate-pulse' : 'border-2 border-accent'}`}
            />
            <p className="text-lead font-bold">{phase === 'recording' ? 'Recording' : 'Paused'}</p>
          </div>
          <p className="mt-2 font-heading text-display leading-none tabular-nums" aria-hidden="true">
            {formatDuration(elapsed)}
          </p>
          <p className="sr-only">Recording time {formatDuration(elapsed)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {phase === 'recording' ? (
              <Button size="sm" variant="secondary" onClick={pause}>
                <Icon name="pause" className="size-5" />
                Pause
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={resume}>
                <Icon name="record" className="size-5" />
                Resume
              </Button>
            )}
            <Button size="sm" onClick={stop}>
              <Icon name="stop" className="size-5" />
              Stop
            </Button>
          </div>
        </div>
      )}

      {(phase === 'review' || phase === 'saving') && take && (
        <div>
          <p className="text-lead font-bold">Listen, then save</p>
          <div className="mt-3">
            <AudioPlayer src={take.url} durationMs={take.durationMs} label="your new recording" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button size="sm" full className="col-span-2" onClick={save} disabled={phase === 'saving'}>
              <Icon name="check" className="size-5" />
              {phase === 'saving' ? 'Saving…' : 'Save voice note'}
            </Button>
            <Button size="sm" variant="secondary" onClick={recordAgain} disabled={phase === 'saving'}>
              Record again
            </Button>
            <Button size="sm" variant="quiet" onClick={discard} disabled={phase === 'saving'}>
              Discard
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-sunken p-3 text-body font-semibold">
          {error}
        </p>
      )}
      {phase === 'idle' && notice === 'Voice note saved.' && (
        <p className="mt-3 text-body font-semibold text-gentle-ink">Voice note saved.</p>
      )}
    </div>
  )
}
