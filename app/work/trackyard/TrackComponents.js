"use client"

import { useState, useEffect, useRef } from "react"

// ─── Animated stat counters ────────────────────────────────────────────────

const STATS = [
  {
    value: 15000,
    format: n => `${Math.floor(n / 1000)}K+`,
    label: "Tracks AI-Analyzed",
  },
  {
    value: 300,
    format: n => `${n}%`,
    label: "Faster Catalog Processing",
  },
  {
    value: 200,
    format: n => `${n}%`,
    label: "Social Growth in 30 Days",
  },
]

function StatItem({ value, format, label }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const duration = 1800
    let startTime = null
    const easeOut = t => 1 - Math.pow(1 - t, 3)
    const animate = ts => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      setCount(Math.round(easeOut(progress) * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [started, value])

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <span className="text-4xl font-bold text-brand tabular-nums">
        {format(count)}
      </span>
      <span className="text-xs text-muted-foreground uppercase tracking-widest leading-snug">
        {label}
      </span>
    </div>
  )
}

export function TrackStats() {
  return (
    <div className="grid grid-cols-3 gap-6 py-8 border-y border-border mb-12">
      {STATS.map((s, i) => (
        <StatItem key={i} {...s} />
      ))}
    </div>
  )
}

// ─── AI search demo ────────────────────────────────────────────────────────

const DEMO_QUERIES = [
  {
    query: "cinematic, tense, 90 BPM",
    results: [
      { title: "Midnight Drive", bpm: 92, mood: "Tension" },
      { title: "Edge of Tomorrow", bpm: 88, mood: "Suspense" },
      { title: "Dark Horizon", bpm: 94, mood: "Dramatic" },
    ],
  },
  {
    query: "upbeat jazz, corporate, no vocals",
    results: [
      { title: "Morning Commute", bpm: 124, mood: "Upbeat" },
      { title: "City Lights", bpm: 118, mood: "Energetic" },
      { title: "Quarter Past Nine", bpm: 122, mood: "Bright" },
    ],
  },
  {
    query: "ambient drone, sci-fi, no tempo",
    results: [
      { title: "Deep Space Drift", bpm: 60, mood: "Atmospheric" },
      { title: "Signal Lost", bpm: 72, mood: "Eerie" },
      { title: "Exoplanet", bpm: 66, mood: "Vast" },
    ],
  },
]

export function SearchDemo() {
  const [queryText, setQueryText] = useState("")
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [demoIdx, setDemoIdx] = useState(0)
  const [phase, setPhase] = useState("typing")

  useEffect(() => {
    const demo = DEMO_QUERIES[demoIdx]
    let id

    if (phase === "typing") {
      if (queryText.length < demo.query.length) {
        id = setTimeout(
          () => setQueryText(demo.query.slice(0, queryText.length + 1)),
          55,
        )
      } else {
        id = setTimeout(() => {
          setResults(demo.results)
          setShowResults(true)
          setPhase("showing")
        }, 600)
      }
    } else if (phase === "showing") {
      id = setTimeout(() => setPhase("clearing"), 3200)
    } else if (phase === "clearing") {
      setShowResults(false)
      id = setTimeout(() => {
        setQueryText("")
        setResults([])
        setDemoIdx(i => (i + 1) % DEMO_QUERIES.length)
        setPhase("typing")
      }, 400)
    }

    return () => clearTimeout(id)
  }, [queryText, phase, demoIdx])

  return (
    <div className="border border-border rounded-sm p-4 bg-secondary/10">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
        <span className="text-xs text-muted-foreground/50 ml-2">
          trackyard.com — AI Search
        </span>
      </div>

      {/* Search input */}
      <div className="border border-border rounded-sm px-3 py-2 flex items-center gap-2 mb-4 bg-background">
        <span className="text-brand text-xs shrink-0">▸</span>
        <span className="text-sm text-foreground flex-1">{queryText}</span>
        <span className="w-0.5 h-4 bg-brand/80 animate-pulse shrink-0" />
      </div>

      {/* Results */}
      <div
        className={`space-y-1.5 transition-opacity duration-300 min-h-[7.5rem] ${
          showResults ? "opacity-100" : "opacity-0"
        }`}>
        {results.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between border border-border/40 rounded-sm px-3 py-2 bg-background/30">
            <span className="text-sm text-foreground">{r.title}</span>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{r.bpm} BPM</span>
              <span className="text-brand/70">{r.mood}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
