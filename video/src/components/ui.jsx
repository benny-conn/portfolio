import React from "react"
import { AbsoluteFill, interpolate } from "remotion"
import { useFrame } from "../time"
import { C, F } from "../theme"
import { EIO, arcPoint, p } from "../lib"

export const Appear = ({ f, at, dur = 14, dy = 18, children, style }) => {
  const t = p(f, at, dur)
  if (f < at) return null
  return (
    <div style={{ opacity: t, transform: `translateY(${(1 - t) * dy}px)`, ...style }}>
      {children}
    </div>
  )
}

export const SceneFade = ({ dur, inF = 12, outF = 12, children }) => {
  const f = useFrame()
  const o = Math.min(p(f, 0, inF), 1 - p(f, dur - outF, outF))
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>
}

export const Chip = ({ children, bg = C.yellow, fg = "#111", size = 22, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: `${size * 0.36}px ${size * 0.72}px`,
      borderRadius: 999,
      background: bg,
      color: fg,
      fontFamily: F.sans,
      fontWeight: 700,
      fontSize: size,
      whiteSpace: "nowrap",
      boxShadow: "0 10px 30px rgba(0,0,0,.45)",
      ...style,
    }}>
    {children}
  </div>
)

// A chip that flies along an arc from `from` to `to` (absolute px).
export const FlyChip = ({ f, start, dur = 22, from, to, arc = -140, children, chipProps }) => {
  if (f < start || f > start + dur) return null
  const t = p(f, start, dur, EIO)
  const [x, y] = arcPoint(from, to, t, arc)
  const s = interpolate(t, [0, 0.15, 1], [0.7, 1.06, 0.86])
  const o = interpolate(t, [0, 0.08, 0.88, 1], [0, 1, 1, 0])
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s})`,
        opacity: o,
        zIndex: 60,
      }}>
      <Chip {...chipProps}>{children}</Chip>
    </div>
  )
}

export const Check = ({ size = 22, color = C.green, t = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
    <circle cx="12" cy="12" r="11" fill={color} opacity={Math.min(1, t * 3)} />
    <path
      d="M7 12.5l3.2 3.2L17 9"
      fill="none"
      stroke="#0b0b0b"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="16"
      strokeDashoffset={16 * (1 - t)}
    />
  </svg>
)

export const AssistantMark = ({ size = 40, pulse = 0, glow = 1 }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
    {pulse > 0 && pulse < 1 && (
      <div
        style={{
          position: "absolute",
          left: -size * 0.6 * pulse,
          top: -size * 0.6 * pulse,
          width: size * (1 + 1.2 * pulse),
          height: size * (1 + 1.2 * pulse),
          borderRadius: "50%",
          border: `2px solid ${C.yellow}`,
          opacity: 1 - pulse,
        }}
      />
    )}
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 34% 30%, #fff8b8 0%, ${C.yellow} 42%, #d9b300 100%)`,
        boxShadow: `0 0 ${size * 0.7 * glow}px rgba(255,221,0,${0.45 * glow})`,
      }}
    />
  </div>
)

export const Pill = ({ children, color = C.red, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "5px 12px",
      borderRadius: 999,
      background: `${color}22`,
      border: `1px solid ${color}88`,
      color,
      fontFamily: F.sans,
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      ...style,
    }}>
    {children}
  </div>
)

export const Spinner = ({ f, size = 18, color = C.yellow }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `rotate(${f * 14}deg)` }}>
    <circle cx="12" cy="12" r="9" fill="none" stroke={`${color}33`} strokeWidth="3" />
    <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
)

export const Label = ({ children, style }) => (
  <div
    style={{
      fontFamily: F.sans,
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      color: C.muted,
      ...style,
    }}>
    {children}
  </div>
)

export const MailIcon = ({ size = 40 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: "linear-gradient(180deg,#5aa0ff,#2f6fe4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M3.5 7l8.5 6 8.5-6" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  </div>
)

export const MsgIcon = ({ size = 40 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: "linear-gradient(180deg,#5fe07c,#28b44a)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
      <path d="M12 4c-5 0-9 3.2-9 7.2 0 2.3 1.3 4.3 3.4 5.6L6 20l3.6-2.1c.8.2 1.6.3 2.4.3 5 0 9-3.2 9-7.2S17 4 12 4z" fill="#fff" />
    </svg>
  </div>
)

export const DocIcon = ({ size = 40, color = "#e5484d", label = "PDF" }) => (
  <div
    style={{
      width: size * 0.8,
      height: size,
      borderRadius: 6,
      background: "#f4f4f5",
      position: "relative",
      flexShrink: 0,
      boxShadow: "0 4px 12px rgba(0,0,0,.3)",
    }}>
    <div
      style={{
        position: "absolute",
        bottom: size * 0.14,
        left: 0,
        right: 0,
        margin: "0 auto",
        width: size * 0.62,
        background: color,
        color: "#fff",
        fontFamily: F.ui,
        fontWeight: 800,
        fontSize: size * 0.2,
        textAlign: "center",
        borderRadius: 3,
      }}>
      {label}
    </div>
  </div>
)

export const SheetIcon = ({ size = 34 }) => (
  <div
    style={{
      width: size * 0.78,
      height: size,
      borderRadius: 4,
      background: "#1fa463",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 12 12">
      <rect x="1" y="1" width="10" height="10" fill="none" stroke="#fff" strokeWidth="1.4" />
      <path d="M1 4.5h10M1 8h10M5 1v10" stroke="#fff" strokeWidth="1.2" />
    </svg>
  </div>
)

export const CursorIcon = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,.6))" }}>
    <path d="M5 3l14 8.2-6.2 1.4L9.6 19z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)
