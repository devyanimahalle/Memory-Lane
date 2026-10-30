import { Icon } from '../../../ui/icons'

// Full-width Games gallery, directly above the Memory Album. Three image-led cards:
// one column on phones (image beside text), two columns on tablets, three from 1024px.
// Only the hovered card grows (hover-capable devices only, never under reduced motion).
// `onSelect(game)` is the integration point for the real game pages.
export function GamesSection({ games, onSelect }) {
  return (
    <section id="games" aria-labelledby="games-title" className="scroll-mt-6">
      <h2 id="games-title" className="text-4xl leading-tight font-bold md:text-section">
        Games
      </h2>
      <p className="mt-2 max-w-prose text-lead text-ink-soft">
        Gentle games with no timer and no score. Pick one whenever you like.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {games.map((game) => (
          <li
            key={game.id}
            className="sm:[&:last-child:nth-child(odd)]:col-span-2 sm:[&:last-child:nth-child(odd)]:mx-auto sm:[&:last-child:nth-child(odd)]:w-[calc(50%-0.75rem)] lg:[&:last-child:nth-child(odd)]:col-span-1 lg:[&:last-child:nth-child(odd)]:mx-0 lg:[&:last-child:nth-child(odd)]:w-auto"
          >
            <button
              type="button"
              onClick={() => onSelect(game)}
              className="relative flex h-full w-full cursor-pointer flex-row items-stretch overflow-hidden rounded-xl border border-line bg-surface text-left transition-transform duration-300 ease-gentle focus-visible:z-10 sm:flex-col hover:z-10 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              <img
                src={game.cover.src}
                alt={game.cover.alt}
                loading="lazy"
                className="aspect-[3/4] w-32 shrink-0 object-cover sm:w-full"
              />
              <span className="flex flex-1 flex-col justify-center gap-2 p-4 sm:justify-start sm:p-5">
                <span className="font-heading text-lead leading-snug font-bold">{game.title}</span>
                <span className="text-body text-ink-soft">{game.blurb}</span>
                <span className="mt-1 inline-flex items-center gap-2 text-body font-bold text-accent">
                  Play
                  <Icon name="forward" className="size-5" />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
