// Pure helpers for personal memory content (no DOM, no storage). Unit-tested in
// memoryContent.test.js.

export const LIMITS = {
  maxPhotosPerMemory: 20,
  maxVoiceNotesPerMemory: 20,
  maxPhotoBytes: 25 * 1024 * 1024,
  maxPhotoEdge: 2048,
  maxRecordingMs: 5 * 60 * 1000,
  maxDescriptionLength: 2000,
}

// Stable id for a built-in stand-in photo, so it can be hidden later.
export const seedPhotoId = (memoryId, index) => `${memoryId}:seed:${index}`

// The photos shown on the detail page: the built-in photos that are not hidden, then uploads
// in the order they were added. `uploads` items need { id, src, alt, caption, addedAt }.
export function mergePhotos(memory, hiddenSeedIds = [], uploads = []) {
  const hidden = new Set(hiddenSeedIds)
  const seeds = memory.photos
    .map((photo, index) => ({
      id: seedPhotoId(memory.id, index),
      kind: 'seed',
      src: photo.src,
      alt: photo.alt,
      caption: photo.caption,
    }))
    .filter((photo) => !hidden.has(photo.id))
  const added = [...uploads]
    .sort((a, b) => a.addedAt - b.addedAt)
    .map((photo) => ({ ...photo, kind: 'upload' }))
  return [...seeds, ...added]
}

// The carousel cover: first upload, else first visible built-in photo, else the original cover.
export function coverFor(memory, hiddenSeedIds = [], firstUpload = null) {
  if (firstUpload) return { src: firstUpload.src, alt: firstUpload.alt }
  const [first] = mergePhotos(memory, hiddenSeedIds, [])
  if (first) return { src: first.src, alt: first.alt }
  return memory.cover
}

// 65000 -> "1:05"
export function formatDuration(ms) {
  const total = Math.max(0, Math.floor((ms ?? 0) / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = String(total % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

const SAVED_AT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
export const formatSavedAt = (time) => SAVED_AT.format(new Date(time))

// Splits text into sentences so speech can pause and resume at a sentence boundary.
export function splitSentences(text) {
  const parts = text.match(/[^.!?]+(?:[.!?]+["')\]]*|$)\s*/g) ?? []
  return parts.map((part) => part.trim()).filter(Boolean)
}

const RECORDER_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

// First recorder MIME type the browser supports; '' lets the browser choose.
export function pickRecorderMimeType(isSupported) {
  return RECORDER_TYPES.find((type) => isSupported(type)) ?? ''
}
