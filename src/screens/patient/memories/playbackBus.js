// Only one thing should make sound at a time (speech, a voice note, a preview), and nothing
// should play while recording. Whatever starts calls `claimPlayback(stop)`; the previous owner's
// `stop` is called. The returned function releases the claim.
let current = null

export function claimPlayback(stop) {
  if (current && current !== stop) current()
  current = stop
  return () => {
    if (current === stop) current = null
  }
}

// Stops whatever is playing (used before recording starts).
export function stopAllPlayback() {
  if (current) current()
  current = null
}
