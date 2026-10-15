import { useEffect, useState } from 'react'

/**
 * Scroll-spy: returns the id of the section crossing the middle of the viewport,
 * or null when none does (e.g. while the hero is in view).
 *
 * A thin band around the viewport's centre decides, so tall pinned sections
 * (Principles is ~470vh) stay active for their whole length.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')

  useEffect(() => {
    const elements = key
      .split('|')
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // Several can touch the band at a boundary; the later one in document order wins.
        const next = elements.filter(el => visible.has(el.id)).at(-1)?.id ?? null
        setActive(prev => (prev === next ? prev : next))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [key])

  return active
}
