// Local storage for personal memory content: descriptions, photographs and voice notes.
// IndexedDB database "memory-lane" (everything stays on this device). When IndexedDB is not
// available (for example some private windows) an in-memory store with the same interface is
// used, and `getStorageInfo().persistent` is false so the page can say so.
//
//   meta       key memoryId   { memoryId, description | null, hiddenSeedIds[], updatedAt }
//   photos     key id         { id, memoryId, blob, type, name, width, height, addedAt }   index byMemory
//   voiceNotes key id         { id, memoryId, blob, mimeType, durationMs, createdAt }       index byMemory

const DB_NAME = 'memory-lane'
const DB_VERSION = 1

let adapterPromise = null
const listeners = new Set()

// Called after every successful write (for example so the album can refresh its covers).
export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const notify = () => listeners.forEach((listener) => listener())

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

function toStorageError(error) {
  const wrapped = new Error(
    error?.name === 'QuotaExceededError'
      ? 'There is not enough space to save this. Remove a photo or voice note and try again.'
      : 'This could not be saved. Please try again.',
  )
  wrapped.code = error?.name === 'QuotaExceededError' ? 'quota' : 'failed'
  return wrapped
}

// ---- Adapter backed by IndexedDB -------------------------------------------------------------
function createIdbAdapter(db) {
  // Runs `work(store)` in one transaction and resolves with the request result when it commits.
  function run(storeName, mode, work) {
    return new Promise((resolve, reject) => {
      let request
      try {
        const tx = db.transaction(storeName, mode)
        request = work(tx.objectStore(storeName))
        tx.oncomplete = () => resolve(request?.result)
        tx.onerror = () => reject(tx.error ?? request?.error)
        tx.onabort = () => reject(tx.error ?? request?.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  return {
    persistent: true,
    get: (storeName, key) => run(storeName, 'readonly', (store) => store.get(key)),
    getAll: (storeName) => run(storeName, 'readonly', (store) => store.getAll()),
    getAllByMemory: (storeName, memoryId) =>
      run(storeName, 'readonly', (store) => store.index('byMemory').getAll(memoryId)),
    put: (storeName, value) => run(storeName, 'readwrite', (store) => store.put(value)),
    remove: (storeName, key) => run(storeName, 'readwrite', (store) => store.delete(key)),
    // Read-modify-write in a single transaction.
    modify(storeName, key, change) {
      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(storeName, 'readwrite')
          const store = tx.objectStore(storeName)
          const read = store.get(key)
          read.onsuccess = () => store.put(change(read.result))
          tx.oncomplete = () => resolve()
          tx.onerror = () => reject(tx.error)
          tx.onabort = () => reject(tx.error)
        } catch (error) {
          reject(error)
        }
      })
    },
  }
}

// ---- Fallback adapter (lost when the page closes) --------------------------------------------
function createMemoryAdapter() {
  const stores = { meta: new Map(), photos: new Map(), voiceNotes: new Map() }
  const keyOf = (storeName, value) => (storeName === 'meta' ? value.memoryId : value.id)
  return {
    persistent: false,
    get: async (storeName, key) => stores[storeName].get(key),
    getAll: async (storeName) => [...stores[storeName].values()],
    getAllByMemory: async (storeName, memoryId) =>
      [...stores[storeName].values()].filter((item) => item.memoryId === memoryId),
    put: async (storeName, value) => {
      stores[storeName].set(keyOf(storeName, value), value)
    },
    remove: async (storeName, key) => {
      stores[storeName].delete(key)
    },
    modify: async (storeName, key, change) => {
      const next = change(stores[storeName].get(key))
      stores[storeName].set(keyOf(storeName, next), next)
    },
  }
}

function openAdapter() {
  if (adapterPromise) return adapterPromise
  adapterPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(createMemoryAdapter())
      return
    }
    let request
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION)
    } catch {
      resolve(createMemoryAdapter())
      return
    }
    request.onupgradeneeded = () => {
      const db = request.result
      // Add later schema versions as `if (event.oldVersion < n)` blocks.
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'memoryId' })
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id' }).createIndex('byMemory', 'memoryId')
      }
      if (!db.objectStoreNames.contains('voiceNotes')) {
        db.createObjectStore('voiceNotes', { keyPath: 'id' }).createIndex('byMemory', 'memoryId')
      }
    }
    request.onsuccess = () => resolve(createIdbAdapter(request.result))
    request.onerror = () => resolve(createMemoryAdapter())
    request.onblocked = () => resolve(createMemoryAdapter())
  })
  return adapterPromise
}

let persistRequested = false
function requestPersistence() {
  if (persistRequested) return
  persistRequested = true
  try {
    navigator.storage?.persist?.()
  } catch {
    // Best effort only.
  }
}

async function write(action) {
  const adapter = await openAdapter()
  requestPersistence()
  try {
    await action(adapter)
  } catch (error) {
    throw toStorageError(error)
  }
  notify()
}

const emptyMeta = (memoryId) => ({ memoryId, description: null, hiddenSeedIds: [], updatedAt: 0 })

// ---- Public API ------------------------------------------------------------------------------
export async function getStorageInfo() {
  const adapter = await openAdapter()
  return { persistent: adapter.persistent }
}

export async function getMeta(memoryId) {
  const adapter = await openAdapter()
  return (await adapter.get('meta', memoryId)) ?? emptyMeta(memoryId)
}

// `text` null restores the built-in description.
export const saveDescription = (memoryId, text) =>
  write((adapter) =>
    adapter.modify('meta', memoryId, (meta) => ({
      ...(meta ?? emptyMeta(memoryId)),
      description: text,
      updatedAt: Date.now(),
    })),
  )

export const hideSeedPhoto = (memoryId, seedId) =>
  write((adapter) =>
    adapter.modify('meta', memoryId, (meta) => {
      const current = meta ?? emptyMeta(memoryId)
      return {
        ...current,
        hiddenSeedIds: [...new Set([...current.hiddenSeedIds, seedId])],
        updatedAt: Date.now(),
      }
    }),
  )

export async function listPhotos(memoryId) {
  const adapter = await openAdapter()
  return (await adapter.getAllByMemory('photos', memoryId)).sort((a, b) => a.addedAt - b.addedAt)
}

export const addPhoto = (memoryId, { blob, type, name, width, height }) =>
  write((adapter) =>
    adapter.put('photos', { id: newId(), memoryId, blob, type, name, width, height, addedAt: Date.now() }),
  )

export const deletePhoto = (id) => write((adapter) => adapter.remove('photos', id))

export async function listVoiceNotes(memoryId) {
  const adapter = await openAdapter()
  return (await adapter.getAllByMemory('voiceNotes', memoryId)).sort((a, b) => a.createdAt - b.createdAt)
}

export const addVoiceNote = (memoryId, { blob, mimeType, durationMs }) =>
  write((adapter) =>
    adapter.put('voiceNotes', { id: newId(), memoryId, blob, mimeType, durationMs, createdAt: Date.now() }),
  )

export const deleteVoiceNote = (id) => write((adapter) => adapter.remove('voiceNotes', id))

// For the album: per memory, the hidden built-in photos and the earliest uploaded photo.
export async function getCoverData() {
  const adapter = await openAdapter()
  const [metas, photos] = await Promise.all([adapter.getAll('meta'), adapter.getAll('photos')])
  const data = {}
  metas.forEach((meta) => {
    data[meta.memoryId] = { hiddenSeedIds: meta.hiddenSeedIds ?? [], firstPhoto: null }
  })
  photos.forEach((photo) => {
    const entry = (data[photo.memoryId] ??= { hiddenSeedIds: [], firstPhoto: null })
    if (!entry.firstPhoto || photo.addedAt < entry.firstPhoto.addedAt) entry.firstPhoto = photo
  })
  return data
}
