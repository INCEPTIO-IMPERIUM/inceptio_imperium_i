import { useEffect, useState } from 'react'

/**
 * Scroll-spy: returns the id of the section crossing the middle of the viewport,
 * or null when none does (e.g. while the hero is in view).
 *
 * A thin band around the viewport's centre decides, so a tall section stays
 * active for its whole length.
 *
 * `keepLast`: never return null — in the gaps between sections (and below the last one)
 * report the last section scrolled past. For a position counter, which should never go blank.
 */
export function useActiveSection(ids: readonly string[], { keepLast = false } = {}): string | null {
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
        let next = elements.filter(el => visible.has(el.id)).at(-1)?.id ?? null
        // In a gap (or below the last section, e.g. at the footer), fall back to the last section
        // scrolled past. Holding the previous value would go stale after a long jump.
        if (next === null && keepLast) {
          const middle = window.innerHeight / 2
          next = elements.filter(el => el.getBoundingClientRect().top < middle).at(-1)?.id ?? elements[0].id
        }
        setActive(prev => (prev === next ? prev : next))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [key, keepLast])

  return active
}
