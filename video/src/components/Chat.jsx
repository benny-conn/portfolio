import React from "react"
import { interpolate } from "remotion"
import { C, F } from "../theme"
import { p } from "../lib"
import { Appear, AssistantMark, Check } from "./ui"

// A texting-style assistant (Muse / iMessage feel). Generic — not any real product's UI.
const RECEIVED = "#2a2a2d"
const SENT = "#0a84ff"

export const ChatCard = ({ f, x, y, w, h, enterAt = 0, badge, children, compact = false, time }) => {
  const t = p(f, enterAt, 18)
  if (f < enterAt) return null
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: t,
        transform: `translateY(${(1 - t) * 34}px)`,
        background: "#0b0b0d",
        border: "1px solid #2a2a2e",
        borderRadius: compact ? 26 : 34,
        boxShadow: "0 30px 90px rgba(0,0,0,.6)",
        overflow: "hidden",
        fontFamily: F.sans,
        zIndex: 40,
      }}>
      <ThreadHeader badge={badge} compact={compact} />
      {time && <div style={{ textAlign: "center", color: C.muted, fontSize: 14, marginTop: 12 }}>{time}</div>}
      <div style={{ padding: compact ? "10px 16px" : "12px 20px", display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </div>
  )
}

export const ThreadHeader = ({ badge, compact }) => (
  <div
    style={{
      position: "relative",
      display: "flex",
      flexDirection: compact ? "row" : "column",
      alignItems: "center",
      justifyContent: "center",
      gap: compact ? 10 : 6,
      padding: compact ? "12px 16px" : "16px 20px 12px",
      background: "rgba(30,30,33,.92)",
      borderBottom: "1px solid #232327",
    }}>
    <AssistantMark size={compact ? 28 : 46} />
    <div style={{ color: C.ink, fontSize: compact ? 17 : 16, fontWeight: 700 }}>
      Assistant <span style={{ color: C.muted, fontWeight: 400 }}>›</span>
    </div>
    {badge && <div style={{ position: "absolute", right: 16, top: compact ? 12 : 18 }}>{badge}</div>}
  </div>
)

const Tail = ({ side, color }) => (
  <svg
    width="20"
    height="18"
    viewBox="0 0 20 18"
    style={{ position: "absolute", bottom: 0, [side]: -7, transform: side === "right" ? "scaleX(-1)" : "none" }}>
    <path d="M14 0 C14 8 11 14 0 18 C9 18 15 16 20 12 L20 0 Z" fill={color} />
  </svg>
)

export const ABubble = ({ f, at, children, size = 21, tail = true, style }) => (
  <Appear f={f} at={at} dy={10} style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 6 }}>
    <div
      style={{
        position: "relative",
        maxWidth: "86%",
        background: RECEIVED,
        color: "#f2f2f2",
        fontSize: size,
        lineHeight: 1.36,
        padding: "10px 16px",
        borderRadius: 22,
        ...style,
      }}>
      {children}
      {tail && <Tail side="left" color={style?.background ?? RECEIVED} />}
    </div>
  </Appear>
)

export const UBubble = ({ f, at, children, size = 21 }) => (
  <Appear f={f} at={at} dy={10} style={{ display: "flex", justifyContent: "flex-end", paddingRight: 6 }}>
    <div style={{ position: "relative", maxWidth: "80%", background: SENT, color: "#fff", fontSize: size, lineHeight: 1.36, padding: "10px 16px", borderRadius: 22 }}>
      {children}
      <Tail side="right" color={SENT} />
    </div>
  </Appear>
)

// Quick-reply chip with an optional tap → sent state.
export const ActionBtn = ({ f, at, label, pressAt, doneLabel, size = 19, primary = false, style }) => {
  if (f < at) return null
  const t = p(f, at, 12)
  const pressed = pressAt !== undefined && f >= pressAt
  const press = pressAt !== undefined ? interpolate(f, [pressAt, pressAt + 4, pressAt + 10], [1, 0.93, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1
  const done = pressAt !== undefined && f >= pressAt + 10
  const ripple = pressAt !== undefined ? p(f, pressAt, 16) : 0
  const bg = done ? "#14261b" : pressed ? SENT : primary ? C.yellow : "#151517"
  const fg = done ? C.green : pressed ? "#fff" : primary ? "#111" : "#f2f2f2"
  const border = done ? "#2f6b45" : pressed ? SENT : primary ? C.yellow : "#3a3a3f"
  return (
    <div
      style={{
        position: "relative",
        opacity: t,
        transform: `translateY(${(1 - t) * 10}px) scale(${press})`,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 18px",
        borderRadius: 999,
        fontFamily: F.sans,
        fontWeight: 700,
        fontSize: size,
        overflow: "hidden",
        background: bg,
        color: fg,
        border: `1.5px solid ${border}`,
        ...style,
      }}>
      {pressed && ripple < 1 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 300 * ripple,
            height: 300 * ripple,
            marginLeft: -150 * ripple,
            marginTop: -150 * ripple,
            borderRadius: "50%",
            background: "rgba(255,255,255,.35)",
            opacity: 1 - ripple,
          }}
        />
      )}
      {done && <Check size={20} />}
      <span style={{ position: "relative" }}>{done && doneLabel ? doneLabel : label}</span>
    </div>
  )
}

// A text arriving as a phone notification banner.
export const MessageBanner = ({ f, at, x, y, w, children, time = "now" }) => {
  if (f < at) return null
  const t = p(f, at, 16)
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        opacity: t,
        transform: `translateY(${(1 - t) * -22}px) scale(${0.97 + 0.03 * t})`,
        background: "rgba(42,42,46,.96)",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 28,
        padding: "16px 22px",
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        boxShadow: "0 24px 70px rgba(0,0,0,.55)",
        fontFamily: F.sans,
        zIndex: 45,
      }}>
      <AssistantMark size={44} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ color: C.ink, fontSize: 19, fontWeight: 700 }}>Assistant</span>
          <span style={{ color: C.muted, fontSize: 15 }}>{time}</span>
        </div>
        <div style={{ color: "#e8e5de", fontSize: 21, lineHeight: 1.36, marginTop: 4 }}>{children}</div>
      </div>
    </div>
  )
}

// A fingertip tap indicator.
export const Tap = ({ f, at, x, y }) => {
  if (f < at - 8 || f > at + 18) return null
  const inT = p(f, at - 8, 8)
  const out = p(f, at + 4, 14)
  return (
    <div
      style={{
        position: "absolute",
        left: x - 26,
        top: y - 26,
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "rgba(255,255,255,.28)",
        border: "2px solid rgba(255,255,255,.7)",
        opacity: inT * (1 - out),
        transform: `scale(${1 + out * 0.5})`,
        zIndex: 80,
      }}
    />
  )
}
