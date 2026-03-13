"use client"

import { useState, useEffect, useRef } from "react"

// ─── Stripe payment flow ─────────────────────────────────────────────────────

const FLOW_STEPS = [
  {
    label: "Gig Booked",
    sub: "client confirms + pays",
    icon: "📅",
  },
  {
    label: "Payment Held",
    sub: "Stripe escrow · funds reserved",
    icon: "🔒",
  },
  {
    label: "Event Completes",
    sub: "band checks in · confirmed",
    icon: "🎺",
  },
  {
    label: "Auto-Split",
    sub: "each member paid instantly",
    icon: "💸",
  },
]

export function StripeFlow() {
  const [activeStep, setActiveStep] = useState(-1)
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
        setActiveStep(-1)
        setDone(false)
      }, 2400)
      return () => clearTimeout(id)
    }

    if (activeStep < FLOW_STEPS.length - 1) {
      const delay = activeStep === -1 ? 400 : 900
      const id = setTimeout(() => setActiveStep(s => s + 1), delay)
      return () => clearTimeout(id)
    } else {
      const id = setTimeout(() => setDone(true), 1000)
      return () => clearTimeout(id)
    }
  }, [started, activeStep, done])

  return (
    <div ref={ref} className="border border-border rounded-sm p-5 bg-secondary/10">
      <div className="flex items-center gap-1.5 mb-5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
        <span className="text-xs text-muted-foreground/50 ml-2">
          Stripe Connect — payment flow
        </span>
      </div>

      <div className="flex items-stretch gap-0">
        {FLOW_STEPS.map((step, i) => {
          const isActive = i === activeStep
          const isPast = i < activeStep || done
          return (
            <div key={i} className="flex items-center flex-1 min-w-0">
              <div
                className={`flex flex-col items-center text-center flex-1 min-w-0 p-2 rounded-sm border transition-all duration-400 ${
                  isActive
                    ? "border-brand/60 bg-brand/8"
                    : isPast
                      ? "border-border/40 bg-background/10 opacity-70"
                      : "border-border/20 opacity-25"
                }`}>
                <span className={`text-lg mb-1 transition-all duration-300 ${isActive ? "scale-110" : "scale-100"}`}>
                  {step.icon}
                </span>
                <p className={`text-xs font-medium leading-snug mb-0.5 transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground/50 leading-snug hidden sm:block">
                  {step.sub}
                </p>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className={`px-1 shrink-0 text-sm transition-colors duration-300 ${isPast || isActive ? "text-brand/60" : "text-muted-foreground/20"}`}>
                  →
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Stack in action diagram ─────────────────────────────────────────────────

const STACK_NODES = [
  { label: "React Native", sub: "iOS · Android", side: "client" },
  { label: "Next.js", sub: "Web app", side: "client" },
  { label: "Go API", sub: "REST · auth · gigs", side: "server" },
  { label: "PostgreSQL", sub: "Hetzner VPS", side: "server" },
]

export function StackDiagram() {
  const [active, setActive] = useState(null)
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
    let i = 0
    const run = () => {
      setActive(i % STACK_NODES.length)
      i++
      if (i < STACK_NODES.length * 2) {
        setTimeout(run, 500)
      } else {
        setTimeout(() => setActive(null), 400)
      }
    }
    const id = setTimeout(run, 300)
    return () => clearTimeout(id)
  }, [started])

  return (
    <div ref={ref} className="flex items-stretch">
      {STACK_NODES.map((node, i) => (
        <div key={i} className="flex items-center flex-1 min-w-0">
          <div
            className={`border rounded-sm px-2 py-3 text-center flex-1 min-w-0 transition-all duration-300 ${
              active === i
                ? "border-brand/60 bg-brand/5"
                : "border-border"
            }`}>
            <p className={`text-xs font-medium leading-snug transition-colors duration-300 ${active === i ? "text-foreground" : "text-foreground"}`}>
              {node.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">
              {node.sub}
            </p>
          </div>
          {i < STACK_NODES.length - 1 && (
            <div className={`px-1 shrink-0 text-sm transition-colors duration-300 ${active !== null && active >= i ? "text-brand/60" : "text-muted-foreground/40"}`}>
              →
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
