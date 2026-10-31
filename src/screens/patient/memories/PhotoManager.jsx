import { useRef, useState } from 'react'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { LIMITS } from './memoryContent'

// "Add photos" control. `onAdd(files)` resolves to { added, errors }.
export function PhotoManager({ onAdd, uploadedCount, buttonRef }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState([])
  const full = uploadedCount >= LIMITS.maxPhotosPerMemory

  async function handleChange(event) {
    const files = [...event.target.files]
    event.target.value = '' // lets the same file be chosen again later
    if (files.length === 0) return
    setBusy(true)
    setMessage('')
    setErrors([])
    const result = await onAdd(files)
    setBusy(false)
    setErrors(result.errors)
    if (result.added > 0) {
      setMessage(result.added === 1 ? '1 photo added.' : `${result.added} photos added.`)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        tabIndex={-1}
        aria-label="Choose photos to add to this memory"
        onChange={handleChange}
        className="sr-only"
      />
      <Button
        ref={buttonRef}
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={busy || full}
        aria-busy={busy}
      >
        <Icon name="camera" className="size-5" />
        {busy ? 'Adding photos…' : 'Add photos'}
      </Button>
      {full && (
        <p className="mt-2 text-body text-ink-soft">
          This memory has {LIMITS.maxPhotosPerMemory} added photos. Remove one to add more.
        </p>
      )}
      <p role="status" className="mt-2 min-h-6 text-body font-semibold text-gentle-ink">
        {message}
      </p>
      {errors.length > 0 && (
        <ul role="alert" className="mt-2 flex flex-col gap-2 rounded-lg bg-sunken p-3 text-body font-semibold">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
