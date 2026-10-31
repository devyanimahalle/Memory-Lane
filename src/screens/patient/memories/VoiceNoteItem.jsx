import { useState } from 'react'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { AudioPlayer } from './AudioPlayer'
import { ConfirmRemove } from './ConfirmRemove'
import { formatSavedAt } from './memoryContent'

// One saved voice note: playback (play, pause) and delete with a confirmation step.
export function VoiceNoteItem({ note, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const saved = formatSavedAt(note.createdAt)

  async function remove() {
    try {
      await onDelete(note.id)
    } catch (failure) {
      setError(failure.message)
      setConfirming(false)
    }
  }

  return (
    <li className="rounded-xl border border-line bg-surface p-4">
      <p className="text-body font-semibold">Voice note, {saved}</p>
      <div className="mt-3">
        <AudioPlayer src={note.src} durationMs={note.durationMs} label={`voice note from ${saved}`} />
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-sunken p-3 text-body font-semibold">
          {error}
        </p>
      )}
      <div className="mt-3">
        {confirming ? (
          <ConfirmRemove
            question="Delete this voice note?"
            confirmLabel="Delete"
            onConfirm={remove}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <Button
            variant="quiet"
            size="sm"
            onClick={() => setConfirming(true)}
            aria-label={`Delete voice note from ${saved}`}
          >
            <Icon name="trash" className="size-5" />
            Delete
          </Button>
        )}
      </div>
    </li>
  )
}
