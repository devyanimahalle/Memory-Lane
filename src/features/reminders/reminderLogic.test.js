import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getNextReminder, markTaken, matchVoiceCommand, snooze, toReminder } from './reminderLogic.js'

const today = new Date('2026-10-31T08:00:00')
const make = (id, time, type = 'routine', taken = false) =>
  toReminder({ id, type, title: `Item ${id}`, time, note: 'note' }, { today, taken })

test('toReminder follows the shared Reminder contract', () => {
  const r = make('a', '09:30', 'medicine')
  assert.deepEqual(Object.keys(r).sort(), ['completedAt', 'id', 'note', 'scheduledAt', 'status', 'title', 'type'])
  assert.equal(r.scheduledAt, '2026-10-31T09:30:00')
  assert.equal(r.status, 'pending')
  assert.equal(r.type, 'medicine')
})

test('markTaken confirms medicine and completes routines, with one contract-shaped event', () => {
  let n = 0
  const makeId = () => `e${++n}`
  const med = markTaken(make('m', '09:00', 'medicine'), new Date('2026-10-31T09:05:00Z'), makeId)
  assert.equal(med.reminder.status, 'taken')
  assert.equal(med.reminder.completedAt, '2026-10-31T09:05:00.000Z')
  assert.deepEqual(med.event, {
    id: 'e1',
    type: 'reminder',
    action: 'confirmed',
    label: 'Confirmed reminder: Item m',
    occurredAt: '2026-10-31T09:05:00.000Z',
    durationMinutes: 1,
  })
  const routine = markTaken(make('r', '10:00'), new Date(), makeId)
  assert.equal(routine.event.type, 'routine')
  assert.equal(routine.event.action, 'completed')
})

test('snooze keeps the reminder open and sends a viewed event', () => {
  const { reminder, event } = snooze(make('s', '13:30'), new Date('2026-10-31T10:00:00Z'), () => 'x')
  assert.equal(reminder.status, 'snoozed')
  assert.equal(reminder.completedAt, null)
  assert.equal(event.action, 'viewed')
  assert.equal(event.label, 'Snoozed reminder: Item s')
})

test('next reminder: earliest pending ahead of now, else earliest snoozed', () => {
  const list = [make('a', '09:00', 'routine', true), make('b', '11:00'), make('c', '13:00')]
  assert.equal(getNextReminder(list, 10 * 60 + 40).id, 'b')
  const afterSnooze = list.map((r) => (r.id === 'b' ? snooze(r).reminder : r))
  assert.equal(getNextReminder(afterSnooze, 10 * 60 + 40).id, 'c')
  const noPending = afterSnooze.map((r) => (r.id === 'c' ? markTaken(r).reminder : r))
  assert.equal(getNextReminder(noPending, 10 * 60 + 40).id, 'b')
  assert.equal(getNextReminder(noPending.map((r) => (r.id === 'b' ? markTaken(r).reminder : r)), 0), null)
})

test('voice commands match whole phrases only', () => {
  assert.equal(matchVoiceCommand("I've done this"), 'done')
  assert.equal(matchVoiceCommand('I am done.'), 'done')
  assert.equal(matchVoiceCommand('Remind me later!'), 'later')
  assert.equal(matchVoiceCommand('Read my reminders'), 'reminders')
  assert.equal(matchVoiceCommand('Stop'), 'stop')
  assert.equal(matchVoiceCommand("What's next?"), 'next')
  assert.equal(matchVoiceCommand('Show photos'), 'photos')
  assert.equal(matchVoiceCommand('Play a game'), 'games')
  assert.equal(matchVoiceCommand('yes'), 'unknown')
  assert.equal(matchVoiceCommand('done'), 'unknown')
  assert.equal(matchVoiceCommand(''), 'unknown')
})
