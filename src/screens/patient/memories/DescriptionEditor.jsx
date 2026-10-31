import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { LIMITS } from './memoryContent'

// The saved description with separate view and edit modes.
// `onSave(text)` and `onRestore()` return promises; `onEditingChange(bool)` lets the page
// stop reading aloud while the text is being changed.
export function DescriptionEditor({ text, edited, onSave, onRestore, onEditingChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const textareaRef = useRef(null)
  const editRef = useRef(null)

  useEffect(() => {
    if (editing) textareaRef.current?.focus()
  }, [editing])

  function setMode(next) {
    setEditing(next)
    onEditingChange?.(next)
    if (!next) requestAnimationFrame(() => editRef.current?.focus())
  }

  function startEditing() {
    setDraft(text)
    setError('')
    setNotice('')
    setMode(true)
  }

  function cancel() {
    setError('')
    setMode(false)
  }

  async function save() {
    setBusy(true)
    setError('')
    try {
      await onSave(draft)
      setNotice('Description saved.')
      setMode(false)
    } catch (failure) {
      setError(failure.message)
    }
    setBusy(false)
  }

  async function restore() {
    setBusy(true)
    setError('')
    try {
      await onRestore()
      setNotice('Original description restored.')
    } catch (failure) {
      setError(failure.message)
    }
    setBusy(false)
  }

  const trimmed = draft.trim()
  const canSave = trimmed.length > 0 && trimmed !== text.trim() && !busy

  if (editing) {
    return (
      <div>
        <label htmlFor="memory-description" className="block text-body font-semibold">
          Write about this memory
        </label>
        <textarea
          id="memory-description"
          ref={textareaRef}
          value={draft}
          rows={8}
          maxLength={LIMITS.maxDescriptionLength}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') cancel()
          }}
          className="mt-2 w-full resize-y rounded-lg border-2 border-line-strong bg-surface p-4 text-lead leading-relaxed text-ink"
        />
        <p className="mt-1 text-caption text-ink-soft">
          {draft.length} of {LIMITS.maxDescriptionLength} characters
        </p>
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-sunken p-3 text-body font-semibold">
            {error}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="secondary" size="sm" onClick={cancel} disabled={busy}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={!canSave}>
            <Icon name="check" className="size-5" />
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="max-w-prose text-lead leading-relaxed">{text}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button ref={editRef} variant="secondary" size="sm" onClick={startEditing} disabled={busy}>
          <Icon name="edit" className="size-5" />
          Edit description
        </Button>
        {edited && (
          <Button variant="quiet" size="sm" onClick={restore} disabled={busy}>
            Restore original text
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-sunken p-3 text-body font-semibold">
          {error}
        </p>
      )}
      <p role="status" className="mt-3 min-h-6 text-body font-semibold text-gentle-ink">
        {notice}
      </p>
    </div>
  )
}
