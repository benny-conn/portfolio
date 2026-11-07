"use client"

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { createPortal } from "react-dom"
import "./bandstand.css"
import { createBandAudio } from "@/lib/bandstand/audio"

const subscribe = () => () => {}
let webgl
function supportsWebGL() {
  if (webgl !== undefined) return webgl
  try {
    const gl = document.createElement("canvas").getContext("webgl2")
    webgl = Boolean(gl)
    gl?.getExtension("WEBGL_lose_context")?.loseContext()
  } catch (_) {
    webgl = false
  }
  return webgl
}

// The homepage's 3D bandstand. "Start the band" hands off to open(), which
// lifts the hero's letters into a clay theater covering the whole site.
// three.js loads only on intent (hover, focus, touch) or on a good idle connection.
export default function Bandstand({
  ref,
  getLetters,
  getMuted,
  onMutedChange,
  onAudioStart,
  onLoading,
  onFallback,
  onClose,
}) {
  const mountRef = useRef(null),
    padRef = useRef(null),
    pitchRef = useRef(null),
    musicRef = useRef(null),
    stageRef = useRef(null),
    engineRef = useRef(null),
    loaderRef = useRef(null),
    closeTimer = useRef(0)
  const [mode, setMode] = useState("closed")
  const [stage, setStage] = useState({ phase: "idle", music: "off" })
  const [muted, setMuted] = useState(false)
  const [message, setMessage] = useState("")
  // The stage covers the whole site, including the fixed nav.
  const portal = useSyncExternalStore(
    subscribe,
    () => document.body,
    () => null,
  )

  const preload = useCallback(() => {
    loaderRef.current ??= import("@/lib/bandstand/create-bandstand").catch(
      (error) => {
        loaderRef.current = null
        throw error
      },
    )
    return loaderRef.current
  }, [])

  const teardown = useCallback(() => {
    clearTimeout(closeTimer.current)
    stageRef.current?.destroy()
    stageRef.current = null
    if (window.__bandstand) window.__bandstand = null
  }, [])

  function finishClose() {
    setMode("leaving")
    closeTimer.current = setTimeout(() => {
      teardown()
      setMode("closed")
      setStage({ phase: "idle", music: "off" })
      onClose?.()
    }, 560)
  }

  async function launch(engine) {
    try {
      const [{ createBandstand }] = await Promise.all([
        preload(),
        document.fonts?.ready,
      ])
      if (!mountRef.current) return
      const family = getComputedStyle(document.body)
        .getPropertyValue("--font-display")
        .trim()
      stageRef.current = createBandstand({
        mount: mountRef.current,
        pad: padRef.current,
        pitchLabel: pitchRef.current,
        audio: engine,
        family: family || "Georgia, serif",
        getLetters,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        onState(next) {
          setStage(next)
          if (next.phase === "closed") finishClose()
        },
        announce: setMessage,
      })
      if (process.env.NODE_ENV === "development")
        window.__bandstand = stageRef.current
      setMode("open")
      setMessage("The curtain is going up.")
    } catch (error) {
      console.error(error)
      teardown()
      setMode("closed")
      onFallback?.()
    } finally {
      onLoading?.(false)
    }
  }

  // Called synchronously from the Start click. Returns false when this device
  // can't show the 3D stage, so the 2D band can walk on instead.
  function open() {
    if (mode !== "closed" || !supportsWebGL()) return false
    // Create and resume audio inside the click, before any await.
    const engine = (engineRef.current ??= createBandAudio({
      onStart: () => onAudioStart?.(),
    }))
    const startMuted = Boolean(getMuted?.())
    setMuted(startMuted)
    engine.setMuted(startMuted)
    engine.prepare().catch(() => {})
    setMode("loading")
    onLoading?.(true)
    launch(engine)
    return true
  }

  useImperativeHandle(ref, () => ({
    open,
    preload: () => preload().catch(() => {}),
    stopMusic: () => stageRef.current?.stopMusic(),
  }))

  // Focus moves into the stage once it is no longer inert.
  useEffect(() => {
    if (mode === "open") padRef.current?.focus({ preventScroll: true })
  }, [mode])

  // Ready: move focus to the music button so keyboard users can start.
  useEffect(() => {
    if (stage.phase === "ready" && document.activeElement === padRef.current)
      musicRef.current?.focus({ preventScroll: true })
  }, [stage.phase])

  useEffect(() => {
    if (mode === "closed" || mode === "loading") return
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = "hidden"
    const onKey = (e) => {
      if (e.key === "Escape") stageRef.current?.close()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      html.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [mode])

  useEffect(() => {
    // Warm the module on a good connection once the page has settled.
    const connection = navigator.connection
    const thrifty =
      connection?.saveData || /2g|3g/.test(connection?.effectiveType ?? "")
    let idle = 0
    const timer = thrifty
      ? 0
      : setTimeout(() => {
          const warm = () => preload().catch(() => {})
          idle = window.requestIdleCallback
            ? requestIdleCallback(warm, { timeout: 4000 })
            : setTimeout(warm, 0)
        }, 4000)
    return () => {
      clearTimeout(timer)
      if (window.cancelIdleCallback) cancelIdleCallback(idle)
      clearTimeout(idle)
      teardown()
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [preload, teardown])

  const toggleSound = () => {
    const next = !muted
    setMuted(next)
    engineRef.current?.setMuted(next)
    onMutedChange?.(next)
  }
  const ready = stage.phase === "ready"
  const music = stage.music
  const hidden = mode === "closed" || mode === "loading"
  const musicLabel =
    music === "loading"
      ? "Getting ready…"
      : music === "stopping"
        ? "…and stop."
        : music === "playing"
          ? "Stop the band"
          : "Start the music"

  if (!portal) return null
  return createPortal(
    <div
      className="bs-overlay"
      data-mode={mode}
      role="dialog"
      aria-modal="true"
      aria-label="The bandstand"
      aria-hidden={hidden}
      inert={hidden ? true : undefined}
    >
      <div ref={mountRef} className="bs-mount" />
      <button
        ref={padRef}
        type="button"
        className="bs-pad"
        aria-label="Stage. Hold Space or Enter and use the Left and Right arrows to take a trombone solo."
      />
      <div className="bs-top">
        <button
          type="button"
          className="bs-button bs-quiet"
          onClick={() => stageRef.current?.close()}
          disabled={stage.phase === "closing"}
        >
          Close the curtain
        </button>
        <button
          type="button"
          className="bs-button bs-quiet"
          aria-pressed={!muted}
          onClick={toggleSound}
        >
          <i aria-hidden="true" data-on={!muted} />
          {muted ? "Sound off" : "Sound on"}
        </button>
      </div>
      <div className="bs-bar">
        {ready ? (
          <>
            <button
              ref={musicRef}
              type="button"
              className="bs-button"
              aria-pressed={music === "playing" || music === "stopping"}
              disabled={music === "loading" || music === "stopping"}
              onClick={() =>
                music === "playing"
                  ? stageRef.current?.stopMusic()
                  : stageRef.current?.startMusic()
              }
            >
              {musicLabel}
            </button>
            <span className="bs-hint">Hold &amp; drag the stage to solo.</span>
          </>
        ) : (
          <span className="bs-hint">
            {stage.phase === "closing" ? "Goodnight!" : "Places, everyone…"}
          </span>
        )}
      </div>
      <span ref={pitchRef} className="bs-pitch" hidden />
      <div className="bs-sr" role="status" aria-live="polite">
        {message}
      </div>
    </div>,
    portal,
  )
}
