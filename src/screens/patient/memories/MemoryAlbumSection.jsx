import { lazy, Suspense, useRef, useState } from 'react'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'

const MemoryCarousel = lazy(() => import('./MemoryCarousel'))

let webgl2Supported
function hasWebGL2() {
  if (webgl2Supported !== undefined) return webgl2Supported
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    webgl2Supported = Boolean(gl)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webgl2Supported = false
  }
  return webgl2Supported
}

// Used when WebGL2 is unavailable: a plain scrolling row of real buttons.
function FallbackList({ memories, onOpen }) {
  return (
    <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
      {memories.map((memory, index) => (
        <li key={memory.id} className="w-64 shrink-0 snap-center">
          <button
            type="button"
            onClick={() => onOpen(index)}
            className="w-full cursor-pointer text-left"
          >
            <img
              src={memory.cover.src}
              alt={memory.cover.alt}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
            <span className="mt-2 block font-heading text-lead leading-snug font-bold">{memory.title}</span>
            <span className="block text-body text-ink-soft">{memory.when}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

// Full-width Memory Album at the bottom of Patient Home. Presentational: the memories,
// the current index and `onOpen` come from the parent so position survives navigation.
export function MemoryAlbumSection({
  memories,
  index,
  restored,
  onIndexChange,
  onOpen,
  openButtonRef,
}) {
  const controls = useRef(null)
  const [webgl] = useState(hasWebGL2)
  const current = memories[index] ?? memories[0]

  return (
    <section
      id="memory-album"
      aria-labelledby="album-title"
      className="scroll-mt-6 bg-sunken py-8 shadow-[0_0_0_100vmax_var(--color-sunken)] [clip-path:inset(0_-100vmax)] md:py-10"
    >
      <h2 id="album-title" className="text-4xl leading-tight font-bold md:text-section">
        Memory Album
      </h2>
      <p className="mt-2 max-w-prose text-lead text-ink-soft">
        {webgl
          ? 'Swipe through your memories, then open the one in the middle.'
          : 'Scroll across to see your memories, then choose one to open.'}
      </p>

      {webgl ? (
        <>
          <div className="mt-6 h-[24rem] sm:h-[30rem] lg:h-[36rem]">
            <Suspense fallback={<div className="h-full" aria-busy="true" />}>
              <MemoryCarousel
                memories={memories}
                initialIndex={index}
                restored={restored}
                controlRef={controls}
                onChange={onIndexChange}
                onSelect={onOpen}
              />
            </Suspense>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:justify-center">
            <Button variant="secondary" onClick={() => controls.current?.prev()}>
              <Icon name="back" className="size-6" />
              Previous
            </Button>
            <Button variant="secondary" onClick={() => controls.current?.next()}>
              Next
              <Icon name="forward" className="size-6" />
            </Button>
            <Button
              ref={openButtonRef}
              className="col-span-2 sm:col-span-1"
              onClick={() => onOpen(index)}
            >
              Open this memory
              <span className="sr-only">: {current.title}</span>
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <FallbackList memories={memories} onOpen={onOpen} />
        </div>
      )}
    </section>
  )
}
