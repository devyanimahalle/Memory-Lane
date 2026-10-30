import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { DayLane } from './DayLane'
import { GreetingHeader } from './GreetingHeader'
import { NextUpCard } from './NextUpCard'
import { VoiceAssistant } from './VoiceAssistant'
import { GamesSection } from './games/GamesSection'
import { GAMES } from './games/gameCards'
import { MemoryAlbumSection } from './memories/MemoryAlbumSection'
import { MemoryDetail } from './memories/MemoryDetail'
import { MEMORIES } from './memories/demoMemories'
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

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// Patient Home prototype. All data is mock (see mockData.js and memories/demoMemories.js).
// Voice is a UI-only mock; its command handler (`runCommand`) is the hook the
// real voice feature will call.
export function PatientHome() {
  const minutes = useDemoClock()
  const [date] = useState(() => DATE_FORMAT.format(new Date()))
  const [view, setView] = useState(() => (savedMemoryIndex() === null ? null : 'memory')) // null | 'memory'
  const [albumIndex, setAlbumIndex] = useState(() => savedMemoryIndex() ?? 0)
  const [albumRestored, setAlbumRestored] = useState(() => savedMemoryIndex() !== null)
  const [doneIds, setDoneIds] = useState(
    () =>
      new Set(
        SCHEDULE.filter((i) => parseTime(i.time) < minutes && !i.leftOpen).map((i) => i.id),
      ),
  )
  const [notice, setNotice] = useState(null)
  const [highlightId, setHighlightId] = useState(null)
  const headingRef = useRef(null)
  const openButtonRef = useRef(null)
  const shownView = useRef(null)
  const scrolledView = useRef(null)
  const homeScroll = useRef(0)

  const next = SCHEDULE.find((i) => !doneIds.has(i.id) && parseTime(i.time) >= minutes)
  const stops = SCHEDULE.map((item) => {
    let status = 'later'
    if (doneIds.has(item.id)) status = 'done'
    else if (item === next) status = 'next'
    else if (parseTime(item.time) < minutes) status = 'still'
    return { item, status }
  })

  // Scroll: a memory opens at the top; coming back restores the home scroll position.
  useLayoutEffect(() => {
    if (view === 'memory') window.scrollTo(0, 0)
    else if (scrolledView.current === 'memory') window.scrollTo(0, homeScroll.current)
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
    headingRef.current?.focus()
  }, [view])

  useEffect(() => {
    if (!highlightId) return
    const timer = setTimeout(() => setHighlightId(null), 5000)
    return () => clearTimeout(timer)
  }, [highlightId])

  // Browser or phone Back: leave the memory (and follow Forward back into it).
  useEffect(() => {
    function onPopState(event) {
      const index = event.state?.memoryIndex
      if (Number.isInteger(index) && MEMORIES[index]) {
        setAlbumIndex(index)
        setView('memory')
      } else {
        setView((current) => (current === 'memory' ? null : current))
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

  function handleDone() {
    setDoneIds((prev) => new Set(prev).add(next.id))
    setNotice({ kind: 'done', text: 'Lovely, that is done.' })
  }

  function handleLater() {
    setNotice({ kind: 'later', text: 'I will remind you again in 15 minutes.' })
  }

  // Leaves the current full-page view (if any), then runs `after` on the home page.
  function toHome(after) {
    if (view === 'memory') {
      closeMemory()
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

  // Integration point for the real game pages (not built yet): receives the chosen entry from
  // games/gameCards.js. Intentionally does nothing for now.
  function handleSelectGame(game) {
    void game
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
      const upcoming = SCHEDULE.filter(
        (i) => !doneIds.has(i.id) && parseTime(i.time) >= minutes,
      ).slice(0, 2)
      if (!upcoming.length) return 'You have nothing left for today.'
      return `Coming up: ${upcoming.map((i) => `${i.title} at ${formatTime(i.time)}`).join(', then ')}.`
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

  if (view === 'memory') {
    return (
      <div className="pb-28">
        <MemoryDetail memory={MEMORIES[albumIndex]} onBack={closeMemory} headingRef={headingRef} />
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
        <GamesSection games={GAMES} onSelect={handleSelectGame} />
      </Reveal>

      <Reveal index={4}>
        <MemoryAlbumSection
          memories={MEMORIES}
          index={albumIndex}
          restored={albumRestored}
          onIndexChange={setAlbumIndex}
          onOpen={openMemory}
          openButtonRef={openButtonRef}
        />
      </Reveal>
    </div>
  )
}
