import type { Chapter, Framing, ShapeParams } from './chapters'
import { clamp, lerp, remap, smoother } from './math'

/** A fully resolved pose for one scroll position. */
export interface Pose {
  framing: Framing
  rot: [number, number, number]
  spin: number
  camera: { yaw: number; pitch: number; dist: number; roll: number }
  shape: ShapeParams
  disc: number
  rim: number
  irid: number
  color: number
  wobble: number
  wordA: number
  wordB: number
  wordMix: number
}

/*
 * Choreography inside one transition (f = 0 at chapter k, 1 at k + 1):
 *   hold 0 – 0.28 · position 0.28 – 0.62 · form 0.4 – 0.75 · hold 0.75 – 1
 *   camera eases across 0.15 – 0.85.
 * Text leaves before the object moves and arrives after it settles
 * (see TextDirector), so the object never crosses text that is visible.
 */
const POS = [0.28, 0.62] as const
const FORM = [0.4, 0.75] as const
const CAM = [0.15, 0.85] as const
const WORD = [0.35, 0.65] as const

const blend = (a: number, b: number, t: number) => lerp(a, b, t)

export class Narrative {
  private chapters: Chapter[]
  readonly pose: Pose

  constructor(chapters: Chapter[]) {
    this.chapters = chapters
    const p = chapters[0].pose
    this.pose = {
      framing: { ...p.desktop },
      rot: [...p.rot],
      spin: p.spin,
      camera: { ...p.camera },
      shape: { ...p.shape },
      disc: p.disc,
      rim: p.rim,
      irid: p.irid,
      color: p.color,
      wobble: p.wobble,
      wordA: 0,
      wordB: 0,
      wordMix: 0,
    }
  }

  evaluate(c: number, mobile: boolean): Pose {
    const n = this.chapters.length
    const cc = clamp(c, 0, n - 1)
    const i = Math.min(Math.floor(cc), n - 2)
    const f = cc - i
    const A = this.chapters[i].pose
    const B = this.chapters[i + 1].pose
    const tp = smoother(remap(f, POS[0], POS[1]))
    const tf = smoother(remap(f, FORM[0], FORM[1]))
    const tc = smoother(remap(f, CAM[0], CAM[1]))
    const out = this.pose

    const fa = mobile ? A.mobile : A.desktop
    const fb = mobile ? B.mobile : B.desktop
    out.framing.x = blend(fa.x, fb.x, tp)
    out.framing.y = blend(fa.y, fb.y, tp)
    out.framing.size = blend(fa.size, fb.size, tp)

    // Orientation belongs to the form: it turns while the shape changes.
    const tr = smoother(remap(f, POS[0] + 0.05, FORM[1]))
    for (let k = 0; k < 3; k++) out.rot[k] = blend(A.rot[k], B.rot[k], tr)
    out.spin = blend(A.spin, B.spin, tr)

    out.camera.yaw = blend(A.camera.yaw, B.camera.yaw, tc)
    out.camera.pitch = blend(A.camera.pitch, B.camera.pitch, tc)
    out.camera.dist = blend(A.camera.dist, B.camera.dist, tc)
    out.camera.roll = blend(A.camera.roll, B.camera.roll, tc)

    const s = out.shape
    for (const key of Object.keys(s) as (keyof ShapeParams)[]) s[key] = blend(A.shape[key], B.shape[key], tf)
    out.disc = blend(A.disc, B.disc, tf)
    out.rim = blend(A.rim, B.rim, tf)
    out.irid = blend(A.irid, B.irid, tf)
    out.color = blend(A.color, B.color, tf)
    out.wobble = blend(A.wobble, B.wobble, tf)

    out.wordA = i
    out.wordB = i + 1
    out.wordMix = smoother(remap(f, WORD[0], WORD[1]))
    return out
  }
}
