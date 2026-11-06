/*
 * The one table the whole experience derives from: copy, composition,
 * object pose, shape parameters, camera and stage-specific shading.
 *
 * Shape model — one continuous SDF, no crossfades:
 *   an elliptical-tube torus (major radius R, tube semi-axes a × b),
 *   stretched along x and twisted around x, unioned with a second ring
 *   that starts inside the first and separates inward as `ring2` → 1.
 *   R = 0, a = b      → sphere
 *   stretch + twist   → twisted ribbon
 *   a ≫ b             → flat disc
 *   R > a, ring2 = 1  → two concentric rings
 */

export interface ShapeParams {
  stretch: number
  twist: number
  R: number
  a: number
  b: number
  ring2: number
  ring2Ratio: number
  ring2Tube: number
  ring2Tilt: number
}

export interface Framing {
  /** Object center as a fraction of the half-width (−1 left edge … 1 right edge). */
  x: number
  /** Object center as a fraction of the half-height (−1 bottom … 1 top). */
  y: number
  /** Object scale relative to the viewport unit. */
  size: number
}

export interface ChapterPose {
  desktop: Framing
  mobile: Framing
  rot: [number, number, number]
  /** Slow rotation around the object's own axis, rad/s. */
  spin: number
  camera: { yaw: number; pitch: number; dist: number; roll: number }
  shape: ShapeParams
  /** Emissive striation weight (disc). */
  disc: number
  /** Colored rim light weight (rings). */
  rim: number
  /** Thin-film iridescence weight, applied at grazing angles only. */
  irid: number
  /** 0 = house steel/mist studio, 1 = full soap-bubble color (film, violet/cyan lights, blue glow). */
  color: number
  /** Slow organic surface wobble, as a fraction of the shape's thickness. */
  wobble: number
}

export interface Chapter {
  id: string
  label: string
  /** A quiet mincho mark beside the counter. */
  kanji: string
  /** The huge, faint word drawn behind the object. */
  word: string
  title: string[]
  body: string
  /** A short, labelled list under the body. */
  details?: { label: string; items: string[] }
  hint?: { pointer: string; touch: string }
  /** Where the text sits on wide screens; on phones it is always anchored to the bottom. */
  align: 'left' | 'right' | 'center'
  pose: ChapterPose
}

const SPHERE: ShapeParams = { stretch: 1, twist: 0, R: 0, a: 0.8, b: 0.8, ring2: 0, ring2Ratio: 0.62, ring2Tube: 0.045, ring2Tilt: 0.4 }

export const CHAPTERS: Chapter[] = [
  {
    id: 'space',
    label: 'About',
    kanji: '間',
    word: 'ma',
    title: ['A small studio', 'for quiet software.'],
    body: 'Inceptio Imperium designs and builds digital products that give attention back instead of taking it.',
    hint: { pointer: 'Scroll to begin, or move over the glass.', touch: 'Scroll to begin, or tap the glass.' },
    align: 'left',
    pose: {
      desktop: { x: 0.5, y: 0.02, size: 1 },
      mobile: { x: 0, y: 0.44, size: 1 },
      rot: [0, 0, 0],
      spin: 0.12,
      camera: { yaw: -0.04, pitch: 0.02, dist: 6, roll: 0 },
      shape: SPHERE,
      disc: 0,
      rim: 0.15,
      irid: 0.6,
      color: 1,
      wobble: 0.07,
    },
  },
  {
    id: 'motion',
    label: 'Craft',
    kanji: '動',
    word: 'dō',
    title: ['Design and code', 'in one pair of hands.'],
    body: 'The people who shape an interface also write it, so nothing is lost between the idea and what ships.',
    details: { label: 'What we make', items: ['Interfaces', 'Motion', 'Design systems'] },
    hint: { pointer: 'Scroll faster and the glass stretches.', touch: 'Swipe faster and the glass stretches.' },
    align: 'right',
    pose: {
      desktop: { x: -0.5, y: 0.02, size: 0.85 },
      mobile: { x: 0, y: 0.46, size: 0.8 },
      rot: [1.15, 0.2, -0.35],
      spin: 0,
      camera: { yaw: 0.05, pitch: 0.03, dist: 6, roll: 0.02 },
      shape: { ...SPHERE, stretch: 2.6, twist: 2.2, a: 0.42, b: 0.07 },
      disc: 0,
      rim: 0.2,
      irid: 0.7,
      color: 0.85,
      wobble: 0,
    },
  },
  {
    id: 'restraint',
    label: 'Restraint',
    kanji: '簡素',
    word: 'kanso',
    title: ['Fewer things,', 'finished properly.'],
    body: 'We take on a few projects at a time and carry each one to the last pixel, the last state and the last millisecond.',
    align: 'left',
    pose: {
      desktop: { x: 0.8, y: -0.04, size: 1.45 },
      mobile: { x: 0.55, y: 0.42, size: 1.25 },
      rot: [1.2, 0, 0.3],
      spin: 0,
      camera: { yaw: 0, pitch: -0.03, dist: 6, roll: -0.03 },
      shape: { ...SPHERE, a: 1, b: 0.055 },
      disc: 1,
      rim: 0.2,
      irid: 0.45,
      color: 0.55,
      wobble: 0,
    },
  },
  {
    id: 'stillness',
    label: 'Principles',
    kanji: '静',
    word: 'sei',
    title: ['Built on ma,', 'the space between.'],
    body: 'Negative space is placed, weighed and given a purpose. The gap between two rings matters as much as the rings.',
    details: { label: 'We work by', items: ['Ma', 'Kanso', 'Dō', 'Sei'] },
    hint: { pointer: 'Click a ring to send a ripple. The center stays empty.', touch: 'Tap a ring to send a ripple. The center stays empty.' },
    align: 'right',
    pose: {
      desktop: { x: -0.5, y: 0, size: 1.05 },
      mobile: { x: 0, y: 0.44, size: 1 },
      rot: [1.15, 0, -0.2],
      spin: 0.15,
      camera: { yaw: 0.04, pitch: 0.04, dist: 6, roll: 0.04 },
      shape: { ...SPHERE, R: 0.9, a: 0.06, b: 0.06, ring2: 1, ring2Ratio: 0.64, ring2Tube: 0.04, ring2Tilt: 0.5 },
      disc: 0,
      rim: 1,
      irid: 0.8,
      color: 0.8,
      wobble: 0,
    },
  },
  {
    id: 'contact',
    label: 'Contact',
    kanji: '話',
    word: 'hello',
    title: ['Start with', 'a conversation.'],
    body: 'Thirty unhurried minutes. Bring a question, not a brief.',
    align: 'center',
    pose: {
      desktop: { x: 0, y: 0.42, size: 0.6 },
      mobile: { x: 0, y: 0.45, size: 0.95 },
      rot: [1.35, 0, 0],
      spin: 0.1,
      camera: { yaw: 0, pitch: 0, dist: 6, roll: 0 },
      shape: { ...SPHERE, R: 0.9, a: 0.06, b: 0.06, ring2: 1, ring2Ratio: 0.5, ring2Tube: 0.045, ring2Tilt: 1.1 },
      disc: 0,
      rim: 0.8,
      irid: 0.7,
      color: 0.9,
      wobble: 0,
    },
  },
]

export const PRIMARY_ACTION = {
  label: 'Book a call',
  href: 'mailto:p.theeranat.dev@gmail.com?subject=Book%20a%20call',
  confirmation: 'Your email app is opening so you can book a call.',
}
