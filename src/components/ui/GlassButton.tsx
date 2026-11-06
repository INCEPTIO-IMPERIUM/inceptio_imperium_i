import type { ReactNode } from 'react'
import GlassSurface from '../effect/GlassSurface'
import { cn } from '../../lib/cn'

/** Secondary CTA: a GlassSurface pill with a nudging arrow. */
export function GlassButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'group inline-flex rounded-full transition-transform duration-500 ease-out-soft hover:-translate-y-0.5',
        className,
      )}
    >
      <GlassSurface
        tone="dark"
        width="auto"
        height={46}
        borderRadius={23}
        brightness={60}
        backgroundOpacity={0.04}
        saturation={1.2}
      >
        <span className="flex items-center gap-3 px-5 text-small tracking-wide text-mist">
          {children}
          <span aria-hidden className="text-steel transition-transform duration-500 ease-out-soft group-hover:translate-x-1">
            →
          </span>
        </span>
      </GlassSurface>
    </a>
  )
}
