import { useRef } from 'react'
import { VoiceNoteItem } from './VoiceNoteItem'
import { VoiceRecorder } from './VoiceRecorder'

// "Voice notes" card: record a new note and play or delete the saved ones.
export function VoiceNotes({ notes, onSave, onDelete }) {
  const headingRef = useRef(null)
  const newestFirst = [...notes].reverse()

  async function handleDelete(id) {
    await onDelete(id)
    headingRef.current?.focus()
  }

  return (
    <section
      aria-labelledby="voice-notes-title"
      className="rounded-xl border border-line bg-surface p-6"
    >
      <h2
        id="voice-notes-title"
        ref={headingRef}
        tabIndex={-1}
        className="text-lead font-bold text-accent"
      >
        Voice notes
      </h2>
      <p className="mt-1 text-body text-ink-soft">Add your own words to this memory.</p>

      <div className="mt-4">
        <VoiceRecorder onSave={onSave} />
      </div>

      {newestFirst.length === 0 ? (
        <p className="mt-5 text-body text-ink-soft">No voice notes yet.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4" aria-label="Saved voice notes">
          {newestFirst.map((note) => (
            <VoiceNoteItem key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </section>
  )
}
