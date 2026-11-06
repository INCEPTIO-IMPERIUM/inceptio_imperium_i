import * as THREE from 'three'

/** Renderer, fullscreen quad, resize and pixel ratio. Throws if WebGL is unavailable. */
export class Stage {
  canvas: HTMLCanvasElement
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  geometry = new THREE.PlaneGeometry(2, 2)
  mesh: THREE.Mesh | null = null
  width = 1
  height = 1
  pixelRatio: number
  lost = false

  private onLost = (e: Event) => {
    e.preventDefault()
    this.lost = true
    this.onContextChange?.(false)
  }
  private onRestored = () => {
    this.lost = false
    this.onContextChange?.(true)
  }
  onContextChange?: (available: boolean) => void

  constructor(container: HTMLElement, pixelRatio: number) {
    this.canvas = document.createElement('canvas')
    this.canvas.setAttribute('aria-hidden', 'true')
    this.canvas.className = 'block h-full w-full'
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    })
    this.renderer.toneMapping = THREE.NoToneMapping
    container.appendChild(this.canvas)
    this.pixelRatio = pixelRatio
    this.canvas.addEventListener('webglcontextlost', this.onLost)
    this.canvas.addEventListener('webglcontextrestored', this.onRestored)
    this.resize()
  }

  setMaterial(material: THREE.Material) {
    this.mesh = new THREE.Mesh(this.geometry, material)
    this.mesh.frustumCulled = false
    this.scene.add(this.mesh)
  }

  resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.renderer.setPixelRatio(this.pixelRatio)
    this.renderer.setSize(this.width, this.height, false)
  }

  setPixelRatio(pr: number) {
    if (Math.abs(pr - this.pixelRatio) < 0.001) return
    this.pixelRatio = pr
    this.resize()
  }

  /** Drawing-buffer size in device pixels. */
  get bufferSize(): [number, number] {
    return [this.canvas.width, this.canvas.height]
  }

  compile() {
    return this.renderer.compileAsync(this.scene, this.camera)
  }

  render() {
    if (!this.lost) this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.canvas.removeEventListener('webglcontextlost', this.onLost)
    this.canvas.removeEventListener('webglcontextrestored', this.onRestored)
    this.geometry.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.canvas.remove()
  }
}
