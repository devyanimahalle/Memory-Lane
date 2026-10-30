import { useEffect, useMemo, useRef, useState } from 'react'
import FlexCarousel from '../../../components/FlexCarousel'

const REACH = 0.36 // the `arch` preset's reach, used to size the lens

// Mint Daylight settings for the shared OGL carousel. The lens (wave) shader is kept as
// the original `arch` preset. The lens is sized from the measured container so the centre card
// stays clean while the side cards bend away; recede and keystone add the depth.
// Lazy-loaded by the album section.
export default function MemoryCarousel({
  memories,
  initialIndex = 0,
  restored = false,
  onChange,
  onSelect,
  controlRef,
}) {
  const boxRef = useRef(null)
  const [size, setSize] = useState(null)

  useEffect(() => {
    const box = boxRef.current
    const measure = () => setSize({ width: box.clientWidth, height: box.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  const items = useMemo(
    () =>
      memories.map((memory) => ({
        src: memory.cover.src,
        alt: memory.cover.alt,
        title: memory.title,
        subtitle: memory.when,
      })),
    [memories],
  )

  let layout = null
  if (size && size.width > 0 && size.height > 0) {
    const compact = size.width < 520
    const cardWidth = Math.min(size.width * (compact ? 0.52 : 0.46), 440)
    const cardHeight = Math.min(cardWidth / (compact ? 1 : 4 / 3) / size.height, 0.6)
    const halfLens = (cardWidth / 2 + 28) / (1 - REACH)
    const lens = (2 * halfLens) / size.width
    layout = { cardHeight, lens, fit: compact ? 'square' : 'landscape' }
  }

  return (
    <div ref={boxRef} className="h-full">
      {layout && (
        <FlexCarousel
          ref={controlRef}
          ariaLabel="Memories"
          items={items}
          preset="arch"
          fit={layout.fit}
          cardHeight={layout.cardHeight}
          lensWidth={layout.lens}
          lensHeight={layout.lens}
          gap={14}
          radius={20}
          recede={1}
          keystone={0.1}
          squeeze={0.08}
          dispersion={0}
          intro={restored ? 'none' : 'fade'}
          initialIndex={initialIndex}
          focusOnClick={false}
          captureWheel={false}
          onChange={onChange}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}
