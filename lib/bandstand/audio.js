import { BAND_SCORE } from "@/lib/band/score.js"
import { SAMPLES } from "@/lib/band/samples.js"

// Audio for the 3D bandstand. It plays the same score, samples, and mix as the
// 2D band in lib/band/create-band.js, and reports every scheduled note so the
// stage can animate. Keep the two in step until they share one engine.
const LINGER = [
  0.16, 0.43, 0.28, 0.58, 0.24, 0.42, 0.7, 1.03, 1.58, 0.62, 0.34, 0.15,
]

export function createBandAudio({ onStart = () => {} } = {}) {
  const requests = new AbortController()
  const sources = new Set(),
    voices = new Set(),
    recentNotes = Array(12).fill(null)
  let audio, master, compressor, bandBus, soloBus, sfxBus, noise
  let decoded, decodePromise, ticker
  let eventIndex = 0,
    cycle = 0,
    startTime = 0,
    running = false,
    muted = false,
    solo = null,
    disposed = false

  function context() {
    if (audio) return audio
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) throw new Error("Web Audio unavailable")
    audio = new AC()
    master = audio.createGain()
    master.gain.value = muted ? 0 : 0.85
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
    soloBus.connect(compressor)
    sfxBus = audio.createGain()
    sfxBus.gain.value = 0.9
    sfxBus.connect(compressor)
    noise = audio.createBuffer(1, audio.sampleRate * 1.5, audio.sampleRate)
    const n = noise.getChannelData(0)
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1
    return audio
  }

  // Call inside the click that opens the stage so Safari lets audio resume.
  async function prepare() {
    if (disposed) throw new Error("Audio disposed")
    const ctx = context()
    const resumed = ctx.resume()
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
                buffer: await ctx.decodeAudioData(await response.arrayBuffer()),
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

  const now = () => (audio ? audio.currentTime : 0)
  const ready = () => Boolean(decoded) && audio?.state === "running"

  function nearest(role, midi) {
    return decoded[role].reduce((a, b) =>
      Math.abs(a.midi - midi) < Math.abs(b.midi - midi) ? a : b,
    )
  }
  function track(source, nodes, voice) {
    sources.add(source)
    if (voice) voices.add(voice)
    source.onended = () => {
      sources.delete(source)
      if (voice) voices.delete(voice)
      source.disconnect()
      nodes.forEach((node) => node.disconnect())
    }
  }

  function note(event, time) {
    if (["kick", "snare", "ride"].includes(event.role)) {
      percussion(event, time)
      return null
    }
    const sample = nearest(event.role, event.midi),
      source = audio.createBufferSource(),
      gain = audio.createGain(),
      pan = audio.createStereoPanner()
    source.buffer = sample.buffer
    source.playbackRate.value = 2 ** ((event.midi - sample.midi) / 12)
    // Stage-right horns, stage-left rhythm section, matching the 3D layout.
    pan.pan.value =
      event.player < 9
        ? 0.1 + ((event.player % 5) - 2) * 0.13
        : event.role === "piano"
          ? -0.6
          : event.role === "contrabass"
            ? -0.3
            : -0.42
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
    const gain = audio.createGain(),
      pan = audio.createStereoPanner()
    pan.pan.value = -0.42
    gain.connect(pan)
    pan.connect(bandBus)
    if (event.role === "kick") {
      const o = audio.createOscillator()
      o.frequency.setValueAtTime(105, time)
      o.frequency.exponentialRampToValueAtTime(47, time + 0.09)
      gain.gain.setValueAtTime(event.volume, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16)
      o.connect(gain)
      o.start(time)
      o.stop(time + 0.18)
      track(o, [gain, pan])
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
      track(n, [f, gain, pan])
    }
  }

  function schedule() {
    if (!running || disposed) return
    while (true) {
      const e = BAND_SCORE.events[eventIndex],
        time = startTime + cycle * BAND_SCORE.duration + e.time
      if (time > audio.currentTime + 0.14) break
      if (time >= audio.currentTime - 0.025) {
        note(e, Math.max(time, audio.currentTime))
        api.onNote?.({ ...e, time })
      }
      if (++eventIndex === BAND_SCORE.events.length) {
        eventIndex = 0
        cycle++
      }
    }
  }

  async function start() {
    await prepare()
    if (disposed) return
    onStart()
    running = true
    recentNotes.fill(null)
    eventIndex = 0
    cycle = 0
    startTime = audio.currentTime + 0.15
    clearInterval(ticker)
    ticker = setInterval(schedule, 25)
    schedule()
    return startTime
  }

  function releaseVoice(voice, seconds, fall = 0) {
    const t = audio.currentTime,
      { source, gain, time, level } = voice
    if (time > t) {
      try {
        source.stop()
      } catch (_) {}
      return
    }
    if (gain.gain.cancelAndHoldAtTime) gain.gain.cancelAndHoldAtTime(t)
    else {
      gain.gain.cancelScheduledValues(t)
      gain.gain.setValueAtTime(level * 0.65, t)
    }
    gain.gain.linearRampToValueAtTime(0, t + seconds)
    if (fall) {
      source.playbackRate.cancelScheduledValues(t)
      source.playbackRate.setValueAtTime(voice.rate, t)
      source.playbackRate.exponentialRampToValueAtTime(
        voice.rate * 2 ** (-fall / 12),
        t + seconds * 0.9,
      )
    }
    source.stop(t + seconds + 0.04)
  }

  // The same staggered cutoff as the homepage: two players miss it.
  function cutOff() {
    if (!running) return []
    running = false
    clearInterval(ticker)
    const t = audio.currentTime,
      tail = []
    const active = new Set()
    ;[...voices].forEach((voice) => {
      const player = voice.event.player
      if (voice.time <= t && voice.end > t) {
        active.add(player)
        releaseVoice(
          voice,
          LINGER[player],
          player === 8 ? 4.5 : player === 7 ? 1.3 : 0,
        )
        tail.push({ ...voice.event, time: t, duration: LINGER[player] })
      } else {
        try {
          voice.source.stop()
        } catch (_) {}
      }
    })
    ;[7, 8].forEach((player) => {
      const last = recentNotes[player]
      if (active.has(player) || !last || last.time > t || t - last.time > 3)
        return
      const time = t + (player === 8 ? 0.16 : 0.075),
        seconds = LINGER[player],
        event = { ...last, duration: seconds, volume: last.volume * 0.68 }
      const voice = note(event, time)
      voice.source.playbackRate.exponentialRampToValueAtTime(
        voice.rate * 2 ** (-(player === 8 ? 4.5 : 1.3) / 12),
        time + seconds * 0.9,
      )
      tail.push({ ...event, time })
    })
    return tail
  }

  function stopAll() {
    running = false
    clearInterval(ticker)
    stopSolo()
    sources.forEach((s) => {
      try {
        s.stop()
      } catch (_) {}
    })
    sources.clear()
    voices.clear()
  }

  function setMuted(value) {
    muted = value
    if (master)
      master.gain.setTargetAtTime(muted ? 0 : 0.85, audio.currentTime, 0.025)
  }

  // A looped trombone voice whose pitch glides with the drag, like the homepage.
  function playSolo(midi) {
    if (!ready() || !decoded?.trombone) return false
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
        const k = i / cross
        data[end - cross + i] =
          data[end - cross + i] * (1 - k) + data[begin + i] * k
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
    solo.source.playbackRate.setTargetAtTime(
      2 ** ((midi - solo.root) / 12),
      audio.currentTime,
      0.025,
    )
    return true
  }
  function stopSolo() {
    if (!solo) return
    const old = solo
    solo = null
    old.gain.gain.setTargetAtTime(0, audio.currentTime, 0.025)
    old.source.stop(audio.currentTime + 0.12)
  }

  // Small synthesized effects for the stage choreography.
  const sfx = {
    footstep(pan = 0, strength = 1, pitch = 1) {
      if (!ready() || muted) return
      const t = audio.currentTime,
        p = audio.createStereoPanner(),
        heel = audio.createOscillator(),
        toe = audio.createOscillator(),
        hg = audio.createGain(),
        tg = audio.createGain()
      p.pan.value = Math.max(-1, Math.min(1, pan))
      p.connect(sfxBus)
      toe.type = "triangle"
      toe.frequency.setValueAtTime(1100 * pitch, t)
      toe.frequency.exponentialRampToValueAtTime(560 * pitch, t + 0.035)
      tg.gain.setValueAtTime(0.02 * strength, t)
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.04)
      heel.frequency.setValueAtTime(170 * pitch, t)
      heel.frequency.exponentialRampToValueAtTime(90, t + 0.06)
      hg.gain.setValueAtTime(0.06 * strength, t)
      hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
      toe.connect(tg)
      tg.connect(p)
      heel.connect(hg)
      hg.connect(p)
      toe.start(t)
      toe.stop(t + 0.045)
      heel.start(t)
      heel.stop(t + 0.075)
      track(toe, [tg])
      track(heel, [hg, p])
    },
    // A soft wooden "tok" when a letter lands on its band front.
    tok(midi = 72, pan = 0) {
      if (!ready() || muted) return
      const t = audio.currentTime,
        o = audio.createOscillator(),
        g = audio.createGain(),
        p = audio.createStereoPanner()
      o.type = "sine"
      o.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), t)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
      p.pan.value = Math.max(-1, Math.min(1, pan))
      o.connect(g)
      g.connect(p)
      p.connect(sfxBus)
      o.start(t)
      o.stop(t + 0.3)
      track(o, [g, p])
    },
    // Filtered noise swell for the velvet curtain.
    whoosh(seconds = 1.6, closing = false) {
      if (!ready() || muted) return
      const t = audio.currentTime,
        n = audio.createBufferSource(),
        f = audio.createBiquadFilter(),
        g = audio.createGain()
      n.buffer = noise
      n.loop = true
      f.type = "bandpass"
      f.Q.value = 0.7
      f.frequency.setValueAtTime(closing ? 1400 : 320, t)
      f.frequency.exponentialRampToValueAtTime(
        closing ? 300 : 1500,
        t + seconds,
      )
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05, t + seconds * 0.35)
      g.gain.exponentialRampToValueAtTime(0.0001, t + seconds)
      n.connect(f)
      f.connect(g)
      g.connect(sfxBus)
      n.start(t)
      n.stop(t + seconds + 0.05)
      track(n, [f, g])
    },
    // The marquee bulbs warming up.
    bulb(i = 0) {
      if (!ready() || muted) return
      const t = audio.currentTime,
        o = audio.createOscillator(),
        g = audio.createGain()
      o.type = "sine"
      o.frequency.setValueAtTime(1800 + (i % 7) * 140, t)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.012, t + 0.004)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
      o.connect(g)
      g.connect(sfxBus)
      o.start(t)
      o.stop(t + 0.07)
      track(o, [g])
    },
  }

  function suspend() {
    stopAll()
    if (audio?.state === "running") audio.suspend().catch(() => {})
  }

  function destroy() {
    if (disposed) return
    disposed = true
    requests.abort()
    stopAll()
    if (audio && audio.state !== "closed") audio.close().catch(() => {})
  }

  const api = {
    onNote: null,
    prepare,
    start,
    cutOff,
    stopAll,
    setMuted,
    playSolo,
    stopSolo,
    suspend,
    destroy,
    now,
    ready,
    sfx,
    get running() {
      return running
    },
    get muted() {
      return muted
    },
    beat: BAND_SCORE.beat,
    get startTime() {
      return startTime
    },
  }
  return api
}
