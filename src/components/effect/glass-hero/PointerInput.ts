const INTERACTIVE = 'a, button, input, textarea, select, label, [role="button"], [data-no-ripple]'

/** Pointer position, velocity, hover capability and tap-vs-drag detection. */
export class PointerInput {
  /** CSS pixels. */
  x = -1000
  y = -1000
  /** Normalized device coordinates, y up. */
  nx = 0
  ny = 0
  vx = 0
  vy = 0
  inside = false
  down = false
  touch = false
  overInteractive = false
  /** True when the device has a precise hovering pointer. */
  fine: boolean
  onTap?: (nx: number, ny: number) => void
  onPress?: () => void

  private startX = 0
  private startY = 0
  private startT = 0
  private lastT = 0
  private media = window.matchMedia('(hover: hover) and (pointer: fine)')

  constructor() {
    this.fine = this.media.matches
    this.media.addEventListener('change', this.onMedia)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    window.addEventListener('pointerdown', this.onDown, { passive: true })
    window.addEventListener('pointerup', this.onUp, { passive: true })
    window.addEventListener('pointercancel', this.onCancel, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.onLeave)
    window.addEventListener('blur', this.onLeave)
  }

  private onMedia = () => {
    this.fine = this.media.matches
  }

  private set(e: PointerEvent) {
    const now = performance.now()
    const dt = Math.max(1, now - this.lastT) / 1000
    this.vx = (e.clientX - this.x) / dt
    this.vy = (e.clientY - this.y) / dt
    this.lastT = now
    this.x = e.clientX
    this.y = e.clientY
    this.nx = (e.clientX / window.innerWidth) * 2 - 1
    this.ny = -((e.clientY / window.innerHeight) * 2 - 1)
    this.touch = e.pointerType !== 'mouse'
    this.overInteractive = e.target instanceof Element && !!e.target.closest(INTERACTIVE)
  }

  private onMove = (e: PointerEvent) => {
    this.set(e)
    this.inside = e.pointerType === 'mouse' || this.down
  }

  private onDown = (e: PointerEvent) => {
    this.set(e)
    this.down = true
    this.inside = true
    this.startX = e.clientX
    this.startY = e.clientY
    this.startT = performance.now()
    this.onPress?.()
  }

  private onUp = (e: PointerEvent) => {
    this.set(e)
    this.down = false
    if (e.pointerType !== 'mouse') this.inside = false
    const moved = Math.hypot(e.clientX - this.startX, e.clientY - this.startY)
    const held = performance.now() - this.startT
    if (moved < 10 && held < 450 && !this.overInteractive) this.onTap?.(this.nx, this.ny)
  }

  private onCancel = () => {
    this.down = false
    if (this.touch) this.inside = false
  }

  private onLeave = () => {
    this.inside = false
    this.down = false
  }

  dispose() {
    this.media.removeEventListener('change', this.onMedia)
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerdown', this.onDown)
    window.removeEventListener('pointerup', this.onUp)
    window.removeEventListener('pointercancel', this.onCancel)
    document.documentElement.removeEventListener('pointerleave', this.onLeave)
    window.removeEventListener('blur', this.onLeave)
  }
}
