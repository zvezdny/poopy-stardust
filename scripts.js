import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import GUI from 'lil-gui'

const params = {
  count: 5000,
  size: 0.1,
  spread: 15,
  autoRotate: false,
  autoRotateSpeed: 0.2,
}

// Scene, camera, renderer
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 15)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// Texture and material (created once, reused)
const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}particles/1.png`)
texture.colorSpace = THREE.SRGBColorSpace

const material = new THREE.PointsMaterial({
  size: params.size,
  sizeAttenuation: true,
  map: texture,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
})

// Particles
let particles = null

function buildParticles() {
  if (particles) {
    particles.geometry.dispose()
    scene.remove(particles)
  }

  const positions = new Float32Array(params.count * 3)
  const colors = new Float32Array(params.count * 3)

  for (let i = 0; i < params.count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * params.spread
    colors[i] = Math.random()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  particles = new THREE.Points(geometry, material)
  scene.add(particles)
}

buildParticles()

// Controls: free rotation on all axes, no pole limit
const controls = new TrackballControls(camera, renderer.domElement)
controls.rotateSpeed = 3
controls.zoomSpeed = 1.2
controls.dynamicDampingFactor = 0.05 // smoothness / inertia
controls.noPan = true                // remove this line if you want panning

// GUI
const gui = new GUI()
gui.add(params, 'count', 10, 50000, 1).name('particle count').onFinishChange(buildParticles)
gui.add(params, 'spread', 1, 50, 0.5).onFinishChange(buildParticles)
gui.add(params, 'size', 0.01, 1, 0.01).onChange(v => (material.size = v))
gui.add(params, 'autoRotate')
gui.add(params, 'autoRotateSpeed', 0, 2, 0.01)

// Animation loop
const clock = new THREE.Clock()

function tick() {
  requestAnimationFrame(tick)
  const delta = clock.getDelta()

  if (params.autoRotate && particles) {
    particles.rotation.y += delta * params.autoRotateSpeed
  }

  controls.update()
  renderer.render(scene, camera)
}
tick()

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  controls.handleResize()
})