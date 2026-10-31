import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRemindersStore } from './remindersStore.js'
import { toReminder } from './reminderLogic.js'

const memoryStorage = () => {
  const data = new Map()
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) }
}
const make = (options = {}) => {
  let n = 0
  return createRemindersStore({
    storage: memoryStorage(),
    makeId: () => `id${++n}`,
    now: () => new Date('2026-10-31T09:05:00Z'),
    ...options,
  })
}
const seed = [
  toReminder({ id: 'a', type: 'medicine', title: 'Morning tablets', time: '08:00', note: '' }, { today: new Date('2026-10-31T00:00:00') }),
  toReminder({ id: 'b', type: 'routine', title: 'Walk', time: '11:00', note: 'Take your time' }, { today: new Date('2026-10-31T00:00:00') }),
]

test('add creates one pending reminder in the shared contract shape', () => {
  const store = make()
  const result = store.add({ title: '  Water  ', note: 'A glass', type: 'routine', scheduledAt: '2026-10-31T10:00:00' })
  assert.equal(result.ok, true)
  assert.deepEqual(result.reminder, {
    id: 'id1', status: 'pending', completedAt: null, title: 'Water', note: 'A glass', type: 'routine', scheduledAt: '2026-10-31T10:00:00',
  })
  assert.equal(store.getState().length, 1)
})

test('add rejects empty names, bad types and bad times', () => {
  const store = make()
  assert.equal(store.add({ title: '   ', type: 'routine', scheduledAt: '2026-10-31T10:00:00' }).ok, false)
  assert.equal(store.add({ title: 'x', type: 'other', scheduledAt: '2026-10-31T10:00:00' }).ok, false)
  assert.equal(store.add({ title: 'x', type: 'routine', scheduledAt: 'nope' }).ok, false)
  assert.equal(store.getState().length, 0)
})

test('editing changes details only: no copy, no status change, no event', () => {
  const store = make()
  store.reset(seed)
  const taken = store.markTaken('a')
  assert.equal(taken.reminder.status, 'taken')
  const result = store.update('a', { title: 'Morning medicine', note: 'With water', scheduledAt: '2026-10-31T08:30:00', status: 'pending', id: 'zzz', completedAt: null })
  assert.equal(result.ok, true)
  const after = store.getState()
  assert.equal(after.length, 2)
  assert.equal(after[0].id, 'a')
  assert.equal(after[0].title, 'Morning medicine')
  assert.equal(after[0].scheduledAt, '2026-10-31T08:30:00')
  assert.equal(after[0].status, 'taken') // not undone by an edit
  assert.equal(after[0].completedAt, taken.reminder.completedAt)
  assert.equal(store.update('missing', { title: 'x' }).ok, false)
  assert.equal(store.update('b', { title: '' }).ok, false)
})

test('medicine is only taken through an explicit markTaken, once, with one event', () => {
  const store = make()
  store.reset(seed.map((r) => ({ ...r, status: 'pending', completedAt: null })))
  assert.equal(store.getState().find((r) => r.id === 'a').status, 'pending') // nothing marks it by itself
  const first = store.markTaken('a')
  assert.equal(first.event.action, 'confirmed')
  assert.equal(first.event.type, 'reminder')
  assert.equal(store.markTaken('a'), null) // a repeated tap makes no second event
})

test('snooze keeps the task open; a taken task cannot be snoozed', () => {
  const store = make()
  store.reset(seed.map((r) => ({ ...r, status: 'pending', completedAt: null })))
  const snoozed = store.snooze('b')
  assert.equal(snoozed.reminder.status, 'snoozed')
  assert.equal(snoozed.event.action, 'viewed')
  store.markTaken('b')
  assert.equal(store.snooze('b'), null)
})

test('delete removes only that task', () => {
  const store = make()
  store.reset(seed)
  assert.equal(store.remove('a'), true)
  assert.deepEqual(store.getState().map((r) => r.id), ['b'])
  assert.equal(store.remove('a'), false)
})

test('seedIfEmpty runs once; deleting everything does not bring the seed back', () => {
  const storage = memoryStorage()
  const first = createRemindersStore({ storage })
  first.seedIfEmpty(seed)
  assert.equal(first.getState().length, 2)
  first.remove('a'); first.remove('b')
  const reloaded = createRemindersStore({ storage })
  reloaded.seedIfEmpty(seed)
  assert.equal(reloaded.getState().length, 0)
})

test('state persists across a reload, and bad stored data is ignored', () => {
  const storage = memoryStorage()
  const first = createRemindersStore({ storage, makeId: () => 'p1' })
  first.add({ title: 'Tea', type: 'routine', scheduledAt: '2026-10-31T15:30:00' })
  assert.equal(createRemindersStore({ storage }).getState()[0].title, 'Tea')
  storage.setItem('memory-lane:reminders', 'not json')
  assert.deepEqual(createRemindersStore({ storage }).getState(), [])
  storage.setItem('memory-lane:reminders', JSON.stringify({ reminders: [{ id: 1 }, { nope: true }] }))
  assert.deepEqual(createRemindersStore({ storage }).getState(), [])
})

test('subscribers hear every change, but not after unsubscribing', () => {
  const store = make()
  let calls = 0
  const stop = store.subscribe(() => calls++)
  store.add({ title: 'A', type: 'routine', scheduledAt: '2026-10-31T10:00:00' })
  store.update('id1', { title: 'B' })
  store.remove('id1')
  stop()
  store.reset([])
  assert.equal(calls, 3)
})
