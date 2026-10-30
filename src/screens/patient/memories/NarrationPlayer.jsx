import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'

// Optional narration. A recorded file (`audio.src`) is played when present; otherwise the
// browser's built-in speech reads the description aloud (on-device, no external API).
// Renders nothing when neither is available.
export function NarrationPlayer({ text, audio }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const recorded = Boolean(audio?.src)
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    const element = audioRef.current
    return () => {
      window.speechSynthesis?.cancel()
      element?.pause()
    }
  }, [])

  if (!recorded && !canSpeak) return null

  function toggle() {
    if (recorded) {
      const element = audioRef.current
      if (playing) element.pause()
      else element.play()
      return
    }
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.onend = () => setPlaying(false)
    utterance.onerror = () => setPlaying(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setPlaying(true)
  }

  const label = recorded
    ? playing
      ? 'Pause narration'
      : 'Play narration'
    : playing
      ? 'Stop reading'
      : 'Read to me'

  return (
    <div className="mt-6">
      {recorded && (
        <audio
          ref={audioRef}
          src={audio.src}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      )}
      <Button full onClick={toggle} aria-pressed={playing}>
        <Icon name={playing ? 'stop' : 'volume'} className="size-6" />
        {label}
      </Button>
    </div>
  )
}
