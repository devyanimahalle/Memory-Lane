import { useSyncExternalStore } from 'react'
import { sosStore } from './sosStore'

// The shared SOS state for any component: { current, history } plus the actions.
// `current` is the active alert (status "sent" or "acknowledged") or null.
export function useSos() {
  const state = useSyncExternalStore(sosStore.subscribe, sosStore.getState, sosStore.getState)
  return {
    current: state.current,
    history: state.history,
    trigger: sosStore.trigger,
    acknowledge: sosStore.acknowledge,
    resolve: sosStore.resolve,
    clearAll: sosStore.clearAll,
  }
}
