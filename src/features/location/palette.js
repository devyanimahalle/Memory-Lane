// Colours for the Leaflet map, read from the design tokens in src/index.css at build time (map options
// and popup HTML cannot use CSS variables). Nothing is written out by hand, so the map can only use
// approved tokens.
import themeCss from '../../index.css?raw'

export const T = Object.fromEntries(
  [...themeCss.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
)
