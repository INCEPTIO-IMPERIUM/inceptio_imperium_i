import { damp } from './math'

/**
 * Native scroll, smoothed. The page keeps real scroll height, so the
 * keyboard, scrollbars and assistive tech scroll it as usual; this class
 * only reads the position and damps it into a chapter value.
 */
export class ScrollDriver {
  /** Smoothed chapter position (0 … count − 1). */
  value = 0
  /** Raw chapter position from the scrollbar. */
  target = 0
  /** Chapters per second of the smoothed value. */
  velocity = 0
  /** Dev/testing: pin the raw position without scrolling. */
  override: number | null = null
  private sections: HTMLElement[]
  private stride = 1
  private count: number

  constructor(sections: HTMLElement[]) {
    this.sections = sections
    this.count = sections.length
    this.measure()
    this.read()
    this.value = this.target
  }

  measure() {
    this.stride = Math.max(1, this.sections[0]?.offsetHeight ?? window.innerHeight)
  }

  read() {
    if (this.override !== null) {
      this.target = this.override
      return
    }
    this.target = Math.min(this.count - 1, Math.max(0, window.scrollY / this.stride))
  }

  update(dt: number, reduced: boolean) {
    this.read()
    const prev = this.value
    this.value = damp(this.value, this.target, reduced ? 40 : 6.5, dt)
    if (Math.abs(this.value - this.target) < 1e-4) this.value = this.target
    const v = dt > 0 ? (this.value - prev) / dt : 0
    this.velocity = damp(this.velocity, v, 12, dt)
  }

  jumpTo(index: number, smooth: boolean) {
    window.scrollTo({ top: index * this.stride, behavior: smooth ? 'smooth' : 'auto' })
  }

  get active() {
    return Math.round(this.value)
  }
}
