import { Spring } from './math'
import type { Pose } from './Narrative'

export const FOV = (30 * Math.PI) / 180
export const BASE_DIST = 6

type V3 = [number, number, number]

/** Orbits the origin; every parameter eases through a critically damped spring. */
export class CinematicCamera {
  pos: V3 = [0, 0, BASE_DIST]
  fwd: V3 = [0, 0, -1]
  right: V3 = [1, 0, 0]
  up: V3 = [0, 1, 0]
  readonly focal = 1 / Math.tan(FOV / 2)

  private yaw = new Spring(0, 0.9, 1)
  private pitch = new Spring(0, 0.9, 1)
  private dist = new Spring(BASE_DIST, 0.9, 1)
  private roll = new Spring(0, 0.9, 1)

  constructor(pose: Pose) {
    this.yaw.snap(pose.camera.yaw)
    this.pitch.snap(pose.camera.pitch)
    this.dist.snap(pose.camera.dist)
    this.roll.snap(pose.camera.roll)
  }

  /** `px`/`py` are pointer NDC (0 when parallax is off); `lean` is scroll velocity. */
  update(pose: Pose, dt: number, px: number, py: number, lean: number) {
    this.yaw.target = pose.camera.yaw + px * 0.035
    this.pitch.target = pose.camera.pitch + py * 0.025
    this.dist.target = pose.camera.dist
    this.roll.target = pose.camera.roll + px * 0.008 + lean * 0.004
    const yaw = this.yaw.step(dt)
    const pitch = this.pitch.step(dt)
    const dist = this.dist.step(dt)
    const roll = this.roll.step(dt)

    const cp = Math.cos(pitch)
    this.pos = [dist * Math.sin(yaw) * cp, dist * Math.sin(pitch), dist * Math.cos(yaw) * cp]
    const f = norm([-this.pos[0], -this.pos[1], -this.pos[2]])
    const r = norm(cross(f, [0, 1, 0]))
    const u = cross(r, f)
    const c = Math.cos(roll)
    const s = Math.sin(roll)
    this.fwd = f
    this.right = [r[0] * c + u[0] * s, r[1] * c + u[1] * s, r[2] * c + u[2] * s]
    this.up = [u[0] * c - r[0] * s, u[1] * c - r[1] * s, u[2] * c - r[2] * s]
  }

  /** World-space ray direction through NDC (x, y) for the given aspect. */
  ray(nx: number, ny: number, aspect: number): V3 {
    const x = nx * aspect
    return norm([
      this.fwd[0] * this.focal + this.right[0] * x + this.up[0] * ny,
      this.fwd[1] * this.focal + this.right[1] * x + this.up[1] * ny,
      this.fwd[2] * this.focal + this.right[2] * x + this.up[2] * ny,
    ])
  }
}

function cross(a: V3, b: V3): V3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function norm(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}
