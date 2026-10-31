import { useId, useState } from 'react'
import { Button } from '../../ui/Button'
import { dateOf, timeOf, todayString, toScheduledAt } from './taskUi'

const FIELD =
  'mt-1 block min-h-touch-lg w-full rounded-lg border-2 border-line-strong bg-surface px-4 text-lead text-ink'

// The task form. Patient mode is short: name, details, time (today, routine). Caregiver mode adds the
// type (medicine or routine) and the date. `onSave(values)` returns { ok: true } or { ok: false, error }.
export function TaskForm({ mode, initial, onSave, onCancel }) {
  const id = useId()
  const caregiver = mode === 'caregiver'
  const [title, setTitle] = useState(initial?.title ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [time, setTime] = useState(initial ? timeOf(initial) : '09:00')
  const [date, setDate] = useState(initial ? dateOf(initial) : todayString())
  const [type, setType] = useState(initial?.type ?? 'routine')
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    const result = onSave({ title, note, type, scheduledAt: toScheduledAt(caregiver ? date : (initial ? dateOf(initial) : todayString()), time) })
    if (!result.ok) setError(result.error)
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor={`${id}-title`} className="text-lead font-semibold">
          What is the task?
        </label>
        <input
          id={`${id}-title`}
          className={FIELD}
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
          autoComplete="off"
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      <div>
        <label htmlFor={`${id}-note`} className="text-lead font-semibold">
          Details (optional)
        </label>
        <input
          id={`${id}-note`}
          className={FIELD}
          value={note}
          maxLength={200}
          onChange={(e) => setNote(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className={caregiver ? 'grid gap-4 sm:grid-cols-2' : ''}>
        {caregiver && (
          <div>
            <label htmlFor={`${id}-date`} className="text-lead font-semibold">
              Date
            </label>
            <input id={`${id}-date`} type="date" className={FIELD} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        )}
        <div>
          <label htmlFor={`${id}-time`} className="text-lead font-semibold">
            Time
          </label>
          <input id={`${id}-time`} type="time" className={FIELD} value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      {caregiver && (
        <fieldset>
          <legend className="text-lead font-semibold">Type</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {[
              ['routine', 'Routine'],
              ['medicine', 'Medicine'],
            ].map(([value, label]) => (
              <label
                key={value}
                className={`inline-flex min-h-touch-lg cursor-pointer items-center gap-2 rounded-full border-2 px-5 text-lead font-semibold ${
                  type === value ? 'border-accent bg-accent text-on-accent' : 'border-line-strong bg-surface text-ink'
                }`}
              >
                <input type="radio" name={`${id}-type`} value={value} checked={type === value} onChange={() => setType(value)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-lead font-semibold text-attention-ink">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit">Save task</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
