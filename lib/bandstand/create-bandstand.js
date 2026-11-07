import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { BAND_SCORE } from "@/lib/band/score.js"
import {
  createModels,
  letterTexture,
  frontTrimTexture,
  kickHeadTexture,
  sunburstTexture,
  planksTexture,
  glyphTexture,
  glowTexture,
  Y,
} from "./models.js"

// Prototype: the homepage letters become a clay theater. The curtain opens,
// the letters land on the band fronts, and twelve little players walk on.
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z)
const clamp = THREE.MathUtils.clamp
const lerp = THREE.MathUtils.lerp
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1)
const smooth = (t) => t * t * (3 - 2 * t)
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const NAMES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"]

const ROLES = [
  "trumpet",
  "saxophone",
  "trumpet",
  "saxophone",
  "trumpet",
  "trombone",
  "trombone",
  "saxophone",
  "trombone",
]
const LOOKS = [
  { color: "#ff8f70", hat: "porkpie" },
  { color: "#6fd3b0", hat: "beret", hatColor: "#1d1d1d" },
  { color: "#7fb7ff", hat: "porkpie" },
  { color: "#ffb067", hat: "beret", hatColor: "#3a1f5c" },
  { color: "#b79cff", hat: "porkpie" },
  { color: "#4fc1c9", hat: "tuft", hatColor: "#4fc1c9", glasses: true },
  { color: "#a6d96a", hat: "tuft", hatColor: "#a6d96a" },
  { color: "#ff8fb8", hat: "beret", hatColor: "#1d1d1d" },
  { color: "#8c9eff", hat: "none" },
  { color: "#f7a8d8", hat: "none", glasses: true },
  { color: "#ff7b54", hat: "fedora" },
  { color: "#5ec2ff", hat: "cap", hatColor: "#161412" },
]
const SOLOIST = 5
const RISER = 0.82
const ROWS = [
  {
    y: RISER,
    z: -2.05,
    chairZ: -2.68,
    pathZ: -3.2,
    xs: [-0.6, 0.85, 2.3, 3.75, 5.2],
  },
  { y: 0, z: -0.35, chairZ: -0.98, pathZ: -1.5, xs: [0.1, 1.55, 3.0, 4.45] },
]
const SEAT = 0.38
const STAND_HIP = 0.205
const SEAT_HIP = 0.47
const CURTAIN_Z = 0.85
const FOCUS = V(-0.2, 1.4, -1.2)
const PARTIALS = [46, 53, 58, 62, 65, 68, 70, 72, 74]
const OPEN = {
  spot: [0.3, 1.3],
  bulbs: 0.9,
  camera: [1.0, 3.7],
  curtain: [3.2, 5.0],
  stage: [3.4, 5.0],
  letters: 4.1,
  walk: 4.0,
}

// Trombone slide position for a pitch: the nearest partial at or above it.
function slideFor(midi) {
  for (const p of PARTIALS)
    if (p >= midi - 0.001 && p - midi <= 6.5) return (p - midi) / 6
  return 0
}

// When each horn has its instrument up, with time to raise it before a phrase.
const HORN_UP = Array.from({ length: 9 }, () => [])
for (const e of BAND_SCORE.events)
  if (e.player < 9)
    HORN_UP[e.player].push([e.time - 0.45, e.time + e.duration + 0.5])
HORN_UP.forEach((list, i) => {
  list.sort((a, b) => a[0] - b[0])
  const merged = []
  for (const r of list) {
    const last = merged[merged.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([...r])
  }
  HORN_UP[i] = merged
})
function hornUp(player, m) {
  const D = BAND_SCORE.duration
  for (const [a, b] of HORN_UP[player])
    for (const x of [m, m + D, m - D]) if (x >= a && x <= b) return true
  return false
}

export function createBandstand({
  mount,
  pad,
  pitchLabel,
  audio,
  getLetters,
  family,
  reducedMotion = false,
  onState = () => {},
  announce = () => {},
}) {
  const listeners = new AbortController()
  const listen = (target, type, fn, opts = {}) =>
    target.addEventListener(type, fn, { signal: listeners.signal, ...opts })
  let disposed = false,
    raf = 0,
    last = performance.now() / 1000

  // --- Renderer, camera, lights --------------------------------------------
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  const canvas = renderer.domElement
  canvas.className = "bs-canvas"
  canvas.setAttribute("aria-hidden", "true")
  mount.appendChild(canvas)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color("#0a0a0a")
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const envMap = pmrem.fromScene(room, 0.04).texture
  room.traverse((o) => o.geometry?.dispose?.())
  pmrem.dispose()

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80)
  let width = 1,
    height = 1,
    portrait = false
  const shot = {
    closePos: V(),
    closeLook: V(),
    widePos: V(),
    wideLook: V(),
    bandPos: V(),
    bandLook: V(),
    fov: 40,
  }
  // Fit a width and height of the stage at a look point.
  function fit(look, W, H, rise, outPos, outLook) {
    const t = Math.tan(THREE.MathUtils.degToRad(shot.fov / 2))
    const d = Math.max(H / 2 / t, W / 2 / (t * camera.aspect))
    outLook.copy(look)
    outPos.copy(look).addScaledVector(V(0, rise, 1).normalize(), d)
  }
  function frameShots() {
    const aspect = width / height
    portrait = aspect < 0.95
    shot.fov = portrait ? 50 : 38
    camera.aspect = aspect
    // The establishing shot shows the whole marquee; then the camera eases in.
    fit(
      V(0, 3.75, 1.4),
      portrait ? 9.4 : 18.4,
      10.6,
      0.12,
      shot.widePos,
      shot.wideLook,
    )
    fit(
      V(FOCUS.x, 1.3, -1.3),
      portrait ? 6.4 : 13.2,
      6.0,
      0.36,
      shot.bandPos,
      shot.bandLook,
    )
    shot.closePos.set(FOCUS.x, 3.3, 7.0)
    shot.closeLook.set(FOCUS.x, 3.3, 0)
    camera.fov = shot.fov
    camera.updateProjectionMatrix()
  }

  const hemi = new THREE.HemisphereLight("#ffe7c2", "#1d140a", 0)
  scene.add(hemi)
  const spot = (color, angle, penumbra, pos, target, shadow = 0) => {
    const s = new THREE.SpotLight(color, 0, 0, angle, penumbra, 0)
    s.position.copy(pos)
    s.target.position.copy(target)
    scene.add(s, s.target)
    if (shadow) {
      s.castShadow = true
      s.shadow.mapSize.set(shadow, shadow)
      s.shadow.camera.near = 2
      s.shadow.camera.far = 40
      s.shadow.bias = -0.0004
      s.shadow.normalBias = 0.02
      s.shadow.radius = 3
    }
    return s
  }
  const curtainSpot = spot(
    "#ffe0a0",
    0.42,
    0.85,
    V(FOCUS.x, 4.9, 14),
    V(FOCUS.x, 3.2, CURTAIN_Z),
    1024,
  )
  curtainSpot.shadow.radius = 7
  curtainSpot.shadow.intensity = 0.6
  const keySpot = spot(
    "#fff0d2",
    0.5,
    0.65,
    V(2.5, 12, 10),
    V(0.2, 0.6, -1.4),
    2048,
  )
  const followSpot = spot("#fff8e4", 0.13, 0.5, V(0.6, 10, 9), V(0, 1, -1))
  const rims = [-5, 5].map((x) => {
    const p = new THREE.PointLight("#ffb347", 0, 0, 2)
    p.position.set(x, 4.6, -3.8)
    scene.add(p)
    return p
  })
  const footGlow = new THREE.PointLight("#ffcf70", 0, 0, 2)
  footGlow.position.set(FOCUS.x, 0.35, 2.4)
  scene.add(footGlow)

  // --- Theater -------------------------------------------------------------
  const M = createModels({ envMap })
  const textures = []
  const tex = (t) => (textures.push(t), t)
  const trimTex = tex(frontTrimTexture()),
    kickTex = tex(kickHeadTexture(family)),
    planks = tex(planksTexture()),
    burst = tex(sunburstTexture()),
    glow = tex(glowTexture()),
    noteTex = [tex(glyphTexture("♪", family)), tex(glyphTexture("♫", family))]

  const floor = M.mesh(
    new THREE.BoxGeometry(17, 1, 7.6),
    [
      M.black,
      M.black,
      new THREE.MeshStandardMaterial({
        map: planks,
        roughness: 0.5,
        color: "#c89a7a",
      }),
      M.black,
      M.black,
      M.black,
    ],
    false,
    true,
  )
  floor.position.set(0, -0.5, -0.8)
  scene.add(floor)
  const lip = M.mesh(new THREE.BoxGeometry(17, 0.05, 0.05), M.yellow, false)
  lip.position.set(0, -0.06, 3.0)
  scene.add(lip)
  const house = M.mesh(
    new THREE.PlaneGeometry(40, 20),
    M.clay("#0c0a08"),
    false,
    true,
  )
  house.rotation.x = -Math.PI / 2
  house.position.set(0, -1, 12)
  scene.add(house)
  const backWall = M.mesh(
    new THREE.PlaneGeometry(17, 9),
    new THREE.MeshStandardMaterial({ map: burst, roughness: 0.9 }),
    false,
    true,
  )
  backWall.position.set(0, 4.3, -4.55)
  scene.add(backWall)
  const riser = M.rounded(
    19,
    RISER,
    1.9,
    0.04,
    M.clay("#1c1915", { roughness: 0.6 }),
  )
  riser.position.set(0, RISER / 2, -2.85)
  scene.add(riser)
  const riserTrim = M.mesh(
    new THREE.BoxGeometry(19, 0.04, 0.02),
    M.yellow,
    false,
  )
  riserTrim.position.set(0, RISER - 0.06, -1.9)
  scene.add(riserTrim)
  // Masking flats so the players appear from the wings.
  for (const s of [-1, 1])
    for (const z of [-0.95, -2.95]) {
      const leg = M.mesh(
        new THREE.BoxGeometry(2.2, 8, 0.08),
        M.clay("#0e0d0c"),
        false,
        true,
      )
      leg.position.set(s * 7.9, 4, z)
      scene.add(leg)
    }
  // Proscenium with marquee bulbs.
  const arch = M.clay("#121110", { roughness: 0.55 })
  for (const s of [-1, 1]) {
    const pillar = M.rounded(1.3, 8.8, 0.8, 0.08, arch)
    pillar.position.set(s * 7.65, 4.0, 1.4)
    scene.add(pillar)
    const trim = M.mesh(new THREE.BoxGeometry(0.06, 7.1, 0.04), M.yellow, false)
    trim.position.set(s * 7.04, 3.55, 1.81)
    scene.add(trim)
  }
  const header = M.rounded(16.6, 1.7, 0.8, 0.08, arch)
  header.position.set(0, 7.95, 1.4)
  scene.add(header)
  const headerTrim = M.mesh(
    new THREE.BoxGeometry(14.14, 0.06, 0.04),
    M.yellow,
    false,
  )
  headerTrim.position.set(0, 7.13, 1.81)
  scene.add(headerTrim)

  const bulbs = []
  for (let y = 0.45; y <= 7.3; y += 0.42)
    bulbs.push(V(-7.42, y, 1.84), V(7.42, y, 1.84))
  for (let x = -7.42; x <= 7.43; x += 0.41) bulbs.push(V(x, 7.48, 1.84))
  // Light the marquee from the top center outward.
  const bulbOrder = bulbs.map((b) =>
    b.y > 7.4 ? Math.abs(b.x) : 7.42 + (7.48 - b.y),
  )
  const footBulbs = []
  for (let x = -6.6; x <= 6.61; x += 0.66) footBulbs.push(V(x, 0.08, 2.7))
  const allBulbs = [...bulbs, ...footBulbs]
  const bulbMesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.075, 10, 8),
    new THREE.MeshBasicMaterial({ toneMapped: false }),
    allBulbs.length,
  )
  const dummy = new THREE.Object3D()
  allBulbs.forEach((p, i) => {
    dummy.position.copy(p)
    dummy.updateMatrix()
    bulbMesh.setMatrixAt(i, dummy.matrix)
    bulbMesh.setColorAt(i, new THREE.Color("#2a2418"))
  })
  scene.add(bulbMesh)
  const glowGeo = new THREE.BufferGeometry().setFromPoints(allBulbs)
  glowGeo.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(allBulbs.length * 3), 3),
  )
  const glowPoints = new THREE.Points(
    glowGeo,
    new THREE.PointsMaterial({
      size: 0.75,
      map: glow,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  )
  scene.add(glowPoints)
  for (const p of footBulbs) {
    const hood = M.mesh(
      new THREE.SphereGeometry(0.16, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      M.black,
      false,
    )
    hood.rotation.x = Math.PI * 0.62
    hood.position.set(p.x, 0.02, p.z + 0.08)
    scene.add(hood)
  }

  // Velvet curtain in two halves, plus a scalloped valance.
  const velvet = new THREE.MeshPhysicalMaterial({
    color: "#c98d00",
    roughness: 0.82,
    sheen: 1,
    sheenRoughness: 0.38,
    sheenColor: new THREE.Color("#ffe066"),
    side: THREE.DoubleSide,
  })
  const CW = 7.4,
    CH = 7.4,
    OUTER = 7.35
  const curtains = [-1, 1].map((side) => {
    const geo = new THREE.PlaneGeometry(1, 1, 72, 16)
    const n = geo.attributes.position.count,
      uv = new Float32Array(n * 2)
    for (let i = 0; i < n; i++) {
      const x0 = geo.attributes.position.getX(i),
        y0 = geo.attributes.position.getY(i)
      uv[i * 2] = side < 0 ? x0 + 0.5 : 0.5 - x0
      uv[i * 2 + 1] = y0 + 0.5
    }
    const m = M.mesh(geo, velvet, true, true)
    m.frustumCulled = false
    scene.add(m)
    return { side, mesh: m, uv }
  })
  function updateCurtains(open, t, motion) {
    for (const c of curtains) {
      const p = c.mesh.geometry.attributes.position
      for (let i = 0; i < p.count; i++) {
        const u = c.uv[i * 2],
          v = c.uv[i * 2 + 1]
        const g = ease(clamp(open * 1.22 - (1 - v) * 0.22, 0, 1))
        const span = CW * (1 - 0.87 * g)
        const x = c.side * (OUTER - u * span)
        const fold = Math.sin((u * CW * 2 * Math.PI) / 0.62 + c.side)
        const sway =
          0.025 * Math.sin(t * 0.8 + v * 2.2 + u * 5) +
          motion * 0.14 * Math.sin(v * 3 + u * 9 - t * 4)
        const z =
          CURTAIN_Z +
          (c.side > 0 ? -0.025 : 0) +
          (0.1 + 0.2 * g) * fold +
          sway * (1 - v * 0.6)
        const y = v * CH + 0.35 * g * u * (1 - v) ** 2
        p.setXYZ(i, x, y, z)
      }
      p.needsUpdate = true
      c.mesh.geometry.computeVertexNormals()
    }
  }
  const valanceGeo = new THREE.PlaneGeometry(14.6, 1.2, 140, 4)
  {
    const p = valanceGeo.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i)
      const scallop =
        y < -0.5 ? 0.22 * Math.abs(Math.sin((x * Math.PI) / 1.46)) : 0
      p.setXYZ(i, x, y + scallop, 0.07 * Math.sin((x * 2 * Math.PI) / 0.48))
    }
    valanceGeo.computeVertexNormals()
  }
  const valance = M.mesh(valanceGeo, velvet, false)
  valance.position.set(0, 6.6, 1.0)
  scene.add(valance)

  // --- Bandstand -----------------------------------------------------------
  const fronts = []
  ROWS.forEach((row, r) =>
    row.xs.forEach((x) => {
      const f = M.bandFront(trimTex)
      f.position.set(x, row.y, row.z)
      scene.add(f)
      fronts.push(f)
      const s = M.stool(SEAT)
      s.position.set(x, row.y, row.chairZ)
      scene.add(s)
    }),
  )
  const piano = M.piano()
  piano.group.position.set(-5.0, 0, -0.45)
  piano.group.rotation.y = Math.PI / 2 - 0.38
  scene.add(piano.group)
  const kit = M.drumKit(kickTex)
  kit.group.position.set(-3.7, RISER, -2.7)
  kit.group.rotation.y = 0.32
  scene.add(kit.group)
  scene.updateMatrixWorld(true)

  // --- The players ---------------------------------------------------------
  const guys = LOOKS.map((look, i) => {
    const parts = M.makeGuy({ ...look, seed: i * 3.7 + 1 })
    const g = {
      i,
      parts,
      role: i < 9 ? ROLES[i] : ["piano", "contrabass", "drums"][i - 9],
      raise: 0,
      lastOnset: -9,
      lastMidi: 58,
      noteEnd: 0,
      blinkAt: 1 + Math.random() * 4,
      steps: 0,
      seated: 0,
      soloLift: 0,
    }
    scene.add(parts.root)
    if (i < 9) {
      const inst = M[g.role]()
      inst.group.scale.setScalar(1.3)
      parts.torso.add(inst.group)
      g.inst = inst
      g.poses = hornPoses(g.role)
    } else if (g.role === "contrabass") {
      const bass = M.upright()
      parts.root.add(bass.group)
      g.inst = bass
    } else if (g.role === "drums") {
      g.sticks = parts.arms.map((arm) => {
        const stick = M.tube(
          V(0, 0, 0),
          V(0, -0.34, 0),
          0.011,
          M.clay("#e8c99a"),
          6,
        )
        arm.shoulder.add(stick)
        return stick
      })
    }
    return g
  })
  function hornPoses(role) {
    const q = (x, y = 0, z = 0) =>
      new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z))
    if (role === "trumpet")
      return {
        play: { p: V(0, 0.555, 0.28), q: q(-0.26, 0.3, 0) },
        rest: { p: V(0.1, 0.12, 0.3), q: q(-0.55, 0.3, 0.1) },
        carry: { p: V(0.36, 0.08, 0.12), q: q(-0.25, 0, 0) },
      }
    if (role === "trombone")
      return {
        play: { p: V(0, 0.555, 0.28), q: q(-0.16, 0.42, 0) },
        rest: { p: V(0.14, 0.08, 0.24), q: q(-0.7, 0, -0.25) },
        carry: { p: V(0.36, 0.16, 0.06), q: q(-0.15, 0, 0) },
      }
    return {
      play: { p: V(0, 0.555, 0.26), q: q(0.02) },
      rest: { p: V(0.02, 0.45, 0.2), q: q(0.18) },
      carry: { p: V(0.06, 0.48, 0.28), q: q(0.32) },
    }
  }

  // Where everyone walks from, and where they end up.
  const order = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8],
  ]
  ROWS.forEach((row, r) =>
    order[r].forEach((i, k) => {
      const x = row.xs[k]
      guys[i].spec = {
        wing: V(9.6, row.y, row.pathZ),
        approach: V(x, row.y, row.pathZ),
        seat: V(x, row.y, row.chairZ),
        yaw: 0,
        hip: SEAT_HIP,
        start: OPEN.walk + 0.25 * r + k * 0.36,
        sits: true,
      }
    }),
  )
  {
    const seat = piano.group.localToWorld(piano.seat.clone())
    guys[9].spec = {
      wing: V(-9.6, 0, -1.45),
      approach: V(seat.x, 0, -1.45),
      seat: V(seat.x, 0, seat.z),
      yaw: piano.group.rotation.y,
      hip: 0.53,
      start: OPEN.walk + 0.9,
      sits: true,
    }
    const throne = kit.group.localToWorld(V(0, 0, -0.48))
    guys[11].spec = {
      wing: V(-9.6, RISER, -3.6),
      approach: V(throne.x, RISER, -3.6),
      seat: V(throne.x, RISER, throne.z),
      yaw: kit.group.rotation.y,
      hip: 0.49,
      start: OPEN.walk + 0.45,
      sits: true,
    }
    guys[10].spec = {
      wing: V(-9.6, 0, -1.45),
      approach: V(-2.35, 0, -1.45),
      seat: V(-2.35, 0, -1.0),
      yaw: 0.35,
      hip: STAND_HIP,
      start: OPEN.walk,
      sits: false,
    }
  }
  const WALK = 2.3
  guys.forEach((g) => {
    const s = g.spec
    s.walkTime = s.wing.distanceTo(s.approach) / WALK
    s.done = s.start + s.walkTime + 1.15
  })
  const openingEnd = Math.max(...guys.map((g) => g.spec.done)) + 0.2

  // --- Letters -------------------------------------------------------------
  const D = 2.6,
    PAD = 1.35
  let letterInfo = getLetters()
  const letters = letterInfo.map((info, j) => {
    const map = letterTexture(info.char, { ...info, family, padding: PAD })
    textures.push(map)
    const mat = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      alphaTest: 0.02,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
    const m = M.mesh(new THREE.PlaneGeometry(1, 1), mat, true, false)
    m.customDepthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map,
      alphaTest: 0.5,
    })
    scene.add(m)
    return { mesh: m, home: { p: V(), w: 1, h: 1 }, start: null, j }
  })
  // The letter's place in the air that lines up with the page's own heading.
  function placeHomes() {
    letterInfo = getLetters()
    const t = Math.tan(THREE.MathUtils.degToRad(shot.fov / 2))
    const per = (2 * D * t) / height
    letters.forEach((L, j) => {
      const info = letterInfo[j]
      if (!info) return
      const cx = info.left + info.width / 2,
        cy = info.top + info.height / 2
      const nx = (cx / width) * 2 - 1,
        ny = 1 - (cy / height) * 2
      L.home.p.set(
        shot.closePos.x + nx * D * t * camera.aspect,
        shot.closePos.y + ny * D * t,
        shot.closePos.z - D,
      )
      L.home.w = info.width * PAD * per
      L.home.h = info.height * PAD * per
      L.ratio = info.height / info.fontSize
    })
  }
  function letterTarget(j) {
    const f = fronts[j]
    const h = 0.48 * letters[j].ratio * PAD
    return { p: f.position.clone().add(V(0, 0.28, 0.075)), h }
  }

  // --- Notes that float out of the bells ------------------------------------
  const notes = Array.from({ length: 36 }, (_, k) => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: noteTex[k % 2],
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    )
    s.visible = false
    scene.add(s)
    return { s, born: -9, vel: V(), life: 1.6 }
  })
  let noteCursor = 0
  function spawnNote(pos, now, strength = 1) {
    if (reducedMotion) return
    const n = notes[noteCursor++ % notes.length]
    n.s.position.copy(pos)
    n.vel.set((Math.random() - 0.3) * 0.25, 0.55 + Math.random() * 0.25, 0.25)
    n.born = now
    n.life = 1.4 + Math.random() * 0.5
    n.size = 0.2 + 0.08 * strength
    n.s.visible = true
  }

  // A soft visible beam for the follow spot.
  const beamGeo = new THREE.ConeGeometry(1, 1, 32, 1, true)
  beamGeo.translate(0, -0.5, 0)
  const beam = new THREE.Mesh(
    beamGeo,
    new THREE.ShaderMaterial({
      uniforms: {
        opacity: { value: 0 },
        color: { value: new THREE.Color("#fff1c4") },
      },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying float vH;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz);
        vN = normalize(normalMatrix * normal); vH = uv.y; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float opacity; uniform vec3 color; varying vec3 vN; varying vec3 vV; varying float vH;
        void main(){ float edge = pow(abs(dot(vN, vV)), 2.2); float fall = mix(0.15, 1.0, vH);
        gl_FragColor = vec4(color * edge * fall * opacity, 1.0); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  )
  beam.frustumCulled = false
  scene.add(beam)
  const spotAim = V(0.2, 1.2, -1.2)
  function aimBeam(light, aim, power) {
    light.target.position.copy(aim)
    const dir = aim.clone().sub(light.position),
      len = dir.length()
    beam.position.copy(light.position)
    beam.quaternion.setFromUnitVectors(V(0, -1, 0), dir.normalize())
    const r = Math.tan(light.angle) * len * 0.85
    beam.scale.set(r, len, r)
    beam.material.uniforms.opacity.value = power
  }

  // --- State ---------------------------------------------------------------
  let phase = "opening",
    phaseStart = performance.now() / 1000,
    music = "off",
    musicStart = 0,
    stopUntil = 0,
    solo = null,
    soloMidi = 58,
    walkSoundsAt = 0
  const queue = []
  const drumHits = { ride: -9, snare: -9, kick: -9 }
  function emit() {
    if (!disposed) onState({ phase, music })
  }
  function setPhase(p) {
    phase = p
    phaseStart = performance.now() / 1000
    emit()
  }

  audio.onNote = (e) => queue.push(e)

  // --- Per-frame choreography ----------------------------------------------
  const tmpA = V(),
    tmpB = V(),
    tmpC = V(),
    curtainState = { open: 0, motion: 0 },
    bulbColor = new THREE.Color()
  let frozenT = null,
    prevOpen = 0,
    push = 0,
    dtFrame = 0

  function theater(T, now) {
    let cam, open, spotLevel, stage, bulbsT, letterMode
    if (phase === "opening") {
      cam = ease(seg(T, ...OPEN.camera))
      open = ease(seg(T, ...OPEN.curtain))
      spotLevel = smooth(seg(T, ...OPEN.spot)) * (1 - 0.55 * seg(T, 4.6, 6))
      stage = smooth(seg(T, ...OPEN.stage))
      bulbsT = T - OPEN.bulbs
      letterMode = "fly"
    } else if (phase === "closing") {
      cam = 1 - ease(seg(T, 1.9, 3.9))
      open = 1 - ease(seg(T, 0.6, 2.3))
      spotLevel = 0.45 + 0.55 * seg(T, 0.8, 1.6) - smooth(seg(T, 3.5, 4.1))
      stage = 1 - smooth(seg(T, 0.8, 2.2))
      bulbsT = 1.5 - (T - 2.7)
      letterMode = "return"
    } else {
      cam = 1
      open = 1
      spotLevel = 0.45
      stage = 1
      bulbsT = 99
      letterMode = "land"
    }
    curtainState.motion = clamp(Math.abs(open - prevOpen) * 40, 0, 1)
    prevOpen = open
    curtainState.open = open

    // Camera: a dolly back from the page into the house, then in on the band.
    const pushTarget =
      (phase === "opening" && T > 7) || phase === "ready" ? 1 : 0
    push +=
      (pushTarget - push) *
      (1 - Math.exp(-dtFrame * (reducedMotion ? 60 : 0.9)))
    const p = smooth(push)
    tmpB.lerpVectors(shot.widePos, shot.bandPos, p)
    tmpC.lerpVectors(shot.wideLook, shot.bandLook, p)
    camera.position.lerpVectors(shot.closePos, tmpB, cam)
    tmpA.lerpVectors(shot.closeLook, tmpC, cam)
    if (!reducedMotion && cam > 0.99) {
      const drift = (portrait ? 2.8 : 0.4) * p
      camera.position.x += Math.sin(now * (portrait ? 0.26 : 0.11)) * drift
      tmpA.x += Math.sin(now * (portrait ? 0.26 : 0.11)) * drift * 0.8
      camera.position.y += Math.sin(now * 0.09) * 0.12
      if (solo) {
        const star = guys[SOLOIST].parts.root.position
        camera.position.x = lerp(camera.position.x, star.x, 0.25)
        tmpA.x = lerp(tmpA.x, star.x, 0.3)
      }
    }
    camera.lookAt(tmpA)

    // Lights.
    curtainSpot.intensity = 5.2 * spotLevel
    keySpot.intensity = 3.4 * stage
    hemi.intensity = 0.12 * Math.min(1, spotLevel * 2) + 0.5 * stage
    rims.forEach((r) => (r.intensity = 26 * stage))
    renderer.toneMappingExposure = 1.05

    // Marquee bulbs.
    const glowColors = glowGeo.attributes.color
    const beatPulse =
      music === "playing" ? (audio.now() - musicStart) / audio.beat : now * 1.3
    allBulbs.forEach((b, i) => {
      let on
      if (i < bulbs.length) on = bulbsT > bulbOrder[i] * 0.085 ? 1 : 0
      else on = smooth(clamp((bulbsT - 0.9) * 2, 0, 1))
      if (on && i < bulbs.length && bulbsT > 3 && !reducedMotion)
        on =
          0.72 +
          0.28 * Math.max(0, Math.sin(beatPulse * Math.PI - bulbOrder[i] * 0.9))
      bulbMesh.setColorAt(
        i,
        bulbColor.setRGB(0.18 + 0.9 * on, 0.15 + 0.82 * on, 0.08 + 0.5 * on),
      )
      glowColors.setXYZ(i, on * 1.0, on * 0.82, on * 0.45)
    })
    bulbMesh.instanceColor.needsUpdate = true
    glowColors.needsUpdate = true
    footGlow.intensity = 9 * smooth(clamp((bulbsT - 0.9) * 2, 0, 1))
    if (phase === "opening" && !theater.lit && bulbsT > 0) {
      theater.lit = true
      const tick = (k) => {
        if (disposed || k > 9) return
        audio.sfx.bulb(k)
        setTimeout(() => tick(k + 1), 110)
      }
      tick(0)
    }

    updateCurtains(open, now, curtainState.motion)
    if (phase === "opening" && T > OPEN.curtain[0] && !theater.whooshed) {
      theater.whooshed = true
      audio.sfx.whoosh(1.9)
    }
    if (phase === "closing" && T > 0.6 && !theater.closedWhoosh) {
      theater.closedWhoosh = true
      audio.sfx.whoosh(1.8, true)
    }

    // Letters.
    letters.forEach((L, j) => {
      const m = L.mesh,
        home = L.home,
        target = letterTarget(j)
      const bob = reducedMotion ? 0 : Math.sin(now * 1.6 + j * 0.7) * 0.03
      let k
      if (letterMode === "fly")
        k = ease(seg(T, OPEN.letters + j * 0.1, OPEN.letters + 0.95 + j * 0.1))
      else if (letterMode === "return")
        k = 1 - ease(seg(T, j * 0.06, 0.9 + j * 0.06))
      else k = 1
      const hover = tmpA.copy(home.p)
      hover.y += bob * seg(cam, 0, 0.3) * (1 - k)
      const mid = tmpB.lerpVectors(hover, target.p, 0.5)
      mid.y += 2.0
      const a = 1 - k
      m.position.set(
        a * a * hover.x + 2 * a * k * mid.x + k * k * target.p.x,
        a * a * hover.y + 2 * a * k * mid.y + k * k * target.p.y,
        a * a * hover.z + 2 * a * k * mid.z + k * k * target.p.z,
      )
      const h = lerp(home.h, target.h, k)
      m.scale.set((h * home.w) / home.h, h, 1)
      m.rotation.set(
        0,
        (letterMode === "return" ? -1 : 1) * Math.PI * 2 * ease(k),
        Math.sin(k * Math.PI) * 0.3,
      )
      // Land with a little squash.
      if (letterMode === "fly") {
        const landed = T - (OPEN.letters + 0.95 + j * 0.1)
        if (landed > 0 && landed < 0.35) {
          const s = Math.sin((landed / 0.35) * Math.PI) * 0.22
          m.scale.y *= 1 - s
          m.scale.x *= 1 + s * 0.6
        }
        if (landed > 0 && !L.tokked && !reducedMotion) {
          L.tokked = true
          audio.sfx.tok(
            [70, 74, 77, 74, 82, 65, 70, 74, 77][j],
            (target.p.x / 7) * 0.8,
          )
        }
      }
    })
  }

  function updateGuy(g, T, now, dt, groove, beatInfo) {
    const { parts, spec } = g
    const root = parts.root
    let pos = tmpA,
      yaw,
      hip,
      sit = 0,
      walking = false,
      walkDist = 0
    const local = phase === "opening" ? T - spec.start : 99
    const visible = !(phase === "opening" && local < 0)
    root.visible = visible
    if (!visible) return
    const dir = Math.sign(spec.approach.x - spec.wing.x)
    if (local < spec.walkTime) {
      walking = true
      walkDist = local * WALK
      pos.copy(spec.wing).lerp(spec.approach, local / spec.walkTime)
      yaw = (dir * Math.PI) / 2
      hip = STAND_HIP
    } else if (local < spec.walkTime + 0.4) {
      const u = smooth((local - spec.walkTime) / 0.4)
      walking = true
      walkDist = spec.walkTime * WALK + u * 0.5
      pos.copy(spec.approach).lerp(spec.seat, u)
      yaw = lerp((dir * Math.PI) / 2, spec.yaw, u)
      hip = STAND_HIP
    } else {
      pos.copy(spec.seat)
      yaw = spec.yaw
      const u = seg(local, spec.walkTime + 0.4, spec.walkTime + 0.85)
      if (spec.sits) {
        sit = smooth(u)
        hip = lerp(STAND_HIP, spec.hip, smooth(u)) + Math.sin(u * Math.PI) * 0.2
      } else {
        sit = smooth(u)
        hip = STAND_HIP
      }
    }
    // The soloist hops up and stands on his chair.
    if (g.i === SOLOIST) {
      g.soloLift += ((solo ? 1 : 0) - g.soloLift) * (1 - Math.exp(-dt * 10))
      hip =
        lerp(hip, SEAT + STAND_HIP + 0.2, smooth(g.soloLift)) +
        Math.sin(g.soloLift * Math.PI) * 0.08
      sit *= 1 - g.soloLift
    }
    g.seated = sit
    root.position.copy(pos)
    root.rotation.y = yaw
    const step = walkDist / 0.19
    parts.hips.position.y =
      hip + (walking ? Math.abs(Math.sin(step * Math.PI)) * 0.05 : 0)
    parts.torso.rotation.set(
      0,
      0,
      walking ? Math.sin(step * Math.PI) * 0.09 : 0,
    )
    if (walking && Math.floor(step) !== g.steps) {
      g.steps = Math.floor(step)
      if (!reducedMotion)
        audio.sfx.footstep(pos.x / 9, 0.7, 0.85 + (g.i % 4) * 0.08)
    }
    parts.legs.forEach((leg, k) => {
      const swing = walking ? Math.sin(step * Math.PI + k * Math.PI) * 0.55 : 0
      const seatedAngle = spec.sits ? -1.45 * sit : 0
      leg.rotation.x = swing + seatedAngle
    })

    // Groove: nod on every beat, harder on two and four.
    const nod =
      groove * (0.05 + 0.06 * beatInfo.backbeat) * Math.exp(-beatInfo.phase * 5)
    const sway = groove * 0.05 * Math.sin(beatInfo.beats * Math.PI * 0.5 + g.i)
    parts.torso.rotation.z += sway
    parts.head.rotation.x = nod + (g.i < 9 ? -0.05 * g.raise : 0)
    parts.head.rotation.y =
      phase === "ready" && music === "off" && !reducedMotion
        ? Math.sin(now * 0.45 + g.i * 1.9) * 0.22
        : 0
    // Breathing and blinking.
    parts.torso.scale.y = 1 + Math.sin(now * 2.2 + g.i) * 0.012
    if (now > g.blinkAt) g.blinkAt = now + 2 + Math.random() * 4
    const blink = g.blinkAt - now < 0.12 ? 0.12 : 1
    parts.eyes.forEach((e) => (e.scale.y = blink))
    const blowing = now < g.noteEnd ? 1 : 0
    parts.cheeks.forEach((c) => {
      const puff = 1 + 0.75 * g.raise * blowing
      c.scale.set(
        c.userData.base.x * puff,
        c.userData.base.y * puff,
        c.userData.base.z * (1 + 1.2 * g.raise * blowing),
      )
    })
    parts.mouth.visible = g.raise < 0.5

    if (g.i < 9) hornArms(g, sit, walking, step, now)
    else if (g.role === "piano") pianoArms(g, now, walking, step)
    else if (g.role === "contrabass") bassArms(g, now, sit, walking, step)
    else drumArms(g, now, walking, step)
  }

  function hornArms(g, sit, walking, step, now) {
    const { inst, poses, parts } = g
    const settle = phase === "opening" ? sit : 1
    const r = smooth(g.raise)
    tmpA.lerpVectors(poses.carry.p, poses.rest.p, settle)
    const qa = new THREE.Quaternion().slerpQuaternions(
      poses.carry.q,
      poses.rest.q,
      settle,
    )
    inst.group.position.lerpVectors(tmpA, poses.play.p, r)
    inst.group.quaternion.slerpQuaternions(qa, poses.play.q, r)
    // A small kick on each note.
    const since = now - g.lastOnset
    if (since >= 0 && since < 0.25)
      inst.group.rotation.x -= 0.05 * (1 - since / 0.25) * r
    if (inst.slide) {
      const target =
        g.i === SOLOIST && solo ? slideFor(soloMidi) : slideFor(g.lastMidi)
      const ext = target * 0.4 * r
      inst.slide.position.z += (ext - inst.slide.position.z) * 0.35
      tmpB.copy(inst.anchors.right)
      tmpB.z += inst.slide.position.z
    } else tmpB.copy(inst.anchors.right)
    inst.group.updateMatrix()
    tmpB.applyMatrix4(inst.group.matrix)
    M.reach(parts.arms[1], tmpB)
    const carrying = settle < 0.5 && r < 0.5
    if (carrying && walking) {
      tmpC.set(-0.32, 0.02, Math.sin(step * Math.PI) * 0.16)
      M.reach(parts.arms[0], tmpC)
    } else {
      tmpC.copy(inst.anchors.left).applyMatrix4(inst.group.matrix)
      M.reach(parts.arms[0], tmpC)
    }
  }

  function toTorso(g, obj, point) {
    return g.parts.torso.worldToLocal(obj.localToWorld(point.clone()))
  }
  function swingArms(g, step) {
    const s = Math.sin(step * Math.PI) * 0.16
    M.reach(g.parts.arms[0], tmpC.set(-0.32, 0.02, s))
    M.reach(g.parts.arms[1], tmpC.set(0.32, 0.02, -s))
  }
  function pianoArms(g, now, walking, step) {
    if (walking || g.seated < 0.6) return swingArms(g, step)
    g.parts.root.updateMatrixWorld(true)
    const since = now - g.lastOnset,
      lift = 0.06 * clamp(since / 0.22, 0, 1)
    ;["left", "right"].forEach((side, k) => {
      const p = toTorso(g, piano.group, piano.anchors[side])
      p.y += lift + (music === "off" ? 0.04 : 0)
      M.reach(g.parts.arms[k], p)
    })
  }
  function bassArms(g, now, sit, walking, step) {
    const bass = g.inst.group
    // Dragged in on its side, then stood up.
    bass.position.set(lerp(-0.3, -0.22, sit), 0, lerp(-0.05, 0.22, sit))
    bass.rotation.set(
      lerp(-0.55, 0, sit),
      lerp(0.6, -0.15, sit),
      lerp(0.35, 0.12, sit),
    )
    g.parts.root.updateMatrixWorld(true)
    const since = now - g.lastOnset
    const neck = g.inst.anchors.neck.clone()
    neck.y -= clamp((g.lastMidi - 29) / 17, 0, 1) * 0.3 * sit
    const left = toTorso(g, bass, neck)
    M.reach(g.parts.arms[0], left)
    const pluck = g.inst.anchors.pluck.clone()
    pluck.x += 0.07 * Math.exp(-since * 9) * sit
    if (walking) swingArms(g, step)
    M.reach(g.parts.arms[1], toTorso(g, bass, pluck))
    if (walking) M.reach(g.parts.arms[0], left)
  }
  function drumArms(g, now, walking, step) {
    g.sticks.forEach((s) => (s.visible = !walking))
    if (walking || g.seated < 0.6) return swingArms(g, step)
    g.parts.root.updateMatrixWorld(true)
    const hit = (role, anchor, k) => {
      const since = now - drumHits[role]
      const p = toTorso(g, kit.group, anchor)
      p.y += music === "off" ? 0.12 : 0.13 * clamp(since / 0.16, 0, 1)
      const arm = g.parts.arms[k]
      M.reach(arm, p)
      const stick = g.sticks[k]
      stick.position.copy(arm.hand.position)
      stick.quaternion.copy(arm.limb.quaternion)
      stick.rotateX(-1.05)
    }
    hit("snare", kit.anchors.snare, 0)
    hit("ride", kit.anchors.ride, 1)
    const r = now - drumHits.ride
    kit.ride.rotation.x = 0.25 + Math.exp(-r * 7) * Math.sin(r * 34) * 0.08
    const kk = now - drumHits.kick
    const pulse = 1 + Math.exp(-kk * 14) * 0.06
    kit.kick.scale.set(pulse, pulse, 1)
    kit.hatTop.position.y =
      0.035 + (Math.exp(-(now - drumHits.snare) * 10) > 0.5 ? -0.03 : 0)
  }

  function updateBand(T, now, dt) {
    const anow = audio.now()
    // Hand musical events to the players as they sound.
    while (queue.length && queue[0].time <= anow) {
      const e = queue.shift()
      const g = guys[e.player]
      if (e.player === 11) {
        drumHits[e.role] = now - (anow - e.time)
        continue
      }
      if (!g) continue
      if (g.i === 9 && e.midi !== undefined) {
        g.lastOnset = now - (anow - e.time)
        continue
      }
      g.lastOnset = now - (anow - e.time)
      g.lastMidi = e.midi
      g.noteEnd = Math.max(g.noteEnd, g.lastOnset + e.duration)
      if (g.i < 9 && g.inst && (e.volume >= 0.19 || Math.random() < 0.25)) {
        const bellPos = g.inst.group.localToWorld(g.inst.bell.clone())
        spawnNote(bellPos, now, e.volume >= 0.19 ? 1 : 0.4)
      }
    }
    const playing = music === "playing"
    const m = playing ? anow - musicStart : 0
    const beats = playing ? m / BAND_SCORE.beat : 0
    const beatInfo = {
      beats,
      phase: beats - Math.floor(beats),
      backbeat: Math.floor(beats) % 2,
    }
    const groove = reducedMotion ? 0 : playing ? clamp(m * 2, 0, 1) : 0
    guys.forEach((g) => {
      if (g.i < 9) {
        let up = 0
        if (playing && m >= -0.5)
          up = hornUp(
            g.i,
            ((m % BAND_SCORE.duration) + BAND_SCORE.duration) %
              BAND_SCORE.duration,
          )
            ? 1
            : 0
        if (music === "stopping") up = now < g.noteEnd + 0.3 ? 1 : 0
        if (g.i === SOLOIST && solo) up = 1
        const rate = reducedMotion ? 30 : 9
        g.raise += (up - g.raise) * (1 - Math.exp(-dt * rate))
      }
      updateGuy(g, T, now, dt, groove, beatInfo)
    })

    // The follow spot finds whoever has the melody.
    let power = 0
    if (solo) {
      guys[SOLOIST].parts.head.getWorldPosition(tmpB)
      tmpB.y -= 0.6
      power = 1
    } else if (playing) {
      const bar = Math.floor((m + 0.45) / (4 * BAND_SCORE.beat)) % 12
      const section = bar % 2 ? [1, 3, 7] : [0, 2, 4]
      tmpB.set(0, 0, 0)
      section.forEach((i) => tmpB.add(guys[i].parts.root.position))
      tmpB.multiplyScalar(1 / 3)
      tmpB.y += 0.9
      power = 0.8
    } else {
      tmpB.set(2.2, 0.9, -1.2)
      power = phase === "ready" ? 0.25 : 0
    }
    if (phase !== "ready") power = 0
    spotAim.lerp(tmpB, reducedMotion ? 1 : 1 - Math.exp(-dt * 4))
    followSpot.intensity +=
      (power * 16 - followSpot.intensity) * (1 - Math.exp(-dt * 5))
    followSpot.angle = solo ? 0.085 : 0.13
    aimBeam(followSpot, spotAim, (followSpot.intensity / 16) * 0.3)

    // Pitch readout above the soloist.
    if (solo && pitchLabel) {
      guys[SOLOIST].parts.head.getWorldPosition(tmpC)
      tmpC.y += 0.55
      tmpC.project(camera)
      const x = (tmpC.x * 0.5 + 0.5) * width,
        y = (-tmpC.y * 0.5 + 0.5) * height
      const n = Math.round(soloMidi)
      pitchLabel.textContent = NAMES[n % 12] + (Math.floor(n / 12) - 1)
      pitchLabel.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`
      pitchLabel.hidden = false
    } else if (pitchLabel) pitchLabel.hidden = true

    // Floating notes.
    notes.forEach((n) => {
      if (!n.s.visible) return
      const age = now - n.born
      if (age > n.life) {
        n.s.visible = false
        return
      }
      n.s.position.addScaledVector(n.vel, dt)
      n.s.position.x += Math.sin(age * 6 + n.born) * 0.004
      const pop = Math.min(1, age / 0.15)
      n.s.scale.setScalar(n.size * (0.6 + 0.4 * pop))
      n.s.material.opacity = Math.min(1, age / 0.1) * (1 - age / n.life)
    })
  }

  function render(ms) {
    raf = 0
    if (disposed || document.hidden) return
    const now = ms / 1000
    const dt = Math.min(0.05, Math.max(0, now - last))
    last = now
    const T = frozenT ?? now - phaseStart
    if (phase === "opening" && T > openingEnd) {
      setPhase("ready")
      announce("The band is seated. Start the music when you are ready.")
    }
    if (phase === "closing" && T > 4.15) {
      setPhase("closed")
      return
    }
    if (music === "stopping" && audio.now() > stopUntil) {
      music = "off"
      emit()
      announce("The band has stopped.")
    }
    dtFrame = dt
    theater(T, now)
    updateBand(T, now, dt)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(render)
  }
  function wake() {
    if (!raf && !disposed && !document.hidden) {
      last = performance.now() / 1000
      raf = requestAnimationFrame(render)
    }
  }

  function resize() {
    width = Math.max(1, mount.clientWidth)
    height = Math.max(1, mount.clientHeight)
    renderer.setSize(width, height, false)
    frameShots()
    placeHomes()
  }

  // --- Controls ------------------------------------------------------------
  async function startMusic() {
    if (phase !== "ready" || music !== "off") return
    try {
      music = "loading"
      emit()
      const start = await audio.start()
      if (disposed) return
      musicStart = start
      music = "playing"
      emit()
      announce(
        "The band is playing a twelve-bar B-flat blues. Hold and drag on the stage to solo.",
      )
    } catch (_) {
      music = "off"
      emit()
      announce("Audio could not start. Please try again.")
    }
  }
  function stopMusic() {
    if (music !== "playing") return
    endSolo()
    const tail = audio.cutOff()
    tail.forEach((e) => queue.push(e))
    queue.sort((a, b) => a.time - b.time)
    stopUntil = audio.now() + 1.9
    music = "stopping"
    emit()
    announce("The cutoff… a couple of players are still finishing.")
  }
  function close() {
    if (phase === "closing" || phase === "closed") return
    endSolo()
    if (music === "playing") stopMusic()
    if (reducedMotion) {
      audio.stopAll()
      setPhase("closed")
      return
    }
    setPhase("closing")
    placeHomes()
    announce("The curtain is closing.")
    wake()
  }

  const canSolo = () => phase === "ready" && music !== "stopping"
  async function beginSolo(midi) {
    if (!canSolo()) return
    solo = { started: performance.now() }
    soloMidi = midi
    try {
      await audio.prepare()
      if (solo) audio.playSolo(soloMidi)
    } catch (_) {
      announce("Audio could not start. Please try again.")
    }
  }
  function moveSolo(midi) {
    soloMidi = clamp(midi, 46, 70)
    if (solo) audio.playSolo(soloMidi)
  }
  function endSolo() {
    solo = null
    pointer = null
    keyboard = false
    audio.stopSolo()
  }
  let pointer = null,
    keyboard = false
  listen(pad, "pointerdown", (e) => {
    if (e.button !== 0 || !canSolo()) return
    e.preventDefault()
    pointer = { id: e.pointerId, x: e.clientX }
    try {
      pad.setPointerCapture(e.pointerId)
    } catch (_) {}
    beginSolo(58)
  })
  listen(pad, "pointermove", (e) => {
    if (pointer?.id === e.pointerId)
      moveSolo(58 - (e.clientX - pointer.x) / Math.max(12, width / 18))
  })
  const release = (e) => {
    if (pointer && (!e || pointer.id === e.pointerId)) endSolo()
  }
  listen(pad, "pointerup", release)
  listen(pad, "pointercancel", release)
  listen(pad, "lostpointercapture", release)
  listen(pad, "keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      if (e.repeat || keyboard) return
      keyboard = true
      beginSolo(soloMidi)
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
      moveSolo(soloMidi + (e.key === "ArrowLeft" ? 0.5 : -0.5))
    }
  })
  listen(pad, "keyup", (e) => {
    if ((e.key === " " || e.key === "Enter") && keyboard) {
      e.preventDefault()
      endSolo()
    }
  })
  listen(pad, "blur", () => keyboard && endSolo())
  listen(window, "resize", resize)
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(mount)
  listen(document, "visibilitychange", () => {
    if (document.hidden) pause()
    else wake()
  })

  function pause() {
    endSolo()
    if (music !== "off") {
      audio.suspend()
      music = "off"
      queue.length = 0
      emit()
    }
    cancelAnimationFrame(raf)
    raf = 0
  }

  resize()
  if (reducedMotion) {
    phaseStart -= 99
  }
  theater(0, performance.now() / 1000)
  renderer.render(scene, camera)
  emit()
  wake()

  return {
    // Development only: pin the choreography clock to inspect a moment.
    freeze(seconds) {
      frozenT = seconds
    },
    startMusic,
    stopMusic,
    close,
    pause,
    setMuted: (m) => audio.setMuted(m),
    destroy() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(raf)
      listeners.abort()
      resizeObserver.disconnect()
      endSolo()
      audio.stopAll()
      audio.onNote = null
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        const mats = Array.isArray(o.material)
          ? o.material
          : o.material
            ? [o.material]
            : []
        mats.forEach((mat) => mat.dispose())
        o.customDepthMaterial?.dispose()
      })
      textures.forEach((t) => t.dispose())
      envMap.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
