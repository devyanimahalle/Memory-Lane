// The only colours the game illustrations may use: the Mint Daylight tokens in src/index.css.
// A data-URI image cannot read CSS variables, so the token values are read from the stylesheet
// source at build time. Nothing is written out by hand here, so the art can never drift from the
// design system, and a missing token fails loudly.
import themeCss from '../../../index.css?raw'

const tokens = Object.fromEntries(
  [...themeCss.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
)

function token(name) {
  if (!tokens[name]) throw new Error(`Missing colour token --color-${name} in src/index.css`)
  return tokens[name]
}

export const P = {
  white: token('surface'),
  canvas: token('canvas'),
  mint: token('sunken'),
  line: token('line'),
  lineStrong: token('line-strong'),
  ink: token('ink'),
  inkSoft: token('ink-soft'),
  accent: token('accent'),
  accentSoft: token('accent-soft'),
  turquoise: token('turquoise'),
  deep: token('deep'),
  gentle: token('gentle'),
  gentleSoft: token('gentle-soft'),
  amber: token('attention'),
  amberSoft: token('attention-soft'),
  sage: token('tint-sage'),
  sky: token('tint-sky'),
  peach: token('tint-peach'),
  butter: token('tint-butter'),
  orange: token('chart-2'),
  purple: token('chart-3'),
}
