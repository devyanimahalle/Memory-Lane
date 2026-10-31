import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSosStore, parseState, telHref } from './sosStore.js'

const memoryStorage = (initial) => {
  const data = new Map(initial ? [['memory-lane:sos', initial]] : [])
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
    dump: () => data.get('memory-lane:sos'),
  }
}

function makeStore(options = {}) {
  let n = 0
  return createSosStore({
    storage: memoryStorage(),
    makeId: () => `sos-${++n}`,
    now: () => new Date('2026-10-31T10:42:00.000Z'),
    ...options,
  })
}

test('trigger creates one alert with an id, a time and the current app context', () => {
  const store = makeStore()
  store.setContext('Matching Pairs')
  const alert = store.trigger({ patientName: 'Mr. Sharma' })
  assert.equal(alert.id, 'sos-1')
  assert.equal(alert.createdAt, '2026-10-31T10:42:00.000Z')
  assert.equal(alert.patientName, 'Mr. Sharma')
  assert.equal(alert.context, 'Matching Pairs')
  assert.equal(alert.status, 'sent')
  assert.equal(store.getState().current.id, 'sos-1')
})

test('a repeated trigger is ignored while an alert is active (no duplicates)', () => {
  const store = makeStore()
  assert.ok(store.trigger({ patientName: 'Mr. Sharma' }))
  assert.equal(store.trigger({ patientName: 'Mr. Sharma' }), null)
  store.acknowledge()
  assert.equal(store.trigger({ patientName: 'Mr. Sharma' }), null)
  assert.equal(store.getState().history.length, 0)
})

test('acknowledge then resolve moves the alert into history', () => {
  const store = makeStore()
  store.trigger({ patientName: 'Mr. Sharma' })
  const seen = store.acknowledge()
  assert.equal(seen.status, 'acknowledged')
  assert.equal(seen.acknowledgedAt, '2026-10-31T10:42:00.000Z')
  assert.equal(store.acknowledge(), null) // only once
  const done = store.resolve()
  assert.equal(done.status, 'resolved')
  assert.equal(store.getState().current, null)
  assert.equal(store.getState().history[0].id, 'sos-1')
  assert.equal(store.resolve(), null)
})

test('after a resolved alert a new one can be sent', () => {
  const store = makeStore()
  store.trigger({ patientName: 'Mr. Sharma' })
  store.resolve()
  assert.equal(store.trigger({ patientName: 'Mr. Sharma' }).id, 'sos-2')
})

test('history keeps the newest 20 and clearAll empties everything', () => {
  const store = makeStore()
  for (let i = 0; i < 25; i++) {
    store.trigger({ patientName: 'Mr. Sharma' })
    store.resolve()
  }
  assert.equal(store.getState().history.length, 20)
  store.trigger({ patientName: 'Mr. Sharma' })
  store.clearAll()
  assert.deepEqual(store.getState(), { current: null, history: [] })
})

test('an old active alert is still active after a reload (no expiry)', () => {
  const storage = memoryStorage()
  const first = createSosStore({ storage, now: () => new Date('2020-01-01T00:00:00.000Z'), makeId: () => 'old' })
  first.trigger({ patientName: 'Mr. Sharma' })
  const reloaded = createSosStore({ storage, now: () => new Date('2026-10-31T10:42:00.000Z') })
  assert.equal(reloaded.getState().current.id, 'old')
  assert.equal(reloaded.getState().current.status, 'sent')
})

test('subscribers are told about every change', () => {
  const store = makeStore()
  let calls = 0
  const stop = store.subscribe(() => calls++)
  store.trigger({ patientName: 'Mr. Sharma' })
  store.acknowledge()
  store.resolve()
  stop()
  store.clearAll()
  assert.equal(calls, 3)
})

test('bad or missing storage never throws and gives no alerts', () => {
  assert.deepEqual(parseState('not json'), { current: null, history: [] })
  assert.deepEqual(parseState(null), { current: null, history: [] })
  assert.deepEqual(parseState('{"current":{"nope":1},"history":"x"}'), { current: null, history: [] })
  const noStorage = createSosStore({ storage: null, makeId: () => 'x' })
  assert.doesNotThrow(() => noStorage.trigger({ patientName: 'Mr. Sharma' }))
  const throwing = createSosStore({
    storage: { getItem: () => null, setItem: () => { throw new Error('full') } },
    makeId: () => 'y',
  })
  assert.equal(throwing.trigger({ patientName: 'Mr. Sharma' }).id, 'y')
})

test('telHref only builds a link for a real-looking number', () => {
  assert.equal(telHref('+91 98765 43210'), 'tel:+919876543210')
  assert.equal(telHref('(022) 1234-5678'), 'tel:02212345678')
  assert.equal(telHref('+91 XXXXX XXXXX'), null) // the placeholder is not callable
  assert.equal(telHref(''), null)
  assert.equal(telHref(undefined), null)
  assert.equal(telHref('12345'), null) // too short
  assert.equal(telHref('1234567890123456'), null) // too long
  assert.equal(telHref('call me'), null)
})
