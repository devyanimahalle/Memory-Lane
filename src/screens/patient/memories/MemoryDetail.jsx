import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { NarrationPlayer } from './NarrationPlayer'

function PhotoViewer({ photos }) {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()
  const photo = photos[index]
  const count = photos.length

  return (
    <div>
      <figure>
        <div className="overflow-hidden rounded-xl bg-tint-sky">
          <motion.img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            className="aspect-[4/3] w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          />
        </div>
        <figcaption className="mt-3 text-lead font-semibold">
          {photo.caption}
          <span className="block text-body font-medium text-ink-soft">
            Photo {index + 1} of {count}
          </span>
        </figcaption>
      </figure>

      <ul className="mt-4 flex gap-3">
        {photos.map((item, i) => (
          <li key={item.src}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}: ${item.alt}`}
              aria-current={i === index ? 'true' : undefined}
              className={`block h-16 w-20 cursor-pointer overflow-hidden rounded-lg ${
                i === index ? 'ring-4 ring-accent' : 'ring-1 ring-line-strong'
              }`}
            >
              <img src={item.src} alt="" className="size-full object-cover" />
            </button>
          </li>
        ))}
      </ul>

      {count > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIndex((index + count - 1) % count)}
          >
            <Icon name="back" className="size-5" />
            Previous photo
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIndex((index + 1) % count)}>
            Next photo
            <Icon name="forward" className="size-5" />
          </Button>
        </div>
      )}
    </div>
  )
}

// Dedicated full-page view for one memory: photos, written description, optional narration.
export function MemoryDetail({ memory, onBack, headingRef }) {
  return (
    <article className="flex flex-col gap-gutter">
      <Button variant="secondary" onClick={onBack} className="w-fit">
        <Icon name="back" className="size-6" />
        Back to home
      </Button>

      <header>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-4xl leading-tight font-bold md:text-display"
        >
          {memory.title}
        </h1>
        <p className="mt-2 text-lead text-ink-soft">
          {memory.when}. {memory.people}.
        </p>
      </header>

      <div className="grid gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PhotoViewer key={memory.id} photos={memory.photos} />
        </div>
        <section
          aria-labelledby="memory-about"
          className="rounded-xl border border-line bg-surface p-6 lg:col-span-5 lg:self-start"
        >
          <h2 id="memory-about" className="text-lead font-bold text-accent">
            About this memory
          </h2>
          <p className="mt-3 max-w-prose text-lead leading-relaxed">{memory.description}</p>
          <NarrationPlayer key={memory.id} text={memory.description} audio={memory.audio} />
        </section>
      </div>
    </article>
  )
}
