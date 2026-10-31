import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { DayLane } from './DayLane'
import { GreetingHeader } from './GreetingHeader'
import { NextUpCard } from './NextUpCard'
import { Button } from '../../ui/Button'
import { VoiceAssistant } from './VoiceAssistant'
import { GAME_COMPONENTS } from '../../features/activities'
import { getNextReminder, stopSpeaking, useReminders } from '../../features/reminders'
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
import { PATIENT } from './mockData'
import { MyTasks } from './tasks/MyTasks'
import { byTime, dateOf, iconFor, minutesOfDay, timeOf, todayString } from '../tasks/taskUi'
import { formatTime, useDemoClock } from './useDemoClock'

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

// Asks "Did you take it?" before a medicine task is marked taken.
function MedicineConfirm({ task, onYes, onNo }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (task && !dialog.open) dialog.showModal()
    if (!task && dialog.open) dialog.close()
  }, [task])
  return (
    <dialog
      ref={ref}
      onClose={onNo}
      aria-labelledby="medicine-confirm-title"
      className="m-auto w-[min(92vw,28rem)] rounded-xl border-0 bg-surface p-gutter text-ink shadow-raised backdrop:bg-ink/60"
    >
      <h2 id="medicine-confirm-title" className="text-title font-bold">
        Did you take it?
      </h2>
      <p className="mt-2 text-lead text-ink-soft">{task?.title}</p>
      <div className="mt-6 flex flex-col gap-3">
        <Button onClick={onYes}>Yes, I took it</Button>
        <Button variant="secondary" onClick={onNo}>
          Not yet
        </Button>
      </div>
    </dialog>
  )
}

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
  // The shared Reminders (the same tasks the caregiver manages) drive Next up and Today's lane.
  const { reminders, markTaken, snooze } = useReminders({
    onEngagement: (event) => recordEngagement(event, { source: 'reminders' }),
  })
  const [confirmMedicineId, setConfirmMedicineId] = useState(null)
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

  const todays = reminders.filter((r) => dateOf(r) === todayString()).sort(byTime)
  const laneItem = (r) => ({ id: r.id, time: timeOf(r), title: r.title, icon: iconFor(r), note: r.note, type: r.type })
  const nextReminder = getNextReminder(
    todays.map((r) => ({ ...r })),
    minutes,
  )
  const next = nextReminder ? laneItem(nextReminder) : undefined
  const stops = todays.map((r) => {
    let status = 'later'
    if (r.status === 'taken') status = 'done'
    else if (nextReminder && r.id === nextReminder.id) status = 'next'
    else if (r.status !== 'snoozed' && minutesOfDay(r) < minutes) status = 'still'
    return { item: laneItem(r), status }
  })
  const upcoming = todays.filter((r) => r.status === 'pending' && minutesOfDay(r) >= minutes)

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

  function finishTask(id) {
    markTaken(id)
    setConfirmMedicineId(null)
    setNotice({ kind: 'done', text: 'Lovely, that is done.' })
  }

  // Medicine is only marked taken after the person confirms it a second time.
  function handleDone() {
    if (next.type === 'medicine') setConfirmMedicineId(next.id)
    else finishTask(next.id)
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
      return `Coming up: ${coming.map((r) => `${r.title} at ${formatTime(timeOf(r))}`).join(', then ')}.`
    }
    if (id === 'done') {
      if (!next) return 'There is nothing waiting for you. Well done.'
      if (next.type === 'medicine') return 'Please tap Done on the card to confirm your medicine.'
      finishTask(next.id)
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
        <MyTasks minutes={minutes} onEngagement={(event) => recordEngagement(event, { source: 'reminders' })} />
      </Reveal>

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

      <MedicineConfirm
        task={confirmMedicineId ? todays.find((r) => r.id === confirmMedicineId) : null}
        onYes={() => finishTask(confirmMedicineId)}
        onNo={() => setConfirmMedicineId(null)}
      />
    </div>
  )
}
