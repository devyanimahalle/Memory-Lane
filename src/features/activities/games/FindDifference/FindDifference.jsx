import { useState } from 'react'
import { Icon } from '../../../../ui/icons'
import { ChoicePills, GameButton, GameFrame, GameHeader, GameMessage, SoundToggle } from '../../GameBits'
import { playCelebrationChime, playGentleChime } from '../../soundEffects'
import { TONES } from '../../tones'
import { useGameSession } from '../../useGameSession'
import { SCENES } from './scenes'

// Gameplay is the original Spot the Difference: tap (or click) where the second picture differs.
// A generous radius accepts near taps, and found spots stay marked on both pictures.
const TOLERANCE = 13 // percent of the picture, same as the original
const KEY_STEP = 8 // percent moved by one arrow key press

const SCENE_OPTIONS = SCENES.map((scene, index) => ({ id: String(index), label: scene.title }))

// The picture itself: the scene's image if it has one, otherwise a grid of token-coloured squares.
function Picture({ scene, which }) {
  const tones = which === 'a' ? scene.imageA : scene.imageB
  if (typeof tones === 'string') {
    return <img src={tones} alt="" className="size-full object-cover" draggable={false} />
  }
  return (
    <div
      className="grid size-full"
      style={{
        gridTemplateColumns: `repeat(${scene.cols}, 1fr)`,
        gridTemplateRows: `repeat(${scene.rows}, 1fr)`,
      }}
    >
      {tones.map((tone, index) => (
        <span key={index} className={TONES[tone]} />
      ))}
    </div>
  )
}

function Marker({ x, y, children }) {
  return (
    <span
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {children}
    </span>
  )
}

export function FindDifference({ onBack, onEngagement, headingRef }) {
  const session = useGameSession(onEngagement)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [found, setFound] = useState([])
  const [hintOn, setHintOn] = useState(false)
  const [message, setMessage] = useState('')
  const [cursor, setCursor] = useState(null) // keyboard pointer, in percent

  const scene = SCENES[sceneIndex]
  const total = scene.differences.length
  const complete = found.length === total

  function reset(nextIndex = sceneIndex) {
    setSceneIndex(nextIndex)
    setFound([])
    setHintOn(false)
    setMessage('')
    setCursor(null)
    session.start()
  }

  // Shared by taps, clicks and the keyboard pointer. Picks the nearest spot not yet found.
  function checkAt(x, y) {
    if (complete) return
    let best = null
    scene.differences.forEach((diff, index) => {
      if (found.includes(index)) return
      const distance = Math.hypot(x - diff.x, y - diff.y)
      if (distance < TOLERANCE && (!best || distance < best.distance)) best = { index, distance }
    })
    if (!best) {
      setMessage('Nothing is different there. Keep looking, you are doing well.')
      return
    }
    const updated = [...found, best.index]
    setFound(updated)
    setHintOn(false)
    if (updated.length === total) {
      playCelebrationChime()
      setMessage(`Wonderful! You found every difference in ${scene.title.toLowerCase()}.`)
      session.reportCompleted('Played Spot the Difference')
    } else {
      playGentleChime()
      setMessage(`Lovely spot! You found ${scene.differences[best.index].label}.`)
    }
  }

  function handlePointer(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    checkAt(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100,
    )
  }

  function handleKeyDown(event) {
    const moves = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    }
    if (moves[event.key]) {
      event.preventDefault()
      const [dx, dy] = moves[event.key]
      const from = cursor ?? { x: 50, y: 50 }
      setCursor({
        x: Math.min(100, Math.max(0, from.x + dx)),
        y: Math.min(100, Math.max(0, from.y + dy)),
      })
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const at = cursor ?? { x: 50, y: 50 }
      setCursor(at)
      checkAt(at.x, at.y)
    }
  }

  const nextHint = scene.differences.find((_, index) => !found.includes(index))?.hint

  function renderMarks(withHints) {
    return (
      <>
        {withHints &&
          hintOn &&
          scene.differences.map(
            (diff, index) =>
              !found.includes(index) && (
                <Marker key={`hint-${diff.id}`} x={diff.x} y={diff.y}>
                  <span className="block size-14 rounded-full border-4 border-dashed border-accent motion-safe:animate-pulse" />
                </Marker>
              ),
          )}
        {found.map((index) => {
          const diff = scene.differences[index]
          return (
            <Marker key={`found-${diff.id}`} x={diff.x} y={diff.y}>
              <span className="flex size-14 items-center justify-center rounded-full border-4 border-gentle bg-surface/70 text-gentle">
                <Icon name="check" className="size-7" />
              </span>
            </Marker>
          )
        })}
      </>
    )
  }

  return (
    <GameFrame label="Spot the Difference">
      <GameHeader
        title="Spot the Difference"
        intro={scene.instruction}
        onBack={onBack}
        headingRef={headingRef}
      />

      <div className="flex flex-wrap items-end gap-4">
        <ChoicePills
          label="Which picture?"
          options={SCENE_OPTIONS}
          value={String(sceneIndex)}
          onChange={(option) => reset(Number(option.id))}
        />
        <SoundToggle />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <figure className="flex flex-col gap-2">
          <figcaption className="text-lead font-semibold">The first picture</figcaption>
          <div
            onClick={handlePointer}
            className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border-2 border-transparent"
          >
            <Picture scene={scene} which="a" />
            {renderMarks(false)}
          </div>
        </figure>

        <figure className="flex flex-col gap-2">
          <figcaption className="text-lead font-semibold">Find the differences here</figcaption>
          <div
            role="group"
            tabIndex={0}
            aria-label="The second picture. Tap where it is different. With a keyboard, use the arrow keys to move the pointer and press Enter to check."
            onClick={handlePointer}
            onKeyDown={handleKeyDown}
            onBlur={() => setCursor(null)}
            className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border-2 border-transparent"
          >
            <Picture scene={scene} which="b" />
            {renderMarks(true)}
            {cursor && (
              <Marker x={cursor.x} y={cursor.y}>
                <span className="block size-12 rounded-full border-4 border-focus bg-surface/40" />
              </Marker>
            )}
          </div>
        </figure>
      </div>

      <GameMessage>{message}</GameMessage>
      <p className="-mt-4 text-body text-on-deep-soft">
        {found.length === 0
          ? `There are ${total} to find.`
          : `You have found ${found.length} so far, out of ${total}.`}
      </p>
      {hintOn && !complete && nextHint && (
        <p className="rounded-lg bg-accent p-4 text-lead text-on-deep">
          <strong>A gentle hint:</strong> {nextHint}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {!complete && (
          <GameButton variant="secondary" aria-pressed={hintOn} onClick={() => setHintOn(!hintOn)}>
            {hintOn ? 'Hide the hint' : 'Show a gentle hint'}
          </GameButton>
        )}
        <GameButton variant={complete ? 'secondary' : 'quiet'} onClick={() => reset()}>
          Play this picture again
        </GameButton>
        {complete && sceneIndex < SCENES.length - 1 && (
          <GameButton onClick={() => reset(sceneIndex + 1)}>
            Next picture
            <Icon name="forward" className="size-5" />
          </GameButton>
        )}
        {complete && onBack && (
          <GameButton variant="quiet" onClick={onBack}>
            Done for now
          </GameButton>
        )}
      </div>
    </GameFrame>
  )
}
