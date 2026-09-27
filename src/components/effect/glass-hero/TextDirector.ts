import { clamp, remap, smoother } from './math'

interface Line {
  el: HTMLElement
  mask: boolean
  index: number
  last: number
}

interface Block {
  el: HTMLElement
  chapter: number
  lines: Line[]
  interactive: boolean | null
}

/*
 * Moves every text line from the same smoothed scroll value that drives
 * the object. Relative to its chapter (local = c − k):
 *   enter −0.36 … −0.12 · hold · exit 0.08 … 0.26   (+ stagger per line)
 * The object only travels between 0.28 and 0.62, so text is gone before it
 * travels and arrives after it has settled.
 */
const ENTER = [-0.36, -0.12] as const
const EXIT = [0.08, 0.26] as const
const STAGGER = 0.03

export class TextDirector {
  private blocks: Block[]

  constructor(root: HTMLElement) {
    this.blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]')).map(el => ({
      el,
      chapter: Number(el.dataset.chapter),
      interactive: null,
      lines: Array.from(el.querySelectorAll<HTMLElement>('[data-line]')).map((line, index) => ({
        el: line,
        mask: line.dataset.line === 'mask',
        index,
        last: -1,
      })),
    }))
  }

  /** `intro` runs 0 → 1+ after loading and gates the first chapter's reveal. */
  update(c: number, intro: number, reduced: boolean) {
    for (const block of this.blocks) {
      const local = c - block.chapter
      let visible = 0
      for (const line of block.lines) {
        const s = line.index * STAGGER
        let enter = smoother(remap(local, ENTER[0] + s, ENTER[1] + s))
        const exit = smoother(remap(local, EXIT[0] + s * 0.6, EXIT[1] + s * 0.6))
        if (block.chapter === 0) enter *= smoother(remap(intro, line.index * 0.1, line.index * 0.1 + 0.55))
        const v = clamp(enter) * (1 - exit)
        visible = Math.max(visible, v)
        const q = Math.round(v * 1000) / 1000
        const dir = exit > 0 ? -1 : 1
        const key = q + dir * 2
        if (key === line.last) continue
        line.last = key
        this.apply(line, q, dir, reduced)
      }
      const interactive = visible > 0.6
      if (interactive !== block.interactive) {
        block.interactive = interactive
        block.el.style.pointerEvents = interactive ? '' : 'none'
      }
    }
  }

  private apply(line: Line, v: number, dir: number, reduced: boolean) {
    const s = line.el.style
    s.opacity = String(reduced ? v : v * v * (3 - 2 * v))
    if (reduced) {
      s.transform = ''
      s.filter = ''
      return
    }
    const hidden = 1 - v
    s.transform = line.mask
      ? `translate3d(0, ${(hidden * 105 * dir).toFixed(2)}%, 0)`
      : `translate3d(0, ${(hidden * 18 * dir).toFixed(2)}px, 0)`
    s.filter = hidden > 0.001 && hidden < 0.999 ? `blur(${(hidden * 8).toFixed(2)}px)` : ''
  }

  /** Which chapter a DOM node belongs to, for keyboard focus. */
  chapterOf(node: Node): number | null {
    for (const block of this.blocks) if (block.el.contains(node)) return block.chapter
    return null
  }
}
