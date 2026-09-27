import { Spring, damp } from './math'
import type { PointerInput } from './PointerInput'

export interface CursorElements {
  root: HTMLElement
  dot: HTMLElement
  ring: HTMLElement
  label: HTMLElement
}

/** Exact dot + spring-lagged ring that grows and labels itself over the object. */
export class Cursor {
  private els: CursorElements
  private rx = new Spring(-1000, 4.5, 0.85)
  private ry = new Spring(-1000, 4.5, 0.85)
  private scale = new Spring(1, 3.2, 0.6)
  private labelOpacity = 0
  private opacity = 0
  private placed = false

  constructor(els: CursorElements) {
    this.els = els
  }

  pulse() {
    this.scale.velocity += 9
  }

  update(dt: number, pointer: PointerInput, over: boolean, reduced: boolean) {
    const show = pointer.fine && pointer.inside && !pointer.touch
    this.els.root.style.display = pointer.fine ? '' : 'none'
    if (!pointer.fine) return

    if (!this.placed && show) {
      this.rx.snap(pointer.x)
      this.ry.snap(pointer.y)
      this.placed = true
    }
    this.rx.target = pointer.x
    this.ry.target = pointer.y
    if (reduced) {
      this.rx.snap(pointer.x)
      this.ry.snap(pointer.y)
    }
    const x = this.rx.step(dt)
    const y = this.ry.step(dt)
    const hot = over && !pointer.overInteractive
    this.scale.target = hot ? 1.9 : pointer.overInteractive ? 0.5 : 1
    const s = this.scale.step(dt)
    this.opacity = damp(this.opacity, show ? 1 : 0, 10, dt)
    this.labelOpacity = damp(this.labelOpacity, hot ? 1 : 0, 9, dt)

    this.els.root.style.opacity = this.opacity.toFixed(3)
    this.els.dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`
    this.els.ring.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s.toFixed(3)})`
    this.els.ring.style.opacity = pointer.overInteractive ? '0' : ''
    this.els.label.style.transform = `translate3d(${x + 30}px, ${y - 7}px, 0)`
    this.els.label.style.opacity = this.labelOpacity.toFixed(3)
  }
}
