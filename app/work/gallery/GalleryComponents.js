"use client"

import { useState, useEffect, useRef } from "react"

// ─── Pipeline step animator ─────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { label: "Token Received", sub: "contract + tokenID" },
  { label: "Fetch Metadata", sub: "IPFS · Arweave · HTTP" },
  { label: "Resolve URLs", sub: "image · animation · pfp" },
  { label: "Cache to GCP", sub: "3 goroutines · parallel" },
  { label: "Store Result", sub: "PostgreSQL" },
]

export function PipelineViz() {
  const [activeStep, setActiveStep] = useState(0)
  const [done, setDone] = useState(false)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          obs.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    if (done) {
      const id = setTimeout(() => {
        setActiveStep(0)
        setDone(false)
      }, 2000)
      return () => clearTimeout(id)
    }
    if (activeStep < PIPELINE_STEPS.length - 1) {
      const id = setTimeout(() => setActiveStep(s => s + 1), 620)
      return () => clearTimeout(id)
    } else {
      const id = setTimeout(() => setDone(true), 800)
      return () => clearTimeout(id)
    }
  }, [started, activeStep, done])

  return (
    <div ref={ref} className="border border-border rounded-sm p-4 bg-secondary/10">
      {/* chrome */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
        <span className="text-xs text-muted-foreground/50 ml-2">
          tokenprocessing — media pipeline
        </span>
      </div>

      <div className="space-y-2">
        {PIPELINE_STEPS.map((step, i) => {
          const isActive = i === activeStep && !done
          const isPast = i < activeStep || done
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm border transition-all duration-300 ${
                isActive
                  ? "border-brand/60 bg-brand/5"
                  : isPast
                    ? "border-border/30 bg-background/20 opacity-60"
                    : "border-border/20 bg-transparent opacity-30"
              }`}>
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                  isActive ? "bg-brand animate-pulse" : isPast ? "bg-brand/40" : "bg-muted-foreground/20"
                }`}
              />
              <span
                className={`text-sm transition-colors duration-300 ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}>
                {step.label}
              </span>
              <span className="text-xs text-muted-foreground/50 ml-auto">{step.sub}</span>
              {isPast && !isActive && (
                <span className="text-brand/60 text-xs shrink-0">✓</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Animated goroutine pool diagram ────────────────────────────────────────

const GOROUTINES = 8

export function GoroutinePool() {
  const [active, setActive] = useState([])
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          obs.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return

    // stagger goroutine activations
    const timeouts = []
    for (let i = 0; i < GOROUTINES; i++) {
      const onDelay = 120 + i * 90
      const offDelay = onDelay + 800 + Math.floor(i * 130)
      timeouts.push(setTimeout(() => setActive(a => [...a, i]), onDelay))
      timeouts.push(
        setTimeout(() => setActive(a => a.filter(x => x !== i)), offDelay),
      )
    }

    // loop
    const total = 120 + GOROUTINES * 90 + 800 + GOROUTINES * 130 + 600
    const loop = setTimeout(() => {
      setActive([])
      setStarted(false)
      setTimeout(() => setStarted(true), 100)
    }, total)

    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(loop)
    }
  }, [started])

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground/70 font-mono">
          pool.New().WithMaxGoroutines(50)
        </span>
        <span className="text-xs text-brand/60">
          {active.length} / {GOROUTINES} active
        </span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: GOROUTINES }).map((_, i) => (
          <div
            key={i}
            className={`h-7 flex-1 min-w-[2rem] rounded-sm border text-xs flex items-center justify-center transition-all duration-300 ${
              active.includes(i)
                ? "border-brand/50 bg-brand/10 text-brand"
                : "border-border/30 bg-background/10 text-muted-foreground/30"
            }`}>
            g{i + 1}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/40 mt-2">
        Each goroutine fetches metadata, resolves media URLs, and caches to GCP independently
      </p>
    </div>
  )
}
