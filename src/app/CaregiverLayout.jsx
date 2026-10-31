import { useEffect, useState } from 'react'

const NAV = [
  { href: '#overview', label: 'Overview' },
  { href: '#reminders', label: 'Reminders' },
  { href: '#activities', label: 'Activities' },
  { href: '#safety', label: 'Location safety' },
]

function NavLinks({ className, active }) {
  return (
    <ul className={className}>
      {NAV.map(({ href, label }) => {
        const current = href === active
        return (
          <li key={href}>
            <a
              href={href}
              aria-current={current ? 'true' : undefined}
              className={`flex min-h-touch items-center rounded-md border-l-4 px-4 text-body transition-colors duration-quick ease-gentle ${
                current
                  ? 'border-accent bg-accent-soft font-semibold text-accent-strong'
                  : 'border-transparent font-medium text-ink-soft hover:bg-surface hover:text-ink'
              }`}
            >
              {label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

// Highlights the last section whose top has reached the upper part of the viewport
// (or the final one at the bottom of the page).
function useActiveSection() {
  const [active, setActive] = useState(NAV[0].href)

  useEffect(() => {
    function update() {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      let current = NAV[0].href
      NAV.forEach(({ href }) => {
        const section = document.querySelector(href)
        if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.3) current = href
      })
      setActive(atBottom ? NAV[NAV.length - 1].href : current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return active
}

// Caregiver frame: top bar on narrow screens, sidebar from 768px up.
// Content comes from src/screens/caregiver (one scrolling dashboard).
export function CaregiverLayout({ children }) {
  const active = useActiveSection()

  return (
    <div className="md:flex">
      <nav
        aria-label="Dashboard sections"
        className="sticky top-0 z-10 border-b border-line bg-sunken px-gutter py-2 md:h-dvh md:w-60 md:shrink-0 md:border-r md:border-b-0 md:py-gutter"
      >
        <p className="hidden px-4 pb-4 font-heading text-title font-bold md:block">
          Memory Lane
        </p>
        <NavLinks className="flex gap-1 overflow-x-auto md:flex-col" active={active} />
      </nav>
      <div className="mx-auto w-full max-w-6xl px-gutter py-gutter-lg md:px-gutter-lg">
        {children}
      </div>
    </div>
  )
}
