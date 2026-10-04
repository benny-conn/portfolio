import React from "react"
import { AbsoluteFill, Img, staticFile } from "remotion"
import { C, F } from "../theme"
import { useFrame } from "../time"
import { p } from "../lib"
import { AssistantMark, SceneFade } from "../components/ui"

// The three layers of the job, then the close.

export const LAYERS_DUR = 150
export const CLOSE_DUR = 230

const LAYERS = [
  {
    n: "LAYER 3 · OPERATIONAL JUDGMENT",
    title: "You",
    sub: "Negotiation, relationships, priorities, emergencies, show day.",
    bg: "transparent",
    border: `2px solid ${C.ink}`,
    fg: C.ink,
    at: 34,
  },
  {
    n: "LAYER 2 · ADMINISTRATIVE EXECUTION",
    title: "Your assistant",
    sub: "Reads, matches, updates, chases, verifies. Keeps the plan complete and current.",
    bg: C.yellow,
    border: `2px solid ${C.yellow}`,
    fg: "#111",
    at: 20,
    glow: true,
  },
  {
    n: "LAYER 1 · SOURCE OF TRUTH",
    title: "Master Tour",
    sub: "The plan: dates, schedules, hotels, travel, contacts, guests, settlement.",
    bg: `linear-gradient(120deg, ${C.mt.headerA}, ${C.mt.headerB} 75%)`,
    border: "2px solid #2f4f86",
    fg: "#fff",
    at: 6,
  },
]

export const Layers = () => {
  const f = useFrame()
  const pulse = 0.5 + 0.5 * Math.sin(f / 8)
  return (
    <AbsoluteFill style={{ fontFamily: F.sans }}>
      <SceneFade dur={LAYERS_DUR} inF={6} outF={18}>
        {LAYERS.map((l, i) => {
          const t = p(f, l.at, 18)
          return (
            <div
              key={l.title}
              style={{
                position: "absolute",
                left: 380,
                top: 300 + i * 172,
                width: 1160,
                height: 148,
                borderRadius: 18,
                background: l.bg,
                border: l.border,
                padding: "26px 40px",
                display: "flex",
                alignItems: "center",
                gap: 40,
                opacity: t,
                transform: `translateY(${(1 - t) * 40}px)`,
                boxShadow: l.glow ? `0 0 ${50 + 30 * pulse}px rgba(255,221,0,${0.25 + 0.15 * pulse})` : "none",
              }}>
              <div style={{ width: 360 }}>
                <div style={{ color: l.fg, opacity: 0.7, fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>{l.n}</div>
                <div style={{ color: l.fg, fontSize: 42, fontWeight: 700, marginTop: 6 }}>{l.title}</div>
              </div>
              <div style={{ color: l.fg, opacity: 0.85, fontSize: 24, lineHeight: 1.35, flex: 1 }}>{l.sub}</div>
            </div>
          )
        })}
      </SceneFade>
    </AbsoluteFill>
  )
}

export const Close = () => {
  const f = useFrame()
  const cardIn = p(f, 0, 22)
  const fadeOut = p(f, CLOSE_DUR - 18, 18)
  return (
    <AbsoluteFill style={{ fontFamily: F.sans, opacity: 1 - fadeOut }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", opacity: cardIn, transform: `translateY(${(1 - cardIn) * 24}px)` }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <AssistantMark size={64} pulse={(f % 50) / 50} />
        </div>
        <div style={{ color: C.ink, fontSize: 76, fontWeight: 700, lineHeight: 1.08, marginTop: 44 }}>
          A personal AI assistant
          <br />
          for your tour operations.
        </div>
        <div style={{ color: C.muted, fontSize: 30, marginTop: 30, opacity: p(f, 104, 18) }}>Set up around the way your team already works.</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 64, opacity: p(f, 140, 18) }}>
          <Img src={staticFile("images/benny.jpg")} style={{ width: 60, height: 60, borderRadius: 30 }} />
          <div style={{ textAlign: "left" }}>
            <div style={{ color: C.ink, fontSize: 26, fontWeight: 700 }}>Benny Conn</div>
            <div style={{ color: C.muted, fontSize: 20, marginTop: 2 }}>Setup, automations & ongoing support · bennyconn.com</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
