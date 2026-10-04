import React from "react"
import { C, F } from "../theme"
import { MT_SHOWS, TOUR } from "../data"
import { Check } from "./ui"

const NAV = ["Dashboard", "Events", "Hotels", "Travel", "Schedule", "Tasks & Notes", "Advance", "Guest List", "Set List", "Accounting", "Attachments"]

export const MT = { titleH: 46, navW: 168, listW: 232, headerH: 108, rowH: 64 }

// Simplified Master Tour desktop window (dark theme), drawn from reference
// screenshots of the sandbox tour. `children` render in the content area.
export const MTWindow = ({
  x,
  y,
  w,
  h,
  nav = "Dashboard",
  selected = null,
  scan = null,
  header,
  children,
  style,
}) => {
  const contentW = w - MT.navW - MT.listW
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 14,
        overflow: "hidden",
        background: C.mt.bg,
        border: "1px solid #2a2c38",
        boxShadow: "0 40px 100px rgba(0,0,0,.6)",
        fontFamily: F.sans,
        color: C.mt.text,
        ...style,
      }}>
      {/* title bar */}
      <div
        style={{
          height: MT.titleH,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 16px",
          background: "#181a22",
          borderBottom: `1px solid ${C.mt.line}`,
        }}>
        <div style={{ display: "flex", gap: 7 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
          ))}
        </div>
        <div style={{ fontWeight: 700, fontSize: 19, marginLeft: 10 }}>Master Tour</div>
        <div style={{ color: C.mt.muted, fontSize: 16 }}>{TOUR.name} ▾</div>
      </div>
      <div style={{ display: "flex", height: h - MT.titleH }}>
        {/* nav */}
        <div style={{ width: MT.navW, background: C.mt.side, paddingTop: 10, borderRight: `1px solid ${C.mt.line}` }}>
          {NAV.map((n) => (
            <div
              key={n}
              style={{
                height: 36,
                display: "flex",
                alignItems: "center",
                paddingLeft: 18,
                fontSize: 15,
                color: n === nav ? "#fff" : C.mt.muted,
                background: n === nav ? "#252836" : "transparent",
                borderRight: n === nav ? `3px solid ${C.mt.red}` : "3px solid transparent",
              }}>
              {n}
            </div>
          ))}
        </div>
        {/* content */}
        <div style={{ position: "relative", width: contentW, overflow: "hidden" }}>
          {header && <MTHeader {...header} />}
          {children}
        </div>
        {/* date list */}
        <div style={{ width: MT.listW, background: "#15161c", borderLeft: `1px solid ${C.mt.line}` }}>
          <div
            style={{
              height: 34,
              display: "flex",
              alignItems: "center",
              paddingLeft: 14,
              fontSize: 13,
              letterSpacing: 1,
              color: C.mt.muted,
              background: "#1b1d26",
            }}>
            OCTOBER 2026
          </div>
          {MT_SHOWS.map((s, i) => {
            const isSel = selected === i
            const scanA = scan && scan.idx === i ? scan.alpha : 0
            return (
              <div
                key={s.date}
                style={{
                  position: "relative",
                  height: MT.rowH,
                  padding: "10px 12px 0 14px",
                  display: "flex",
                  gap: 10,
                  background: isSel ? "#262936" : "transparent",
                  borderLeft: `3px solid ${isSel ? C.mt.red : "transparent"}`,
                  borderBottom: `1px solid #1f212b`,
                }}>
                {scanA > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `rgba(255,221,0,${0.16 * scanA})`,
                      boxShadow: `inset 0 0 0 2px rgba(255,221,0,${0.85 * scanA})`,
                    }}
                  />
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: C.mt.muted, width: 38 }}>{s.date}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{s.venue}</div>
                  <div style={{ fontSize: 13, fontStyle: "italic", color: C.mt.muted, marginTop: 2 }}>{s.city}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const MTHeader = ({ title, sub, date, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: MT.headerH,
      padding: "20px 22px",
      background: `linear-gradient(120deg, ${C.mt.headerA}, ${C.mt.headerB} 70%)`,
      opacity,
    }}>
    <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{title}</div>
    <div style={{ fontSize: 16, color: "#c7cede", marginTop: 6 }}>{sub}</div>
    <div style={{ position: "absolute", right: 22, top: 22, textAlign: "right" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{date}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#c7cede", marginTop: 8 }}>Show Day</div>
    </div>
  </div>
)

export const MTPanel = ({ x, y, w, h, title, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: C.mt.panel,
      border: `1px solid ${C.mt.line}`,
      borderRadius: 4,
      overflow: "hidden",
    }}>
    <div
      style={{
        height: 38,
        display: "flex",
        alignItems: "center",
        paddingLeft: 14,
        fontSize: 13,
        letterSpacing: 1.4,
        color: C.mt.muted,
        borderBottom: `1px solid ${C.mt.line}`,
      }}>
      {title}
    </div>
    {children}
  </div>
)

// A single field. state: empty | flash | set | verified
export const MTField = ({ label, value, h = 70, flash = 0, verifyT = 0, empty = false, accent = false }) => (
  <div
    style={{
      position: "relative",
      height: h,
      padding: "12px 14px",
      borderBottom: `1px solid #1b1d26`,
      borderLeft: accent ? `3px solid ${C.mt.red}` : "3px solid transparent",
    }}>
    {flash > 0 && (
      <div
        style={{
          position: "absolute",
          inset: 2,
          borderRadius: 4,
          background: `rgba(255,221,0,${0.32 * flash})`,
          boxShadow: `inset 0 0 0 2px rgba(255,221,0,${flash})`,
        }}
      />
    )}
    <div style={{ position: "relative", fontSize: 12, letterSpacing: 1.2, color: C.mt.muted, textTransform: "uppercase" }}>{label}</div>
    <div
      style={{
        position: "relative",
        fontSize: 18,
        fontWeight: 700,
        marginTop: 6,
        color: empty ? "#4a4e5c" : "#fff",
        whiteSpace: "nowrap",
      }}>
      {empty ? "—" : value}
    </div>
    {verifyT > 0 && (
      <div style={{ position: "absolute", right: 12, top: h / 2 - 11 }}>
        <Check size={22} t={verifyT} />
      </div>
    )}
  </div>
)
