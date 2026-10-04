const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict"),
  path = require("node:path")
const dir = path.join(__dirname, "../lib/band")
async function scenario(reduced = false) {
  let fetchCount = 0,
    failFetch = false,
    waitForFetch = null
  const audioContexts = []
  let ms = 0,
    rafId = 0,
    timerId = 0
  const frames = new Map(),
    timers = new Map(),
    intervals = new Map(),
    nodes = []
  class E {
    constructor() {
      this.hidden = false
      this.disabled = false
      this.dataset = {}
      this.attributes = {}
      this.handlers = {}
      this.style = { setProperty() {} }
      this.classList = { add() {}, remove() {}, toggle() {} }
      this.clientWidth = 680
      this.clientHeight = 365
    }
    addEventListener(k, f, options = {}) {
      ;(this.handlers[k] ??= []).push(f)
      options.signal?.addEventListener(
        "abort",
        () => {
          this.handlers[k] = this.handlers[k].filter((handler) => handler !== f)
        },
        { once: true },
      )
    }
    async fire(k, e = {}) {
      for (const f of this.handlers[k] || []) await f(e)
    }
    setAttribute(k, v) {
      this.attributes[k] = v
    }
    removeAttribute(k) {
      delete this.attributes[k]
    }
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 680, height: 1000 }
    }
    setPointerCapture() {}
    hasPointerCapture() {
      return true
    }
    releasePointerCapture() {}
    closest() {
      return null
    }
    scrollIntoView() {}
    contains() {
      return true
    }
  }
  const root = new E(),
    variant = new E(),
    canvas = new E(),
    elements = {}
  const context = new Proxy(
    { measureText: () => ({ width: 50 }) },
    {
      get: (o, k) => (k in o ? o[k] : () => {}),
      set: (o, k, v) => ((o[k] = v), true),
    },
  )
  canvas.getContext = () => context
  for (const name of [
    "stage",
    "start",
    "music",
    "reset",
    "hint",
    "sound",
    "slide-cursor",
    "pitch",
    "stage-control",
    "announcement",
    "name",
    "home",
    "tour",
    "bottom",
  ])
    elements[".bc-" + name] = new E()
  elements[".bc-cursor-instrument"] = canvas
  elements[".bc-stage"].querySelector = () => canvas
  elements[".bc-sound"].querySelector = () => new E()
  root.querySelector = (s) => elements[s] ?? (elements[s] = new E())
  root.querySelectorAll = () => []
  root.closest = () => variant
  class Param {
    constructor(value = 1) {
      this.value = value
      this.events = []
    }
    setValueAtTime(v, t) {
      this.value = v
      this.events.push(["set", v, t])
    }
    setTargetAtTime(v, t) {
      this.value = v
      this.events.push(["target", v, t])
    }
    linearRampToValueAtTime(v, t) {
      this.events.push(["linear", v, t])
    }
    exponentialRampToValueAtTime(v, t) {
      this.events.push(["exponential", v, t])
    }
    cancelAndHoldAtTime(t) {
      this.events.push(["hold", t])
    }
    cancelScheduledValues(t) {
      this.events.push(["cancel", t])
    }
  }
  class Node {
    constructor(kind) {
      this.kind = kind
      for (const k of [
        "gain",
        "frequency",
        "playbackRate",
        "pan",
        "threshold",
        "knee",
        "ratio",
        "attack",
        "release",
      ])
        this[k] = new Param()
      nodes.push(this)
    }
    connect() {}
    disconnect() {}
    start(...a) {
      this.startArgs = a
    }
    stop(time = ms / 1000) {
      this.stopAt = time
    }
  }
  const fakeBuffer = {
    length: 48000 * 2.2,
    sampleRate: 48000,
    getChannelData: () => new Float32Array(48000 * 2.2),
  }
  class Audio {
    constructor() {
      audioContexts.push(this)
      this.sampleRate = 48000
      this.state = "running"
      this.destination = new Node("destination")
    }
    get currentTime() {
      return ms / 1000
    }
    async resume() {
      this.state = "running"
    }
    createGain() {
      return new Node("gain")
    }
    createDynamicsCompressor() {
      return new Node("compressor")
    }
    createStereoPanner() {
      return new Node("pan")
    }
    createBiquadFilter() {
      return new Node("filter")
    }
    createBufferSource() {
      return new Node("sample")
    }
    createOscillator() {
      return new Node("oscillator")
    }
    createBuffer() {
      return fakeBuffer
    }
    async decodeAudioData() {
      return fakeBuffer
    }
    async close() {
      this.state = "closed"
    }
    async suspend() {
      this.state = "suspended"
    }
  }
  const doc = Object.assign(new E(), {
    hidden: false,
    fonts: { load: async () => {} },
  })
  const win = Object.assign(new E(), { AudioContext: Audio })
  const box = {
    console,
    document: doc,
    window: win,
    root,
    AbortController,
    getComputedStyle: () => ({ getPropertyValue: () => '"Fraunces"' }),
    performance: { now: () => ms },
    devicePixelRatio: 1,
    matchMedia: (q) =>
      Object.assign(new E(), {
        matches: q.includes("reduced") ? reduced : true,
      }),
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
    MutationObserver: class {
      observe() {}
    },
    requestAnimationFrame: (f) => {
      frames.set(++rafId, f)
      return rafId
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: (f, d) => {
      timers.set(++timerId, { f, at: ms + d })
      return timerId
    },
    clearTimeout: (id) => timers.delete(id),
    setInterval: (f, d) => {
      intervals.set(++timerId, { f, at: ms + d, d })
      return timerId
    },
    clearInterval: (id) => intervals.delete(id),
    fetch: async () => {
      fetchCount++
      if (waitForFetch) await waitForFetch
      if (failFetch) throw new Error("Offline")
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(1) }
    },
    Uint8Array,
    Float32Array,
    Math,
    Set,
    Array,
    Promise,
  }
  const source = ["score.js", "samples.js", "create-band.js"]
    .map((file) =>
      fs
        .readFileSync(path.join(dir, file), "utf8")
        .replace(/^import .*;?$/gm, "")
        .replace(/export (const|function)/g, "$1"),
    )
    .join("\n")
  vm.createContext(box)
  vm.runInContext(source + "\nvar controller=createBand(root);", box)
  async function flush() {
    for (let n = 0; n < 20; n++) await Promise.resolve()
  }
  async function advance(amount) {
    for (let n = 0; n < amount; n += 20) {
      ms += 20
      for (const [id, t] of [...timers])
        if (t.at <= ms) {
          timers.delete(id)
          t.f()
        }
      for (const t of intervals.values())
        if (t.at <= ms) {
          t.at = ms + t.d
          t.f()
        }
      const batch = [...frames.values()]
      frames.clear()
      batch.forEach((f) => f(ms))
      await flush()
    }
  }
  const click = (selector) => elements[selector].fire("click")
  await flush()
  await advance(20)
  assert.equal(root.dataset.bandState, "idle")
  assert.equal(fetchCount, 0, "No samples fetched before interaction")
  assert.equal(audioContexts.length, 0, "No autoplay context")
  await click(".bc-start")
  await flush()
  await advance(3400)
  assert.equal(root.dataset.bandState, "ready")
  assert.equal(elements[".bc-music"].textContent, "Start the music")
  if (!reduced)
    assert(
      nodes.some((n) => n.kind === "oscillator" && n.startArgs),
      "Foot taps must play during entrance",
    )
  assert(
    !nodes.some((n) => n.kind === "sample" && n.startArgs),
    "Walking must not start the jazz score",
  )
  await click(".bc-music")
  await advance(4500)
  assert.equal(root.dataset.bandState, "playing")
  await click(".bc-music")
  assert.equal(root.dataset.bandState, "stopping")
  assert(
    nodes.some(
      (n) =>
        n.kind === "sample" &&
        n.playbackRate.events.some((e) => e[0] === "exponential"),
    ),
    "Cutoff must include falling pitches",
  )
  await advance(2200)
  assert.equal(root.dataset.bandState, "ready")
  await click(".bc-reset")
  await advance(5400)
  assert.equal(root.dataset.bandState, "idle")
  assert.equal(elements[".bc-start"].hidden, false)
  assert.equal(elements[".bc-reset"].hidden, true)
  await click(".bc-start")
  await advance(3400)
  await click(".bc-music")
  await advance(2500)
  await click(".bc-reset")
  await advance(7400)
  assert.equal(
    root.dataset.bandState,
    "idle",
    "Reset while playing must finish its cutoff and return plain letters",
  )
  const target = new E()
  await root.fire("pointerdown", {
    button: 0,
    pointerId: 1,
    pointerType: "mouse",
    clientX: 100,
    clientY: 200,
    target,
    preventDefault() {},
  })
  await flush()
  assert.equal(elements[".bc-pitch"].textContent, "B♭3")
  assert.equal(elements[".bc-pitch"].hidden, false)
  await root.fire("pointermove", {
    pointerId: 1,
    pointerType: "mouse",
    clientX: 175.56,
    clientY: 200,
    target,
  })
  assert.equal(elements[".bc-pitch"].textContent, "A♭3")
  await root.fire("pointerup", { pointerId: 1 })
  assert.equal(elements[".bc-pitch"].hidden, true)

  // Muting is explicit and survives both new notes and restarts.
  await click(".bc-sound")
  await root.fire("pointerdown", {
    button: 0,
    pointerId: 2,
    pointerType: "mouse",
    clientX: 100,
    clientY: 200,
    target,
    preventDefault() {},
  })
  assert.equal(
    elements[".bc-pitch"].hidden,
    true,
    "A new gesture must respect explicit mute",
  )
  await root.fire("pointerup", { pointerId: 2 })
  await click(".bc-start")
  await advance(3400)
  await click(".bc-music")
  await advance(600)
  assert.equal(elements[".bc-sound"].attributes["aria-pressed"], "false")
  doc.hidden = true
  await doc.fire("visibilitychange")
  await advance(200)
  assert.equal(root.dataset.bandState, "ready")
  assert.equal(intervals.size, 0)
  assert.equal(audioContexts[0].state, "suspended")
  doc.hidden = false
  await doc.fire("visibilitychange")
  await advance(20)
  await click(".bc-sound")
  await click(".bc-music")
  await advance(700)
  box.controller.destroy()
  await advance(3000)
  assert.equal(intervals.size, 0)
  assert.equal(frames.size, 0)
  assert.equal(timers.size, 0)
  assert.equal(audioContexts[0].state, "closed")
  assert(
    Object.values(root.handlers).every((list) => list.length === 0),
    "Input handlers removed",
  )
  assert(
    Object.values(doc.handlers).every((list) => list.length === 0),
    "Visibility listener removed",
  )
  assert(
    Object.values(win.handlers).every((list) => list.length === 0),
    "Window handlers removed",
  )

  // An unmount during a slow request must never resurrect sound or timers.
  let resolveFetch
  waitForFetch = new Promise((resolve) => {
    resolveFetch = resolve
  })
  vm.runInContext("controller=createBand(root);", box)
  await click(".bc-start")
  box.controller.destroy()
  resolveFetch()
  await flush()
  await advance(5400)
  assert.equal(intervals.size, 0)
  assert.equal(frames.size, 0)
  assert.equal(timers.size, 0)
  assert.equal(audioContexts[1].state, "closed")
  waitForFetch = null

  // Retry after a network failure, and cancel a note released while loading.
  vm.runInContext("controller=createBand(root);", box)
  failFetch = true
  await click(".bc-start")
  await flush()
  await advance(3400)
  await click(".bc-music")
  assert.equal(root.dataset.bandState, "ready")
  failFetch = false
  await click(".bc-music")
  await advance(1200)
  assert.equal(root.dataset.bandState, "playing")
  box.controller.destroy()
  waitForFetch = new Promise((resolve) => {
    resolveFetch = resolve
  })
  vm.runInContext("controller=createBand(root);", box)
  const pending = root.fire("pointerdown", {
    button: 0,
    pointerId: 3,
    pointerType: "mouse",
    clientX: 100,
    clientY: 200,
    target,
    preventDefault() {},
  })
  await root.fire("pointerup", { pointerId: 3 })
  resolveFetch()
  await pending
  assert.equal(
    elements[".bc-pitch"].hidden,
    true,
    "Release before decode must cancel pending note",
  )
  box.controller.destroy()
  console.log(
    `${
      reduced ? "Reduced motion" : "Animated"
    }: entrance, jazz, staggered cutoff, reset, pitch, mute, route cleanup, retry, and canceled gestures passed.`,
  )
}

function scoreCheck() {
  const box = {}
  vm.createContext(box)
  vm.runInContext(
    fs
      .readFileSync(path.join(dir, "score.js"), "utf8")
      .replace("export const", "var"),
    box,
  )
  const score = box.BAND_SCORE
  const expected =
    "Bb D F E | Eb Eb E E | F Eb D C | Bb C Db D | Eb G Bb Eb | E G Bb E | F F Eb Eb | D Ab G B | C D Eb E | F A C A | Bb Ab G B | C F# F A"
      .replaceAll("|", "")
      .trim()
      .split(/\s+/)
  const pitches = {
    C: 0,
    Db: 1,
    D: 2,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    G: 7,
    Ab: 8,
    A: 9,
    Bb: 10,
    B: 11,
  }
  const bass = score.events.filter((e) => e.role === "contrabass")
  assert.equal(bass.length, 48)
  assert.equal(score.duration, 24)
  bass.forEach((e, i) => {
    assert.equal(e.midi % 12, pitches[expected[i]], `Bass note ${i + 1}`)
    assert.equal(e.time, i * 0.5)
  })
  assert.equal(
    score.changes.map((bar) => bar.join(" ")).join(" | "),
    "Bb7 | Eb7 | Bb7 | Fm7 Bb7 | Eb7 | Edim7 | Bb7 | Dm7 G7 | Cm7 | F7 | Bb7 G7 | Cm7 F7",
  )
  console.log(
    "Score: all 48 quarter notes match Benny’s bassline; jazz blues changes and 24-second form passed.",
  )
}
;(async () => {
  scoreCheck()
  await scenario()
  await scenario(true)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
