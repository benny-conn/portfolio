import * as THREE from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"

// Low-poly clay pieces for the 3D bandstand. Everything is built from
// primitives so the prototype needs no model files.
export const Y = "#ffdd00"
export const K = "#0a0a0a"

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z)
const UP = V(0, 1, 0)

export function createModels({ envMap }) {
  const materials = new Map()
  const clay = (color, extra = {}) => {
    const key = color + JSON.stringify(extra)
    if (!materials.has(key))
      materials.set(
        key,
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.8,
          metalness: 0,
          ...extra,
        }),
      )
    return materials.get(key)
  }
  const brass = new THREE.MeshStandardMaterial({
    color: "#ffd21f",
    roughness: 0.3,
    metalness: 0.65,
    envMap,
    envMapIntensity: 0.9,
  })
  const brassInside = brass.clone()
  brassInside.side = THREE.DoubleSide
  const silver = new THREE.MeshStandardMaterial({
    color: "#e8e3d6",
    roughness: 0.35,
    metalness: 0.5,
    envMap,
    envMapIntensity: 0.6,
  })
  const black = clay("#161412", { roughness: 0.7 })
  const yellow = clay(Y, { roughness: 0.55 })

  const mesh = (geometry, material, cast = true, receive = false) => {
    const m = new THREE.Mesh(geometry, material)
    m.castShadow = cast
    m.receiveShadow = receive
    return m
  }
  // Soft, slightly hand-pressed spheres for bodies and heads.
  function lumpy(radius, detail = 3, amount = 0.035, seed = 1) {
    let g = new THREE.IcosahedronGeometry(radius, detail)
    g.deleteAttribute("normal")
    g.deleteAttribute("uv")
    g = mergeVertices(g)
    const p = g.attributes.position,
      v = V()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      const n =
        Math.sin(v.x * 11 + seed) *
          Math.sin(v.y * 9 + seed * 1.7) *
          Math.sin(v.z * 10 + seed * 2.3) +
        0.4 * Math.sin(v.x * 23 + v.y * 19 + seed)
      v.multiplyScalar(1 + n * amount)
      p.setXYZ(i, v.x, v.y, v.z)
    }
    g.computeVertexNormals()
    return g
  }
  function tube(a, b, radius, material, radial = 8) {
    const dir = b.clone().sub(a),
      len = dir.length()
    const m = mesh(
      new THREE.CylinderGeometry(radius, radius, len, radial, 1),
      material,
    )
    m.position.copy(a).addScaledVector(dir, 0.5)
    m.quaternion.setFromUnitVectors(UP, dir.normalize())
    return m
  }
  // A horn bell that opens along +z from its throat.
  function bell(length, throat, mouth, material = brassInside, flare = 3) {
    const pts = []
    for (let i = 0; i <= 8; i++) {
      const t = i / 8
      pts.push(
        new THREE.Vector2(throat + (mouth - throat) * t ** flare, t * length),
      )
    }
    const g = new THREE.LatheGeometry(pts, 18)
    g.rotateX(Math.PI / 2)
    return mesh(g, material)
  }

  // --- Musicians -----------------------------------------------------------
  const eyeGeo = new THREE.SphereGeometry(0.04, 12, 10),
    shineGeo = new THREE.SphereGeometry(0.012, 8, 6),
    cheekGeo = new THREE.SphereGeometry(0.05, 12, 8),
    armGeo = new THREE.CapsuleGeometry(0.052, 0.2, 4, 10),
    handGeo = new THREE.SphereGeometry(0.068, 12, 10),
    legGeo = new THREE.CapsuleGeometry(0.06, 0.1, 4, 10),
    footGeo = new THREE.SphereGeometry(0.08, 12, 8)
  armGeo.translate(0, -0.15, 0)
  legGeo.translate(0, -0.08, 0)
  const eyeMat = new THREE.MeshStandardMaterial({
      color: "#0d0d0d",
      roughness: 0.18,
    }),
    shineMat = new THREE.MeshBasicMaterial({ color: "#ffffff" }),
    cheekMat = clay("#ff8f8f", { roughness: 0.9 }),
    mouthMat = clay("#2a1310")

  function hat(kind, color) {
    const g = new THREE.Group()
    if (kind === "porkpie") {
      const brim = mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.025, 20),
        black,
      )
      const crown = mesh(
        new THREE.CylinderGeometry(0.155, 0.17, 0.12, 20),
        black,
      )
      const band = mesh(
        new THREE.CylinderGeometry(0.172, 0.172, 0.03, 20),
        yellow,
      )
      crown.position.y = 0.07
      band.position.y = 0.03
      g.add(brim, crown, band)
      g.position.y = 0.23
      g.rotation.z = -0.12
    } else if (kind === "beret") {
      const b = mesh(lumpy(0.2, 2, 0.04, 7), clay(color))
      b.scale.set(1.15, 0.42, 1.1)
      const nub = mesh(new THREE.SphereGeometry(0.025, 8, 6), clay(color))
      nub.position.y = 0.08
      g.add(b, nub)
      g.position.set(0.03, 0.235, -0.01)
      g.rotation.z = 0.25
    } else if (kind === "fedora") {
      const brim = mesh(
        new THREE.CylinderGeometry(0.27, 0.27, 0.025, 20),
        black,
      )
      const crown = mesh(lumpy(0.17, 2, 0.02, 3), black)
      crown.scale.set(1, 0.75, 0.9)
      crown.position.y = 0.08
      const band = mesh(
        new THREE.CylinderGeometry(0.168, 0.168, 0.035, 20),
        yellow,
      )
      band.position.y = 0.035
      g.add(brim, crown, band)
      g.position.y = 0.22
      g.rotation.x = -0.12
    } else if (kind === "tuft") {
      for (let i = 0; i < 3; i++) {
        const t = mesh(new THREE.ConeGeometry(0.035, 0.12, 8), clay(color))
        t.position.set((i - 1) * 0.045, 0.27, 0.02)
        t.rotation.z = (1 - i) * 0.45
        g.add(t)
      }
    } else if (kind === "cap") {
      const c = mesh(lumpy(0.2, 2, 0.02, 11), clay(color))
      c.scale.set(1.05, 0.6, 1.05)
      c.position.y = 0.17
      const bill = mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.02, 16, 1, false, 0, Math.PI),
        clay(color),
      )
      bill.position.set(0, 0.17, -0.12)
      bill.rotation.y = Math.PI / 2
      g.add(c, bill)
      g.rotation.x = 0.15
    }
    return g
  }

  function makeGuy({
    color,
    hat: hatKind = "none",
    hatColor = "#222",
    seed = 1,
    glasses = false,
  }) {
    const skin = clay(color)
    const root = new THREE.Group(),
      hips = new THREE.Group(),
      torso = new THREE.Group(),
      head = new THREE.Group()
    root.add(hips)
    hips.add(torso)
    torso.add(head)
    const body = mesh(lumpy(0.3, 3, 0.03, seed), skin)
    body.scale.set(1, 1.05, 0.92)
    body.position.y = 0.2
    torso.add(body)
    head.position.y = 0.62
    const skull = mesh(lumpy(0.27, 3, 0.025, seed + 4), skin)
    skull.scale.set(1.04, 0.96, 1)
    head.add(skull)
    const eyes = [-1, 1].map((s) => {
      const e = new THREE.Group()
      const ball = mesh(eyeGeo, eyeMat, false)
      ball.scale.set(0.85, 1.15, 0.55)
      const shine = mesh(shineGeo, shineMat, false)
      shine.position.set(0.012, 0.018, 0.022)
      e.add(ball, shine)
      e.position.set(s * 0.092, 0.035, 0.236)
      head.add(e)
      return e
    })
    const cheeks = [-1, 1].map((s) => {
      const c = mesh(cheekGeo, cheekMat, false)
      c.position.set(s * 0.155, -0.045, 0.205)
      c.scale.set(1, 0.68, 0.45)
      c.userData.base = c.scale.clone()
      head.add(c)
      return c
    })
    const mouth = mesh(
      new THREE.TorusGeometry(0.035, 0.01, 6, 12, Math.PI),
      mouthMat,
      false,
    )
    mouth.position.set(0, -0.06, 0.258)
    mouth.rotation.z = Math.PI
    head.add(mouth)
    if (hatKind !== "none") head.add(hat(hatKind, hatColor))
    if (glasses) {
      ;[-1, 1].forEach((s) => {
        const r = mesh(
          new THREE.TorusGeometry(0.058, 0.011, 6, 16),
          black,
          false,
        )
        r.position.set(s * 0.092, 0.035, 0.252)
        head.add(r)
      })
      const bridge = tube(
        V(-0.035, 0.04, 0.262),
        V(0.035, 0.04, 0.262),
        0.008,
        black,
      )
      head.add(bridge)
    }
    // The site's yellow, worn as a bow tie.
    const tie = new THREE.Group()
    ;[-1, 1].forEach((s) => {
      const wing = mesh(new THREE.ConeGeometry(0.045, 0.085, 10), yellow, false)
      wing.rotation.z = (s * Math.PI) / 2
      wing.position.x = s * 0.04
      tie.add(wing)
    })
    tie.add(mesh(new THREE.SphereGeometry(0.022, 8, 6), yellow, false))
    tie.position.set(0, 0.38, 0.235)
    tie.rotation.x = -0.35
    torso.add(tie)

    const arms = [-1, 1].map((s) => {
      const shoulder = new THREE.Group()
      shoulder.position.set(s * 0.25, 0.36, 0.02)
      const limb = new THREE.Group()
      limb.add(mesh(armGeo, skin))
      const hand = mesh(handGeo, skin)
      hand.position.y = -0.3
      shoulder.add(limb, hand)
      torso.add(shoulder)
      return { shoulder, limb, hand, side: s }
    })
    const legs = [-1, 1].map((s) => {
      const hip = new THREE.Group()
      hip.position.set(s * 0.12, 0.04, 0)
      const leg = mesh(legGeo, skin)
      const foot = mesh(footGeo, skin)
      foot.scale.set(0.95, 0.55, 1.35)
      foot.position.set(0, -0.2, 0.04)
      hip.add(leg, foot)
      hips.add(hip)
      return hip
    })
    return { root, hips, torso, head, eyes, cheeks, mouth, arms, legs, seed }
  }

  // Points an arm at a torso-space target. Clay arms may stretch a little.
  const tmp = V(),
    down = V(0, -1, 0)
  function reach(arm, target, stretch = 1.5) {
    tmp.copy(target).sub(arm.shoulder.position)
    const len = THREE.MathUtils.clamp(tmp.length(), 0.16, 0.3 * stretch)
    tmp.normalize()
    arm.limb.quaternion.setFromUnitVectors(down, tmp)
    arm.limb.scale.y = len / 0.3
    arm.hand.position.copy(tmp).multiplyScalar(len)
  }

  // --- Instruments ---------------------------------------------------------
  // Each horn is built with its mouthpiece at the origin, pointing along +z.
  function trumpet() {
    const g = new THREE.Group()
    g.add(tube(V(0, 0, -0.02), V(0, 0, 0.32), 0.016, brass))
    g.add(tube(V(0, -0.075, 0.05), V(0, -0.075, 0.3), 0.015, brass))
    g.add(tube(V(0, 0, 0.32), V(0, -0.075, 0.3), 0.015, brass))
    g.add(tube(V(0, 0, 0.05), V(0, -0.075, 0.05), 0.015, brass))
    for (let k = 0; k < 3; k++) {
      const z = 0.13 + k * 0.045
      g.add(tube(V(0, -0.1, z), V(0, 0.045, z), 0.02, brass))
      const cap = mesh(new THREE.SphereGeometry(0.022, 8, 6), brass)
      cap.position.set(0, 0.05, z)
      g.add(cap)
    }
    const b = bell(0.2, 0.018, 0.085)
    b.position.z = 0.3
    g.add(b)
    return {
      group: g,
      anchors: { left: V(0, -0.04, 0.14), right: V(0, 0.02, 0.19) },
      bell: V(0, 0, 0.52),
    }
  }

  function trombone() {
    const g = new THREE.Group(),
      slide = new THREE.Group()
    g.add(tube(V(0, 0, -0.02), V(0, 0, 0.46), 0.012, silver))
    g.add(tube(V(0, -0.075, 0.08), V(0, -0.075, 0.46), 0.012, silver))
    slide.add(tube(V(0, 0, 0.12), V(0, 0, 0.5), 0.017, brass))
    slide.add(tube(V(0, -0.075, 0.12), V(0, -0.075, 0.5), 0.017, brass))
    const crook = mesh(
      new THREE.TorusGeometry(0.0375, 0.017, 6, 12, Math.PI),
      brass,
    )
    crook.rotation.y = -Math.PI / 2
    crook.rotation.z = -Math.PI / 2
    crook.position.set(0, -0.0375, 0.5)
    slide.add(crook)
    slide.add(tube(V(0, 0, 0.17), V(0, -0.075, 0.17), 0.01, brass))
    g.add(slide)
    // Bell section, over the shoulder.
    g.add(tube(V(0.02, 0.09, -0.26), V(0.02, 0.09, 0.2), 0.016, brass))
    const back = mesh(
      new THREE.TorusGeometry(0.045, 0.016, 6, 12, Math.PI),
      brass,
    )
    back.rotation.y = -Math.PI / 2
    back.rotation.z = Math.PI / 2
    back.position.set(0.01, 0.045, -0.26)
    g.add(back)
    g.add(tube(V(0, 0, -0.26), V(0, 0, -0.02), 0.014, brass))
    g.add(tube(V(0.01, 0, 0.04), V(0.02, 0.09, 0.04), 0.008, brass))
    const b = bell(0.26, 0.018, 0.12)
    b.position.set(0.02, 0.09, 0.2)
    g.add(b)
    return {
      group: g,
      slide,
      anchors: { left: V(0.01, 0.05, 0.06), right: V(0, -0.035, 0.18) },
      bell: V(0.02, 0.09, 0.48),
    }
  }

  function saxophone() {
    const g = new THREE.Group()
    const neck = new THREE.CatmullRomCurve3([
      V(0, 0, -0.03),
      V(0, -0.02, 0.06),
      V(0, -0.09, 0.1),
    ])
    g.add(mesh(new THREE.TubeGeometry(neck, 10, 0.016, 8), brass))
    const body = new THREE.CatmullRomCurve3([
      V(0, -0.09, 0.1),
      V(0, -0.25, 0.085),
      V(0, -0.45, 0.075),
      V(0, -0.57, 0.12),
      V(0, -0.52, 0.2),
      V(0, -0.38, 0.235),
    ])
    g.add(mesh(new THREE.TubeGeometry(body, 28, 0.04, 10), brass))
    const b = bell(0.12, 0.04, 0.1, brassInside, 2.2)
    b.rotation.x = -Math.PI / 2 + 0.35
    b.position.set(0, -0.39, 0.235)
    g.add(b)
    for (let k = 0; k < 5; k++) {
      const key = mesh(new THREE.SphereGeometry(0.018, 8, 6), silver)
      key.scale.z = 0.5
      key.position.set(0, -0.17 - k * 0.07, 0.125 - k * 0.002)
      g.add(key)
    }
    return {
      group: g,
      anchors: { left: V(0, -0.2, 0.12), right: V(0, -0.42, 0.11) },
      bell: V(0, -0.3, 0.27),
    }
  }

  function upright() {
    const g = new THREE.Group()
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.3, 0, 0.36, 0.2, 0.3, 0.34)
    s.bezierCurveTo(0.24, 0.42, 0.18, 0.43, 0.2, 0.5)
    s.bezierCurveTo(0.27, 0.6, 0.24, 0.78, 0, 0.8)
    s.bezierCurveTo(-0.24, 0.78, -0.27, 0.6, -0.2, 0.5)
    s.bezierCurveTo(-0.18, 0.43, -0.24, 0.42, -0.3, 0.34)
    s.bezierCurveTo(-0.36, 0.2, -0.3, 0, 0, 0)
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.03,
      bevelThickness: 0.03,
      bevelSegments: 3,
      curveSegments: 16,
    })
    geo.translate(0, 0.1, -0.06)
    const wood = clay("#a4592c", { roughness: 0.45 })
    g.add(mesh(geo, wood))
    const neck = mesh(new RoundedBoxGeometry(0.06, 0.52, 0.05, 2, 0.02), black)
    neck.position.set(0, 1.12, 0.06)
    g.add(neck)
    const scroll = mesh(new THREE.TorusGeometry(0.035, 0.018, 6, 12), black)
    scroll.position.set(0, 1.4, 0.06)
    scroll.rotation.y = Math.PI / 2
    g.add(scroll)
    for (let k = 0; k < 4; k++) {
      const x = (k - 1.5) * 0.014
      g.add(tube(V(x, 0.2, 0.1), V(x, 1.36, 0.095), 0.0035, clay("#f4ead2"), 4))
    }
    const bridge = mesh(new THREE.BoxGeometry(0.11, 0.06, 0.02), yellow)
    bridge.position.set(0, 0.42, 0.105)
    g.add(bridge)
    g.add(tube(V(0, 0, 0), V(0, 0.1, 0), 0.01, silver))
    return {
      group: g,
      anchors: { neck: V(0.02, 1.08, 0.1), pluck: V(0.02, 0.58, 0.14) },
    }
  }

  function stool(height = 0.38) {
    const g = new THREE.Group()
    const seat = mesh(
      new THREE.CylinderGeometry(0.18, 0.17, 0.06, 18),
      black,
      true,
      true,
    )
    seat.position.y = height - 0.03
    g.add(seat)
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2
      g.add(
        tube(
          V(Math.cos(a) * 0.1, height - 0.05, Math.sin(a) * 0.1),
          V(Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15),
          0.014,
          brass,
          6,
        ),
      )
    }
    return g
  }

  function drumKit(headTexture) {
    const g = new THREE.Group()
    const shell = clay("#1a1714", { roughness: 0.4 }),
      head = clay("#f4ead2", { roughness: 0.7 })
    const kick = new THREE.Group()
    const kickShell = mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.26, 24, 1, true),
      shell,
    )
    kickShell.rotation.x = Math.PI / 2
    const face = mesh(
      new THREE.CircleGeometry(0.3, 28),
      new THREE.MeshStandardMaterial({ map: headTexture, roughness: 0.7 }),
    )
    face.position.z = 0.13
    const backFace = mesh(new THREE.CircleGeometry(0.3, 28), head)
    backFace.position.z = -0.13
    backFace.rotation.y = Math.PI
    const hoop = mesh(new THREE.TorusGeometry(0.3, 0.018, 6, 28), yellow)
    hoop.position.z = 0.13
    kick.add(kickShell, face, backFace, hoop)
    kick.position.set(0, 0.3, 0.12)
    g.add(kick)
    const drum = (r, h, color = shell) => {
      const d = new THREE.Group()
      d.add(mesh(new THREE.CylinderGeometry(r, r, h, 22), color))
      const top = mesh(
        new THREE.CylinderGeometry(r * 0.98, r * 0.98, 0.006, 22),
        head,
      )
      top.position.y = h / 2
      const ring = mesh(new THREE.TorusGeometry(r, 0.01, 5, 22), silver)
      ring.rotation.x = Math.PI / 2
      ring.position.y = h / 2
      d.add(top, ring)
      return d
    }
    const snare = drum(0.15, 0.08, clay("#e9e2cf", { roughness: 0.4 }))
    snare.position.set(-0.36, 0.55, 0.0)
    snare.rotation.x = 0.15
    g.add(snare, tube(V(-0.36, 0, 0), V(-0.36, 0.5, 0), 0.01, silver))
    const tom = drum(0.11, 0.1)
    tom.position.set(-0.1, 0.7, 0.08)
    tom.rotation.set(0.35, 0, 0.1)
    g.add(tom)
    const floorTom = drum(0.17, 0.24)
    floorTom.position.set(0.42, 0.34, -0.04)
    g.add(floorTom)
    const cymbal = (r) => {
      const c = mesh(new THREE.ConeGeometry(r, 0.035, 24, 1, true), brassInside)
      return c
    }
    const ride = new THREE.Group()
    ride.add(cymbal(0.25))
    ride.position.set(0.5, 0.92, 0.18)
    ride.rotation.set(0.25, 0, -0.18)
    g.add(ride, tube(V(0.55, 0, 0.18), V(0.5, 0.9, 0.18), 0.009, silver))
    const hat = new THREE.Group()
    const hatTop = cymbal(0.15)
    hatTop.position.y = 0.035
    hat.add(cymbal(0.15), hatTop)
    hat.position.set(-0.62, 0.78, -0.02)
    g.add(hat, tube(V(-0.62, 0, -0.02), V(-0.62, 0.78, -0.02), 0.009, silver))
    const throne = stool(0.4)
    throne.position.z = -0.48
    g.add(throne)
    return {
      group: g,
      kick,
      ride,
      hatTop,
      snare,
      anchors: {
        snare: V(-0.33, 0.66, 0.02),
        ride: V(0.42, 0.99, 0.18),
        rest: V(0, 0.75, 0.0),
      },
    }
  }

  function piano() {
    const g = new THREE.Group()
    const s = new THREE.Shape()
    s.moveTo(0.6, 0)
    s.lineTo(0.6, 1.55)
    s.quadraticCurveTo(0.6, 1.72, 0.38, 1.7)
    s.bezierCurveTo(0.1, 1.66, 0.02, 1.25, -0.2, 0.9)
    s.bezierCurveTo(-0.45, 0.55, -0.6, 0.5, -0.6, 0.3)
    s.lineTo(-0.6, 0)
    s.lineTo(0.6, 0)
    const lacquer = clay("#121110", { roughness: 0.25, metalness: 0.1 })
    const caseGeo = new THREE.ExtrudeGeometry(s, {
      depth: 0.26,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 3,
      curveSegments: 20,
    })
    caseGeo.rotateX(Math.PI / 2)
    caseGeo.translate(0, 0.86, 0)
    g.add(mesh(caseGeo, lacquer, true, true))
    const lidGeo = new THREE.ExtrudeGeometry(s, {
      depth: 0.025,
      bevelEnabled: false,
      curveSegments: 20,
    })
    lidGeo.rotateX(Math.PI / 2)
    lidGeo.translate(-0.6, 0, 0)
    const lid = new THREE.Group()
    lid.add(mesh(lidGeo, lacquer))
    lid.position.set(0.6, 0.9, 0)
    lid.rotation.z = -0.62
    g.add(lid)
    const prop = tube(V(-0.3, 0.88, 0.9), V(-0.12, 1.42, 0.9), 0.012, black)
    g.add(prop)
    ;[V(0.5, 0, 0.1), V(-0.5, 0, 0.1), V(0.45, 0, 1.45)].forEach((p) =>
      g.add(tube(p, V(p.x, 0.62, p.z), 0.05, lacquer, 10)),
    )
    const keys = mesh(
      new RoundedBoxGeometry(1.14, 0.05, 0.2, 2, 0.015),
      clay("#f7f1e3", { roughness: 0.5 }),
    )
    keys.position.set(0, 0.68, -0.08)
    g.add(keys)
    const blackKey = new THREE.BoxGeometry(0.022, 0.03, 0.11)
    const pattern = [1, 1, 0, 1, 1, 1, 0]
    for (let k = 0; k < 21; k++) {
      if (!pattern[k % 7]) continue
      const bk = mesh(blackKey, black, false)
      bk.position.set(-0.53 + k * 0.052 + 0.026, 0.715, -0.04)
      g.add(bk)
    }
    const block = mesh(
      new RoundedBoxGeometry(1.24, 0.1, 0.12, 2, 0.02),
      lacquer,
    )
    block.position.set(0, 0.66, -0.03)
    g.add(block)
    const desk = mesh(new RoundedBoxGeometry(0.7, 0.24, 0.02, 2, 0.01), lacquer)
    desk.position.set(0, 1.0, 0.12)
    desk.rotation.x = -0.25
    g.add(desk)
    const sheet = mesh(
      new THREE.PlaneGeometry(0.5, 0.2),
      clay("#f4ead2"),
      false,
    )
    sheet.position.set(0, 1.01, 0.105)
    sheet.rotation.set(-0.25, Math.PI, 0)
    g.add(sheet)
    const bench = mesh(
      new RoundedBoxGeometry(0.62, 0.08, 0.3, 2, 0.03),
      lacquer,
    )
    bench.position.set(0, 0.4, -0.62)
    g.add(bench)
    for (const x of [-0.26, 0.26])
      for (const z of [-0.5, -0.74])
        g.add(tube(V(x, 0, z), V(x, 0.37, z), 0.02, lacquer, 6))
    return {
      group: g,
      anchors: { left: V(-0.25, 0.73, -0.12), right: V(0.25, 0.73, -0.12) },
      seat: V(0, 0.44, -0.62),
    }
  }

  // A swing-era band front: black, yellow trim, and one letter of the name.
  function bandFront(trimTexture) {
    const g = new THREE.Group()
    const s = new THREE.Shape()
    s.moveTo(-0.42, 0)
    s.lineTo(0.42, 0)
    s.lineTo(0.42, 0.62)
    s.quadraticCurveTo(0, 0.82, -0.42, 0.62)
    s.lineTo(-0.42, 0)
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      bevelSegments: 2,
      curveSegments: 12,
    })
    geo.translate(0, 0, -0.04)
    g.add(mesh(geo, black, true, true))
    const faceGeo = new THREE.ShapeGeometry(s, 12)
    const uv = faceGeo.attributes.uv
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, (uv.getX(i) + 0.42) / 0.84, uv.getY(i) / 0.82)
    const face = mesh(
      faceGeo,
      new THREE.MeshStandardMaterial({
        map: trimTexture,
        transparent: true,
        roughness: 0.6,
      }),
      false,
    )
    face.position.z = 0.063
    g.add(face)
    const ledge = mesh(new RoundedBoxGeometry(0.8, 0.03, 0.12, 2, 0.01), black)
    ledge.position.set(0, 0.64, -0.08)
    ledge.rotation.x = -0.4
    g.add(ledge)
    const sheet = mesh(
      new THREE.PlaneGeometry(0.42, 0.24),
      clay("#f4ead2"),
      false,
    )
    sheet.position.set(0, 0.76, -0.12)
    sheet.rotation.x = -0.3
    g.add(sheet)
    return g
  }

  return {
    clay,
    brass,
    silver,
    black,
    yellow,
    mesh,
    lumpy,
    tube,
    makeGuy,
    reach,
    trumpet,
    trombone,
    saxophone,
    upright,
    drumKit,
    piano,
    stool,
    bandFront,
    rounded: (w, h, d, r = 0.05, mat = black) =>
      mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat, true, true),
  }
}

// Canvas textures drawn with the site's own display face.
export function letterTexture(
  char,
  { width, height, fontSize, family, padding },
) {
  const k = 256 / (height * padding)
  const c = document.createElement("canvas")
  c.width = Math.ceil(width * padding * k)
  c.height = 256
  const ctx = c.getContext("2d")
  ctx.font = `800 ${fontSize * k}px ${family}`
  ctx.textAlign = "center"
  ctx.textBaseline = "alphabetic"
  const m = ctx.measureText(char)
  const ascent = m.fontBoundingBoxAscent ?? fontSize * k * 0.9,
    descent = m.fontBoundingBoxDescent ?? fontSize * k * 0.25
  const baseline = c.height / 2 - (ascent + descent) / 2 + ascent
  ctx.fillStyle = Y
  ctx.fillText(char, c.width / 2, baseline)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export function frontTrimTexture() {
  const c = document.createElement("canvas")
  c.width = 256
  c.height = 256
  const ctx = c.getContext("2d")
  const w = c.width,
    h = c.height
  // The texture spans the arched panel; draw a deco border inset from its edge.
  const panel = (inset) => {
    const sx = w / 0.84,
      sy = h / 0.82
    ctx.beginPath()
    ctx.moveTo((-0.42 + inset + 0.42) * sx, h - inset * sy)
    ctx.lineTo((0.42 - inset + 0.42) * sx, h - inset * sy)
    ctx.lineTo((0.42 - inset + 0.42) * sx, h - (0.62 - inset * 0.3) * sy)
    ctx.quadraticCurveTo(
      0.42 * sx,
      h - (0.82 - inset * 1.2) * sy,
      (-0.42 + inset + 0.42) * sx,
      h - (0.62 - inset * 0.3) * sy,
    )
    ctx.closePath()
  }
  ctx.strokeStyle = Y
  ctx.lineWidth = 5
  panel(0.04)
  ctx.stroke()
  ctx.lineWidth = 2
  panel(0.075)
  ctx.stroke()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function kickHeadTexture(family) {
  const c = document.createElement("canvas")
  c.width = c.height = 256
  const ctx = c.getContext("2d")
  ctx.fillStyle = Y
  ctx.fillRect(0, 0, 256, 256)
  ctx.strokeStyle = K
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(128, 128, 104, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = K
  ctx.font = `800 120px ${family}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("bc", 128, 136)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function sunburstTexture() {
  const c = document.createElement("canvas")
  c.width = 1024
  c.height = 512
  const ctx = c.getContext("2d")
  ctx.fillStyle = "#14110b"
  ctx.fillRect(0, 0, 1024, 512)
  const rays = 28
  for (let i = 0; i < rays; i++) {
    const a0 = Math.PI + (i / rays) * Math.PI,
      a1 = Math.PI + ((i + 0.5) / rays) * Math.PI
    ctx.fillStyle = "#1f1a10"
    ctx.beginPath()
    ctx.moveTo(512, 560)
    ctx.arc(512, 560, 1200, a0, a1)
    ctx.closePath()
    ctx.fill()
  }
  const glow = ctx.createRadialGradient(512, 560, 0, 512, 560, 620)
  glow.addColorStop(0, "rgba(255,221,0,0.22)")
  glow.addColorStop(0.5, "rgba(255,190,0,0.06)")
  glow.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1024, 512)
  ctx.strokeStyle = "rgba(255,221,0,0.35)"
  ctx.lineWidth = 4
  for (const r of [180, 260]) {
    ctx.beginPath()
    ctx.arc(512, 560, r, Math.PI, Math.PI * 2)
    ctx.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function planksTexture() {
  const c = document.createElement("canvas")
  c.width = 512
  c.height = 512
  const ctx = c.getContext("2d")
  for (let i = 0; i < 8; i++) {
    const l = 20 + ((i * 37) % 9)
    ctx.fillStyle = `hsl(24, 38%, ${l}%)`
    ctx.fillRect(i * 64, 0, 64, 512)
    ctx.fillStyle = "rgba(0,0,0,0.35)"
    ctx.fillRect(i * 64, 0, 3, 512)
    ctx.fillRect(i * 64, ((i * 173) % 512) | 0, 64, 3)
    for (let k = 0; k < 6; k++) {
      ctx.fillStyle = "rgba(255,220,180,0.035)"
      ctx.fillRect(i * 64 + 8 + k * 9, 0, 2, 512)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 2)
  t.rotation = Math.PI / 2
  t.anisotropy = 8
  return t
}

export function glyphTexture(text, family) {
  const c = document.createElement("canvas")
  c.width = c.height = 128
  const ctx = c.getContext("2d")
  ctx.fillStyle = Y
  ctx.font = `700 96px ${family}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, 64, 70)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function glowTexture() {
  const c = document.createElement("canvas")
  c.width = c.height = 64
  const ctx = c.getContext("2d")
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.2, "rgba(255,240,170,0.8)")
  g.addColorStop(0.5, "rgba(255,200,60,0.22)")
  g.addColorStop(1, "rgba(255,180,0,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
