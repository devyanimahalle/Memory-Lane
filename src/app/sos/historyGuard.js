// While an SOS is active the patient pages are hidden behind the assistance screen. Browser Back
// and Forward must neither dismiss it nor move the hidden page, so a guard entry is pushed on top of
// the current history entry (same URL, same state plus `sos: true`). If the person goes Back or
// Forward, the entry the browser landed on is replaced by the original one and the guard is pushed
// again, so the patient's view, URL and scroll stay exactly as they were. Releasing the guard
// (the alert was resolved, or the patient view is leaving) pops the guard entry again so history
// is back to how it was.
//
// PatientHome ignores popstate events while an SOS is active (see its popstate handler).
export function guardHistory() {
  const here = window.history.state
  const original = { ...(here ?? {}) }
  delete original.sos
  const originalState = Object.keys(original).length > 0 ? original : null
  const url = window.location.href

  if (!here?.sos) window.history.pushState({ ...original, sos: true }, '', url)

  function onPopState() {
    if (window.history.state?.sos) return
    window.history.replaceState(originalState, '', url)
    window.history.pushState({ ...original, sos: true }, '', url)
  }
  window.addEventListener('popstate', onPopState)

  return function release() {
    window.removeEventListener('popstate', onPopState)
    if (window.history.state?.sos) window.history.back()
  }
}
