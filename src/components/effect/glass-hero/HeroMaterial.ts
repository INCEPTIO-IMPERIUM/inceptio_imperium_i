import * as THREE from 'three'
import { heroFragment, heroVertex } from './heroShader'
import { hexToLinear } from './math'

const PALETTE = { canvas: '#13162B', navy: '#2B3153', slate: '#505870', steel: '#86939B', mist: '#EFEFEF' }

export interface Quality {
  steps: number
  inner: number
  spectral: number
}

const v3 = (hex: string, k = 1) => new THREE.Vector3(...hexToLinear(hex)).multiplyScalar(k)

/** Canvas color lifted by `amount` in sRGB, expressed as a linear delta — the word's contrast. */
function wordLift(amount: number) {
  const n = parseInt(PALETTE.canvas.slice(1), 16)
  const lifted = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map(c => Math.min(255, Math.round(c + amount * 255)).toString(16).padStart(2, '0'))
    .join('')
  const a = hexToLinear(PALETTE.canvas)
  const b = hexToLinear(`#${lifted}`)
  return new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2])
}

export class HeroMaterial {
  material: THREE.ShaderMaterial
  uniforms: Record<string, THREE.IUniform>
  private ripples: THREE.Vector4[]
  private rippleAmp = new THREE.Vector4()
  private next = 0

  constructor(quality: Quality, atlas: THREE.Texture, atlasRows: number, atlasAspect: number) {
    this.ripples = Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, 0, -100))
    this.uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uDrift: { value: 0 },
      uCamPos: { value: new THREE.Vector3(0, 0, 6) },
      uCamRight: { value: new THREE.Vector3(1, 0, 0) },
      uCamUp: { value: new THREE.Vector3(0, 1, 0) },
      uCamFwd: { value: new THREE.Vector3(0, 0, -1) },
      uFocal: { value: 1 },
      uPixAngle: { value: 0.001 },
      uObjPos: { value: new THREE.Vector3() },
      uObjInvRot: { value: new THREE.Matrix3() },
      uObjScale: { value: 1 },
      uSquash: { value: 0 },
      uBound: { value: 2 },
      uStretch: { value: 1 },
      uTwist: { value: 0 },
      uR: { value: 0 },
      uA: { value: 0.8 },
      uB: { value: 0.8 },
      uR2: { value: 0 },
      uTube2: { value: 0.8 },
      uTilt2: { value: 0 },
      uThick: { value: 0.8 },
      uPtrPos: { value: new THREE.Vector3(0, 0, 10) },
      uPtrAmp: { value: 0 },
      uPtrRad: { value: 0.5 },
      uRip: { value: this.ripples },
      uRipAmp: { value: this.rippleAmp },
      uRipK: { value: 3 },
      uRipSpeed: { value: 1 },
      uRipWidth: { value: 0.5 },
      uRipDecay: { value: 1.2 },
      uLightAngle: { value: 0 },
      uBg: { value: v3(PALETTE.canvas) },
      uKeyCol: { value: v3(PALETTE.mist) },
      uStripCol: { value: v3(PALETTE.steel, 1.6) },
      uRimCol: { value: v3(PALETTE.steel, 1.2).add(new THREE.Vector3(0.0, 0.02, 0.08)) },
      uHazeCol: { value: v3(PALETTE.slate, 0.35) },
      uHazePos: { value: new THREE.Vector2() },
      uHazeR: { value: 3 },
      uHazeK: { value: 0.3 },
      uAtlas: { value: atlas },
      uAtlasRows: { value: atlasRows },
      uAtlasAspect: { value: atlasAspect },
      uWordLift: { value: wordLift(0.03) },
      uWordA: { value: 0 },
      uWordB: { value: 0 },
      uWordMix: { value: 0 },
      uWordCenter: { value: new THREE.Vector2() },
      uWordH: { value: 3 },
      uDiscW: { value: 0 },
      uRimW: { value: 0 },
      uIrid: { value: 0.6 },
      uIntro: { value: 0 },
      uGlow: { value: 0.25 },
    }

    this.material = new THREE.ShaderMaterial({
      vertexShader: heroVertex,
      fragmentShader: heroFragment,
      uniforms: this.uniforms,
      defines: { STEPS: quality.steps, INNER: quality.inner, SPECTRAL: quality.spectral },
      depthTest: false,
      depthWrite: false,
    })
  }

  set(name: string, value: number) {
    this.uniforms[name].value = value
  }

  /** Ring buffer of 4 ripples; the oldest is replaced. */
  addRipple(local: [number, number, number], amp: number, time: number) {
    const i = this.next
    this.next = (this.next + 1) % 4
    this.ripples[i].set(local[0], local[1], local[2], time)
    this.rippleAmp.setComponent(i, amp)
  }

  /** Retire ripples that have fully decayed so the shader skips them. */
  expireRipples(time: number, lifetime: number) {
    for (let i = 0; i < 4; i++) {
      if (this.rippleAmp.getComponent(i) > 0 && time - this.ripples[i].w > lifetime) this.rippleAmp.setComponent(i, 0)
    }
  }

  dispose() {
    this.material.dispose()
  }
}
