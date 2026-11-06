/*
 * CPU mirror of the shader's SDF, used for shape-aware hit-testing.
 * Keep `shapeBase` and `ObjectTransform.toLocal` in lock-step with
 * heroShader.ts — the hole of a ring must be empty space here too.
 */

export interface ShapeUniforms {
  stretch: number
  twist: number
  R: number
  a: number
  b: number
  R2: number
  tube2: number
  tilt2: number
}

export interface ObjectTransform {
  pos: [number, number, number]
  /** Row-major inverse rotation (world → local). */
  invRot: number[]
  scale: number
  squash: number
}

function sdEllipse(qx: number, qy: number, rx: number, ry: number) {
  const k0 = Math.hypot(qx / rx, qy / ry)
  const k1 = Math.hypot(qx / (rx * rx), qy / (ry * ry))
  return (k0 * (k0 - 1)) / Math.max(k1, 1e-5)
}

export function shapeBase(px: number, py: number, pz: number, s: ShapeUniforms) {
  const sx = px / s.stretch
  const ang = s.twist * sx
  const c = Math.cos(ang)
  const sn = Math.sin(ang)
  // GLSL mat2(c, sn, -sn, c) * v  →  (c·y − sn·z, sn·y + c·z)
  const sy = c * py - sn * pz
  const sz = sn * py + c * pz

  const d1 = sdEllipse(Math.hypot(sx, sz) - s.R, sy, s.a, s.b)

  const ct = Math.cos(s.tilt2)
  const st = Math.sin(s.tilt2)
  const ty = ct * sy - st * sz
  const tz = st * sy + ct * sz
  const d2 = Math.hypot(Math.hypot(sx, tz) - s.R2, ty) - s.tube2

  return Math.min(d1, d2) * Math.min(s.stretch, 1)
}

export function toLocal(t: ObjectTransform, x: number, y: number, z: number, out: number[]) {
  const sy = 1 + t.squash
  const sxz = Math.sqrt(sy)
  const qx = (x - t.pos[0]) * sxz
  const qy = (y - t.pos[1]) / sy
  const qz = (z - t.pos[2]) * sxz
  const m = t.invRot
  out[0] = (m[0] * qx + m[1] * qy + m[2] * qz) / t.scale
  out[1] = (m[3] * qx + m[4] * qy + m[5] * qz) / t.scale
  out[2] = (m[6] * qx + m[7] * qy + m[8] * qz) / t.scale
  return out
}

export function worldScale(t: ObjectTransform) {
  const sy = 1 + t.squash
  return t.scale * Math.min(sy, 1 / Math.sqrt(sy))
}

export interface HitResult {
  hit: boolean
  /** Local-space point on (or nearest to) the surface. */
  local: [number, number, number]
  /** Closest approach of the ray to the surface, world units. */
  distance: number
}

const tmp = [0, 0, 0]

export function raycast(
  ro: [number, number, number],
  rd: [number, number, number],
  t: ObjectTransform,
  shape: ShapeUniforms,
  bound: number,
  out: HitResult,
): HitResult {
  out.hit = false
  out.distance = Infinity
  const ox = ro[0] - t.pos[0]
  const oy = ro[1] - t.pos[1]
  const oz = ro[2] - t.pos[2]
  const b = ox * rd[0] + oy * rd[1] + oz * rd[2]
  const c = ox * ox + oy * oy + oz * oz - bound * bound
  const h = b * b - c
  if (h < 0) return out

  const k = worldScale(t)
  const eps = 0.0015 * t.scale
  let dist = Math.max(-b - Math.sqrt(h), 0)
  const far = -b + Math.sqrt(h)
  let bestT = dist
  for (let i = 0; i < 96 && dist < far; i++) {
    const x = ro[0] + rd[0] * dist
    const y = ro[1] + rd[1] * dist
    const z = ro[2] + rd[2] * dist
    toLocal(t, x, y, z, tmp)
    const d = shapeBase(tmp[0], tmp[1], tmp[2], shape) * k
    if (d < out.distance) {
      out.distance = d
      bestT = dist
    }
    if (d < eps) {
      out.hit = true
      break
    }
    dist += d * 0.8
  }
  toLocal(t, ro[0] + rd[0] * bestT, ro[1] + rd[1] * bestT, ro[2] + rd[2] * bestT, tmp)
  out.local[0] = tmp[0]
  out.local[1] = tmp[1]
  out.local[2] = tmp[2]
  return out
}
