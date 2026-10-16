import { useReducedMotion } from 'motion/react'
import GlassSurface from '../effect/GlassSurface'
import { cn } from '../../lib/cn'
import { useActiveSection } from '../../lib/useActiveSection'

type Section = { id: string; label: string }

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The template's presentation HUD as a quiet position counter: where you are,
 * how far along, and a step to the neighbouring section. It only moves when the
 * reader does — no keyboard hijacking, no scroll snapping.
 */
export function SectionHud({ sections, className }: { sections: readonly Section[]; className?: string }) {
  const ids = sections.map(s => s.id)
  const active = useActiveSection(ids, { keepLast: true })
  const reduceMotion = useReducedMotion()
  const index = Math.max(0, ids.indexOf(active ?? ids[0]))
  const prev = sections[index - 1]
  const next = sections[index + 1]

  const go = (section: Section | undefined) => {
    if (!section) return
    document.getElementById(section.id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    // z-[150]: the page-level GradualBlur renders at its zIndex + 100 (140 on Homepage); the HUD must sit above it.
    <aside aria-label="Section navigation" className={cn('fixed bottom-6 right-6 z-[150]', className)}>
      <GlassSurface tone="dark" width="auto" height={44} borderRadius={22} brightness={55} backgroundOpacity={0.05} saturation={1.2}>
        <div className="flex items-center gap-3 pl-4 pr-1.5">
          <p className="whitespace-nowrap font-mono text-caption uppercase tracking-[0.2em] text-steel">
            <span className="sr-only">Section </span>
            <span className="text-mist">{pad(index + 1)}</span>
            <span aria-hidden> / </span>
            <span className="sr-only"> of </span>
            {pad(sections.length)}
            <span className="sr-only">: {sections[index].label}</span>
          </p>

          <span aria-hidden className="h-px w-14 overflow-hidden rounded-full bg-white/15">
            <span
              className="block h-full origin-left bg-violet-light transition-transform duration-700 ease-out-soft"
              style={{ transform: `scaleX(${(index + 1) / sections.length})` }}
            />
          </span>

          <div className="flex gap-1">
            {[
              { target: prev, glyph: '↑', verb: 'Previous' },
              { target: next, glyph: '↓', verb: 'Next' },
            ].map(({ target, glyph, verb }) => (
              <button
                key={verb}
                type="button"
                onClick={() => go(target)}
                disabled={!target}
                aria-label={target ? `${verb} section: ${target.label}` : `${verb} section`}
                title={target?.label}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-small text-mist transition-colors duration-500 enabled:hover:border-violet/60 enabled:hover:text-violet-light disabled:opacity-30"
              >
                <span aria-hidden>{glyph}</span>
              </button>
            ))}
          </div>
        </div>
      </GlassSurface>
    </aside>
  )
}
