// Run with: node --test src/screens/patient/memories/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  coverFor,
  formatDuration,
  mergePhotos,
  pickRecorderMimeType,
  seedPhotoId,
  splitSentences,
} from './memoryContent.js'

const memory = {
  id: 'seaside',
  cover: { src: 'cover.png', alt: 'cover' },
  photos: [
    { src: 'a.png', alt: 'A', caption: 'First' },
    { src: 'b.png', alt: 'B', caption: 'Second' },
  ],
}

test('merged photos list the built-in photos first, then uploads by time', () => {
  const uploads = [
    { id: 'u2', src: 'u2.jpg', alt: 'u2', caption: '', addedAt: 20 },
    { id: 'u1', src: 'u1.jpg', alt: 'u1', caption: '', addedAt: 10 },
  ]
  const merged = mergePhotos(memory, [], uploads)
  assert.deepEqual(
    merged.map((p) => p.id),
    ['seaside:seed:0', 'seaside:seed:1', 'u1', 'u2'],
  )
  assert.equal(merged[0].kind, 'seed')
  assert.equal(merged[2].kind, 'upload')
})

test('hidden built-in photos are left out', () => {
  const merged = mergePhotos(memory, [seedPhotoId('seaside', 0)], [])
  assert.deepEqual(
    merged.map((p) => p.id),
    ['seaside:seed:1'],
  )
})

test('cover is the first upload, else the first visible built-in photo, else the original', () => {
  assert.deepEqual(coverFor(memory, [], { src: 'u.jpg', alt: 'mine' }), { src: 'u.jpg', alt: 'mine' })
  assert.deepEqual(coverFor(memory, [seedPhotoId('seaside', 0)], null), { src: 'b.png', alt: 'B' })
  const all = [seedPhotoId('seaside', 0), seedPhotoId('seaside', 1)]
  assert.deepEqual(coverFor(memory, all, null), memory.cover)
})

test('formatDuration shows minutes and padded seconds', () => {
  assert.equal(formatDuration(0), '0:00')
  assert.equal(formatDuration(65000), '1:05')
  assert.equal(formatDuration(599999), '9:59')
  assert.equal(formatDuration(null), '0:00')
})

test('splitSentences keeps each sentence and handles no final punctuation', () => {
  assert.deepEqual(splitSentences('One. Two! Three?'), ['One.', 'Two!', 'Three?'])
  assert.deepEqual(splitSentences('Hello there. And no end'), ['Hello there.', 'And no end'])
  assert.deepEqual(splitSentences('   '), [])
})

test('recorder type is the first supported option, or empty', () => {
  assert.equal(pickRecorderMimeType((t) => t === 'audio/mp4'), 'audio/mp4')
  assert.equal(pickRecorderMimeType(() => true), 'audio/webm;codecs=opus')
  assert.equal(pickRecorderMimeType(() => false), '')
})
