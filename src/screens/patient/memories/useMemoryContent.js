import { useCallback, useEffect, useRef, useState } from 'react'
import { prepareImage } from './imageUtils'
import { LIMITS, formatSavedAt, mergePhotos } from './memoryContent'
import * as db from './storage/memoryDb'

// All saved content for one memory (description, photos, voice notes), tied to `memory.id`.
// Writes go to IndexedDB (see storage/memoryDb.js); the hook reloads after each one.
// Photo and note blobs are shown through object URLs, which this hook creates and revokes.
export function useMemoryContent(memory) {
  const memoryId = memory.id
  const urls = useRef(new Map()) // record id -> object URL
  const mounted = useRef(true)
  const [state, setState] = useState({
    status: 'loading',
    persistent: true,
    meta: null,
    photos: [],
    notes: [],
  })

  const urlFor = useCallback((record) => {
    let url = urls.current.get(record.id)
    if (!url) {
      url = URL.createObjectURL(record.blob)
      urls.current.set(record.id, url)
    }
    return url
  }, [])

  const load = useCallback(async () => {
    const [meta, photos, notes, info] = await Promise.all([
      db.getMeta(memoryId),
      db.listPhotos(memoryId),
      db.listVoiceNotes(memoryId),
      db.getStorageInfo(),
    ])
    const live = new Set([...photos, ...notes].map((record) => record.id))
    urls.current.forEach((url, id) => {
      if (!live.has(id)) {
        URL.revokeObjectURL(url)
        urls.current.delete(id)
      }
    })
    return {
      status: 'ready',
      persistent: info.persistent,
      meta,
      photos: photos.map((photo) => ({
        id: photo.id,
        src: urlFor(photo),
        alt: 'A photo you added to this memory',
        caption: `Added ${formatSavedAt(photo.addedAt)}`,
        addedAt: photo.addedAt,
      })),
      notes: notes.map((note) => ({ ...note, src: urlFor(note) })),
    }
  }, [memoryId, urlFor])

  useEffect(() => {
    let alive = true
    load()
      .then((next) => alive && setState(next))
      .catch(() => alive && setState((current) => ({ ...current, status: 'error' })))
    return () => {
      alive = false
    }
  }, [load])

  useEffect(() => {
    mounted.current = true
    const map = urls.current
    return () => {
      mounted.current = false
      map.forEach((url) => URL.revokeObjectURL(url))
      map.clear()
    }
  }, [])

  const refresh = useCallback(async () => {
    const next = await load()
    if (mounted.current) setState(next)
  }, [load])

  const meta = state.meta
  const description = meta?.description ?? memory.description
  const photos = mergePhotos(memory, meta?.hiddenSeedIds ?? [], state.photos)

  // Returns { added, errors } so the screen can describe what happened.
  async function addPhotos(files) {
    const errors = []
    let added = 0
    for (const file of files) {
      if (state.photos.length + added >= LIMITS.maxPhotosPerMemory) {
        errors.push(`A memory can hold ${LIMITS.maxPhotosPerMemory} added photos. Remove one to add more.`)
        break
      }
      try {
        await db.addPhoto(memoryId, await prepareImage(file))
        added += 1
      } catch (error) {
        errors.push(error.message)
      }
    }
    await refresh()
    return { added, errors }
  }

  async function removePhoto(photo) {
    if (photo.kind === 'seed') await db.hideSeedPhoto(memoryId, photo.id)
    else await db.deletePhoto(photo.id)
    await refresh()
  }

  async function saveDescription(text) {
    const trimmed = text.trim()
    await db.saveDescription(memoryId, trimmed === memory.description ? null : trimmed)
    await refresh()
  }

  async function restoreDescription() {
    await db.saveDescription(memoryId, null)
    await refresh()
  }

  async function addVoiceNote(recording) {
    if (state.notes.length >= LIMITS.maxVoiceNotesPerMemory) {
      throw new Error(`A memory can hold ${LIMITS.maxVoiceNotesPerMemory} voice notes. Delete one to add more.`)
    }
    await db.addVoiceNote(memoryId, recording)
    await refresh()
  }

  async function removeVoiceNote(id) {
    await db.deleteVoiceNote(id)
    await refresh()
  }

  return {
    status: state.status,
    persistent: state.persistent,
    description,
    descriptionEdited: meta?.description != null,
    photos,
    uploadedCount: state.photos.length,
    notes: state.notes,
    addPhotos,
    removePhoto,
    saveDescription,
    restoreDescription,
    addVoiceNote,
    removeVoiceNote,
  }
}
