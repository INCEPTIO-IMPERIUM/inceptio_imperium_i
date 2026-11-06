export interface SoundEvents {
  'hover-enter': Record<string, never>
  ripple: { pan: number; strength: number }
  chapter: { index: number }
  confirm: Record<string, never>
}

type Handler<K extends keyof SoundEvents> = (payload: SoundEvents[K]) => void

/** Every interaction emits here; sound (or anything else) can listen. */
export class SoundBus {
  private handlers = new Map<keyof SoundEvents, Set<(payload: never) => void>>()

  on<K extends keyof SoundEvents>(type: K, fn: Handler<K>) {
    let set = this.handlers.get(type)
    if (!set) this.handlers.set(type, (set = new Set()))
    set.add(fn)
    return () => {
      set.delete(fn)
    }
  }

  emit<K extends keyof SoundEvents>(type: K, payload: SoundEvents[K]) {
    this.handlers.get(type)?.forEach(fn => (fn as Handler<K>)(payload))
  }
}

const PENTATONIC = [0, 2, 4, 7, 9, 12]

/** A quiet Web Audio synth. Off by default; created on the first user gesture. */
export class Synth {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private off: (() => void)[] = []
  enabled = false
  private bus: SoundBus

  constructor(bus: SoundBus) {
    this.bus = bus
  }

  setEnabled(on: boolean) {
    this.enabled = on
    if (on && !this.ctx) this.init()
    if (!this.ctx || !this.master) return
    if (on) void this.ctx.resume()
    this.master.gain.setTargetAtTime(on ? 0.5 : 0, this.ctx.currentTime, 0.05)
  }

  private init() {
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    this.ctx = ctx
    this.master = master
    this.off = [
      this.bus.on('hover-enter', () => this.tone(1174.7, 0.035, 0.18, 0)),
      this.bus.on('ripple', ({ pan, strength }) => {
        this.tone(1318.5, 0.06 * strength, 1.4, pan)
        this.tone(1975.5, 0.03 * strength, 0.9, pan)
      }),
      this.bus.on('chapter', ({ index }) => {
        const f = 220 * Math.pow(2, PENTATONIC[index % PENTATONIC.length] / 12)
        this.tone(f, 0.05, 1.6, 0)
        this.tone(f * 1.5, 0.025, 1.2, 0)
      }),
      this.bus.on('confirm', () => {
        this.tone(659.3, 0.05, 0.5, 0)
        setTimeout(() => this.tone(987.8, 0.05, 0.8, 0), 110)
      }),
    ]
  }

  private tone(freq: number, gain: number, decay: number, pan: number) {
    const ctx = this.ctx
    if (!ctx || !this.master || !this.enabled) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    const panner = ctx.createStereoPanner()
    osc.type = 'sine'
    osc.frequency.value = freq
    panner.pan.value = Math.max(-1, Math.min(1, pan))
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(gain, t + 0.012)
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    osc.connect(env).connect(panner).connect(this.master)
    osc.start(t)
    osc.stop(t + decay + 0.05)
  }

  dispose() {
    this.off.forEach(fn => fn())
    void this.ctx?.close()
    this.ctx = null
  }
}
