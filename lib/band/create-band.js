import { BAND_SCORE } from "./score.js"
import { SAMPLES } from "./samples.js"

// Owns one mounted homepage's canvas, input listeners, and Web Audio graph.
// React calls the returned disposer on navigation and during Strict Mode remounts.
export function createBand(root, { onAudioStart = () => {} } = {}) {
  const type = {
    family: getComputedStyle(root).getPropertyValue("--font-display").trim(),
    fallback: "Georgia,serif",
    weight: 800,
    size: 92,
  }
  let disposed = false,
    soloOperation = 0
  const listeners = new AbortController(),
    requests = new AbortController()
  const listen = (target, event, handler) =>
    target.addEventListener(event, handler, { signal: listeners.signal })
  const stage = root.querySelector(".bc-stage"),
    canvas = stage.querySelector("canvas"),
    ctx = canvas.getContext("2d")
  const heroFont =
    type.weight + " " + type.size + "px " + type.family + "," + type.fallback
  let letterLayouts = []
  const startButton = root.querySelector(".bc-start"),
    musicButton = root.querySelector(".bc-music"),
    resetButton = root.querySelector(".bc-reset"),
    hint = root.querySelector(".bc-hint"),
    soundButton = root.querySelector(".bc-sound"),
    cursor = root.querySelector(".bc-slide-cursor"),
    pitchLabel = root.querySelector(".bc-pitch"),
    pad = root.querySelector(".bc-stage-control")
  const cursorCanvas = root.querySelector(".bc-cursor-instrument"),
    cursorCtx = cursorCanvas.getContext("2d")
  let cursorEnd = 94,
    lastCursorPoint = null
  const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
    fine = matchMedia("(pointer:fine)"),
    clamp = (x, a, b) => Math.max(a, Math.min(b, x))
  const players = [
    ["b", "trumpet"],
    ["e", "saxophone"],
    ["n", "trumpet"],
    ["n", "saxophone"],
    ["y", "trumpet"],
    ["c", "trombone"],
    ["o", "trombone"],
    ["n", "saxophone"],
    ["n", "trombone"],
  ]
  const Y = "#ffdd00",
    H = "#fff0a0",
    K = "#0a0a0a",
    D = "#9d8700",
    W = "#fafafa"
  let width = 0,
    height = 0,
    dpr = 1,
    running = false,
    band = false,
    entrance = null,
    frame = 0,
    muted = true,
    pointer = null,
    solo = null,
    soloTimer,
    keyboard = false,
    midi = 58,
    operation = 0
  let stopping = false,
    stopTimer,
    pendingReset = false,
    resetting = false,
    loadingMusic = false,
    soundChosen = false,
    walkSteps = [],
    stepIndex = 0
  const voices = new Set(),
    recentNotes = Array(12).fill(null)
  let audio,
    master,
    compressor,
    bandBus,
    soloBus,
    noise,
    decoded,
    decodePromise,
    ticker,
    eventIndex = 0,
    cycle = 0,
    startTime = 0
  const sources = new Set(),
    visualQueue = [],
    activeUntil = Array(12).fill(0),
    startedAt = Array(12).fill(0)
  const announce = (s) => {
    if (!disposed) root.querySelector(".bc-announcement").textContent = s
  }
  function stroke(path, color = Y, lineWidth = 2) {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.beginPath()
    path()
    ctx.stroke()
  }
  function ellipse(x, y, rx, ry, fill, outline = Y, lw = 2) {
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
    if (outline) {
      ctx.strokeStyle = outline
      ctx.lineWidth = lw
      ctx.stroke()
    }
  }
  function hornBell(x, y, size) {
    ctx.beginPath()
    ctx.moveTo(x - 25, y - 3)
    ctx.bezierCurveTo(x - 11, y - 3, x - 6, y - size * 0.7, x, y - size)
    ctx.lineTo(x, y + size)
    ctx.bezierCurveTo(x - 6, y + size * 0.7, x - 11, y + 3, x - 25, y + 3)
    ctx.closePath()
    ctx.fillStyle = Y
    ctx.fill()
    ellipse(x, y, size * 0.28, size, K, H, 1.5)
    stroke(
      () => {
        ctx.moveTo(x - 22, y - 2)
        ctx.quadraticCurveTo(x - 10, y - 2, x - 4, y - size * 0.7)
      },
      H,
      1,
    )
  }
  function trumpet(hot) {
    ctx.save()
    ctx.rotate(-0.08 - hot * 0.07)
    stroke(
      () => {
        ctx.moveTo(-7, 0)
        ctx.lineTo(30, 0)
        ctx.bezierCurveTo(39, 0, 40, 17, 31, 17)
        ctx.lineTo(7, 17)
        ctx.bezierCurveTo(-1, 17, -1, 7, 7, 7)
        ctx.lineTo(41, 7)
      },
      K,
      7,
    )
    stroke(
      () => {
        ctx.moveTo(-7, 0)
        ctx.lineTo(30, 0)
        ctx.bezierCurveTo(39, 0, 40, 17, 31, 17)
        ctx.lineTo(7, 17)
        ctx.bezierCurveTo(-1, 17, -1, 7, 7, 7)
        ctx.lineTo(41, 7)
      },
      Y,
      4,
    )
    hornBell(59, 7, 12)
    ;[12, 20, 28].forEach((x, i) => {
      stroke(
        () => {
          ctx.moveTo(x, 2)
          ctx.lineTo(x, 13)
        },
        H,
        4,
      )
      stroke(
        () => {
          ctx.moveTo(x, -5 + (hot > 0.3 ? (i % 2) * 2 : 0))
          ctx.lineTo(x, 1)
          ctx.moveTo(x - 3, -5)
          ctx.lineTo(x + 3, -5)
        },
        Y,
        1.8,
      )
    })
    stroke(
      () => {
        ctx.moveTo(-12, -3)
        ctx.lineTo(-12, 3)
        ctx.moveTo(-12, 0)
        ctx.lineTo(-6, 0)
      },
      H,
      2,
    )
    ctx.restore()
  }
  function trombone(hot) {
    ctx.save()
    ctx.rotate(-0.06 - hot * 0.045)
    const extension = hot * 7
    stroke(
      () => {
        ctx.moveTo(-8, -2)
        ctx.lineTo(45 + extension, -2)
        ctx.bezierCurveTo(
          59 + extension,
          -2,
          59 + extension,
          13,
          45 + extension,
          13,
        )
        ctx.lineTo(-4, 13)
      },
      K,
      7,
    )
    stroke(
      () => {
        ctx.moveTo(-8, -2)
        ctx.lineTo(45 + extension, -2)
        ctx.bezierCurveTo(
          59 + extension,
          -2,
          59 + extension,
          13,
          45 + extension,
          13,
        )
        ctx.lineTo(-4, 13)
      },
      Y,
      3.5,
    )
    stroke(
      () => {
        ctx.moveTo(4, -2)
        ctx.lineTo(4, 13)
        ctx.moveTo(21 + extension, -2)
        ctx.lineTo(21 + extension, 13)
      },
      H,
      2,
    )
    hornBell(35, -10, 10)
    stroke(
      () => {
        ctx.moveTo(-8, -10)
        ctx.lineTo(10, -10)
        ctx.moveTo(-11, -5)
        ctx.lineTo(-11, 1)
      },
      H,
      2,
    )
    ctx.restore()
  }
  function saxophone(hot) {
    ctx.save()
    ctx.rotate(0.1 - hot * 0.05)
    stroke(
      () => {
        ctx.moveTo(-4, -16)
        ctx.bezierCurveTo(13, -21, 11, -8, 13, 5)
        ctx.lineTo(20, 34)
        ctx.bezierCurveTo(23, 48, 40, 45, 38, 30)
        ctx.lineTo(36, 19)
      },
      K,
      11,
    )
    stroke(
      () => {
        ctx.moveTo(-4, -16)
        ctx.bezierCurveTo(13, -21, 11, -8, 13, 5)
        ctx.lineTo(20, 34)
        ctx.bezierCurveTo(23, 48, 40, 45, 38, 30)
        ctx.lineTo(36, 19)
      },
      Y,
      7,
    )
    stroke(
      () => {
        ctx.moveTo(11, -5)
        ctx.lineTo(23, 36)
      },
      H,
      1.5,
    )
    ctx.beginPath()
    ctx.moveTo(31, 29)
    ctx.quadraticCurveTo(32, 16, 24, 10)
    ctx.lineTo(44, 6)
    ctx.quadraticCurveTo(39, 15, 40, 27)
    ctx.closePath()
    ctx.fillStyle = Y
    ctx.fill()
    ellipse(34, 9, 11, 3.6, K, H, 1.7)
    ;[0, 7, 14, 21].forEach((y, i) => ellipse(14 + i * 1.9, y, 3.2, 2, K, H, 1))
    stroke(
      () => {
        ctx.moveTo(-8, -16)
        ctx.lineTo(-3, -16)
      },
      W,
      3,
    )
    ctx.restore()
  }
  function piano(hot) {
    ctx.save()
    ctx.translate(0, -hot * 1.3)
    ctx.rotate(-0.035)
    stroke(
      () => {
        ctx.moveTo(-33, 20)
        ctx.lineTo(-40, 45)
        ctx.moveTo(26, 20)
        ctx.lineTo(35, 45)
      },
      Y,
      3,
    )
    ctx.fillStyle = Y
    ctx.beginPath()
    ctx.moveTo(-44, -6)
    ctx.lineTo(33, -6)
    ctx.lineTo(40, 20)
    ctx.lineTo(-38, 20)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = K
    ctx.fillRect(-37, -1, 66, 8)
    for (let i = 0; i < 12; i++) {
      stroke(
        () => {
          ctx.moveTo(-33 + i * 5.5, 8)
          ctx.lineTo(-31 + i * 5.5, 17)
        },
        K,
        1,
      )
      if (![2, 6, 9].includes(i)) {
        ctx.fillStyle = K
        ctx.fillRect(-33 + i * 5.5, 5, 3, 8)
      }
    }
    stroke(
      () => {
        ctx.moveTo(-40, -8)
        ctx.lineTo(-25, -29)
        ctx.lineTo(30, -16)
        ctx.lineTo(35, -8)
      },
      Y,
      2,
    )
    if (hot) {
      ctx.fillStyle = H
      ctx.fillRect(-20, 10, 4, 6)
      ctx.fillRect(-3, 10, 4, 6)
      ctx.fillRect(13, 10, 4, 6)
    }
    ctx.restore()
  }
  function bass(hot) {
    ctx.save()
    ctx.rotate(0.1 + hot * 0.015)
    ctx.beginPath()
    ctx.moveTo(-7, -7)
    ctx.bezierCurveTo(-27, -3, -17, 11, -19, 16)
    ctx.bezierCurveTo(-37, 40, 0, 51, 17, 31)
    ctx.bezierCurveTo(24, 20, 11, 13, 12, 7)
    ctx.bezierCurveTo(17, -2, 5, -11, -7, -7)
    ctx.closePath()
    ctx.fillStyle = Y
    ctx.fill()
    ctx.strokeStyle = H
    ctx.lineWidth = 1.5
    ctx.stroke()
    stroke(
      () => {
        ctx.moveTo(-2, -40)
        ctx.lineTo(-2, 31)
      },
      K,
      5,
    )
    stroke(
      () => {
        ctx.moveTo(-4, -41)
        ctx.lineTo(-4, 28)
        ctx.moveTo(0, -41)
        ctx.lineTo(0, 28)
      },
      H,
      1,
    )
    stroke(
      () => {
        ctx.moveTo(-2, 36)
        ctx.lineTo(-2, 49)
      },
      Y,
      2,
    )
    ellipse(-2, -43, 4, 7, Y, null)
    ctx.fillStyle = K
    ctx.fillRect(-7, 23, 11, 3)
    stroke(
      () => {
        ctx.moveTo(-13, 10)
        ctx.bezierCurveTo(-8, 4, -17, 17, -10, 18)
        ctx.moveTo(9, 9)
        ctx.bezierCurveTo(4, 3, 13, 16, 6, 17)
      },
      K,
      1.5,
    )
    if (hot)
      stroke(
        () => {
          ctx.moveTo(-1, -34)
          ctx.quadraticCurveTo(2 + hot * 2, -2, -1, 27)
        },
        H,
        1,
      )
    ctx.restore()
  }
  function drums(hot) {
    ellipse(0, 13, 21, 20, K, Y, 3)
    ellipse(0, 13, 15, 14, K, D, 1)
    ctx.fillStyle = Y
    ctx.font = '600 12px "DM Sans",sans-serif'
    ctx.textAlign = "center"
    ctx.fillText("bc", 0, 16)
    ;[-33, 33].forEach((x) => {
      stroke(
        () => {
          ctx.moveTo(x, -20)
          ctx.lineTo(x, 32)
          ctx.moveTo(x - 8, 34)
          ctx.lineTo(x, 29)
          ctx.lineTo(x + 8, 34)
        },
        D,
        1.5,
      )
      ctx.save()
      ctx.translate(x, -20)
      ctx.rotate(hot * (x < 0 ? -0.055 : 0.055))
      ellipse(0, 0, 19, 3, Y, H, 1)
      ctx.restore()
    })
    ellipse(-16, -3 - hot, 11, 5, K, Y, 2)
    ellipse(16, -3 + hot, 11, 5, K, Y, 2)
  }
  function actor(
    letter,
    role,
    x,
    y,
    scale,
    hot,
    phase,
    reveal,
    tilt = 0,
    squash = 0,
    gesture = 0,
    front = false,
  ) {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(scale, scale)
    const motion = reduced.matches
      ? 0
      : running || stopping
      ? Math.sin(phase) * 0.015 - hot * 0.025
      : solo
      ? Math.sin(performance.now() / 180 + x) * 0.012
      : 0
    ctx.rotate(motion + tilt)
    ctx.scale(1 + squash * 0.1, 1 - squash * 0.09)
    ctx.fillStyle = Y
    ctx.font = heroFont
    ctx.textAlign = "center"
    ctx.textBaseline = "alphabetic"
    if (front) {
      ctx.strokeStyle = K
      ctx.lineWidth = 3
      ctx.strokeText(letter, 0, 0)
    }
    ctx.fillText(letter, 0, 0)
    if (reveal > 0) {
      ctx.globalAlpha = reveal
      ctx.save()
      ctx.translate(8, 4)
      ctx.scale(0.78, 0.78)
      if (role === "trumpet") trumpet(hot)
      else if (role === "trombone") trombone(hot)
      else saxophone(hot)
      ctx.restore()
      stroke(
        () => {
          ctx.moveTo(-3, -4)
          ctx.quadraticCurveTo(-2, 12, 18, 12)
        },
        K,
        5.5,
      )
      stroke(
        () => {
          ctx.moveTo(-3, -4)
          ctx.quadraticCurveTo(-2, 12, 18, 12)
        },
        Y,
        2.6,
      )
      ellipse(18, 12, 2.7, 2.4, H, null)
    }
    if (gesture > 0) {
      const edge = ctx.measureText(letter).width * 0.36,
        reach = 6 + gesture * 13
      const arm = () => {
        ctx.moveTo(edge, -20)
        ctx.quadraticCurveTo(edge + 6, -15, edge + reach, -19)
      }
      stroke(arm, K, 6)
      stroke(arm, Y, 2.8)
      ellipse(edge + reach, -19, 3, 4, Y, K, 1.5)
    }
    ctx.restore()
  }
  function syncControls() {
    if (disposed) return
    const walking = entrance !== null
    root.dataset.bandState = walking
      ? resetting
        ? "resetting"
        : "assembling"
      : stopping
      ? "stopping"
      : running
      ? "playing"
      : band
      ? "ready"
      : "idle"
    startButton.hidden = band || walking
    musicButton.hidden = !band || walking
    resetButton.hidden = !band || walking
    hint.hidden = !band || walking
    musicButton.disabled = stopping || loadingMusic
    resetButton.disabled = pendingReset
    musicButton.textContent = loadingMusic
      ? "Getting ready…"
      : stopping
      ? "…and stop."
      : running
      ? "Stop the band"
      : "Start the music"
    musicButton.setAttribute("aria-pressed", String(running || stopping))
    stage.setAttribute("aria-busy", String(walking))
  }
  function finishEntrance() {
    const wasReset = resetting
    entrance = null
    resetting = false
    band = !wasReset
    walkSteps = []
    stepIndex = 0
    syncControls()
    announce(
      wasReset
        ? "Everyone is back in the right place."
        : "The band is back with its instruments. Start the music when you are ready.",
    )
  }
  function cancelEntrance() {
    if (entrance !== null) {
      entrance = null
      resetting = false
      band = false
    }
    walkSteps = []
    stepIndex = 0
    syncControls()
  }
  function walkingSounds(isReset) {
    const steps = []
    players.forEach((_, i) => {
      const row = i < 5 ? 0 : 1,
        col = row ? i - 5 : i,
        count = row ? 4 : 5,
        offset = col - (count - 1) / 2
      const exitDelay = Math.min(col, count - 1 - col) * 120 + row * 80,
        returnDelay = Math.abs(offset) * 120 + row * 80
      for (let j = 1; j <= 4; j++) {
        steps.push({
          at: exitDelay + j * 195,
          player: i,
          strength: 0.68 + (i % 3) * 0.08,
        })
        steps.push({
          at: 1450 + returnDelay + j * 262.5,
          player: i,
          strength: 0.72 + (j % 2) * 0.1,
        })
      }
    })
    if (isReset)
      [0, 5].forEach((player) => {
        const delay = player === 5 ? 180 : 0
        ;[170, 820, 1060].forEach((t) =>
          steps.push({ at: 3100 + delay + t, player, strength: 0.5 }),
        )
        steps.push({
          at: 3100 + delay + 540,
          player: player + 1,
          strength: 0.58,
        })
        steps.push({
          at: 3100 + delay + 1270,
          player: player + 1,
          strength: 0.85,
        })
      })
    return steps.sort((a, b) => a.at - b.at)
  }
  function walkBand(isReset) {
    if (entrance !== null) return
    stopSolo()
    resetting = isReset
    entrance = performance.now()
    walkSteps = walkingSounds(isReset)
    stepIndex = 0
    syncControls()
    const id = ++operation
    ensureAudio()
      .then(() => {
        if (id === operation && !disposed && !document.hidden) {
          if (!soundChosen) muted = false
          soundState()
        }
      })
      .catch(() => {})
    announce(
      isReset
        ? "The band is putting its instruments away."
        : "The letters are heading offstage to get their instruments.",
    )
    if (reduced.matches) finishEntrance()
    wake()
  }
  function gatherBand() {
    if (!band && entrance === null) walkBand(false)
  }
  function resetBand() {
    if (!band || entrance !== null) return
    stopSolo()
    if (running) {
      cutOffBand(true)
      return
    }
    if (stopping) {
      pendingReset = true
      syncControls()
      return
    }
    stopBand()
    walkBand(true)
  }
  function draw(now = performance.now()) {
    frame = 0
    if (disposed || document.hidden) return
    const elapsed = entrance === null ? 0 : now - entrance
    if (
      entrance !== null &&
      (elapsed >= (resetting ? 5100 : 3250) || reduced.matches)
    )
      finishEntrance()
    if (resetting && elapsed >= 3100) {
      const t = elapsed - 3100,
        beat =
          t < 170
            ? "step-aside"
            : t < 580
            ? "pass"
            : t < 870
            ? "cross-behind"
            : t < 1090
            ? "step-forward"
            : t < 1200
            ? "wind-up"
            : t < 1370
            ? "nudge"
            : t < 1600
            ? "settle"
            : "done"
      if (root.dataset.resetBeat !== beat) root.dataset.resetBeat = beat
    } else if (root.dataset.resetBeat) delete root.dataset.resetBeat
    if (entrance !== null) {
      while (
        stepIndex < walkSteps.length &&
        walkSteps[stepIndex].at <= elapsed
      ) {
        const step = walkSteps[stepIndex++]
        if (elapsed - step.at < 90) footstep(step.player, step.strength)
      }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    const scale = Math.min(1.08, width / 580),
      centerY = height * 0.405,
      nameCenter = width / 2 + (band ? 63 : 0) * scale,
      phase = audio ? (audio.currentTime / BAND_SCORE.beat) * Math.PI * 2 : 0
    if (audio) {
      while (visualQueue.length && visualQueue[0].time <= audio.currentTime) {
        const e = visualQueue.shift()
        startedAt[e.player] = e.time
        activeUntil[e.player] = e.time + e.duration
      }
    }
    const hot = (i) =>
      !reduced.matches && (running || stopping) && audio
        ? clamp((activeUntil[i] - audio.currentTime) / 0.18, 0, 1)
        : 0
    const smooth = (t) => t * t * (3 - 2 * t),
      poses = []
    players.forEach(([letter, role], i) => {
      const row = i < 5 ? 0 : 1,
        col = i < 5 ? i : i - 5,
        count = row ? 4 : 5,
        offset = col - (count - 1) / 2
      let x = nameCenter + letterLayouts[band ? 1 : 0][i] * scale,
        y = centerY + (row ? 79 : -24) * scale,
        reveal = band ? 1 : 0,
        tilt = 0,
        squash = 0,
        depth = 1,
        layer = 0,
        gesture = 0
      if (entrance !== null) {
        const direction = offset < 0 ? -1 : 1,
          offstage = direction < 0 ? -110 * scale : width + 100 * scale
        const exitDelay = Math.min(col, count - 1 - col) * 120 + row * 80,
          returnDelay = Math.abs(offset) * 120 + row * 80
        const out = clamp((elapsed - exitDelay) / 780, 0, 1),
          back = clamp((elapsed - 1450 - returnDelay) / 1050, 0, 1)
        if (elapsed < 1450 + returnDelay) {
          x += (offstage - x) * smooth(out)
          const hop = Math.abs(Math.sin(out * Math.PI * 4))
          y -= hop * 16 * scale
          tilt = direction * 0.13 * Math.sin(out * Math.PI * 8)
          squash = -hop
        } else {
          const mixed = [1, 0, 2, 3, 4, 6, 5, 7, 8],
            slot = resetting ? mixed[i] : i
          x =
            offstage +
            (width / 2 +
              (resetting ? 0 : 63) * scale +
              letterLayouts[resetting ? 0 : 1][slot] * scale -
              offstage) *
              smooth(back)
          reveal = resetting ? 0 : 1
          const hop = Math.abs(Math.sin(back * Math.PI * 4))
          y -= hop * 19 * scale
          tilt = -direction * 0.11 * Math.sin(back * Math.PI * 8)
          squash = -hop
          if (resetting && elapsed >= 3100) {
            const t = elapsed - 3100 - row * 180,
              phase = (start, duration) =>
                smooth(clamp((t - start) / duration, 0, 1))
            const leader = i === 0 || i === 5,
              receiver = i === 1 || i === 6
            if (leader) {
              // Make room first. Cross behind only after the other letter has passed.
              const stepBack = phase(0, 170),
                cross = phase(580, 260),
                stepForward = phase(870, 210)
              x +=
                (letterLayouts[0][i] - letterLayouts[0][slot]) * scale * cross
              y += (row ? 42 : -44) * scale * stepBack * (1 - stepForward)
              depth = 1 - 0.22 * stepBack * (1 - stepForward)
              layer = t < 980 ? -1 : 2
              tilt = (row ? -0.055 : 0.055) * stepBack * (1 - stepForward)
              // A short look, a wind-up, then a quick palm tap. Return without orbiting.
              const windup = phase(1090, 110),
                tap = phase(1200, 75),
                relax = phase(1300, 250)
              x += (-3 * windup + 8 * tap) * (1 - relax) * scale
              tilt += (-0.055 * windup + 0.15 * tap) * (1 - relax)
              gesture = phase(1140, 95) * (1 - phase(1340, 150))
              squash = 0.3 * tap * (1 - relax)
            } else if (receiver) {
              // Slide straight across, but stop a little too far left and slightly askew.
              const pass = phase(205, 355),
                target = letterLayouts[0][i] - 11
              x += (target - letterLayouts[0][slot]) * scale * pass
              tilt = -0.055 * pass
              if (t >= 1270) {
                const hit = clamp((t - 1270) / 100, 0, 1),
                  settle = clamp((t - 1370) / 230, 0, 1)
                const push =
                  t < 1370
                    ? 14 * (1 - (1 - hit) ** 3)
                    : 11 +
                      3 *
                        Math.exp(-settle * 5) *
                        Math.cos(settle * Math.PI * 2.5)
                x += push * scale
                tilt =
                  t < 1370
                    ? -0.055 + 0.16 * hit
                    : 0.105 * (1 - settle) * Math.cos(settle * Math.PI * 2)
                squash = t < 1370 ? Math.sin(hit * Math.PI) * 0.7 : 0
                if (t >= 1600) {
                  x = width / 2 + letterLayouts[0][i] * scale
                  tilt = 0
                  squash = 0
                }
              }
            }
          }
        }
      }
      poses.push({
        letter,
        role,
        x,
        y,
        scale: scale * depth,
        hot: hot(i),
        phase: phase + i * 0.25,
        reveal,
        tilt,
        squash,
        gesture,
        layer,
      })
    })
    poses
      .sort((a, b) => a.layer - b.layer)
      .forEach((p) =>
        actor(
          p.letter,
          p.role,
          p.x,
          p.y,
          p.scale,
          p.hot,
          p.phase,
          p.reveal,
          p.tilt,
          p.squash,
          p.gesture,
          p.layer === 2,
        ),
      )
    const arrival = resetting
      ? 1 - clamp(elapsed / 650, 0, 1)
      : band
      ? 1
      : entrance !== null
      ? clamp((elapsed - 2750) / 500, 0, 1)
      : 0
    if (arrival > 0) {
      const pop = 1 + 2.4 * (arrival - 1) ** 3 + 1.4 * (arrival - 1) ** 2,
        sectionX = width / 2 - 222 * scale,
        sectionY = centerY + 30 * scale
      ctx.save()
      ctx.globalAlpha = arrival
      ctx.save()
      ctx.translate(
        sectionX - 29 * scale - 18 * (1 - arrival),
        sectionY - 42 * scale,
      )
      ctx.scale(scale * 0.76 * pop, scale * 0.76 * pop)
      piano(hot(9))
      ctx.restore()
      ctx.save()
      ctx.translate(
        sectionX + 37 * scale - 18 * (1 - arrival),
        sectionY - 3 * scale,
      )
      ctx.scale(scale * 0.85 * pop, scale * 0.85 * pop)
      bass(hot(10))
      ctx.restore()
      ctx.save()
      ctx.translate(
        sectionX - 4 * scale - 18 * (1 - arrival),
        sectionY + 76 * scale,
      )
      ctx.scale(scale * 0.82 * pop, scale * 0.82 * pop)
      drums(hot(11))
      ctx.restore()
      ctx.restore()
    }
    if (running || stopping || solo || entrance !== null)
      frame = requestAnimationFrame(draw)
  }
  function wake() {
    if (!frame && !disposed && !document.hidden)
      frame = requestAnimationFrame(draw)
  }
  function measureLetters() {
    ctx.font = heroFont
    letterLayouts = [-2, 20].map((gap) => {
      const positions = []
      for (const letters of ["benny", "conn"]) {
        const widths = [...letters].map(
            (letter) => ctx.measureText(letter).width,
          ),
          total = widths.reduce((a, b) => a + b, 0) + gap * (letters.length - 1)
        let x = -total / 2
        for (const w of widths) {
          positions.push(x + w / 2)
          x += w + gap
        }
      }
      return positions
    })
  }
  function resize() {
    if (disposed || !stage.clientWidth) return
    measureLetters()
    width = stage.clientWidth
    height = stage.clientHeight
    dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    wake()
  }
  function soundState() {
    if (disposed) return
    if (!muted) onAudioStart()
    soundButton.setAttribute("aria-pressed", String(!muted))
    soundButton.querySelector("span").textContent = muted
      ? "Sound off"
      : "Sound on"
    if (master)
      master.gain.setTargetAtTime(muted ? 0 : 0.85, audio.currentTime, 0.025)
  }
  async function ensureAudio() {
    if (disposed) throw new Error("Band disposed")
    if (!audio) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) throw new Error("Web Audio unavailable")
      audio = new AC()
      master = audio.createGain()
      master.gain.value = 0
      compressor = audio.createDynamicsCompressor()
      compressor.threshold.value = -9
      compressor.knee.value = 12
      compressor.ratio.value = 3
      compressor.attack.value = 0.008
      compressor.release.value = 0.12
      compressor.connect(master)
      master.connect(audio.destination)
      bandBus = audio.createGain()
      bandBus.gain.value = 0.85
      bandBus.connect(compressor)
      soloBus = audio.createGain()
      soloBus.gain.value = 1
      soloBus.connect(compressor)
      noise = audio.createBuffer(1, audio.sampleRate * 0.35, audio.sampleRate)
      const n = noise.getChannelData(0)
      for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1
    }
    // Resume synchronously inside the gesture before awaiting any network work.
    const resumed = audio.resume()
    if (!decodePromise) {
      decodePromise = Promise.all(
        Object.entries(SAMPLES).map(async ([role, list]) => [
          role,
          await Promise.all(
            list.map(async (sample) => {
              const response = await fetch(sample.url, {
                signal: requests.signal,
              })
              if (!response.ok) throw new Error("Instrument sample unavailable")
              return {
                midi: sample.midi,
                buffer: await audio.decodeAudioData(
                  await response.arrayBuffer(),
                ),
              }
            }),
          ),
        ]),
      )
        .then((entries) => {
          if (!disposed) decoded = Object.fromEntries(entries)
        })
        .catch((error) => {
          decodePromise = null
          throw error
        })
    }
    await Promise.all([resumed, decodePromise])
  }
  function nearest(role, note) {
    return decoded[role].reduce((a, b) =>
      Math.abs(a.midi - note) < Math.abs(b.midi - note) ? a : b,
    )
  }
  function track(source, nodes, voice) {
    sources.add(source)
    if (voice) voices.add(voice)
    source.onended = () => {
      sources.delete(source)
      if (voice) voices.delete(voice)
      source.disconnect()
      nodes.forEach((n) => n.disconnect())
    }
  }
  function note(event, time) {
    if (["kick", "snare", "ride"].includes(event.role)) {
      percussion(event, time)
      return
    }
    const sample = nearest(event.role, event.midi),
      source = audio.createBufferSource(),
      gain = audio.createGain(),
      pan = audio.createStereoPanner()
    source.buffer = sample.buffer
    source.playbackRate.value = 2 ** ((event.midi - sample.midi) / 12)
    pan.pan.value =
      event.player < 9
        ? 0.2 + ((event.player % 5) - 2) * 0.13
        : event.role === "piano"
        ? -0.55
        : event.role === "contrabass"
        ? -0.42
        : 0
    const attack =
        event.role === "piano" || event.role === "contrabass" ? 0.005 : 0.014,
      sustain = event.duration * 0.78,
      level = event.volume * (event.role === "trombone" ? 2.5 : 1)
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(level, time + attack)
    if (event.role === "contrabass")
      gain.gain.exponentialRampToValueAtTime(level * 0.28, time + sustain)
    else gain.gain.setValueAtTime(level * 0.86, time + sustain)
    gain.gain.linearRampToValueAtTime(0, time + event.duration + 0.055)
    source.connect(gain)
    gain.connect(pan)
    pan.connect(bandBus)
    source.start(
      time,
      event.role === "contrabass" ? 0.24 : event.role === "trombone" ? 0.08 : 0,
    )
    source.stop(time + event.duration + 0.08)
    const voice = {
      source,
      gain,
      pan,
      event,
      time,
      end: time + event.duration + 0.08,
      level,
      rate: source.playbackRate.value,
    }
    recentNotes[event.player] = { ...event, time }
    track(source, [gain, pan], voice)
    return voice
  }
  function percussion(event, time) {
    const gain = audio.createGain()
    gain.connect(bandBus)
    if (event.role === "kick") {
      const o = audio.createOscillator()
      o.frequency.setValueAtTime(105, time)
      o.frequency.exponentialRampToValueAtTime(47, time + 0.09)
      gain.gain.setValueAtTime(event.volume, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16)
      o.connect(gain)
      o.start(time)
      o.stop(time + 0.18)
      track(o, [gain])
    } else {
      const n = audio.createBufferSource(),
        f = audio.createBiquadFilter()
      n.buffer = noise
      f.type = "highpass"
      f.frequency.value = event.role === "ride" ? 5700 : 1600
      gain.gain.setValueAtTime(event.volume, time)
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        time + (event.role === "ride" ? 0.15 : 0.11),
      )
      n.connect(f)
      f.connect(gain)
      n.start(time)
      n.stop(time + 0.19)
      track(n, [f, gain])
    }
  }
  function footstep(player, strength = 1) {
    if (!audio || muted || audio.state !== "running") return
    const t = audio.currentTime,
      pan = audio.createStereoPanner()
    pan.pan.value = ((player % 5) - 2) * 0.28
    pan.connect(compressor)
    const toe = audio.createOscillator(),
      heel = audio.createOscillator(),
      tg = audio.createGain(),
      hg = audio.createGain()
    toe.type = "triangle"
    toe.frequency.setValueAtTime(980 + player * 43, t)
    toe.frequency.exponentialRampToValueAtTime(520 + player * 24, t + 0.035)
    tg.gain.setValueAtTime(0.026 * strength, t)
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.04)
    heel.type = "sine"
    heel.frequency.setValueAtTime(165 + player * 5, t)
    heel.frequency.exponentialRampToValueAtTime(88, t + 0.06)
    hg.gain.setValueAtTime(0.07 * strength, t)
    hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
    toe.connect(tg)
    tg.connect(pan)
    heel.connect(hg)
    hg.connect(pan)
    toe.start(t)
    toe.stop(t + 0.045)
    heel.start(t)
    heel.stop(t + 0.075)
    track(toe, [tg])
    track(heel, [hg, pan])
  }
  function schedule() {
    if (!running || disposed || document.hidden) return
    while (true) {
      const e = BAND_SCORE.events[eventIndex],
        time = startTime + cycle * BAND_SCORE.duration + e.time
      if (time > audio.currentTime + 0.14) break
      if (time >= audio.currentTime - 0.025) {
        note(e, Math.max(time, audio.currentTime))
        visualQueue.push({ ...e, time })
      }
      if (++eventIndex === BAND_SCORE.events.length) {
        eventIndex = 0
        cycle++
      }
    }
  }
  function stopBand() {
    running = false
    stopping = false
    pendingReset = false
    loadingMusic = false
    clearTimeout(stopTimer)
    clearInterval(ticker)
    visualQueue.length = 0
    activeUntil.fill(0)
    sources.forEach((s) => {
      try {
        s.stop()
      } catch (_) {}
    })
    sources.clear()
    voices.clear()
    syncControls()
    wake()
  }
  function releaseVoice(voice, seconds, fall = 0) {
    const now = audio.currentTime,
      { source, gain, event, time, level } = voice
    if (time > now) {
      try {
        source.stop()
      } catch (_) {}
      return
    }
    if (gain.gain.cancelAndHoldAtTime) gain.gain.cancelAndHoldAtTime(now)
    else {
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(level * 0.65, now)
    }
    gain.gain.linearRampToValueAtTime(0, now + seconds)
    if (fall) {
      source.playbackRate.cancelScheduledValues(now)
      source.playbackRate.setValueAtTime(voice.rate, now)
      source.playbackRate.exponentialRampToValueAtTime(
        voice.rate * 2 ** (-fall / 12),
        now + seconds * 0.9,
      )
    }
    source.stop(now + seconds + 0.04)
    voice.end = now + seconds + 0.04
    activeUntil[event.player] = Math.max(
      activeUntil[event.player],
      now + seconds,
    )
  }
  function cutOffBand(resetAfter = false) {
    if (!running) {
      if (stopping && resetAfter) {
        pendingReset = true
        syncControls()
      }
      return
    }
    running = false
    stopping = true
    pendingReset = resetAfter
    clearInterval(ticker)
    visualQueue.length = 0
    stopSolo()
    const now = audio.currentTime,
      linger = [
        0.16, 0.43, 0.28, 0.58, 0.24, 0.42, 0.7, 1.03, 1.58, 0.62, 0.34, 0.15,
      ]
    const active = new Set()
    ;[...voices].forEach((voice) => {
      if (voice.time <= now && voice.end > now) {
        active.add(voice.event.player)
        releaseVoice(
          voice,
          linger[voice.event.player],
          voice.event.player === 8 ? 4.5 : voice.event.player === 7 ? 1.3 : 0,
        )
      } else {
        try {
          voice.source.stop()
        } catch (_) {}
      }
    })
    // Two players occasionally miss the cutoff and finish their last note.
    ;[7, 8].forEach((player) => {
      const last = recentNotes[player]
      if (active.has(player) || !last || last.time > now || now - last.time > 3)
        return
      const time = now + (player === 8 ? 0.16 : 0.075),
        seconds = linger[player],
        event = { ...last, duration: seconds, volume: last.volume * 0.68 }
      const voice = note(event, time)
      voice.source.playbackRate.exponentialRampToValueAtTime(
        voice.rate * 2 ** (-(player === 8 ? 4.5 : 1.3) / 12),
        time + seconds * 0.9,
      )
      visualQueue.push({ ...event, time })
    })
    visualQueue.sort((a, b) => a.time - b.time)
    syncControls()
    announce("The cutoff… a couple of players are still finishing.")
    wake()
    stopTimer = setTimeout(() => {
      const reset = pendingReset
      stopBand()
      if (reset) walkBand(true)
      else announce("The band has stopped.")
    }, 1900)
  }
  async function startMusic() {
    if (!band || entrance !== null || stopping || loadingMusic) return
    const id = ++operation
    loadingMusic = true
    syncControls()
    try {
      await ensureAudio()
      if (id !== operation || disposed || document.hidden) return
      if (!soundChosen) muted = false
      soundState()
      running = true
      recentNotes.fill(null)
      activeUntil.fill(0)
      eventIndex = 0
      cycle = 0
      startTime = audio.currentTime + 0.12
      clearInterval(ticker)
      ticker = setInterval(schedule, 25)
      schedule()
      wake()
      announce(
        "The band is playing your twelve-bar B-flat jazz blues. Hold and drag to solo.",
      )
    } catch (_) {
      announce("Audio could not start. Please try again.")
    } finally {
      loadingMusic = false
      syncControls()
    }
  }
  function stopSolo() {
    soloOperation++
    pitchLabel.hidden = true
    pointer = null
    keyboard = false
    clearTimeout(soloTimer)
    root.classList.remove("bc-playing")
    if (solo) {
      const old = solo
      solo = null
      old.gain.gain.setTargetAtTime(0, audio.currentTime, 0.025)
      old.source.stop(audio.currentTime + 0.12)
    }
    wake()
  }
  function playSolo(value) {
    midi = clamp(value, 46, 70)
    if (!audio || !decoded?.trombone || muted) return
    if (!solo) {
      const sample = nearest("trombone", 58),
        buffer = audio.createBuffer(
          1,
          sample.buffer.length,
          sample.buffer.sampleRate,
        ),
        data = buffer.getChannelData(0)
      data.set(sample.buffer.getChannelData(0))
      const begin = Math.floor(0.35 * buffer.sampleRate),
        end = Math.min(Math.floor(1.2 * buffer.sampleRate), data.length - 1),
        cross = Math.floor(0.04 * buffer.sampleRate)
      for (let i = 0; i < cross; i++) {
        const t = i / cross
        data[end - cross + i] =
          data[end - cross + i] * (1 - t) + data[begin + i] * t
      }
      const source = audio.createBufferSource(),
        gain = audio.createGain()
      source.buffer = buffer
      source.loop = true
      source.loopStart = (begin + cross) / buffer.sampleRate
      source.loopEnd = end / buffer.sampleRate
      source.connect(gain)
      gain.connect(soloBus)
      gain.gain.value = 0
      source.playbackRate.value = 2 ** ((midi - sample.midi) / 12)
      source.start(0, 0.08)
      gain.gain.setTargetAtTime(0.65, audio.currentTime, 0.02)
      solo = { source, gain, root: sample.midi }
      track(source, [gain])
    }
    const nearestPitch = Math.round(midi),
      names = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"]
    pitchLabel.textContent =
      names[nearestPitch % 12] + (Math.floor(nearestPitch / 12) - 1)
    pitchLabel.hidden = false
    drawCursor(94 + (58 - midi) * 2.2)
    if (keyboard) {
      const s = stage.getBoundingClientRect()
      placeCursor(s.left + s.width / 2, s.top + s.height * 0.82)
    } else if (lastCursorPoint)
      placeCursor(lastCursorPoint.x, lastCursorPoint.y)
    solo.source.playbackRate.setTargetAtTime(
      2 ** ((midi - solo.root) / 12),
      audio.currentTime,
      0.025,
    )
    clearTimeout(soloTimer)
    soloTimer = setTimeout(stopSolo, 10000)
    wake()
  }
  const isControl = (target) =>
    target.closest(
      "button:not(.bc-stage-control),a,input,select,textarea,details,nav,[contenteditable],p,h2,h3,label,footer",
    )
  function drawCursor(end = 94) {
    cursorEnd = clamp(end, 68, 122)
    const w = Math.ceil(cursorEnd + 8),
      pixelRatio = Math.min(devicePixelRatio || 1, 2),
      c = cursorCtx
    if (cursorCanvas.width !== w * pixelRatio) {
      cursorCanvas.width = w * pixelRatio
      cursorCanvas.height = 44 * pixelRatio
    }
    cursor.style.width = w + "px"
    c.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    c.clearRect(0, 0, w, 44)
    c.lineCap = "round"
    c.lineJoin = "round"
    const line = (points, color = Y, size = 2.7) => {
      c.beginPath()
      points()
      c.strokeStyle = K
      c.lineWidth = size + 2
      c.stroke()
      c.strokeStyle = color
      c.lineWidth = size
      c.stroke()
    }
    // Bell section and tuning crook stay fixed while the two slide rails extend.
    line(
      () => {
        c.moveTo(42, 12)
        c.lineTo(16, 12)
        c.bezierCurveTo(3, 12, 3, 35, 17, 35)
        c.lineTo(26, 35)
      },
      Y,
      3,
    )
    c.beginPath()
    c.moveTo(37, 9.5)
    c.bezierCurveTo(50, 9.5, 54, 7, 61, 2)
    c.lineTo(61, 22)
    c.bezierCurveTo(53, 17, 49, 14.5, 37, 14.5)
    c.closePath()
    c.fillStyle = Y
    c.fill()
    c.beginPath()
    c.ellipse(61, 12, 3, 10, 0, 0, Math.PI * 2)
    c.fillStyle = K
    c.fill()
    c.lineWidth = 1.8
    c.strokeStyle = solo ? W : H
    c.stroke()
    line(
      () => {
        c.moveTo(22, 25)
        c.lineTo(cursorEnd, 25)
        c.quadraticCurveTo(cursorEnd + 5, 25, cursorEnd + 5, 30)
        c.quadraticCurveTo(cursorEnd + 5, 35, cursorEnd, 35)
        c.lineTo(23, 35)
      },
      Y,
      2.6,
    )
    line(
      () => {
        c.moveTo(8, 25)
        c.lineTo(34, 25)
        c.moveTo(25, 25)
        c.lineTo(25, 35)
        c.moveTo(cursorEnd - 15, 25)
        c.lineTo(cursorEnd - 15, 35)
      },
      H,
      1.6,
    )
    line(
      () => {
        c.moveTo(4, 22)
        c.lineTo(4, 28)
        c.moveTo(4, 25)
        c.lineTo(10, 25)
      },
      solo ? W : H,
      2,
    )
    c.beginPath()
    c.moveTo(18, 11)
    c.lineTo(39, 11)
    c.strokeStyle = H
    c.lineWidth = 0.8
    c.stroke()
  }
  function placeCursor(clientX, clientY) {
    const r = root.getBoundingClientRect(),
      w = cursorEnd + 8,
      px = clientX - r.left,
      flipped = px + w + 61 > r.width
    cursor.classList.toggle("bc-flipped", flipped)
    const x = flipped ? px - w + 4 : px - 4,
      y = clamp(clientY - r.top - 25, 1, r.height - 45)
    cursor.style.transform = `translate(${clamp(
      x,
      1,
      r.width - w - 1,
    )}px,${y}px)`
    cursor.style.opacity = "1"
  }
  function hideCursor() {
    cursor.style.opacity = "0"
    root.classList.remove("bc-cursor-active")
  }
  function moveCursor(e) {
    if (
      disposed ||
      document.hidden ||
      (!pointer &&
        (e.pointerType === "touch" || !fine.matches || isControl(e.target)))
    ) {
      hideCursor()
      return
    }
    lastCursorPoint = { x: e.clientX, y: e.clientY }
    drawCursor(
      pointer
        ? 94 + ((e.clientX - pointer.x) / Math.max(12, width / 18)) * 2.2
        : 94,
    )
    placeCursor(e.clientX, e.clientY)
    root.classList.add("bc-cursor-active")
  }
  listen(root, "pointermove", (e) => {
    moveCursor(e)
    if (pointer?.id === e.pointerId)
      playSolo(58 - (e.clientX - pointer.x) / Math.max(12, width / 18))
  })
  listen(root, "pointerdown", async (e) => {
    if (
      disposed ||
      document.hidden ||
      entrance !== null ||
      stopping ||
      e.button !== 0 ||
      isControl(e.target) ||
      (e.pointerType === "touch" && !stage.contains(e.target))
    )
      return
    e.preventDefault()
    stopSolo()
    const gesture = soloOperation
    pointer = { id: e.pointerId, x: e.clientX }
    root.setPointerCapture(e.pointerId)
    root.classList.add("bc-playing")
    moveCursor(e)
    try {
      await ensureAudio()
      if (gesture !== soloOperation || !pointer || disposed || document.hidden)
        return
      if (!soundChosen) muted = false
      soundState()
      playSolo(58)
    } catch (_) {
      if (gesture === soloOperation) {
        stopSolo()
        announce("Audio could not start. Please try again.")
      }
    }
  })
  listen(root, "pointerup", (e) => {
    if (pointer?.id === e.pointerId) {
      stopSolo()
      if (root.hasPointerCapture(e.pointerId))
        root.releasePointerCapture(e.pointerId)
    }
  })
  listen(root, "pointercancel", stopSolo)
  listen(root, "lostpointercapture", stopSolo)
  listen(root, "pointerleave", () => {
    if (!pointer) hideCursor()
  })
  listen(pad, "keydown", async (e) => {
    if (entrance !== null || stopping) return
    if ((e.key === " " || e.key === "Enter") && e.repeat) {
      e.preventDefault()
      return
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      stopSolo()
      keyboard = true
      const gesture = soloOperation
      try {
        await ensureAudio()
        if (
          gesture !== soloOperation ||
          !keyboard ||
          disposed ||
          document.hidden
        )
          return
        if (!soundChosen) muted = false
        soundState()
        root.classList.add("bc-playing")
        playSolo(midi)
      } catch (_) {
        announce("Audio could not start.")
      }
    } else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault()
      midi = clamp(midi + (e.key === "ArrowLeft" ? 0.5 : -0.5), 46, 70)
      if (keyboard) playSolo(midi)
    } else if (e.key === "Escape") stopSolo()
  })
  listen(pad, "keyup", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      stopSolo()
    }
  })
  listen(pad, "blur", stopSolo)
  listen(startButton, "click", gatherBand)
  listen(musicButton, "click", () => (running ? cutOffBand() : startMusic()))
  listen(resetButton, "click", resetBand)
  listen(soundButton, "click", async () => {
    soundChosen = true
    if (!muted) {
      muted = true
      soundState()
      stopSolo()
    } else {
      try {
        await ensureAudio()
        if (!disposed && !document.hidden) {
          muted = false
          soundState()
        }
      } catch (_) {
        announce("Audio could not start.")
      }
    }
  })
  function pause() {
    operation++
    cancelEntrance()
    stopSolo()
    stopBand()
    hideCursor()
    cancelAnimationFrame(frame)
    frame = 0
    if (audio?.state === "running") audio.suspend().catch(() => {})
  }
  listen(window, "blur", () => {
    stopSolo()
    hideCursor()
  })
  listen(document, "visibilitychange", () => {
    if (document.hidden) pause()
    else resize()
  })
  listen(window, "pagehide", pause)
  listen(reduced, "change", wake)
  drawCursor()
  syncControls()
  const name = root.querySelector(".bc-name")
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stage)
  // Keep the real heading visible until its exact font is ready for the canvas.
  document.fonts
    .load(heroFont, "bennyconn")
    .then(() => {
      if (!disposed) {
        name.classList.add("bc-sr")
        resize()
      }
    })
    .catch(resize)
  resize()
  return {
    pause,
    destroy() {
      if (disposed) return
      disposed = true
      operation++
      listeners.abort()
      requests.abort()
      resizeObserver.disconnect()
      clearTimeout(stopTimer)
      clearTimeout(soloTimer)
      clearInterval(ticker)
      cancelAnimationFrame(frame)
      stopSolo()
      hideCursor()
      sources.forEach((source) => {
        try {
          source.stop()
          source.disconnect()
        } catch (_) {}
      })
      sources.clear()
      voices.clear()
      visualQueue.length = 0
      if (audio && audio.state !== "closed") audio.close().catch(() => {})
      name.classList.remove("bc-sr")
    },
  }
}
