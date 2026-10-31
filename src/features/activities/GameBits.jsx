import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/icons'
import { isSoundOn, setSoundOn } from './soundEffects'

// Shared pieces of the three game pages, in the "Dark Midnight" treatment: a navy ground, dark teal
// surfaces, off-white text and mint for the things to press. Tokens only (see DESIGN.md).

// The page frame. The navy runs edge to edge using the same clipped box-shadow band as the Memory
// Album (it adds no horizontal scroll), reaching up over the layout padding and down past the
// content. Focus rings are mint here, because the global blue ring is too faint on navy.
export function GameFrame({ label, children }) {
  return (
    <section
      aria-label={label}
      className="relative flex flex-col gap-gutter bg-ink text-on-deep shadow-[0_0_0_100vmax_var(--color-ink)] [clip-path:inset(-1.5rem_-100vmax_-100vmax)] md:[clip-path:inset(-2.5rem_-100vmax_-100vmax)] [&_:focus-visible]:outline-sunken"
    >
      {children}
    </section>
  )
}

// Button for the game pages: maps the usual variants to the dark ones.
export function GameButton({ variant = 'primary', ...props }) {
  const dark = { primary: 'dark', secondary: 'dark-secondary', quiet: 'dark-quiet' }[variant]
  return <Button variant={dark} {...props} />
}

export function GameHeader({ title, intro, onBack, headingRef }) {
  return (
    <header className="flex flex-col gap-4">
      {onBack && (
        <GameButton variant="secondary" onClick={onBack} className="w-fit">
          <Icon name="back" className="size-6" />
          Back to games
        </GameButton>
      )}
      <h1 ref={headingRef} tabIndex={-1} className="text-4xl leading-tight font-bold md:text-display">
        {title}
      </h1>
      <p className="max-w-prose text-lead text-on-deep-soft">{intro}</p>
    </header>
  )
}

// A labelled row of choices (for example the number of cards). One is always selected: the
// selected choice is a mint pill with a tick, the others a quiet outline.
export function ChoicePills({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span className="text-lead font-semibold">{label}</span>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`inline-flex min-h-touch-lg cursor-pointer items-center gap-2 rounded-full border-2 px-5 text-lead font-semibold transition-colors duration-quick ease-gentle motion-reduce:transition-none ${
                selected
                  ? 'border-sunken bg-sunken text-ink'
                  : 'border-line-strong text-on-deep hover:border-turquoise hover:bg-accent'
              }`}
            >
              {selected && <Icon name="check" className="size-5" />}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Sounds are gentle and on by default. The choice is remembered on this device.
export function SoundToggle() {
  const [on, setOn] = useState(isSoundOn)
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        setSoundOn(!on)
        setOn(!on)
      }}
      className="inline-flex min-h-touch-lg w-fit cursor-pointer items-center gap-2 rounded-full border-2 border-line-strong px-5 text-lead font-semibold text-on-deep transition-colors duration-quick ease-gentle hover:border-turquoise hover:bg-accent motion-reduce:transition-none"
    >
      <Icon name="volume" className="size-6" />
      {on ? 'Sound on' : 'Sound off'}
    </button>
  )
}

// A kind message that screen readers announce when it changes.
export function GameMessage({ children }) {
  return (
    <p role="status" aria-live="polite" className="min-h-[2lh] text-lead font-semibold text-sunken">
      {children}
    </p>
  )
}
