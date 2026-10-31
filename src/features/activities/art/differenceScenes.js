import { P } from './palette'
import { bird, circle, cloud, ellipse, flower, group, line, path, poly, rect, svgUri, tree } from './svg'

// Spot the Difference scenes, 800 x 600 (4:3). Each scene is one drawing function that takes
// `v`, either 'a' (the first picture) or 'b' (the second). The five differences are the only
// places where the two versions disagree, and each one is listed in `differences` with its
// position as a percentage of the picture, so the pictures and the game data cannot drift apart.
const W = 800
const H = 600

const pct = (x, y) => ({ x: (x / W) * 100, y: (y / H) * 100 })

// ---------------------------------------------------------------- Garden
function gardenBody(v) {
  const a = v === 'a'
  const picket = (x) =>
    path(`M${x} 470 L${x} 410 L${x + 20} 388 L${x + 40} 410 L${x + 40} 470 Z`, P.white, P.lineStrong, 3)
  let body =
    rect(0, 0, W, H, P.sky) +
    circle(700, 90, 70, P.amberSoft) +
    circle(700, 90, 50, P.butter) +
    cloud(150, 100, 1) +
    cloud(560, 150, 0.8) +
    ellipse(230, 330, 330, 110, P.mint) +
    ellipse(640, 340, 300, 90, P.mint) +
    rect(0, 340, W, 260, P.sage) +
    path('M110 600 Q330 520 540 470 L650 482 Q420 560 340 600 Z', P.peach) +
    // tree with fruit
    tree(210, 430, 330) +
    circle(190, 180, 20, P.orange) +
    circle(225, 235, 20, P.orange) +
    // fence rails and pickets
    rect(320, 418, 480, 14, P.white, 4, P.lineStrong, 3) +
    rect(320, 452, 480, 14, P.white, 4, P.lineStrong, 3)
  ;[340, 400, 460, 520, 580, 640, 700, 760].forEach((x) => {
    if (x === 520 && !a) return // difference 4: a missing picket
    body += picket(x)
  })
  // flower bed, front left
  body +=
    [[70, 530], [140, 560], [220, 540]].map(([x, y]) => line(x, y, x, y + 50, P.gentle, 6)).join('') +
    flower(70, 530, 22, P.white, P.butter, P.lineStrong) +
    flower(140, 560, 22, P.butter, P.amber) +
    flower(220, 540, 22, P.white, P.orange, P.lineStrong)
  // difference 3: the big flower changes colour
  body +=
    line(650, 548, 650, 598, P.gentle, 7) +
    flower(650, 540, 30, a ? P.purple : P.orange, P.butter)
  // difference 5: the butterfly's wings change colour
  const wing = a ? P.turquoise : P.purple
  body += group(
    'translate(480 330)',
    ellipse(-24, -10, 28, 22, wing, -25) +
      ellipse(24, -10, 28, 22, wing, 25) +
      ellipse(-18, 18, 20, 16, wing, 25) +
      ellipse(18, 18, 20, 16, wing, -25) +
      ellipse(0, 4, 5, 28, P.ink),
  )
  // difference 2: a piece of fruit on the tree (B has one fewer, drawn above as base; add it here)
  if (a) body += circle(268, 215, 20, P.orange)
  // difference 1: a bird in the sky (only in B)
  if (!a) body += bird(420, 110, 1.3)
  return body
}

// ------------------------------------------------------------- Tea table
function teaBody(v) {
  const a = v === 'a'
  const teapot = a ? P.accent : P.purple
  let body =
    rect(0, 0, W, H, P.mint) +
    // window with curtains
    rect(60, 50, 230, 230, P.white, 14, P.lineStrong, 4) +
    rect(76, 66, 96, 198, P.sky, 6) +
    rect(178, 66, 96, 198, P.sky, 6) +
    circle(190, 120, 22, P.butter) +
    path('M40 40 Q90 150 60 300 L120 300 Q130 150 120 40 Z', P.butter, P.amber, 3) +
    path('M310 40 Q260 150 290 300 L230 300 Q220 150 230 40 Z', P.butter, P.amber, 3) +
    // wall clock
    circle(600, 170, 62, P.white, P.ink, 8) +
    line(600, 118, 600, 128, P.ink, 6) +
    line(600, 212, 600, 222, P.ink, 6) +
    line(548, 170, 558, 170, P.ink, 6) +
    line(642, 170, 652, 170, P.ink, 6) +
    (a
      ? line(600, 170, 600, 126, P.ink, 8) + line(600, 170, 636, 170, P.accent, 8) // twelve and three
      : line(600, 170, 600, 212, P.ink, 8) + line(600, 170, 564, 170, P.accent, 8)) + // six and nine
    circle(600, 170, 8, P.ink) +
    // table
    rect(0, 400, W, 200, P.peach) +
    rect(0, 400, W, 14, P.amberSoft) +
    // plate of biscuits
    ellipse(150, 480, 108, 26, P.white, 0, P.lineStrong, 4) +
    ellipse(150, 474, 82, 16, P.sky) +
    // teapot
    path('M318 336 Q270 330 262 296 Q300 300 330 320 Z', teapot) +
    ellipse(400, 348, 84, 66, teapot) +
    ellipse(400, 292, 46, 14, teapot) +
    circle(400, 274, 14, P.butter) +
    path('M476 322 Q540 310 524 372 Q512 410 466 396', 'none', teapot, 14) +
    ellipse(372, 332, 20, 30, P.white, 20) +
    ellipse(400, 410, 96, 18, P.white, 0, P.lineStrong, 4) +
    // cup and saucer
    ellipse(600, 450, 76, 16, P.white, 0, P.lineStrong, 4) +
    path('M550 396 L650 396 Q648 448 600 452 Q552 448 550 396 Z', P.white, P.lineStrong, 4) +
    path('M552 414 L648 414 L646 424 L554 424 Z', P.turquoise) +
    path('M650 408 Q680 408 676 430 Q672 446 646 442', 'none', P.lineStrong, 8) +
    // vase on the right
    path('M700 420 Q690 360 704 330 L756 330 Q770 360 760 420 Z', P.turquoise) +
    line(716, 330, 704, 250, P.gentle, 6) +
    line(730, 330, 732, 240, P.gentle, 6) +
    line(746, 330, 764, 262, P.gentle, 6) +
    flower(704, 244, 15, P.white, P.amber, P.lineStrong) +
    flower(732, 232, 15, P.butter, P.orange) +
    flower(764, 256, 15, P.white, P.amber, P.lineStrong)
  // difference 2: the biscuits (B is missing the middle one)
  body += circle(100, 470, 26, P.amberSoft, P.orange, 4) + circle(200, 470, 26, P.amberSoft, P.orange, 4)
  if (a) body += circle(150, 452, 26, P.amberSoft, P.orange, 4)
  // difference 3: steam over the cup (only in A)
  if (a) body += path('M580 380 Q568 356 582 334 M604 380 Q592 352 606 326 M628 380 Q616 356 630 336', 'none', P.inkSoft, 7)
  // difference 4: an extra flower in the vase (only in B)
  if (!a) {
    body += line(722, 330, 690, 288, P.gentle, 6) + flower(688, 282, 17, P.purple, P.butter)
  }
  return body
}

// -------------------------------------------------------------- Seaside
function seasideBody(v) {
  const a = v === 'a'
  let body =
    rect(0, 0, W, H, P.sky) +
    circle(110, 90, 66, P.amberSoft) +
    circle(110, 90, 48, P.butter) +
    cloud(430, 80, 0.9) +
    cloud(680, 150, 0.7) +
    rect(0, 290, W, 150, P.turquoise) +
    [[120, 340], [300, 380], [470, 350], [640, 400], [740, 340], [60, 410]]
      .map(([x, y]) => path(`M${x - 28} ${y} q14 -14 28 0 q14 -14 28 0`, 'none', P.white, 5))
      .join('') +
    rect(0, 430, W, 170, P.butter) +
    path('M0 440 Q200 410 400 440 T800 430 L800 450 Q600 470 400 452 T0 460 Z', P.amberSoft) +
    // sailing boat
    path('M440 330 L600 330 L576 366 L466 366 Z', P.amber) +
    line(520, 330, 520, 218, P.ink, 7) +
    poly('528 226 528 322 592 322', a ? P.white : P.orange, P.lineStrong, 3) +
    poly('512 240 512 322 462 322', P.sky, P.lineStrong, 3) +
    // two gulls (B has a third)
    bird(250, 140, 1.2, P.inkSoft) +
    bird(340, 190, 1.0, P.inkSoft) +
    // umbrella
    line(210, 330, 214, 540, P.amber, 9) +
    `<clipPath id="canopy"><path d="M96 410 A114 114 0 0 1 324 410 Z"/></clipPath><g clip-path="url(#canopy)">${[0, 1, 2, 3, 4]
      .map((i) => rect(96 + i * 46, 290, 46, 130, i % 2 === 0 ? (a ? P.gentle : P.purple) : P.white))
      .join('')}</g>` +
    path('M96 410 A114 114 0 0 1 324 410 Z', 'none', P.ink, 4) +
    // sandcastle
    rect(500, 470, 140, 74, P.peach, 8, P.orange, 3) +
    rect(484, 440, 42, 104, P.peach, 6, P.orange, 3) +
    rect(612, 430, 42, 114, P.peach, 6, P.orange, 3) +
    [484, 500, 516].map((x) => rect(x, 430, 12, 14, P.peach, 2, P.orange, 3)).join('') +
    [612, 628, 644].map((x) => rect(x, 420, 12, 14, P.peach, 2, P.orange, 3)).join('') +
    path('M548 544 L548 510 Q570 486 592 510 L592 544 Z', P.sky) +
    // bucket and shells
    path('M690 506 L760 506 L748 560 L702 560 Z', P.purple) +
    path('M696 506 Q725 480 754 506', 'none', P.inkSoft, 5) +
    ellipse(110, 540, 24, 16, P.white, 0, P.lineStrong, 3) +
    ellipse(160, 560, 18, 12, P.peach, 0, P.orange, 3)
  // difference 5: an extra gull in B
  if (!a) body += bird(430, 205, 1.1, P.inkSoft)
  // difference 3: a starfish on the sand (only in A)
  if (a) {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? 30 : 13
      const ang = (-90 + i * 36) * (Math.PI / 180)
      return `${360 + Math.cos(ang) * r},${540 + Math.sin(ang) * r}`
    }).join(' ')
    body += poly(pts, P.orange, P.amber, 3)
  }
  // difference 4: a flag on the sandcastle (only in A)
  if (a) body += line(633, 420, 633, 376, P.ink, 6) + poly('636 378 636 404 674 391', P.orange)
  return body
}

export const SCENE_ART = {
  garden: {
    imageA: svgUri(W, H, gardenBody('a')),
    imageB: svgUri(W, H, gardenBody('b')),
    differences: [
      { id: 'garden-bird', ...pct(420, 110), label: 'the bird in the sky', hint: 'Look up at the sky, between the clouds.' },
      { id: 'garden-fruit', ...pct(268, 215), label: 'the fruit on the tree', hint: 'Look carefully at the tree on the left.' },
      { id: 'garden-flower', ...pct(650, 540), label: 'the big flower', hint: 'Look at the flowers at the bottom right.' },
      { id: 'garden-fence', ...pct(540, 440), label: 'the fence', hint: 'Look along the fence on the right.' },
      { id: 'garden-butterfly', ...pct(480, 330), label: 'the butterfly', hint: 'Look in the middle of the garden.' },
    ],
  },
  tea: {
    imageA: svgUri(W, H, teaBody('a')),
    imageB: svgUri(W, H, teaBody('b')),
    differences: [
      { id: 'tea-clock', ...pct(600, 170), label: 'the clock', hint: 'Look at the clock on the wall.' },
      { id: 'tea-teapot', ...pct(400, 348), label: 'the teapot', hint: 'Look at the teapot in the middle.' },
      { id: 'tea-biscuit', ...pct(150, 452), label: 'the biscuits', hint: 'Look at the plate on the left.' },
      { id: 'tea-steam', ...pct(604, 354), label: 'the steam from the cup', hint: 'Look just above the cup on the right.' },
      { id: 'tea-vase', ...pct(688, 282), label: 'the flowers in the vase', hint: 'Look at the vase on the far right.' },
    ],
  },
  seaside: {
    imageA: svgUri(W, H, seasideBody('a')),
    imageB: svgUri(W, H, seasideBody('b')),
    differences: [
      { id: 'sea-sail', ...pct(560, 280), label: 'the sail on the boat', hint: 'Look at the boat out on the water.' },
      { id: 'sea-gull', ...pct(430, 205), label: 'the extra seagull', hint: 'Look up in the sky.' },
      { id: 'sea-umbrella', ...pct(210, 350), label: 'the beach umbrella', hint: 'Look at the umbrella on the left.' },
      { id: 'sea-flag', ...pct(650, 396), label: 'the flag on the sandcastle', hint: 'Look at the sandcastle on the right.' },
      { id: 'sea-starfish', ...pct(360, 540), label: 'the starfish', hint: 'Look at the sand at the bottom.' },
    ],
  },
}

// Whole-scene bodies for the gallery covers.
export const SCENE_BODIES = { garden: gardenBody, tea: teaBody, seaside: seasideBody }
