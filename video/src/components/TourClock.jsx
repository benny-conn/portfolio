import React from "react"
import { interpolate, useCurrentFrame } from "remotion"
import { C, F } from "../theme"
import { CLOCK, SCENES } from "../timeline"
import { RUN_OF_SHOW, TOUR } from "../data"
import { fmtTime, p } from "../lib"

const TRACK_X0 = 640
const TRACK_X1 = 1500

const clockAt = (f) => {
  for (let i = 0; i < CLOCK.length - 1; i++) {
    const [f0, m0] = CLOCK[i]
    const [f1, m1] = CLOCK[i + 1]
    if (f >= f0 && f <= f1) return interpolate(f, [f0, f1], [m0, m1])
  }
  return CLOCK[CLOCK.length - 1][1]
}

const trackX = (mins) => {
  const n = RUN_OF_SHOW.length
  const xs = RUN_OF_SHOW.map((_, i) => TRACK_X0 + ((TRACK_X1 - TRACK_X0) * i) / (n - 1))
  if (mins <= RUN_OF_SHOW[0].t) return TRACK_X0 - 40 * (1 - Math.max(0, (mins - 7 * 60) / 120))
  for (let i = 0; i < n - 1; i++) {
    if (mins <= RUN_OF_SHOW[i + 1].t) {
      return interpolate(mins, [RUN_OF_SHOW[i].t, RUN_OF_SHOW[i + 1].t], [xs[i], xs[i + 1]])
    }
  }
  return TRACK_X1
}

// Layer 3 — your own day — always running along the top of the frame.
export const TourClock = () => {
  const f = useCurrentFrame()
  const endStart = SCENES.layers[0]
  const vis = Math.min(p(f, 6, 20), 1 - p(f, endStart - 12, 14))
  if (vis <= 0) return null
  const mins = clockAt(f)
  const x = trackX(mins)
  // little roll whenever the clock jumps between scenes
  const jumps = CLOCK.filter((k, i) => i > 0 && k[1] - CLOCK[i - 1][1] > 30 && k[0] - CLOCK[i - 1][0] < 10).map((k) => k[0])
  const lastJump = jumps.filter((j) => j <= f).pop()
  const roll = lastJump !== undefined ? p(f, lastJump, 12) : 1
  const current = [...RUN_OF_SHOW].reverse().find((s) => mins >= s.t)
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 74,
        opacity: vis,
        fontFamily: F.sans,
        background: "linear-gradient(180deg, rgba(9,9,10,.96), rgba(9,9,10,.82))",
        borderBottom: `1px solid ${C.line}`,
        zIndex: 100,
      }}>
      <div style={{ position: "absolute", left: 56, top: 17 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2.6, color: C.ink }}>YOUR DAY</div>
        <div style={{ fontSize: 13, letterSpacing: 2.2, color: C.muted, marginTop: 5 }}>
          {TOUR.today.date} · {TOUR.today.city} · {TOUR.today.venue}
        </div>
      </div>
      {/* track */}
      <div style={{ position: "absolute", left: TRACK_X0, top: 28, width: TRACK_X1 - TRACK_X0, height: 2, background: "#2a2a2e" }} />
      <div style={{ position: "absolute", left: TRACK_X0, top: 28, width: Math.max(0, x - TRACK_X0), height: 2, background: C.ink }} />
      {RUN_OF_SHOW.map((s, i) => {
        const sx = TRACK_X0 + ((TRACK_X1 - TRACK_X0) * i) / (RUN_OF_SHOW.length - 1)
        const passed = mins >= s.t
        const isCur = current && current.label === s.label
        return (
          <div key={s.label}>
            <div
              style={{
                position: "absolute",
                left: sx - 5,
                top: 24,
                width: 10,
                height: 10,
                borderRadius: 5,
                background: passed ? C.ink : "#09090a",
                border: `2px solid ${passed ? C.ink : "#3a3a3e"}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: sx - 60,
                width: 120,
                top: 42,
                textAlign: "center",
                fontSize: 13,
                letterSpacing: 0.6,
                fontWeight: isCur ? 700 : 400,
                color: isCur ? C.ink : passed ? "#76736c" : "#4d4b47",
              }}>
              {s.label}
            </div>
          </div>
        )
      })}
      <div style={{ position: "absolute", left: x - 7, top: 22, width: 14, height: 14, borderRadius: 7, background: C.ink, boxShadow: "0 0 12px rgba(243,240,232,.6)" }} />
      <div
        style={{
          position: "absolute",
          right: 56,
          top: 14,
          fontSize: 34,
          fontWeight: 700,
          color: C.ink,
          fontVariantNumeric: "tabular-nums",
          opacity: roll,
          transform: `translateY(${(1 - roll) * 14}px)`,
        }}>
        {fmtTime(mins)}
      </div>
    </div>
  )
}
