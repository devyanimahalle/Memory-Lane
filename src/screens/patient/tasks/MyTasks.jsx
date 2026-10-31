import { useState } from 'react'
import { useReminders } from '../../../features/reminders'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { TaskDialog } from '../../tasks/TaskDialog'
import { TaskForm } from '../../tasks/TaskForm'
import { byTime, dateOf, statusOf, timeOf, todayString } from '../../tasks/taskUi'
import { formatTime } from '../useDemoClock'

const CHIP = {
  done: { text: 'Done', icon: 'check', cls: 'bg-gentle-soft text-gentle-ink' },
  snoozed: { text: 'Later', icon: 'clock', cls: 'bg-accent-soft text-accent-strong' },
  missed: { text: 'Still to do', icon: 'clock', cls: 'bg-sunken text-ink' },
  pending: { text: 'To do', icon: 'clock', cls: 'bg-sunken text-ink' },
}

function TaskRow({ task, status, confirm, setConfirm, onDone, onLater, onEdit, onDelete }) {
  const chip = CHIP[status]
  const done = status === 'done'
  const asking = confirm?.id === task.id ? confirm.kind : null

  return (
    <li className={`rounded-xl border border-line p-5 ${done ? 'bg-sunken' : 'bg-surface'}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-body font-bold text-accent-strong">
          {formatTime(timeOf(task))}
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-body font-bold ${chip.cls}`}>
          <Icon name={chip.icon} className="size-4" />
          {chip.text}
        </span>
        {task.type === 'medicine' && <span className="text-body font-semibold text-ink-soft">Medicine</span>}
      </div>
      <p className="mt-2 font-heading text-lead leading-snug font-bold">{task.title}</p>
      {task.note && <p className="mt-1 text-body text-ink-soft">{task.note}</p>}

      {asking === 'medicine' ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-lead font-semibold">Did you take it?</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                onDone(task.id)
                setConfirm(null)
              }}
            >
              Yes, I took it
            </Button>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Not yet
            </Button>
          </div>
        </div>
      ) : asking === 'delete' ? (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-lead font-semibold">Delete this task?</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                onDelete(task.id)
                setConfirm(null)
              }}
            >
              Yes, delete it
            </Button>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Keep it
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          {!done && (
            <Button size="sm" onClick={() => (task.type === 'medicine' ? setConfirm({ id: task.id, kind: 'medicine' }) : onDone(task.id))}>
              <Icon name="check" className="size-5" />
              I have done this
            </Button>
          )}
          {!done && status !== 'snoozed' && (
            <Button size="sm" variant="secondary" onClick={() => onLater(task.id)}>
              Remind me later
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => onEdit(task.id)}>
            <Icon name="edit" className="size-5" />
            Edit
          </Button>
          <Button size="sm" variant="quiet" onClick={() => setConfirm({ id: task.id, kind: 'delete' })}>
            <Icon name="trash" className="size-5" />
            Delete
          </Button>
        </div>
      )}
    </li>
  )
}

// "My daily tasks": today's tasks in time order. The patient can add, edit, finish, put off or delete
// a task. A task only becomes done after the patient taps it (medicine asks once more). The tasks are
// the same Reminders the caregiver manages; they are saved in this browser only.
export function MyTasks({ minutes, onEngagement }) {
  const { reminders, markTaken, snooze, add, update, remove } = useReminders({ onEngagement })
  const [editing, setEditing] = useState(null) // null | 'new' | a task id
  const [confirm, setConfirm] = useState(null) // { id, kind: 'delete' | 'medicine' }
  const today = todayString()

  const todays = reminders.filter((r) => dateOf(r) === today).sort(byTime)
  const todo = todays.filter((r) => r.status !== 'taken')
  const finished = todays.filter((r) => r.status === 'taken')
  const editingTask = editing && editing !== 'new' ? reminders.find((r) => r.id === editing) : null

  function save(values) {
    const result = editing === 'new' ? add({ ...values, type: 'routine' }) : update(editing, values)
    if (result.ok) setEditing(null)
    return result
  }

  const rowProps = {
    confirm,
    setConfirm,
    onDone: markTaken,
    onLater: snooze,
    onEdit: setEditing,
    onDelete: remove,
  }

  return (
    <section id="tasks" aria-labelledby="tasks-title" className="scroll-mt-6">
      <h2 id="tasks-title" className="text-4xl leading-tight font-bold md:text-section">
        My daily tasks
      </h2>
      <p className="mt-2 max-w-prose text-lead text-ink-soft">
        Your tasks for today, in time order. Add your own, change them, or tick them off.
      </p>
      <div className="mt-4">
        <Button onClick={() => setEditing('new')}>
          <Icon name="forward" className="size-6" />
          Add a task
        </Button>
      </div>

      <h3 className="mt-6 text-title font-bold">To do</h3>
      {todo.length === 0 ? (
        <p className="mt-2 text-lead text-ink-soft">Nothing left to do today. Well done.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-4">
          {todo.map((task) => (
            <TaskRow key={task.id} task={task} status={statusOf(task, minutes, today)} {...rowProps} />
          ))}
        </ul>
      )}

      <h3 className="mt-8 text-title font-bold">Done</h3>
      {finished.length === 0 ? (
        <p className="mt-2 text-lead text-ink-soft">Nothing is ticked off yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-4">
          {finished.map((task) => (
            <TaskRow key={task.id} task={task} status="done" {...rowProps} />
          ))}
        </ul>
      )}

      <p className="mt-6 text-body text-ink-soft">
        Tasks are saved in this browser only. A caregiver page in this same browser shows the same
        tasks; they are not shared with other devices or people.
      </p>

      <TaskDialog open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add a task' : 'Change this task'}>
        <TaskForm
          key={editing ?? 'none'}
          mode="patient"
          initial={editingTask ?? undefined}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      </TaskDialog>
    </section>
  )
}
