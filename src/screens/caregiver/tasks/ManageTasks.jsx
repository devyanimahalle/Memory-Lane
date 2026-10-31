import { useState } from 'react'
import { useReminders } from '../../../features/reminders'
import { Icon } from '../../../ui/icons'
import { buildSeedReminders } from '../../patient/reminderSeed'
import { formatTime, useDemoClock } from '../../patient/useDemoClock'
import { TaskDialog } from '../../tasks/TaskDialog'
import { TaskForm } from '../../tasks/TaskForm'
import { byTime, dateOf, friendlyDay, statusOf, timeOf, todayString } from '../../tasks/taskUi'

const CHIP = {
  pending: { text: 'Pending', icon: 'clock', cls: 'bg-sunken text-ink' },
  done: { text: 'Completed', icon: 'check', cls: 'bg-gentle-soft text-gentle-ink' },
  snoozed: { text: 'Snoozed', icon: 'clock', cls: 'bg-accent-soft text-accent-strong' },
  missed: { text: 'Missed', icon: 'clock', cls: 'bg-attention-soft text-attention-ink' },
}

const WHEN = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

function Action({ tone = 'secondary', ...props }) {
  const tones = {
    primary: 'bg-accent text-on-accent hover:bg-accent-strong',
    secondary: 'border-2 border-accent bg-surface text-accent hover:bg-accent-soft',
    quiet: 'text-accent hover:bg-accent-soft',
  }
  return (
    <button
      type="button"
      className={`inline-flex min-h-touch cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-body font-semibold transition-colors duration-quick ease-gentle motion-reduce:transition-none ${tones[tone]}`}
      {...props}
    />
  )
}

// "Manage patient tasks" for the caregiver: every task in one list, with add, edit, delete (confirmed),
// a status summary and a completion history. These are the same Reminders the patient sees, saved in
// this browser only. The caregiver cannot mark a task done: only the patient can confirm a task
// (especially medicine).
export function ManageTasks() {
  const { reminders, add, update, remove, reset } = useReminders()
  const minutes = useDemoClock()
  const [editing, setEditing] = useState(null) // null | 'new' | a task id
  const [confirm, setConfirm] = useState(null) // { id, kind } | { kind: 'reset' }
  const today = todayString()

  const sorted = [...reminders].sort(byTime)
  const counts = { pending: 0, done: 0, snoozed: 0, missed: 0 }
  for (const r of reminders) counts[statusOf(r, minutes, today)] += 1
  const days = [...new Set(sorted.map(dateOf))]
  const history = reminders
    .filter((r) => r.status === 'taken' && r.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  const editingTask = editing && editing !== 'new' ? reminders.find((r) => r.id === editing) : null

  function save(values) {
    const result = editing === 'new' ? add(values) : update(editing, values)
    if (result.ok) setEditing(null)
    return result
  }

  return (
    <section id="tasks" aria-labelledby="tasks-title" className="scroll-mt-24">
      <h2 id="tasks-title" className="mb-4 text-title font-bold">
        Manage patient tasks
      </h2>
      <div className="relative overflow-hidden rounded-lg bg-surface p-gutter pt-[calc(var(--spacing-gutter)+0.25rem)] shadow-card">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent" />

        <ul className="flex flex-wrap gap-2" aria-label="Task summary">
          {Object.entries(CHIP).map(([key, chip]) => (
            <li key={key} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-body font-bold ${chip.cls}`}>
              <Icon name={chip.icon} className="size-4" />
              {chip.text}: {counts[key]}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <Action tone="primary" onClick={() => setEditing('new')}>
            Add a task for the patient
          </Action>
        </div>

        {days.length === 0 && <p className="mt-4 text-body text-ink-soft">There are no tasks yet.</p>}
        {days.map((day) => (
          <div key={day} className="mt-6">
            <h3 className="text-body font-bold">{friendlyDay(day, today)}</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {sorted
                .filter((r) => dateOf(r) === day)
                .map((task) => {
                  const chip = CHIP[statusOf(task, minutes, today)]
                  const asking = confirm?.id === task.id ? confirm.kind : null
                  return (
                    <li key={task.id} className="rounded-lg border border-line p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-body font-bold">{formatTime(timeOf(task))}</span>
                        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-caption font-bold text-accent-strong">
                          {task.type === 'medicine' ? 'Medicine' : 'Routine'}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-bold ${chip.cls}`}>
                          <Icon name={chip.icon} className="size-3.5" />
                          {chip.text}
                        </span>
                      </div>
                      <p className="mt-1 text-body font-semibold text-ink">{task.title}</p>
                      {task.note && <p className="text-body text-ink-soft">{task.note}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {asking === 'delete' ? (
                          <>
                            <span className="text-body font-semibold">Delete this task?</span>
                            <Action
                              tone="primary"
                              onClick={() => {
                                remove(task.id)
                                setConfirm(null)
                              }}
                            >
                              Yes, delete
                            </Action>
                            <Action onClick={() => setConfirm(null)}>Keep it</Action>
                          </>
                        ) : (
                          <>
                            <Action onClick={() => setEditing(task.id)}>
                              <Icon name="edit" className="size-4" />
                              Edit
                            </Action>
                            <Action tone="quiet" onClick={() => setConfirm({ id: task.id, kind: 'delete' })}>
                              <Icon name="trash" className="size-4" />
                              Delete
                            </Action>
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
            </ul>
          </div>
        ))}

        <div className="mt-6 border-t border-line pt-4">
          <h3 className="text-body font-bold">Completion history</h3>
          {history.length === 0 ? (
            <p className="mt-2 text-body text-ink-soft">Nothing has been completed yet.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1 text-body text-ink-soft">
              {history.map((r) => (
                <li key={r.id}>
                  {r.title}: completed {WHEN.format(new Date(r.completedAt))}.
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          {confirm?.kind === 'reset' ? (
            <>
              <span className="text-body font-semibold">Replace every task with the starting demo tasks?</span>
              <Action
                tone="primary"
                onClick={() => {
                  reset(buildSeedReminders())
                  setConfirm(null)
                }}
              >
                Yes, reset demo tasks
              </Action>
              <Action onClick={() => setConfirm(null)}>Keep my tasks</Action>
            </>
          ) : (
            <Action tone="quiet" onClick={() => setConfirm({ kind: 'reset' })}>
              Reset demo tasks
            </Action>
          )}
        </div>

        <p className="mt-3 text-caption text-ink-faint">
          Prototype: tasks are saved in this browser only. The patient page in this same browser shows
          the same tasks and updates live; changes are not synchronised with other devices or people.
          Only the patient can mark a task done.
        </p>
      </div>

      <TaskDialog open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add a task' : 'Edit task'}>
        <TaskForm
          key={editing ?? 'none'}
          mode="caregiver"
          initial={editingTask ?? undefined}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      </TaskDialog>
    </section>
  )
}
