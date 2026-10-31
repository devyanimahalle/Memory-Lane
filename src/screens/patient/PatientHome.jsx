import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { DayLane } from './DayLane'
import { GreetingHeader } from './GreetingHeader'
import { NextUpCard } from './NextUpCard'
import { VoiceAssistant } from './VoiceAssistant'
import { GAME_COMPONENTS } from '../../features/activities'
import { getNextReminder, minutesOf, stopSpeaking, toReminder, useReminders } from '../../features/reminders'
import { GamesSection } from './games/GamesSection'
import { GAMES } from './games/gameCards'
import { recordEngagement } from './games/engagementLog'
import { sosStore } from '../../app/sos/sosStore'
import { usePatientContext } from './sos/usePatientContext'
import { PatientLocationCard } from './location/PatientLocationCard'
import { MemoryAlbumSection } from './memories/MemoryAlbumSection'
import { MemoryDetail } from './memories/MemoryDetail'
import { MEMORIES } from './memories/demoMemories'
import { useMemoryCovers } from './memories/useMemoryCovers'
import { PATIENT, SCHEDULE } from './mockData'
import { formatTime, parseTime, useDemoClock } from './useDemoClock'

// Gentle entrance: fade and rise, staggered. Opacity only under reduced motion.
function Reveal({ index = 0, className = '', children }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

// An open memory is stored in the browser history, so the Back button and a reload both work.
function savedMemoryIndex() {
  const index = window.history.state?.memoryIndex
  return Number.isInteger(index) && MEMORIES[index] ? index : null
}

// An open game is stored in the browser history the same way, so Back and a reload both work.
function savedGameId() {
  const id = window.history.state?.gameId
  return typeof id === 'string' && GAME_COMPONENTS[id] ? id : null
}

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// Patient Home prototype. All data is mock (see mockData.js and memories/demoMemories.js).
// Voice is a UI-only mock; its command handler (`runCommand`) is the hook the
// real voice feature will call.
export function PatientHome() {
  const minutes = useDemoClock()
  const { memories, ready: coversReady } = useMemoryCovers(MEMORIES)
  const [date] = useState(() => DATE_FORMAT.format(new Date()))
  const [view, setView] = useState(() => {
    if (savedMemoryIndex() !== null) return 'memory'
    return savedGameId() === null ? null : 'game'
  }) // null | 'memory' | 'game'
  const [gameId, setGameId] = useState(savedGameId)
  const [albumIndex, setAlbumIndex] = useState(() => savedMemoryIndex() ?? 0)
  const [albumRestored, setAlbumRestored] = useState(() => savedMemoryIndex() !== null)
  // Reminders (shared contract) drive Next up and Today's lane. Items before the demo time start taken.
  const { reminders, markTaken, snooze } = useReminders(
    () =>
      SCHEDULE.map((item) =>
        toReminder(item, { taken: parseTime(item.time) < minutes && !item.leftOpen }),
      ),
    (event) => recordEngagement(event, { source: 'reminders' }),
  )
  const [notice, setNotice] = useState(null)
  const [highlightId, setHighlightId] = useState(null)
  const headingRef = useRef(null)
  const openButtonRef = useRef(null)
  const shownView = useRef(null)
  const scrolledView = useRef(null)
  const homeScroll = useRef(0)

  // For SOS: the patient's current place in the app (not a physical location).
  usePatientContext(
    view === 'game'
      ? (GAMES.find((g) => g.id === gameId)?.title ?? 'Games')
      : view === 'memory'
        ? `Memory detail: ${memories[albumIndex]?.title ?? 'Memory'}`
        : null,
  )

  const nextReminder = getNextReminder(reminders, minutes)
  const next = nextReminder ? SCHEDULE.find((i) => i.id === nextReminder.id) : undefined
  const stops = SCHEDULE.map((item) => {
    const reminder = reminders.find((r) => r.id === item.id)
    let status = 'later'
    if (reminder?.status === 'taken') status = 'done'
    else if (item === next) status = 'next'
    else if (reminder?.status !== 'snoozed' && minutesOf(reminder) < minutes) status = 'still'
    return { item, status }
  })
  const upcoming = reminders.filter((r) => r.status === 'pending' && minutesOf(r) >= minutes)

  // Scroll: a memory or a game opens at the top; coming back restores the home scroll position.
  useLayoutEffect(() => {
    if (view !== null) window.scrollTo(0, 0)
    else if (scrolledView.current !== null) window.scrollTo(0, homeScroll.current)
    scrolledView.current = view
  }, [view])

  // Focus: the new page heading, or the album's "Open this memory" button when coming back.
  useEffect(() => {
    if (shownView.current === view) return
    const leaving = shownView.current
    shownView.current = view
    if (view === null && leaving === 'memory') {
      openButtonRef.current?.focus({ preventScroll: true })
      return
    }
    if (view === null && leaving === 'game') {
      // Back on the gallery: focus the card that was opened.
      const cards = document.querySelectorAll('#games ul button')
      cards[GAMES.findIndex((g) => g.id === gameId)]?.focus({ preventScroll: true })
      return
    }
    headingRef.current?.focus()
  }, [view, gameId])

  useEffect(() => {
    if (!highlightId) return
    const timer = setTimeout(() => setHighlightId(null), 5000)
    return () => clearTimeout(timer)
  }, [highlightId])

  // Browser or phone Back: leave the memory or game (and follow Forward back into it).
  useEffect(() => {
    function onPopState(event) {
      if (sosStore.getState().current) return // an SOS is active: the page behind it must not move
      const index = event.state?.memoryIndex
      const id = event.state?.gameId
      if (Number.isInteger(index) && MEMORIES[index]) {
        setAlbumIndex(index)
        setView('memory')
      } else if (typeof id === 'string' && GAME_COMPONENTS[id]) {
        setGameId(id)
        setView('game')
      } else {
        setView(null)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function openMemory(index) {
    homeScroll.current = window.scrollY
    setAlbumIndex(index)
    setAlbumRestored(true)
    setView('memory')
    window.history.pushState({ memoryIndex: index }, '', `#memory-${MEMORIES[index].id}`)
  }

  function closeMemory() {
    if (savedMemoryIndex() !== null) window.history.back()
    else setView(null)
  }

  function openGame(game) {
    homeScroll.current = window.scrollY
    setGameId(game.id)
    setView('game')
    window.history.pushState({ gameId: game.id }, '', `#game-${game.id}`)
  }

  function closeGame() {
    if (savedGameId() !== null) window.history.back()
    else setView(null)
  }

  // Each game reports a finished round once; it is kept on this device (see games/engagementLog.js).
  function handleEngagement(event) {
    recordEngagement(event, { gameId })
  }

  function handleDone() {
    markTaken(next.id)
    setNotice({ kind: 'done', text: 'Lovely, that is done.' })
  }

  function handleLater() {
    snooze(next.id)
    setNotice({ kind: 'later', text: 'I will remind you again in 15 minutes.' })
  }

  // Leaves the current full-page view (if any), then runs `after` on the home page.
  function toHome(after) {
    if (view === 'memory') {
      closeMemory()
      setTimeout(after, 200)
    } else if (view === 'game') {
      closeGame()
      setTimeout(after, 200)
    } else {
      after()
    }
  }

  function scrollToAlbum() {
    document.getElementById('memory-album')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
    openButtonRef.current?.focus({ preventScroll: true })
  }

  function scrollToGames() {
    const section = document.getElementById('games')
    section?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
    section?.querySelector('button')?.focus({ preventScroll: true })
  }

  // Runs a voice (or on-screen chip) command and returns the reply to show.
  function runCommand(id) {
    if (id === 'next') {
      setNotice(null)
      if (!next) {
        setHighlightId('all-done')
        return 'That is everything for today. Well done.'
      }
      setHighlightId(next.id)
      return `Your next stop is ${next.title} at ${formatTime(next.time)}.`
    }
    if (id === 'reminders') {
      const coming = upcoming.slice(0, 2)
      if (!coming.length) return 'You have nothing left for today.'
      return `Coming up: ${coming.map((r) => `${r.title} at ${formatTime(minutesOf(r))}`).join(', then ')}.`
    }
    if (id === 'done') {
      if (!next) return 'There is nothing waiting for you. Well done.'
      markTaken(next.id)
      setNotice({ kind: 'done', text: 'Lovely, that is done.' })
      return `Lovely. ${next.title} is done.`
    }
    if (id === 'later') {
      if (!next) return 'There is nothing to put off.'
      snooze(next.id)
      setNotice({ kind: 'later', text: 'I will remind you again in 15 minutes.' })
      return `Of course. I will remind you about ${next.title} later.`
    }
    if (id === 'stop') {
      stopSpeaking()
      return 'Stopped.'
    }
    if (id === 'photos') {
      toHome(scrollToAlbum)
      return 'Here are your memories.'
    }
    if (id === 'games') {
      toHome(scrollToGames)
      return 'Here are your games.'
    }
    return 'I did not catch that. Please try again.'
  }

  if (view === 'game') {
    const Game = GAME_COMPONENTS[gameId]
    return (
      <div className="pb-28">
        <Game
          key={gameId}
          onBack={closeGame}
          onEngagement={handleEngagement}
          headingRef={headingRef}
        />
        <VoiceAssistant variant="bar" tone="dark" onCommand={runCommand} />
      </div>
    )
  }

  if (view === 'memory') {
    return (
      <div className="pb-28">
        <MemoryDetail memory={memories[albumIndex]} onBack={closeMemory} headingRef={headingRef} />
        <VoiceAssistant variant="bar" onCommand={runCommand} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-gutter-lg">
      <Reveal>
        <GreetingHeader
          name={PATIENT.name}
          minutes={minutes}
          date={date}
          headingRef={headingRef}
        />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-gutter">
        <div className="contents lg:col-span-7 lg:flex lg:flex-col lg:gap-gutter">
          <Reveal index={1} className="order-1">
            <NextUpCard
              item={next}
              notice={notice}
              highlighted={highlightId === (next ? next.id : 'all-done')}
              onDone={handleDone}
              onLater={handleLater}
            />
          </Reveal>
          <Reveal index={2} className="order-3">
            <DayLane stops={stops} highlightId={highlightId} />
          </Reveal>
        </div>

        <aside className="contents lg:sticky lg:top-6 lg:col-span-5 lg:flex lg:flex-col lg:gap-gutter lg:self-start">
          <VoiceAssistant onCommand={runCommand} />
        </aside>
      </div>

      <Reveal index={3}>
        <GamesSection games={GAMES} onSelect={openGame} />
      </Reveal>

      <Reveal index={4}>
        {coversReady ? (
          <MemoryAlbumSection
            memories={memories}
            index={albumIndex}
            restored={albumRestored}
            onIndexChange={setAlbumIndex}
            onOpen={openMemory}
            openButtonRef={openButtonRef}
          />
        ) : (
          <div id="memory-album" aria-busy="true" className="min-h-[40rem]" />
        )}
      </Reveal>

      <Reveal index={5}>
        <PatientLocationCard />
      </Reveal>
    </div>
  )
}
