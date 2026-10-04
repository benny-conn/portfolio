import React from "react"
import { AbsoluteFill, Img, staticFile } from "remotion"
import { C, F } from "../theme"
import { useFrame } from "../time"
import { EIO, p } from "../lib"
import { AssistantMark, MsgIcon, SceneFade, SheetIcon } from "../components/ui"

// What you're actually buying: Benny sets up an assistant + automations for your tour,
// wired into the tools your team already uses, and keeps tuning it.

export const SERVICE_DUR = 600

const HUB = [1340, 600]
const RX = 390
const RY = 268
const BENNY = { x: 110, y: 270 }

const STEPS = [
  { n: 1, title: "Learns how your team works", sub: "Your advance process, approvals, where info lives.", at: 82 },
  { n: 2, title: "Configures your assistant", sub: "A personal AI assistant + automations, built for your tour.", at: 151 },
  { n: 3, title: "Keeps it tuned", sub: "Testing, fixes and improvements, all tour long.", at: 497 },
]

const Glyph = ({ bg, children, fg = "#fff", size = 34 }) => (
  <div style={{ width: size, height: size, borderRadius: 9, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.42, fontFamily: F.ui, flexShrink: 0 }}>
    {children}
  </div>
)

const TOOLS = [
  { name: "Master Tour", at: 286, icon: <Glyph bg={`linear-gradient(140deg, ${C.mt.headerA}, ${C.mt.headerB})`}>MT</Glyph>, primary: true },
  {
    name: "Gmail",
    at: 316,
    icon: (
      <Glyph bg="#ffffff">
        <svg width="22" height="22" viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="#d93025" strokeWidth="2.2" />
          <path d="M3.5 7l8.5 6 8.5-6" fill="none" stroke="#d93025" strokeWidth="2.2" />
        </svg>
      </Glyph>
    ),
  },
  { name: "Google Sheets", at: 353, icon: <SheetIcon size={34} /> },
  {
    name: "Google Docs",
    at: 382,
    icon: (
      <Glyph bg="#4285f4">
        <svg width="18" height="18" viewBox="0 0 12 12">
          <path d="M2.5 3h7M2.5 6h7M2.5 9h4.5" stroke="#fff" strokeWidth="1.4" />
        </svg>
      </Glyph>
    ),
  },
  { name: "Slack", at: 406, icon: <Glyph bg="#4a154b">#</Glyph> },
  { name: "WhatsApp", at: 430, icon: <MsgIcon size={34} /> },
  { name: "Calendar", at: 440, icon: <Glyph bg="#ffffff" fg="#1a73e8">31</Glyph> },
  { name: "Dropbox", at: 450, icon: <Glyph bg="#0061ff">◆</Glyph> },
  { name: "+ whatever you use", at: 462, dashed: true },
]

const toolPos = (i) => {
  const a = ((-90 + i * 40) * Math.PI) / 180
  return [HUB[0] + RX * Math.cos(a), HUB[1] + RY * Math.sin(a)]
}

export const Service = () => {
  const f = useFrame()
  const hubIn = p(f, 130, 18)
  const link = p(f, 136, 34, EIO)
  return (
    <AbsoluteFill style={{ fontFamily: F.sans }}>
      <SceneFade dur={SERVICE_DUR} inF={10} outF={16}>
        <div style={{ position: "absolute", left: 110, top: 104, opacity: p(f, 8, 14) }}>
          <div style={{ color: C.muted, fontSize: 18, fontWeight: 700, letterSpacing: 3 }}>THE SERVICE</div>
          <div style={{ color: C.ink, fontSize: 54, fontWeight: 700, marginTop: 2 }}>Benny sets it up for your tour.</div>
        </div>

        {/* Benny */}
        <div style={{ position: "absolute", left: BENNY.x, top: BENNY.y, display: "flex", alignItems: "center", gap: 24, opacity: p(f, 60, 16), transform: `translateY(${(1 - p(f, 60, 16)) * 16}px)` }}>
          <Img src={staticFile("images/benny.jpg")} style={{ width: 132, height: 132, borderRadius: 66, border: `3px solid ${C.ink}` }} />
          <div>
            <div style={{ color: C.ink, fontSize: 36, fontWeight: 700 }}>Benny Conn</div>
            <div style={{ color: C.muted, fontSize: 21, marginTop: 6 }}>Setup · automations · ongoing support</div>
          </div>
        </div>

        {/* steps */}
        {STEPS.map((s, i) => {
          const t = p(f, s.at, 14)
          return (
            <div key={s.n} style={{ position: "absolute", left: BENNY.x, top: 480 + i * 128, width: 600, display: "flex", gap: 20, opacity: t, transform: `translateX(${(1 - t) * -20}px)` }}>
              <div style={{ width: 46, height: 46, borderRadius: 23, border: `2px solid ${C.yellow}`, color: C.yellow, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</div>
              <div>
                <div style={{ color: C.ink, fontSize: 28, fontWeight: 700 }}>{s.title}</div>
                <div style={{ color: C.muted, fontSize: 21, marginTop: 6, lineHeight: 1.35 }}>{s.sub}</div>
              </div>
            </div>
          )
        })}

        {/* connectors */}
        <svg width="1920" height="1080" style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <filter id="sglow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          {/* Benny → assistant */}
          {link > 0 && (
            <path
              d={`M${BENNY.x + 450},${BENNY.y + 66} C${BENNY.x + 700},${BENNY.y + 66} ${HUB[0] - 300},${HUB[1]} ${HUB[0] - 70},${HUB[1]}`}
              stroke={C.ink}
              strokeWidth="2"
              strokeDasharray="8 8"
              fill="none"
              opacity={0.55 * link}
            />
          )}
          {TOOLS.map((tool, i) => {
            const t = p(f, tool.at, 16, EIO)
            if (t <= 0) return null
            const [x, y] = toolPos(i)
            const ex = x + (HUB[0] - x) * t
            const ey = y + (HUB[1] - y) * t
            return (
              <g key={tool.name}>
                <line x1={x} y1={y} x2={ex} y2={ey} stroke={C.yellow} strokeWidth="5" opacity="0.3" filter="url(#sglow)" />
                <line x1={x} y1={y} x2={ex} y2={ey} stroke={C.yellow} strokeWidth="2.2" opacity={tool.dashed ? 0.5 : 0.9} strokeDasharray={tool.dashed ? "6 8" : "none"} />
              </g>
            )
          })}
          {f > 330 &&
            TOOLS.map((tool, i) => {
              if (f < tool.at + 16 || tool.dashed) return null
              const [x, y] = toolPos(i)
              const t = ((f - tool.at + i * 9) % 40) / 40
              return <circle key={`p${i}`} cx={x + (HUB[0] - x) * t} cy={y + (HUB[1] - y) * t} r={4.5} fill={C.yellow} />
            })}
        </svg>
        {link >= 1 && (
          <div style={{ position: "absolute", left: (BENNY.x + 450 + HUB[0] - 70) / 2 - 60, top: (BENNY.y + 66 + HUB[1]) / 2 - 44, color: C.muted, fontSize: 17, fontStyle: "italic", opacity: p(f, 170, 12) }}>configures</div>
        )}

        {/* the assistant */}
        {hubIn > 0 && (
          <div style={{ position: "absolute", left: HUB[0] - 220, top: HUB[1] - 50, width: 440, textAlign: "center", opacity: hubIn, transform: `scale(${0.85 + 0.15 * hubIn})` }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AssistantMark size={84} pulse={((f - 130) % 50) / 50} />
            </div>
            <div style={{ display: "inline-block", marginTop: 12, padding: "8px 16px", borderRadius: 14, background: "rgba(9,9,10,.92)", border: "1px solid #26262a" }}>
              <div style={{ color: C.yellow, fontSize: 25, fontWeight: 700 }}>Your tour's assistant</div>
              <div style={{ color: C.muted, fontSize: 17, marginTop: 2, whiteSpace: "nowrap" }}>configured for The Lanterns · Fall 2026</div>
            </div>
          </div>
        )}

        {/* their tools */}
        {TOOLS.map((tool, i) => {
          const t = p(f, tool.at, 14)
          if (t <= 0) return null
          const [x, y] = toolPos(i)
          return (
            <div
              key={tool.name}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * t})`,
                opacity: t,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: tool.dashed ? "12px 20px" : "10px 18px 10px 10px",
                borderRadius: 16,
                background: tool.dashed ? "rgba(255,221,0,.06)" : "#141416",
                border: tool.dashed ? `1.5px dashed ${C.yellow}` : tool.primary ? "1.5px solid #3a5a96" : "1px solid #2c2c31",
                boxShadow: "0 14px 40px rgba(0,0,0,.5)",
                whiteSpace: "nowrap",
              }}>
              {tool.icon}
              <div style={{ color: tool.dashed ? C.yellow : C.ink, fontSize: 20, fontWeight: 700 }}>{tool.name}</div>
            </div>
          )
        })}
      </SceneFade>
    </AbsoluteFill>
  )
}
