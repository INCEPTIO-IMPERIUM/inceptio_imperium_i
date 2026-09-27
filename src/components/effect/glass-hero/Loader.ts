import { damp } from './math'

export interface LoaderElements {
  root: HTMLElement
  arc: SVGCircleElement
  step: HTMLElement
}

const CIRCUMFERENCE = 2 * Math.PI * 22

/**
 * Honest progress: it only advances when a real step completes
 * (fonts → text atlas → shader compile → first frame).
 */
export class Loader {
  private els: LoaderElements
  private shown = 0
  private target = 0
  private raf = 0
  private last = 0
  private resolveDone: (() => void) | null = null

  constructor(els: LoaderElements) {
    this.els = els
    this.els.arc.style.strokeDasharray = `${CIRCUMFERENCE}`
    this.els.arc.style.strokeDashoffset = `${CIRCUMFERENCE}`
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  step(progress: number, label: string) {
    this.target = Math.max(this.target, progress)
    this.els.step.textContent = label
    this.els.root.setAttribute('aria-valuenow', String(Math.round(this.target * 100)))
  }

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    this.shown = damp(this.shown, this.target, 9, dt)
    if (this.target - this.shown < 0.002) this.shown = this.target
    this.els.arc.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - this.shown)}`
    if (this.shown >= 1 && this.resolveDone) {
      this.resolveDone()
      this.resolveDone = null
    }
    this.raf = requestAnimationFrame(this.tick)
  }

  /** Resolves once the ring has visibly filled, then scales the loader away. */
  async finish(reduced: boolean) {
    this.step(1, 'Ready')
    await new Promise<void>(resolve => {
      if (this.shown >= 1) resolve()
      else this.resolveDone = resolve
    })
    cancelAnimationFrame(this.raf)
    const root = this.els.root
    root.style.transitionDuration = reduced ? '250ms' : '700ms'
    root.style.opacity = '0'
    if (!reduced) {
      root.style.transform = 'scale(0.9)'
      root.style.filter = 'blur(8px)'
    }
    root.setAttribute('aria-hidden', 'true')
    root.setAttribute('aria-busy', 'false')
    await new Promise(resolve => setTimeout(resolve, reduced ? 120 : 260))
    setTimeout(() => {
      root.style.display = 'none'
    }, reduced ? 260 : 720)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
  }
}
