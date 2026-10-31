import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { formatDuration } from './memoryContent'
import { claimPlayback } from './playbackBus'

// Large play/pause control for one recording. `durationMs` comes from the saved note
// (recorded webm files do not carry a reliable length of their own).
export function AudioPlayer({ src, durationMs, label }) {
  const audioRef = useRef(null)
  const release = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)

  useEffect(() => {
    const element = audioRef.current
    return () => {
      element?.pause()
      release.current?.()
    }
  }, [])

  function toggle() {
    const element = audioRef.current
    if (playing) {
      element.pause()
      return
    }
    release.current?.()
    release.current = claimPlayback(() => element.pause())
    element.play().catch(() => setPlaying(false))
  }

  const percent = durationMs ? Math.min(100, (time / durationMs) * 100) : 0

  return (
    <div>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setTime(0)
          release.current?.()
        }}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime * 1000)}
      />
      <div className="flex items-center gap-4">
        <Button size="sm" onClick={toggle} aria-pressed={playing} aria-label={`${playing ? 'Pause' : 'Play'} ${label}`}>
          <Icon name={playing ? 'pause' : 'play'} className="size-5" />
          {playing ? 'Pause' : 'Play'}
        </Button>
        <div className="min-w-0 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-body font-semibold tabular-nums">
            {formatDuration(Math.min(time, durationMs ?? time))} / {formatDuration(durationMs)}
          </p>
        </div>
      </div>
    </div>
  )
}
