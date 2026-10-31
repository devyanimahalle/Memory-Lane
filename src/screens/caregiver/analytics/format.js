// Display helpers for the analytics summary. Dates are ISO strings (YYYY-MM-DD).
const toDate = (iso) => new Date(`${iso}T00:00:00Z`)

const fmt = (options) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options })
const WEEKDAY = fmt({ weekday: 'short' })
const DAY = fmt({ day: 'numeric' })
const FRIENDLY = fmt({ weekday: 'short', day: 'numeric', month: 'short' })

export const weekdayOf = (iso) => WEEKDAY.format(toDate(iso))
export const dayOf = (iso) => DAY.format(toDate(iso))
export const friendlyDate = (iso) => FRIENDLY.format(toDate(iso))

export const TREND_TEXT = {
  increasing: 'Activity has been a little higher lately.',
  steady: 'Activity has been steady.',
  decreasing: 'Activity has been lower in recent days compared with earlier in the week.',
  'not-enough-data': 'Not enough days yet to show a trend.',
}

export const ALERT_LABEL = {
  'missed-medicine': 'Medicine',
  'low-engagement': 'Routine',
}

// Keeps the module's own wording, but shows dates the way people read them.
export const friendlyMessage = (message) =>
  message.replace(/\d{4}-\d{2}-\d{2}/g, (iso) => friendlyDate(iso))

export const daysWithDataText = (weekly) =>
  `${weekly.daysWithData} of ${weekly.daysWithData + weekly.daysWithoutData} days`
