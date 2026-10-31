// Placeholder visuals use existing CogniCare tokens only. Each tone is a Tailwind token class
// (full class names so Tailwind can see them). Real illustrations replace these later.
export const TONES = {
  white: 'bg-surface',
  sky: 'bg-tint-sky',
  sage: 'bg-tint-sage',
  mint: 'bg-sunken',
  teal: 'bg-accent-soft',
  gentle: 'bg-gentle-soft',
  turquoise: 'bg-turquoise',
  accent: 'bg-accent',
}

// Fisher-Yates: an unbiased shuffle (returns a new array).
export function shuffle(list) {
  const items = [...list]
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}
