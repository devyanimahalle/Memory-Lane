import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../../../ui/icons'
import { matchingItems } from '../../activityData'
import { ChoicePills, GameButton, GameFrame, GameHeader, GameMessage, SoundToggle } from '../../GameBits'
import { playCardFlip, playCelebrationChime, playGentleChime } from '../../soundEffects'
import { shuffle } from '../../tones'
import { useGameSession } from '../../useGameSession'

// Gameplay is the original Matching Pairs from the activities module (deal, flip two, keep matches,
// a mismatch turns back after about a second, and tapping again turns it back at once).
const CARD_OPTIONS = [
  { id: '4', label: '4 cards', pairs: 2, grid: 'grid-cols-2', maxWidth: 380 },
  { id: '8', label: '8 cards', pairs: 4, grid: 'grid-cols-2 sm:grid-cols-4', maxWidth: 640 },
  { id: '12', label: '12 cards', pairs: 6, grid: 'grid-cols-3 sm:grid-cols-4', maxWidth: 760 },
  { id: '16', label: '16 cards', pairs: 8, grid: 'grid-cols-4', maxWidth: 840 },
]

const MISMATCH_MS = 1100

function dealDeck(pairCount) {
  const chosen = shuffle(matchingItems).slice(0, pairCount)
  return shuffle(
    [...chosen, ...chosen].map((item, index) => ({ ...item, cardId: `${item.id}-${index}` })),
  )
}

function CardFace({ card, compact }) {
  return (
    <span className="flex size-full flex-col items-center justify-center gap-1 p-1">
      {card.image ? (
        <img src={card.image} alt="" className="min-h-0 flex-1 object-contain" />
      ) : null}
      <span
        className={`font-heading leading-tight font-bold break-words text-ink ${compact ? 'text-body sm:text-lead' : 'text-lead'}`}
      >
        {card.name}
      </span>
    </span>
  )
}

export function MatchingPairs({ onBack, onEngagement, headingRef }) {
  const session = useGameSession(onEngagement)
  const [option, setOption] = useState(CARD_OPTIONS[2])
  const [cards, setCards] = useState(() => dealDeck(CARD_OPTIONS[2].pairs))
  const [selected, setSelected] = useState([])
  const [matched, setMatched] = useState([])
  const [message, setMessage] = useState('Take your time. Tap a card to turn it over.')
  const mismatchTimer = useRef(null)

  useEffect(() => () => clearTimeout(mismatchTimer.current), [])

  const complete = matched.length === option.pairs

  function deal(pairCount) {
    clearTimeout(mismatchTimer.current)
    setCards(dealDeck(pairCount))
    setSelected([])
    setMatched([])
    setMessage('Take your time. Tap a card to turn it over.')
    session.start()
  }

  function changeOption(next) {
    setOption(next)
    deal(next.pairs)
  }

  function selectCard(card) {
    if (selected.includes(card.cardId) || matched.includes(card.id) || complete) return

    playCardFlip()

    // Two unmatched cards are showing: turn them back and start again with this card.
    if (selected.length >= 2) {
      clearTimeout(mismatchTimer.current)
      setSelected([card.cardId])
      setMessage('Tap a second card to find a match.')
      return
    }

    const next = [...selected, card.cardId]
    setSelected(next)
    if (next.length < 2) return

    const first = cards.find((item) => item.cardId === next[0])
    const second = cards.find((item) => item.cardId === next[1])

    if (first.id === second.id) {
      const nowMatched = [...matched, first.id]
      setMatched(nowMatched)
      setSelected([])
      if (nowMatched.length === option.pairs) {
        playCelebrationChime()
        setMessage('Beautifully done! You found all the matching pairs.')
        session.reportCompleted(`Played Matching Pairs (${option.label})`)
      } else {
        playGentleChime()
        setMessage(`Wonderful! You matched the ${first.name.toLowerCase()}.`)
      }
    } else {
      setMessage("That's okay. Let's try another one.")
      mismatchTimer.current = setTimeout(() => setSelected([]), MISMATCH_MS)
    }
  }

  const nextOption = CARD_OPTIONS[CARD_OPTIONS.findIndex((o) => o.id === option.id) + 1]

  return (
    <GameFrame label="Matching Pairs">
      <GameHeader
        title="Matching Pairs"
        intro="Tap a card to turn it over, then find the one that matches."
        onBack={onBack}
        headingRef={headingRef}
      />

      <div className="flex flex-col gap-4">
        <ChoicePills
          label="How many cards?"
          options={CARD_OPTIONS}
          value={option.id}
          onChange={changeOption}
        />
        <div className="flex flex-wrap items-center gap-3">
          <GameButton variant="secondary" onClick={() => deal(option.pairs)}>
            Deal new cards
          </GameButton>
          <SoundToggle />
        </div>
      </div>

      <GameMessage>{message}</GameMessage>
      {matched.length > 0 && !complete && (
        <p className="-mt-4 text-body text-on-deep-soft">
          {matched.length} {matched.length === 1 ? 'pair' : 'pairs'} found so far.
        </p>
      )}

      <ul
        className={`mx-auto grid w-full gap-3 ${option.grid}`}
        style={{ maxWidth: option.maxWidth }}
      >
        {cards.map((card) => {
          const isMatched = matched.includes(card.id)
          const revealed = isMatched || selected.includes(card.cardId)
          return (
            <li key={card.cardId}>
              <button
                type="button"
                onClick={() => selectCard(card)}
                aria-label={
                  isMatched
                    ? `${card.name}, matched`
                    : revealed
                      ? card.name
                      : 'Hidden card, tap to turn it over'
                }
                className={`relative aspect-square min-h-touch-lg w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-colors duration-quick ease-gentle motion-reduce:transition-none ${
                  isMatched
                    ? 'border-sunken bg-sunken'
                    : revealed
                      ? 'border-turquoise bg-surface'
                      : 'border-transparent bg-accent hover:border-turquoise'
                }`}
              >
                {revealed ? (
                  <CardFace card={card} compact={option.pairs === 8} />
                ) : (
                  <span className="flex size-full flex-col items-center justify-center gap-1 text-sunken">
                    <Icon name="games" className={option.pairs === 8 ? 'size-9 sm:size-8' : 'size-8'} />
                    {/* On the tightest phone grid (16 cards) the hint would be tiny, so the
                        instruction above the cards carries it and only screen readers get it here. */}
                    <span
                      className={`text-body font-semibold ${option.pairs === 8 ? 'sr-only sm:not-sr-only' : ''}`}
                    >
                      Tap to turn
                    </span>
                  </span>
                )}
                {isMatched && (
                  <span className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-gentle text-on-gentle">
                    <Icon name="check" className="size-4" />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {complete && (
        <div className="flex flex-col gap-4 rounded-xl bg-accent p-gutter">
          <h2 className="text-title font-bold text-on-deep">Wonderful! You matched them all.</h2>
          <p className="text-lead text-on-deep-soft">Thank you for taking this peaceful time.</p>
          <div className="flex flex-wrap gap-3">
            <GameButton onClick={() => deal(option.pairs)}>Play another round</GameButton>
            {nextOption && (
              <GameButton variant="secondary" onClick={() => changeOption(nextOption)}>
                Try more cards
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
