import { P } from './palette'
import { bird, circle, cloud, ellipse, flower, group, line, path, poly, rect, svgUri, tree } from './svg'

// Picture Puzzle pictures, 800 x 600 (4:3). Each one is composed so that every part of the
// picture (a 4 x 3 grid of 200 px cells at the hardest setting) holds something different:
// a shape, an edge or a colour change, so a single piece is recognisable on its own.
const W = 800
const H = 600

function gardenBody() {
  return (
    rect(0, 0, W, H, P.sky) +
    // sun with rays, top right
    [0, 45, 90, 135, 180, 225, 270, 315]
      .map((a) => `<g transform="rotate(${a} 680 100)">${line(680, 20, 680, 40, P.orange, 8)}</g>`)
      .join('') +
    circle(680, 100, 46, P.butter, P.orange, 5) +
    cloud(150, 90, 1) +
    cloud(450, 60, 0.7) +
    bird(380, 170, 1.1) +
    group('translate(560 215)', ellipse(-18, -8, 22, 17, P.purple, -25) + ellipse(18, -8, 22, 17, P.purple, 25) + ellipse(-13, 14, 15, 12, P.turquoise, 25) + ellipse(13, 14, 15, 12, P.turquoise, -25) + ellipse(0, 3, 4, 22, P.ink)) +
    ellipse(200, 330, 300, 100, P.mint) +
    ellipse(640, 340, 260, 80, P.mint) +
    rect(0, 330, W, 270, P.sage) +
    // house, left
    rect(60, 240, 230, 170, P.white, 8, P.lineStrong, 4) +
    poly('40 250 175 150 310 250', P.accent) +
    rect(240, 160, 30, 60, P.amber, 4) +
    rect(150, 320, 54, 90, P.orange, 6) +
    circle(194, 366, 5, P.butter) +
    rect(82, 270, 54, 50, P.sky, 4, P.lineStrong, 4) +
    rect(214, 270, 54, 50, P.sky, 4, P.lineStrong, 4) +
    // tree with orange fruit, right
    tree(560, 430, 300) +
    circle(530, 220, 18, P.orange) +
    circle(590, 250, 18, P.orange) +
    circle(560, 180, 18, P.orange) +
    // path and fence
    path('M330 600 Q380 520 470 440 L530 450 Q480 540 480 600 Z', P.peach) +
    rect(620, 440, 180, 12, P.white, 4, P.lineStrong, 3) +
    [630, 690, 750].map((x) => rect(x, 410, 34, 80, P.white, 8, P.lineStrong, 3)).join('') +
    // flower bed and watering can, front
    [[70, 540, P.purple], [140, 560, P.butter], [230, 545, P.white], [560, 560, P.purple], [680, 545, P.orange]]
      .map(([x, y, c]) => line(x, y, x, y + 55, P.gentle, 6) + flower(x, y, 20, c, c === P.butter ? P.amber : P.butter, P.lineStrong))
      .join('') +
    group('translate(380 520)', rect(0, 0, 70, 56, P.turquoise, 10) + path('M70 14 L106 -8 L112 6 L70 30 Z', P.turquoise) + path('M8 0 Q35 -34 62 0', 'none', P.turquoise, 8))
  )
}

function lakeBody() {
  return (
    rect(0, 0, W, H, P.sky) +
    cloud(560, 80, 0.9) +
    cloud(120, 70, 0.7) +
    circle(400, 190, 60, P.butter, P.orange, 5) +
    // mountains
    poly('0 330 140 130 290 330', P.accent) +
    poly('110 330 230 200 350 330', P.deep) +
    poly('140 130 112 176 140 164 170 180', P.white) +
    poly('450 330 600 110 780 330', P.accent) +
    poly('600 110 568 160 600 148 634 164', P.white) +
    poly('600 330 720 210 800 330', P.deep) +
    // lake with reflection stripes
    rect(0, 330, W, 270, P.turquoise) +
    [[400, 360, 90], [400, 392, 60], [400, 424, 120], [400, 460, 70]]
      .map(([x, y, w]) => rect(x - w / 2, y, w, 8, P.butter, 4))
      .join('') +
    [[100, 420], [620, 400], [180, 520], [560, 540], [740, 470]]
      .map(([x, y]) => path(`M${x - 30} ${y} q15 -14 30 0 q15 -14 30 0`, 'none', P.white, 5))
      .join('') +
    // shore trees, left
    tree(60, 350, 190) +
    tree(150, 345, 150, P.gentle) +
    // sailing boat
    path('M220 440 L330 440 L308 476 L242 476 Z', P.amber) +
    line(275, 440, 275, 346, P.ink, 6) +
    poly('282 352 282 436 332 436', P.white, P.lineStrong, 3) +
    poly('268 366 268 436 232 436', P.peach, P.orange, 3) +
    // ducks
    [[560, 470, 1], [640, 490, 0.8]]
      .map(([x, y, s]) =>
        group(`translate(${x} ${y}) scale(${s})`,
          ellipse(0, 0, 40, 24, P.white, 0, P.lineStrong, 3) + circle(34, -22, 16, P.white, P.lineStrong, 3) + poly('48 -22 66 -16 48 -12', P.orange) + circle(38, -26, 3, P.ink)))
      .join('') +
    // reeds, bottom left, and dock, bottom right
    [20, 50, 80, 110].map((x, i) => line(x, 600, x + (i % 2 ? 10 : -6), 500 - i * 12, P.gentle, 7)).join('') +
    [20, 50, 80, 110].map((x, i) => ellipse(x + (i % 2 ? 10 : -6), 490 - i * 12, 7, 20, P.amber)).join('') +
    rect(520, 556, 280, 44, P.amber, 4) +
    [540, 610, 680, 750].map((x) => line(x, 556, x, 600, P.inkSoft, 4)).join('') +
    ellipse(380, 560, 40, 14, P.gentle) +
    ellipse(440, 585, 30, 10, P.gentle)
  )
}

function teaBody() {
  return (
    rect(0, 0, W, H, P.mint) +
    // window with curtain, left
    rect(40, 40, 250, 250, P.white, 14, P.lineStrong, 4) +
    rect(56, 56, 106, 218, P.sky, 6) +
    rect(168, 56, 106, 218, P.sky, 6) +
    circle(215, 120, 26, P.butter) +
    path('M20 30 Q80 150 50 310 L120 310 Q130 150 120 30 Z', P.butter, P.amber, 3) +
    // picture frame, top right
    rect(500, 50, 200, 150, P.white, 10, P.amber, 8) +
    path('M516 184 L580 110 L620 150 L650 124 L686 184 Z', P.gentle) +
    circle(650, 88, 20, P.butter) +
    // wall shelf with jars, top centre
    rect(320, 150, 160, 12, P.amber, 4) +
    rect(336, 96, 40, 54, P.turquoise, 8) +
    rect(392, 112, 34, 38, P.butter, 8, P.amber, 3) +
    rect(440, 80, 30, 70, P.purple, 8) +
    // table
    rect(0, 400, W, 200, P.peach) +
    rect(0, 400, W, 14, P.amberSoft) +
    // cake stand and cake, left
    ellipse(170, 470, 120, 20, P.white, 0, P.lineStrong, 4) +
    rect(160, 470, 20, 70, P.white, 4, P.lineStrong, 3) +
    ellipse(170, 545, 70, 14, P.white, 0, P.lineStrong, 4) +
    rect(90, 390, 160, 70, P.orange, 14) +
    path('M90 400 Q112 430 134 400 Q156 430 178 400 Q200 430 222 400 Q236 418 250 400 L250 392 L90 392 Z', P.white) +
    circle(130, 380, 12, P.purple) +
    circle(172, 376, 12, P.purple) +
    circle(214, 380, 12, P.purple) +
    // teapot, centre
    path('M338 320 Q290 316 282 284 Q320 286 350 306 Z', P.accent) +
    ellipse(420, 340, 86, 68, P.accent) +
    ellipse(420, 280, 48, 14, P.accent) +
    circle(420, 262, 14, P.butter) +
    path('M498 312 Q564 300 546 366 Q534 404 486 390', 'none', P.accent, 14) +
    ellipse(392, 324, 20, 30, P.white, 20) +
    ellipse(420, 408, 100, 18, P.white, 0, P.lineStrong, 4) +
    // cup with steam, right
    ellipse(640, 460, 76, 16, P.white, 0, P.lineStrong, 4) +
    path('M590 404 L690 404 Q688 456 640 460 Q592 456 590 404 Z', P.white, P.lineStrong, 4) +
    path('M592 424 L688 424 L686 434 L594 434 Z', P.turquoise) +
    path('M692 416 Q722 416 718 438 Q714 454 688 450', 'none', P.lineStrong, 8) +
    path('M620 380 Q608 356 622 334 M644 380 Q632 352 646 326 M668 380 Q656 356 670 336', 'none', P.inkSoft, 7) +
    // plant, bottom right corner
    rect(724, 520, 70, 80, P.purple, 8) +
    path('M759 520 Q720 470 730 430 Q760 470 759 520 Z', P.gentle) +
    path('M759 520 Q800 480 790 440 Q760 480 759 520 Z', P.gentle) +
    flower(300, 540, 18, P.white, P.orange, P.lineStrong)
  )
}

function catBody() {
  return (
    rect(0, 0, W, H, P.sky) +
    // window, top right, with curtain
    rect(520, 40, 240, 230, P.white, 14, P.lineStrong, 4) +
    rect(536, 56, 100, 198, P.mint, 6) +
    rect(644, 56, 100, 198, P.mint, 6) +
    circle(590, 110, 22, P.butter) +
    path('M780 30 Q730 150 760 290 L700 290 Q690 150 700 30 Z', P.butter, P.amber, 3) +
    // picture and plant, top left
    rect(60, 60, 150, 110, P.white, 10, P.amber, 7) +
    path('M72 156 L110 100 L136 128 L160 108 L198 156 Z', P.gentle) +
    // shelf with books and a lamp, top centre
    rect(250, 190, 210, 12, P.amber, 4) +
    rect(268, 120, 26, 70, P.purple, 4) + rect(298, 134, 24, 56, P.turquoise, 4) + rect(326, 126, 28, 64, P.orange, 4) +
    circle(420, 168, 22, P.butter, P.amber, 4) +
    // floor and rug
    rect(0, 370, W, 230, P.sage) +
    rect(0, 360, W, 14, P.line) +
    ellipse(400, 500, 330, 76, P.peach, 0, P.orange, 4) +
    ellipse(400, 500, 250, 50, P.amberSoft) +
    // pot plant, left
    rect(70, 280, 80, 90, P.purple, 8) +
    path('M110 280 Q70 220 84 170 Q116 220 110 280 Z', P.gentle) +
    path('M110 280 Q150 230 140 180 Q110 230 110 280 Z', P.gentle) +
    path('M110 280 Q100 200 112 140 Q130 210 110 280 Z', P.turquoise) +
    // cushion and curled cat
    ellipse(400, 470, 190, 56, P.accent) +
    ellipse(400, 458, 170, 44, P.accentSoft) +
    ellipse(420, 400, 150, 70, P.inkSoft) +
    path('M545 420 Q620 400 590 350 Q560 330 540 360', 'none', P.inkSoft, 28) +
    circle(310, 392, 56, P.inkSoft) +
    poly('264 366 270 308 312 342', P.inkSoft) +
    poly('356 366 350 308 308 342', P.inkSoft) +
    poly('274 352 276 322 298 338', P.peach) +
    path('M286 394 Q298 404 310 394 M322 394 Q334 404 346 394', 'none', P.butter, 5) +
    poly('306 410 318 410 312 418', P.peach) +
    ellipse(350, 450, 34, 16, P.white) +
    ellipse(446, 438, 40, 16, P.white) +
    // ball of wool, right
    circle(660, 520, 40, P.orange) +
    path('M626 508 Q660 480 694 508 M622 528 Q660 500 698 528 M634 548 Q660 526 688 548', 'none', P.peach, 5) +
    path('M630 548 Q580 560 560 540', 'none', P.orange, 6)
  )
}

export const PUZZLE_BODIES = { garden: gardenBody, lake: lakeBody, tea: teaBody, cat: catBody }

export const puzzleArt = Object.fromEntries(
  Object.entries(PUZZLE_BODIES).map(([id, draw]) => [id, svgUri(W, H, draw())]),
)
