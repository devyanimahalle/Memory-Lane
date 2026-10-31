import { useEffect, useRef } from 'react'
import { Button } from '../../../ui/Button'

// Inline "are you sure?" step (no pop-up). Focus starts on the safe choice, "Keep".
export function ConfirmRemove({ question, confirmLabel = 'Remove', onConfirm, onCancel }) {
  const keepRef = useRef(null)

  useEffect(() => {
    keepRef.current?.focus()
  }, [])

  return (
    <div role="group" aria-label={question} className="rounded-xl bg-sunken p-4">
      <p className="text-lead font-semibold">{question}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button ref={keepRef} variant="secondary" size="sm" onClick={onCancel}>
          Keep
        </Button>
        <Button size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}
