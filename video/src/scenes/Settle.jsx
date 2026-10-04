import React from "react"
import { AbsoluteFill } from "remotion"
import { C, F } from "../theme"
import { useFrame } from "../time"
import { EIO, p } from "../lib"
import { Check, SceneFade } from "../components/ui"
import { MessageBanner } from "../components/Chat"

// 1:12–1:20 — tonight's settlement, checked against the contract before you walk in.

export const SETTLE_DUR = 240

const ROWS = [
  { label: "Production", cap: "$4,000", billed: "$4,000" },
  { label: "Security", cap: "$900", billed: "$900" },
  { label: "Stagehands", cap: "$1,600", billed: "$1,600" },
  { label: "Catering", cap: "$1,200", billed: "$1,850", over: true },
]
const LEFT = { x: 150, y: 260, w: 740, h: 580 }
const RIGHT = { x: 1030, y: 260, w: 740, h: 580 }
const rowY = (i) => 236 + i * 74

const Card = ({ box, title, sub, children, t }) => (
  <div
    style={{
      position: "absolute",
      left: box.x,
      top: box.y,
      width: box.w,
      height: box.h,
      borderRadius: 18,
      background: "#121215",
      border: "1px solid #29292f",
      boxShadow: "0 40px 100px rgba(0,0,0,.55)",
      opacity: t,
      transform: `translateY(${(1 - t) * 24}px)`,
      overflow: "hidden",
    }}>
    <div style={{ padding: "26px 34px", borderBottom: "1px solid #232328" }}>
      <div style={{ color: C.muted, fontSize: 15, fontWeight: 700, letterSpacing: 2.2 }}>{sub}</div>
      <div style={{ color: C.ink, fontSize: 30, fontWeight: 700, marginTop: 6 }}>{title}</div>
    </div>
    {children}
  </div>
)

export const Settle = () => {
  const f = useFrame()
  const over = p(f, 134, 12)
  const pulse = f > 134 ? 0.6 + 0.4 * Math.sin((f - 134) / 5) : 0
  return (
    <AbsoluteFill style={{ fontFamily: F.sans }}>
      <SceneFade dur={SETTLE_DUR} inF={10} outF={14}>
        <div style={{ position: "absolute", left: 150, top: 118, opacity: p(f, 2, 14) }}>
          <div style={{ color: C.muted, fontSize: 18, fontWeight: 700, letterSpacing: 3 }}>TONIGHT · LANTERN HALL, NEW YORK</div>
          <div style={{ color: C.ink, fontSize: 54, fontWeight: 700, marginTop: 2 }}>Settlement</div>
        </div>

        <Card box={LEFT} sub="YOUR DEAL · FROM THE CONTRACT" title="$7,500 guarantee vs 85% of net" t={p(f, 6, 16)}>
          <div style={{ position: "absolute", left: 34, top: 176, color: C.muted, fontSize: 15, fontWeight: 700, letterSpacing: 2 }}>EXPENSE CAPS</div>
          {ROWS.map((r, i) => (
            <Row key={r.label} y={rowY(i)} label={r.label} value={r.cap} t={p(f, 14 + i * 5, 12)} />
          ))}
        </Card>

        <Card box={RIGHT} sub="VENUE SETTLEMENT SHEET" title="Expenses as billed" t={p(f, 22, 16)}>
          <div style={{ position: "absolute", left: 34, top: 176, color: C.muted, fontSize: 15, fontWeight: 700, letterSpacing: 2 }}>LINE ITEMS</div>
          {ROWS.map((r, i) => {
            const checkT = !r.over ? p(f, 100 + i * 8, 10) : 0
            return (
              <Row key={r.label} y={rowY(i)} label={r.label} value={r.billed} t={p(f, 30 + i * 5, 12)} red={r.over ? over : 0} pulse={r.over ? pulse : 0}>
                {checkT > 0 && <Check size={26} t={checkT} />}
                {r.over && over > 0 && (
                  <div style={{ background: C.red, color: "#fff", fontSize: 18, fontWeight: 700, padding: "6px 12px", borderRadius: 8, opacity: over }}>+$650 over cap</div>
                )}
              </Row>
            )
          })}
        </Card>

        {/* yellow match lines between the two documents */}
        <svg width="1920" height="1080" style={{ position: "absolute", left: 0, top: 0 }}>
          {ROWS.map((r, i) => {
            const t = p(f, 62 + i * 6, 20, EIO)
            const y = LEFT.y + rowY(i) + 30
            const color = r.over && f >= 134 ? C.red : C.yellow
            return <line key={i} x1={LEFT.x + LEFT.w} y1={y} x2={LEFT.x + LEFT.w + (RIGHT.x - LEFT.x - LEFT.w) * t} y2={y} stroke={color} strokeWidth={3} opacity={t > 0 ? 0.9 : 0} />
          })}
        </svg>

        <MessageBanner f={f} at={160} x={(1920 - 900) / 2} y={872} w={900}>
          Catering is billed at $1,850. Your contract caps it at $1,200. <b style={{ color: C.red }}>That's $650 to raise before you sign.</b>
        </MessageBanner>
      </SceneFade>
    </AbsoluteFill>
  )
}

const Row = ({ y, label, value, t, red = 0, pulse = 0, children }) => (
  <div
    style={{
      position: "absolute",
      left: 18,
      right: 18,
      top: y,
      height: 60,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 16px",
      opacity: t,
      background: red > 0 ? `rgba(255,82,71,${0.12 + 0.12 * pulse})` : "transparent",
      boxShadow: red > 0 ? `inset 0 0 0 2px rgba(255,82,71,${red})` : "none",
    }}>
    <div style={{ color: C.ink, fontSize: 24, flex: 1 }}>{label}</div>
    <div style={{ color: red > 0 ? C.red : C.ink, fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    {children}
  </div>
)
