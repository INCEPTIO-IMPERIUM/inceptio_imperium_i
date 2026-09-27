export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** 0 → 1 as v goes a → b, clamped. */
export const remap = (v: number, a: number, b: number) => clamp((v - a) / (b - a))
/** Quintic smootherstep: zero velocity and acceleration at both ends. */
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

/** Frame-rate-independent exponential approach. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))

/** A damped harmonic spring. `frequency` in Hz, `ratio` 1 = critically damped. */
export class Spring {
  value: number
  velocity = 0
  target: number
  frequency: number
  ratio: number

  constructor(value: number, frequency: number, ratio: number) {
    this.value = value
    this.target = value
    this.frequency = frequency
    this.ratio = ratio
  }

  step(dt: number) {
    const w = 2 * Math.PI * this.frequency
    const k = w * w
    const c = 2 * this.ratio * w
    // Fixed small substeps keep the integration stable at any frame rate.
    const n = Math.max(1, Math.ceil(dt / (1 / 240)))
    const h = dt / n
    for (let i = 0; i < n; i++) {
      const a = -k * (this.value - this.target) - c * this.velocity
      this.velocity += a * h
      this.value += this.velocity * h
    }
    return this.value
  }

  snap(value: number) {
    this.value = value
    this.target = value
    this.velocity = 0
  }
}

/** sRGB hex → linear RGB triple. */
export function hexToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => v / 255)
  return c.map(v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))) as [number, number, number]
}
