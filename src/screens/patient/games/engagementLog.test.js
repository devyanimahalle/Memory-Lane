import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readEngagementLog, recordEngagement, toEngagementRecord } from './engagementLog.js'

const memoryStorage = () => {
  const data = new Map()
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) }
}

const event = {
  id: 'e1',
  type: 'game',
  action: 'completed',
  label: 'Played Picture Puzzle',
  occurredAt: '2026-10-31T10:00:00.000Z',
  durationMinutes: 2,
}

test('maps a game event to the shared schema', () => {
  assert.deepEqual(toEngagementRecord(event, { gameId: 'picture-puzzle' }), {
    id: 'e1',
    type: 'game',
    timestamp: '2026-10-31T10:00:00.000Z',
    featureId: 'activities',
    status: 'completed',
    meta: { label: 'Played Picture Puzzle', durationMinutes: 2, gameId: 'picture-puzzle' },
  })
})

test('a round with the same id is only recorded once', () => {
  const storage = memoryStorage()
  assert.ok(recordEngagement(event, {}, storage))
  assert.equal(recordEngagement(event, {}, storage), null)
  assert.equal(readEngagementLog(storage).length, 1)
})

test('separate rounds are all recorded, and bad input or missing storage is ignored', () => {
  const storage = memoryStorage()
  recordEngagement(event, {}, storage)
  recordEngagement({ ...event, id: 'e2' }, {}, storage)
  assert.equal(readEngagementLog(storage).length, 2)
  assert.equal(recordEngagement(null, {}, storage), null)
  assert.doesNotThrow(() => recordEngagement({ ...event, id: 'e3' }, {}, null))
  assert.deepEqual(readEngagementLog(null), [])
})
