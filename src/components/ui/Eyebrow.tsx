import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type EyebrowProps = {
  children: ReactNode
  /** A short violet rule before the label — use once per view, on the section that leads. */
  rule?: boolean
  className?: string
}

export function Eyebrow({ children, rule = false, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        'font-mono text-caption uppercase tracking-[0.3em] text-steel',
        rule && 'flex items-center gap-3',
        className,
      )}
    >
      {rule && <span aria-hidden className="inline-block h-px w-8 bg-violet" />}
      {children}
    </p>
  )
}
