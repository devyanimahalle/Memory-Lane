import { useEffect } from 'react'
import { sosStore } from '../../../app/sos/sosStore'

// Tells the SOS store where the patient is in the app, so an alert can say "Matching Pairs" or
// "Memory Album". This is the app context only, never a physical location.
//
// `label` is set for a full-page view (a game or a memory). On Patient Home it is null, and the
// context follows the section under the middle of the viewport: Games gallery, Memory Album, or
// Patient Home when neither is there. Nothing re-renders; the store just remembers the latest.
export function usePatientContext(label) {
  useEffect(() => {
    if (label) {
      sosStore.setContext(label)
      return undefined
    }

    function update() {
      const middle = window.innerHeight / 2
      const under = (id) => {
        const rect = document.getElementById(id)?.getBoundingClientRect()
        return Boolean(rect && rect.top <= middle && rect.bottom >= middle)
      }
      if (under('games')) sosStore.setContext('Games gallery')
      else if (under('memory-album')) sosStore.setContext('Memory Album')
      else sosStore.setContext('Patient Home')
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [label])
}
