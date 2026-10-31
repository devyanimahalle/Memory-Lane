import { useEffect, useMemo, useRef, useState } from 'react'
import { coverFor } from './memoryContent'
import { getCoverData, subscribe } from './storage/memoryDb'

const MAX_WAIT_MS = 800

// The memories with each cover replaced by the first photo the user added (if any).
// `ready` turns true once saved covers are loaded, or after a short wait, so the album
// never stays blank. Refreshes whenever saved content changes.
export function useMemoryCovers(memories) {
  const [covers, setCovers] = useState({})
  const [ready, setReady] = useState(false)
  const urls = useRef(new Map()) // photo id -> object URL

  useEffect(() => {
    let alive = true
    const map = urls.current

    async function load() {
      try {
        const data = await getCoverData()
        if (!alive) return
        const next = {}
        const used = new Set()
        memories.forEach((memory) => {
          const info = data[memory.id]
          let firstUpload = null
          if (info?.firstPhoto) {
            const { id, blob } = info.firstPhoto
            if (!map.has(id)) map.set(id, URL.createObjectURL(blob))
            used.add(id)
            firstUpload = { src: map.get(id), alt: `A photo you added to ${memory.title}` }
          }
          next[memory.id] = coverFor(memory, info?.hiddenSeedIds ?? [], firstUpload)
        })
        map.forEach((url, id) => {
          if (!used.has(id)) {
            URL.revokeObjectURL(url)
            map.delete(id)
          }
        })
        setCovers(next)
      } catch {
        // Keep the built-in covers.
      }
      if (alive) setReady(true)
    }

    load()
    const unsubscribe = subscribe(load)
    const timer = setTimeout(() => alive && setReady(true), MAX_WAIT_MS)
    return () => {
      alive = false
      unsubscribe()
      clearTimeout(timer)
      map.forEach((url) => URL.revokeObjectURL(url))
      map.clear()
    }
  }, [memories])

  const list = useMemo(
    () => memories.map((memory) => ({ ...memory, cover: covers[memory.id] ?? memory.cover })),
    [memories, covers],
  )
  return { memories: list, ready }
}
