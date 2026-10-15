import { useState, type ReactNode } from 'react'
import MetaBalls from '../effect/MetaBalls'
import { cn } from '../../lib/cn'

type Tone = 'mist' | 'violet'

const tones: Record<Tone, { fill: string; balls: string; cursor: string }> = {
  // Mist fill, navy text: the quiet conversion action.
  mist: { fill: 'bg-mist text-navy', balls: '#9A8DA9', cursor: '#71657C' },
  // Bright violet fill, ink text (4.7:1 at the deep end): the one action a view is built around.
  violet: { fill: 'bg-violet-gradient text-imperium-950 font-semibold', balls: '#F7F3FB', cursor: '#D5B9FF' },
}

/** Primary CTA. The WebGL layer only exists while hovered or focused, so an idle button costs nothing. */
export function MetaBallsButton({
  href,
  children,
  tone = 'mist',
  className,
}: {
  href: string
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  const [hovered, setHovered] = useState(false)
  const t = tones[tone]

  return (
    <a
      href={href}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={cn(
        'relative inline-flex h-12 items-center overflow-hidden rounded-full px-7 text-small font-medium tracking-wide transition-transform duration-500 ease-out-soft hover:-translate-y-0.5',
        t.fill,
        className,
      )}
    >
      {hovered && (
        <span className="absolute inset-0 opacity-40">
          <MetaBalls
            color={t.balls}
            cursorBallColor={t.cursor}
            enableTransparency
            speed={0.3}
            ballCount={5}
            animationSize={14}
            clumpFactor={0.9}
            cursorBallSize={2.5}
            hoverSmoothness={0.12}
          />
        </span>
      )}
      <span className="relative flex items-center gap-3">
        {children} <span aria-hidden>→</span>
      </span>
    </a>
  )
}
