import { useRef, useState } from 'react'
import { Icon } from '../../../../ui/icons'
import { ChoicePills, GameButton, GameFrame, GameHeader, GameMessage, SoundToggle } from '../../GameBits'
import { playCelebrationChime, playGentleChime } from '../../soundEffects'
import { TONES } from '../../tones'
import { useGameSession } from '../../useGameSession'
import { puzzleArt } from '../../art/puzzleArt'

// Gameplay is the original Picture Puzzle: the picture is cut into pieces, shuffled (never already
// solved), and the person taps two pieces to swap them until every piece is in its place.
//
// Pictures: each puzzle's `image` (art/puzzleArt.js) is sliced across the pieces. With no `image`,
// a piece falls back to a token-coloured square labelled with its number.
const PUZZLES = [
  { id: 'garden', title: 'Garden', description: 'A bright garden path.', image: puzzleArt.garden, bands: ['sky', 'sage', 'mint'] },
  { id: 'lake', title: 'Lakeside', description: 'A quiet morning by the water.', image: puzzleArt.lake, bands: ['sky', 'teal', 'sage'] },
  { id: 'tea', title: 'Tea time', description: 'A warm cup of tea.', image: puzzleArt.tea, bands: ['mint', 'white', 'teal'] },
  { id: 'cat', title: 'Sleepy cat', description: 'A cat curled up on a cushion.', image: puzzleArt.cat, bands: ['white', 'sky', 'mint'] },
]
const PUZZLE_OPTIONS = PUZZLES.map((puzzle) => ({ id: puzzle.id, label: puzzle.title }))

const GRID_OPTIONS = [
  { id: '4', label: '4 pieces', cols: 2, rows: 2 },
  { id: '6', label: '6 pieces', cols: 3, rows: 2 },
  { id: '9', label: '9 pieces', cols: 3, rows: 3 },
  { id: '12', label: '12 pieces', cols: 4, rows: 3 },
]

const isSolved = (tiles) => tiles.every((piece, slot) => piece === slot)

// A shuffled order that is never already solved.
function shuffledTiles(count) {
  const order = Array.from({ length: count }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  if (isSolved(order)) [order[0], order[1]] = [order[1], order[0]]
  return order
}

// What a piece looks like: its slice of the picture, or a banded token-coloured square.
function pieceStyle(puzzle, grid, piece) {
  const col = piece % grid.cols
  const row = Math.floor(piece / grid.cols)
  if (!puzzle.image) return { className: TONES[puzzle.bands[Math.floor((row / grid.rows) * puzzle.bands.length)]] }
  return {
    className: '',
    style: {
      backgroundImage: `url(${puzzle.image})`,
      backgroundPosition: `${grid.cols > 1 ? (col / (grid.cols - 1)) * 100 : 0}% ${grid.rows > 1 ? (row / (grid.rows - 1)) * 100 : 0}%`,
      backgroundSize: `${grid.cols * 100}% ${grid.rows * 100}%`,
    },
  }
}

export function PicturePuzzle({ onBack, onEngagement, headingRef }) {
  const session = useGameSession(onEngagement)
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [grid, setGrid] = useState(GRID_OPTIONS[0])
  const [tiles, setTiles] = useState(() => shuffledTiles(GRID_OPTIONS[0].cols * GRID_OPTIONS[0].rows))
  const [selected, setSelected] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [message, setMessage] = useState('')
  const tileRefs = useRef([])

  const puzzle = PUZZLES[puzzleIndex]
  const completed = isSolved(tiles)
  const inPlace = tiles.filter((piece, slot) => piece === slot).length

  function restart(nextGrid = grid, nextPuzzleIndex = puzzleIndex) {
    setPuzzleIndex(nextPuzzleIndex)
    setGrid(nextGrid)
    setTiles(shuffledTiles(nextGrid.cols * nextGrid.rows))
    setSelected(null)
    setShowPreview(false)
    setMessage('')
    session.start()
  }

  function handleTile(slot) {
    if (completed) return
    if (selected === null) {
      setSelected(slot)
      setMessage('Now tap another piece to swap them.')
      return
    }
    if (selected === slot) {
      setSelected(null)
      setMessage('')
      return
    }
    const updated = [...tiles]
    ;[updated[selected], updated[slot]] = [updated[slot], updated[selected]]
    setTiles(updated)
    setSelected(null)
    if (isSolved(updated)) {
      playCelebrationChime()
      setMessage('Wonderful! You put the picture together.')
      session.reportCompleted('Played Picture Puzzle')
    } else {
      playGentleChime()
      setMessage('')
    }
  }

  // Arrow keys move between pieces so the whole board works from a keyboard.
  function handleKeyDown(event, slot) {
    const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -grid.cols, ArrowDown: grid.cols }
    if (!(event.key in deltas)) return
    const col = slot % grid.cols
    if ((event.key === 'ArrowLeft' && col === 0) || (event.key === 'ArrowRight' && col === grid.cols - 1)) return
    const target = slot + deltas[event.key]
    if (target < 0 || target >= tiles.length) return
    event.preventDefault()
    tileRefs.current[target]?.focus()
  }

  const instruction = completed
    ? 'Every piece is in its place. Well done!'
    : selected !== null
      ? 'Now tap another piece to swap them.'
      : 'Tap a piece to pick it up, then tap another piece to swap them.'

  return (
    <GameFrame label="Picture Puzzle">
      <GameHeader
        title="Picture Puzzle"
        intro="Put the pieces back together. Tap two pieces to swap their places."
        onBack={onBack}
        headingRef={headingRef}
      />

      <div className="flex flex-col gap-4">
        <ChoicePills
          label="Which picture?"
          options={PUZZLE_OPTIONS}
          value={puzzle.id}
          onChange={(option) => restart(grid, PUZZLES.findIndex((p) => p.id === option.id))}
        />
        <ChoicePills
          label="How many pieces?"
          options={GRID_OPTIONS}
          value={grid.id}
          onChange={(option) => restart(option)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <GameButton variant="secondary" aria-pressed={showPreview} onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Hide the full picture' : 'Show the full picture'}
          </GameButton>
          <SoundToggle />
        </div>
      </div>

      {showPreview && (
        <div
          role="img"
          aria-label={`The finished picture: ${puzzle.title}. ${puzzle.description}`}
          className="mx-auto grid aspect-[4/3] w-full max-w-sm overflow-hidden rounded-lg"
          style={{
            gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
            gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
          }}
        >
          {tiles.map((_, piece) => {
            const look = pieceStyle(puzzle, grid, piece)
            return <span key={piece} className={look.className} style={look.style} />
          })}
        </div>
      )}

      <GameMessage>{message}</GameMessage>
      <p className="-mt-4 text-body text-on-deep-soft">
        {instruction} {!completed && inPlace > 0 ? `${inPlace} in place so far.` : ''}
      </p>

      <div
        role="group"
        aria-label={`${puzzle.title} puzzle, ${tiles.length} pieces`}
        className="mx-auto grid aspect-[4/3] w-full max-w-2xl gap-1"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        }}
      >
        {tiles.map((piece, slot) => {
          const isSelected = selected === slot
          const inRightPlace = piece === slot
          const look = pieceStyle(puzzle, grid, piece)
          return (
            <button
              key={slot}
              ref={(el) => (tileRefs.current[slot] = el)}
              type="button"
              onClick={() => handleTile(slot)}
              onKeyDown={(event) => handleKeyDown(event, slot)}
              aria-pressed={isSelected}
              aria-label={`Piece ${piece + 1}, in place ${slot + 1}${inRightPlace ? ', in the right place' : ''}${isSelected ? ', picked up' : ''}`}
              className={`relative min-h-touch-lg cursor-pointer overflow-hidden rounded-md transition-colors duration-quick ease-gentle motion-reduce:transition-none ${look.className} ${
                isSelected ? 'outline-4 outline-offset-2 outline-sunken' : ''
              }`}
              style={look.style}
            >
              {!puzzle.image && (
                <span className="font-heading text-title font-bold text-ink">{piece + 1}</span>
              )}
              {isSelected && (
                <span className="absolute bottom-1 left-1 rounded-full bg-sunken px-2 text-caption font-semibold text-ink">
                  Picked up
                </span>
              )}
              {inRightPlace && !completed && (
                <span className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-gentle text-on-gentle">
                  <Icon name="check" className="size-4" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {completed && (
        <div className="flex flex-col gap-4 rounded-xl bg-accent p-gutter">
          <h2 className="text-title font-bold text-on-deep">Wonderful! The picture is together.</h2>
          <p className="text-lead text-on-deep-soft">
            {puzzle.title} is complete with {tiles.length} pieces.
          </p>
          <div className="flex flex-wrap gap-3">
            <GameButton onClick={() => restart()}>Play again</GameButton>
            {puzzleIndex < PUZZLES.length - 1 && (
              <GameButton variant="secondary" onClick={() => restart(grid, puzzleIndex + 1)}>
                Next picture
                <Icon name="forward" className="size-5" />
              </GameButton>
            )}
            {onBack && (
              <GameButton variant="quiet" onClick={onBack}>
                Done for now
              </GameButton>
            )}
          </div>
        </div>
      )}
    </GameFrame>
  )
}
