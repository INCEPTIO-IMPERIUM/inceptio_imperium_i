import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Eyebrow } from './Eyebrow'

type SectionToplineProps = {
  /** The section label, left. */
  eyebrow: ReactNode
  /** 1-based position of this section. */
  index: number
  total: number
  rule?: boolean
  className?: string
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The line every section opens with: label on the left, position on the right (`02 — 07`).
 * The counter uses steel (5.7:1 on the grain canvas), not slate (3.2:1), because it is 12px text.
 */
export function SectionTopline({ eyebrow, index, total, rule, className }: SectionToplineProps) {
  return (
    <div className={cn('mb-[clamp(1.75rem,5vw,4rem)] flex items-center justify-between gap-5', className)}>
      <Eyebrow rule={rule}>{eyebrow}</Eyebrow>
      <p
        className="font-mono text-caption tracking-[0.2em] text-steel"
        aria-label={`Section ${index} of ${total}`}
      >
        {pad(index)} — {pad(total)}
      </p>
    </div>
  )
}
