import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { ConfirmRemove } from './ConfirmRemove'
import { DescriptionEditor } from './DescriptionEditor'
import { DescriptionSpeech } from './DescriptionSpeech'
import { PhotoManager } from './PhotoManager'
import { VoiceNotes } from './VoiceNotes'
import { useMemoryContent } from './useMemoryContent'

function PhotoViewer({ photos, uploadedCount, onAdd, onRemove }) {
  const [index, setIndex] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const reduceMotion = useReducedMotion()
  const figureRef = useRef(null)
  const addRef = useRef(null)
  const count = photos.length
  const current = Math.min(index, Math.max(count - 1, 0))
  const photo = photos[current]

  async function handleAdd(files) {
    const result = await onAdd(files)
    if (result.added > 0) setIndex(Number.MAX_SAFE_INTEGER) // clamps to the newest photo
    return result
  }

  async function handleRemove() {
    setError('')
    try {
      await onRemove(photo)
      setConfirming(false)
      setNotice('Photo removed.')
      requestAnimationFrame(() => (figureRef.current ?? addRef.current)?.focus())
    } catch (failure) {
      setError(failure.message)
      setConfirming(false)
    }
  }

  return (
    <div>
      {photo ? (
        <figure ref={figureRef} tabIndex={-1} className="outline-offset-4">
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
              Photo {current + 1} of {count}
            </span>
          </figcaption>
        </figure>
      ) : (
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl bg-tint-sky p-6 text-center">
          <Icon name="camera" className="size-10 text-accent" />
          <p className="text-lead font-semibold">No photos yet.</p>
          <p className="text-body text-ink-soft">Add your first photo below.</p>
        </div>
      )}

      {count > 0 && (
        <ul className="mt-4 flex flex-wrap gap-3">
          {photos.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setIndex(i)
                  setConfirming(false)
                }}
                aria-label={`Show photo ${i + 1}: ${item.alt}`}
                aria-current={i === current ? 'true' : undefined}
                className={`block h-16 w-20 cursor-pointer overflow-hidden rounded-lg ${
                  i === current ? 'ring-4 ring-accent' : 'ring-1 ring-line-strong'
                }`}
              >
                <img src={item.src} alt="" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {count > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIndex((current + count - 1) % count)}
          >
            <Icon name="back" className="size-5" />
            Previous photo
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIndex((current + 1) % count)}>
            Next photo
            <Icon name="forward" className="size-5" />
          </Button>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-start gap-3">
          <PhotoManager onAdd={handleAdd} uploadedCount={uploadedCount} buttonRef={addRef} />
          {photo && !confirming && (
            <Button variant="secondary" size="sm" onClick={() => setConfirming(true)}>
              <Icon name="trash" className="size-5" />
              Remove this photo
            </Button>
          )}
        </div>
        {confirming && (
          <ConfirmRemove
            question="Remove this photo from the memory?"
            onConfirm={handleRemove}
            onCancel={() => setConfirming(false)}
          />
        )}
        {error && (
          <p role="alert" className="rounded-lg bg-sunken p-3 text-body font-semibold">
            {error}
          </p>
        )}
        <p role="status" className="sr-only">
          {notice}
        </p>
      </div>
    </div>
  )
}

// Dedicated full-page view for one memory: photos, an editable description that can be read
// aloud, and voice notes. Everything the user adds is saved on this device against `memory.id`.
export function MemoryDetail({ memory, onBack, headingRef }) {
  const content = useMemoryContent(memory)
  const [editing, setEditing] = useState(false)

  return (
    <article className="flex flex-col gap-gutter" aria-busy={content.status === 'loading'}>
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

      {content.status === 'ready' && !content.persistent && (
        <p role="status" className="rounded-xl bg-sunken p-4 text-body font-semibold">
          This browser cannot save changes, so anything you add will be lost when you close the page.
        </p>
      )}
      {content.status === 'error' && (
        <p role="status" className="rounded-xl bg-sunken p-4 text-body font-semibold">
          Your saved photos and notes could not be loaded just now. Showing the original memory.
        </p>
      )}

      {content.status === 'loading' ? (
        <div className="grid gap-gutter lg:grid-cols-12">
          <div className="aspect-[4/3] rounded-xl bg-tint-sky lg:col-span-7" />
          <div className="h-64 rounded-xl bg-sunken lg:col-span-5" />
        </div>
      ) : (
        <div className="grid gap-gutter lg:grid-cols-12">
          <div className="lg:col-span-7">
            <PhotoViewer
              key={memory.id}
              photos={content.photos}
              uploadedCount={content.uploadedCount}
              onAdd={content.addPhotos}
              onRemove={content.removePhoto}
            />
          </div>

          <div className="flex flex-col gap-gutter lg:col-span-5 lg:self-start">
            <section
              aria-labelledby="memory-about"
              className="rounded-xl border border-line bg-surface p-6"
            >
              <h2 id="memory-about" className="text-lead font-bold text-accent">
                About this memory
              </h2>
              <div className="mt-3">
                <DescriptionEditor
                  key={memory.id}
                  text={content.description}
                  edited={content.descriptionEdited}
                  onSave={content.saveDescription}
                  onRestore={content.restoreDescription}
                  onEditingChange={setEditing}
                />
              </div>
              <DescriptionSpeech
                key={`${content.description}|${editing}`}
                text={content.description}
                disabled={editing}
              />
            </section>

            <VoiceNotes
              notes={content.notes}
              onSave={content.addVoiceNote}
              onDelete={content.removeVoiceNote}
            />

            <p className="text-caption text-ink-soft">
              Photos, words and voice notes you add are saved on this device only.
            </p>
          </div>
        </div>
      )}
    </article>
  )
}
