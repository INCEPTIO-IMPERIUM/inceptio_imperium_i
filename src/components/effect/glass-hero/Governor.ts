/**
 * Adaptive resolution. Lowers the pixel ratio only after sustained slow
 * frames, in small steps; raises it again only after a long fast stretch.
 */
export class Governor {
  ratio: number
  private min: number
  private max: number
  private avg = 1 / 60
  private slow = 0
  private fast = 0
  private cooldown = 1.5

  constructor(start: number, min: number, max: number) {
    this.ratio = start
    this.min = min
    this.max = max
  }

  /** Returns the pixel ratio to use. `dt` is the raw, unclamped frame time. */
  update(dt: number) {
    // Ignore hitches (tab switches, GC pauses): they are not sustained load.
    if (dt > 0.25) return this.ratio
    this.avg += (dt - this.avg) * 0.08
    this.cooldown = Math.max(0, this.cooldown - dt)
    if (this.cooldown > 0) return this.ratio

    if (this.avg > 1 / 48) {
      this.slow += dt
      this.fast = 0
    } else if (this.avg < 1 / 57) {
      this.fast += dt
      this.slow = 0
    } else {
      this.slow = Math.max(0, this.slow - dt)
      this.fast = 0
    }

    if (this.slow > 1.2 && this.ratio > this.min) {
      this.ratio = Math.max(this.min, +(this.ratio - 0.1).toFixed(2))
      this.slow = 0
      this.cooldown = 1.5
    } else if (this.fast > 6 && this.ratio < this.max) {
      this.ratio = Math.min(this.max, +(this.ratio + 0.05).toFixed(2))
      this.fast = 0
      this.cooldown = 2
    }
    return this.ratio
  }
}
