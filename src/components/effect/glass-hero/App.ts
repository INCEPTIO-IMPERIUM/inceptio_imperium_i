import * as THREE from 'three'
import { CHAPTERS } from './chapters'
import { BASE_DIST, CinematicCamera, FOV } from './CinematicCamera'
import { Cursor, type CursorElements } from './Cursor'
import { Governor } from './Governor'
import { HeroMaterial, type Quality } from './HeroMaterial'
import { Loader, type LoaderElements } from './Loader'
import { clamp, damp, lerp, remap, smoother, Spring } from './math'
import { Narrative } from './Narrative'
import { PointerInput } from './PointerInput'
import { ScrollDriver } from './ScrollDriver'
import { raycast, type HitResult, type ObjectTransform, type ShapeUniforms } from './sdf'
import { SoundBus, Synth } from './SoundBus'
import { Stage } from './Stage'
import { TextDirector } from './TextDirector'

export interface GlassHeroOptions {
  root: HTMLElement
  sections: HTMLElement[]
  canvasHost: HTMLElement
  loader: LoaderElements
  cursor: CursorElements
  railFill: HTMLElement
  onChapter: (index: number) => void
  onGl: (state: 'on' | 'off') => void
}

const ATLAS = { size: 2048, row: 256 }
const PLANE_DIST = 10 // camera (z = 6) to backdrop plane (z = −4)

/** Frame loop and wiring. Owns every other part and disposes them. */
export class GlassHeroApp {
  readonly bus = new SoundBus()
  private synth = new Synth(this.bus)
  private opts: GlassHeroOptions
  private disposed = false
  private raf = 0
  private last = 0
  private time = 0
  private drift = 0

  private reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  private reduced = this.reducedQuery.matches
  private lowPower = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches

  private stage: Stage | null = null
  private hero: HeroMaterial | null = null
  private atlas: THREE.CanvasTexture | null = null
  private governor: Governor
  private loader: Loader
  private scroll: ScrollDriver
  private text: TextDirector
  private pointer = new PointerInput()
  private cursor: Cursor
  private narrative = new Narrative(CHAPTERS)
  private camera: CinematicCamera

  private active = 0
  private introStart = -1
  private intro = new Spring(0.03, 1.25, 0.72)
  private introFade = 0
  private offX = new Spring(0, 1.1, 0.55)
  private offY = new Spring(0, 1.1, 0.55)
  private leanX = new Spring(0, 1.1, 0.55)
  private leanY = new Spring(0, 1.1, 0.55)
  private squash = new Spring(0, 2.4, 0.32)
  private spin = 0
  private over = false
  private ptrAmp = 0
  private ptrPos: [number, number, number] = [0, 0, 10]

  private m4 = new THREE.Matrix4()
  private spinM = new THREE.Matrix4()
  private euler = new THREE.Euler()
  private transform: ObjectTransform = { pos: [0, 0, 0], invRot: [1, 0, 0, 0, 1, 0, 0, 0, 1], scale: 1, squash: 0 }
  private shape: ShapeUniforms = { stretch: 1, twist: 0, R: 0, a: 0.8, b: 0.8, R2: 0, tube2: 0.8, tilt2: 0 }
  private bound = 2
  private thick = 0.8
  private hit: HitResult = { hit: false, local: [0, 0, 0], distance: Infinity }

  constructor(opts: GlassHeroOptions) {
    this.opts = opts
    const dpr = window.devicePixelRatio || 1
    this.governor = this.lowPower
      ? new Governor(Math.min(dpr, 1), 0.5, Math.min(dpr, 1.25))
      : new Governor(Math.min(dpr, 1.5), 0.6, Math.min(dpr, 2))
    this.loader = new Loader(opts.loader)
    window.scrollTo(0, 0)
    this.scroll = new ScrollDriver(opts.sections)
    this.text = new TextDirector(opts.root)
    this.cursor = new Cursor(opts.cursor)
    this.camera = new CinematicCamera(this.narrative.evaluate(0, this.mobileLayout))
    this.active = this.scroll.active

    this.pointer.onTap = this.onTap
    this.pointer.onPress = () => this.cursor.pulse()
    this.reducedQuery.addEventListener('change', this.onReduced)
    window.addEventListener('resize', this.onResize)
    window.addEventListener('pagehide', this.onPageHide)
    opts.root.addEventListener('focusin', this.onFocus)
  }

  private get mobileLayout() {
    return window.innerWidth < 768
  }

  /* ---------------- loading ---------------- */

  async start() {
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)

    this.loader.step(0.04, 'Loading type')
    try {
      await document.fonts.load('300 64px "Inter Variable"')
      await document.fonts.load('200 200px "Inter Variable"')
    } catch {
      // Fall back to the system stack; the story still reads.
    }
    if (this.disposed) return
    this.loader.step(0.25, 'Drawing the words')

    this.atlas = this.buildAtlas()
    await nextFrame()
    if (this.disposed) return
    this.loader.step(0.5, 'Preparing the glass')

    try {
      this.stage = new Stage(this.opts.canvasHost, this.governor.ratio)
      const quality: Quality = this.lowPower ? { steps: 64, inner: 20, spectral: 3 } : { steps: 110, inner: 40, spectral: 6 }
      this.hero = new HeroMaterial(quality, this.atlas, ATLAS.size / ATLAS.row, ATLAS.size / ATLAS.row)
      this.stage.setMaterial(this.hero.material)
      this.stage.onContextChange = available => {
        if (available && this.atlas) this.atlas.needsUpdate = true
      }
      await this.stage.compile()
      if (this.disposed) return
      this.loader.step(0.8, 'Rendering the first frame')
      this.frame(0, 0)
      await nextFrame()
      if (this.disposed) return
      this.opts.onGl('on')
    } catch {
      this.stage?.dispose()
      this.stage = null
      this.hero?.dispose()
      this.hero = null
      this.opts.onGl('off')
    }

    await this.loader.finish(this.reduced)
    if (this.disposed) return
    this.introStart = this.time
    this.intro.target = 1
    if (this.reduced) this.intro.snap(1)
  }

  private buildAtlas() {
    const canvas = document.createElement('canvas')
    canvas.width = ATLAS.size
    canvas.height = ATLAS.size
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    CHAPTERS.forEach((chapter, i) => {
      let size = 200
      ctx.font = `200 ${size}px "Inter Variable", Inter, system-ui, sans-serif`
      const w = ctx.measureText(chapter.word).width
      if (w > ATLAS.size * 0.9) {
        size *= (ATLAS.size * 0.9) / w
        ctx.font = `200 ${size}px "Inter Variable", Inter, system-ui, sans-serif`
      }
      ctx.fillText(chapter.word, ATLAS.size / 2, i * ATLAS.row + ATLAS.row / 2 + size * 0.02)
    })
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = true
    texture.anisotropy = 4
    return texture
  }

  /* ---------------- input ---------------- */

  private onTap = (nx: number, ny: number) => {
    if (!this.hero || !this.stage) return
    const aspect = this.stage.width / this.stage.height
    const hit = raycast(this.camera.pos, this.camera.ray(nx, ny, aspect), this.transform, this.shape, this.bound, {
      hit: false,
      local: [0, 0, 0],
      distance: Infinity,
    })
    if (!hit.hit) return
    const { amp } = this.rippleShape()
    this.hero.addRipple(hit.local, amp * (this.reduced ? 0.4 : 1), this.time)
    this.bus.emit('ripple', { pan: clamp(nx, -1, 1), strength: 1 })
  }

  /** Ripple wavelength, amplitude and speed, all sized to the current shape. */
  private rippleShape() {
    const wl = clamp(this.thick * 0.7, 0.12, 0.6)
    const k = (2 * Math.PI) / wl
    return { k, amp: Math.min(0.12 * this.thick, 0.28 / k), speed: 0.5 + wl * 1.5, width: wl * 1.5 }
  }

  private onFocus = (e: FocusEvent) => {
    const chapter = e.target instanceof Node ? this.text.chapterOf(e.target) : null
    if (chapter !== null && chapter !== this.scroll.active) this.scroll.jumpTo(chapter, false)
  }

  private onReduced = () => {
    this.reduced = this.reducedQuery.matches
  }

  private onResize = () => {
    this.stage?.resize()
    this.scroll.measure()
  }

  private onPageHide = (e: PageTransitionEvent) => {
    // Pages entering the back/forward cache keep their GPU state.
    if (!e.persisted) this.dispose()
  }

  jumpTo(index: number) {
    this.scroll.jumpTo(index, !this.reduced)
  }

  setSound(on: boolean) {
    this.synth.setEnabled(on)
  }

  confirm() {
    this.bus.emit('confirm', {})
  }

  /* ---------------- frame ---------------- */

  private tick = (now: number) => {
    const raw = (now - this.last) / 1000
    this.last = now
    const dt = Math.min(Math.max(raw, 0), 1 / 30)
    this.frame(dt, raw)
    if (!this.disposed) this.raf = requestAnimationFrame(this.tick)
  }

  /** Dev/testing: show chapter position `c` (null returns control to the scrollbar). */
  preview(c: number | null) {
    this.scroll.override = c
  }

  /** Dev/testing: step the simulation by fixed frames without waiting for rAF. */
  advance(seconds: number) {
    const n = Math.max(1, Math.round(seconds * 60))
    for (let i = 0; i < n; i++) this.frame(1 / 60, 0, i === n - 1)
  }

  private frame(dt: number, raw: number, draw = true) {
    const reduced = this.reduced
    this.time += dt
    if (!reduced) this.drift += dt

    this.scroll.update(dt, reduced)
    const c = this.scroll.value
    const mobile = this.mobileLayout
    const pose = this.narrative.evaluate(c, mobile)

    const active = this.scroll.active
    if (active !== this.active) {
      this.active = active
      this.opts.onChapter(active)
      this.bus.emit('chapter', { index: active })
    }

    // Text and rail run with or without WebGL.
    const introT = this.introStart < 0 ? 0 : (this.time - this.introStart) * (reduced ? 4 : 1) - (reduced ? 0 : 0.35)
    this.text.update(c, introT, reduced)
    this.opts.railFill.style.transform = `scaleY(${(c / (CHAPTERS.length - 1)).toFixed(4)})`

    const stage = this.stage
    const hero = this.hero
    if (!stage || !hero) {
      this.cursor.update(dt, this.pointer, false, reduced)
      return
    }

    // Catch size changes that arrive without a resize event (mobile URL bar, device emulation).
    if (stage.width !== window.innerWidth || stage.height !== window.innerHeight) this.onResize()

    /* Framing: object placement is in viewport fractions, so it never meets the text column. */
    const aspect = stage.width / stage.height
    const halfH = BASE_DIST * Math.tan(FOV / 2)
    const halfW = halfH * aspect
    const unit = mobile ? Math.min(halfH * 0.55, halfW * 0.95) : Math.min(halfH, halfW * 0.6)
    const unitScale = unit / 1.6

    /* Springs: pointer follow, lean, squash, droplet intro. */
    const p = this.pointer
    const follow = p.fine && p.inside && !reduced
    const px = follow ? p.nx : 0
    const py = follow ? p.ny : 0
    this.offX.target = px * 0.08 * unit
    this.offY.target = py * 0.06 * unit
    this.leanX.target = -py * 0.14
    this.leanY.target = px * 0.2
    this.squash.target = reduced ? 0 : clamp(this.scroll.velocity * 0.1, -0.25, 0.25)
    const offX = this.offX.step(dt)
    const offY = this.offY.step(dt)
    const leanX = this.leanX.step(dt)
    const leanY = this.leanY.step(dt)
    const squash = clamp(this.squash.step(dt), -0.3, 0.35)
    const introScale = this.intro.step(dt)
    this.introFade = damp(this.introFade, this.introStart < 0 ? 0 : 1, reduced ? 10 : 14, dt)
    this.camera.update(pose, dt, px, py, reduced ? 0 : squash)

    /* Object transform. */
    if (!reduced) this.spin += pose.spin * dt
    const scale = Math.max(0.02, pose.framing.size * unitScale * introScale)
    this.euler.set(pose.rot[0] + leanX, pose.rot[1] + leanY, pose.rot[2])
    // Spin only reads on shapes symmetric around their axis; the ribbon keeps its authored orientation.
    const symmetric = 1 - smoother(remap(pose.shape.stretch, 1, 1.3))
    this.m4.makeRotationFromEuler(this.euler).multiply(this.spinM.makeRotationY(this.spin * symmetric))
    const e = this.m4.elements
    const t = this.transform
    t.pos = [pose.framing.x * halfW + offX, pose.framing.y * halfH + offY, 0]
    t.invRot = [e[0], e[1], e[2], e[4], e[5], e[6], e[8], e[9], e[10]]
    t.scale = scale
    t.squash = squash

    /* Shape. */
    const s = pose.shape
    const sh = this.shape
    sh.stretch = s.stretch
    sh.twist = s.twist + (s.twist > 0.1 ? Math.sin(this.drift * 0.6) * 0.12 : 0)
    sh.R = s.R
    sh.a = s.a
    sh.b = s.b
    sh.R2 = lerp(s.R, s.R * s.ring2Ratio, s.ring2)
    sh.tube2 = lerp(Math.min(s.a, s.b), s.ring2Tube, s.ring2)
    sh.tilt2 = s.ring2 * s.ring2Tilt
    this.thick = s.ring2 > 0.5 ? Math.min(s.a, s.b, sh.tube2) : Math.min(s.a, s.b)
    const localBound = Math.max(Math.hypot(Math.max(1, s.stretch) * (s.R + s.a), s.b), sh.R2 + sh.tube2) + this.thick * (0.3 + pose.wobble * 1.6)
    this.bound = localBound * scale * (1 + Math.abs(squash)) + 0.08 * scale + 0.05

    /* Pointer: shape-aware hit test mirrors the shader's SDF. */
    const probing = (p.fine && p.inside) || (p.touch && p.down)
    let over = false
    let ampTarget = 0
    if (probing) {
      raycast(this.camera.pos, this.camera.ray(p.nx, p.ny, aspect), t, sh, this.bound, this.hit)
      over = this.hit.hit
      const base = 0.22 * this.thick * (reduced ? 0.3 : 1)
      ampTarget = over ? base : Number.isFinite(this.hit.distance) ? base * 0.6 * Math.exp(-this.hit.distance / (0.25 * scale)) : 0
      if (Number.isFinite(this.hit.distance)) {
        const k = this.ptrAmp < 1e-4 ? 1 : 1 - Math.exp(-14 * dt)
        for (let i = 0; i < 3; i++) this.ptrPos[i] = lerp(this.ptrPos[i], this.hit.local[i], k)
      }
    }
    if (over && !this.over) this.bus.emit('hover-enter', {})
    this.over = over
    this.ptrAmp = damp(this.ptrAmp, ampTarget, 8, dt)

    /* Uniforms. */
    const u = hero.uniforms
    const [bw, bh] = stage.bufferSize
    ;(u.uRes.value as THREE.Vector2).set(bw, bh)
    u.uTime.value = this.time
    u.uDrift.value = this.drift
    const cam = this.camera
    ;(u.uCamPos.value as THREE.Vector3).fromArray(cam.pos)
    ;(u.uCamRight.value as THREE.Vector3).fromArray(cam.right)
    ;(u.uCamUp.value as THREE.Vector3).fromArray(cam.up)
    ;(u.uCamFwd.value as THREE.Vector3).fromArray(cam.fwd)
    u.uFocal.value = cam.focal
    u.uPixAngle.value = 2 / (bh * cam.focal)

    ;(u.uObjPos.value as THREE.Vector3).fromArray(t.pos)
    ;(u.uObjInvRot.value as THREE.Matrix3).setFromMatrix4(this.m4).transpose()
    u.uObjScale.value = scale
    u.uSquash.value = squash
    u.uBound.value = this.bound

    u.uStretch.value = sh.stretch
    u.uTwist.value = sh.twist
    u.uR.value = sh.R
    u.uA.value = sh.a
    u.uB.value = sh.b
    u.uR2.value = sh.R2
    u.uTube2.value = sh.tube2
    u.uTilt2.value = sh.tilt2
    u.uThick.value = this.thick

    ;(u.uPtrPos.value as THREE.Vector3).fromArray(this.ptrPos)
    u.uPtrAmp.value = this.ptrAmp
    u.uPtrRad.value = clamp(this.thick * 1.6, 0.12, 0.9)

    const rip = this.rippleShape()
    u.uRipK.value = rip.k
    u.uRipSpeed.value = rip.speed
    u.uRipWidth.value = rip.width
    u.uRipDecay.value = reduced ? 2.5 : 0.9
    hero.expireRipples(this.time, 6)

    u.uLightAngle.value = 0.3 + c * 0.35 + (reduced ? 0 : Math.sin(this.drift * 0.07) * 0.35)
    const toPlane = PLANE_DIST / BASE_DIST
    ;(u.uHazePos.value as THREE.Vector2).set(t.pos[0] * toPlane, t.pos[1] * toPlane)
    u.uHazeR.value = 0.8 + 1.8 * scale
    ;(u.uWordCenter.value as THREE.Vector2).set(t.pos[0] * toPlane * 0.75, t.pos[1] * toPlane * 0.6)
    u.uWordH.value = 4.2
    u.uWordA.value = pose.wordA
    u.uWordB.value = pose.wordB
    u.uWordMix.value = pose.wordMix

    u.uDiscW.value = pose.disc
    u.uRimW.value = pose.rim
    u.uIrid.value = pose.irid
    u.uColor.value = pose.color
    u.uWobble.value = pose.wobble * (reduced ? 0.3 : 1)
    u.uIntro.value = reduced ? this.introFade : this.introFade * clamp(introScale * 4)

    this.cursor.update(dt, p, over, reduced)
    if (raw > 0) stage.setPixelRatio(this.governor.update(raw))
    if (draw) stage.render()
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.reducedQuery.removeEventListener('change', this.onReduced)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('pagehide', this.onPageHide)
    this.opts.root.removeEventListener('focusin', this.onFocus)
    this.pointer.dispose()
    this.loader.dispose()
    this.synth.dispose()
    this.hero?.dispose()
    this.atlas?.dispose()
    this.stage?.dispose()
    this.hero = null
    this.stage = null
  }
}

function nextFrame() {
  return new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}
