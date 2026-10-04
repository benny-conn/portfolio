import React from "react"
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion"
import { C, F } from "../theme"
import { useFrame } from "../time"
import { MT_SHOWS, NOTIFS } from "../data"
import { EIO, arcPoint, lerp, p } from "../lib"
import { AssistantMark, CursorIcon, DocIcon, MailIcon, MsgIcon, SheetIcon } from "../components/ui"

// 0:00–0:17 — inbox overload → the plan scattered across tools → the assistant connects them.

const T_N = (i) => 18 + i * 14
const FLY0 = 228
const flyStart = (i) => FLY0 + (NOTIFS.length - 1 - i) * 4

const TILES = {
  mail: { x: 330, y: 330, label: "Gmail", icon: <MailIcon size={30} /> },
  texts: { x: 1590, y: 330, label: "Messages", icon: <MsgIcon size={30} /> },
  pdf: { x: 330, y: 790, label: "PDFs & attachments", icon: <DocIcon size={30} /> },
  sheets: { x: 1590, y: 790, label: "Sheets & Docs", icon: <SheetIcon size={28} /> },
}
const TILE_W = 400
const TILE_H = 250

const MT_BOX = { x: 630, y: 390, w: 660, h: 400 }
const MARK = [960, 905]

// rows × 8 dots; 1 = known, 0 = missing
const DOTS = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 1, 1],
  [1, 1, 1, 0, 1, 1, 0, 1],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 1, 0, 0, 0],
]
// manual copy/paste trips: [tile, row, col]
const TRIPS = [
  ["mail", 3, 2],
  ["texts", 4, 3],
  ["pdf", 4, 6],
]
const TRIP0 = 300

const dotPos = (r, c) => [MT_BOX.x + 392 + c * 34, MT_BOX.y + 78 + r * 60]

const cubic = (a, b, c, d, t) => {
  const u = 1 - t
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ]
}

// Each link is a list of cubic segments [a, b, c, d], routed around the Master Tour window.
const ML = [MARK[0] - 30, MARK[1]]
const MR = [MARK[0] + 30, MARK[1]]
const LINKS = [
  [
    [[530, 400], [585, 400], [585, 430], [585, 520]],
    [[585, 520], [585, 880], [700, MARK[1]], ML],
  ],
  [
    [[1390, 400], [1335, 400], [1335, 430], [1335, 520]],
    [[1335, 520], [1335, 880], [1220, MARK[1]], MR],
  ],
  [[[530, 800], [650, 800], [760, MARK[1]], ML]],
  [[[1390, 800], [1270, 800], [1160, MARK[1]], MR]],
]
const MT_LINK = [[[MARK[0], MARK[1] - 30], [MARK[0], 850], [MARK[0], 820], [MARK[0], MT_BOX.y + MT_BOX.h]]]

const linkPath = (segs) => segs.map(([a, b, c, d], i) => `${i === 0 ? `M${a[0]},${a[1]} ` : ""}C${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`).join(" ")
const linkPoint = (segs, t) => {
  const n = segs.length
  const i = Math.min(n - 1, Math.floor(t * n))
  const [a, b, c, d] = segs[i]
  return cubic(a, b, c, d, t * n - i)
}

export const Intro = () => {
  const f = useFrame()

  const appeared = NOTIFS.filter((_, i) => f >= T_N(i)).length
  const counter = Math.round(112 + interpolate(f, [T_N(0), T_N(9) + 10], [0, 35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
  const counterO = 1 - p(f, FLY0 - 4, 12)

  const tileIn = (k) => p(f, 212 + k * 6, 18)
  const mtIn = p(f, 252, 22)
  const cursorO = Math.min(p(f, TRIP0 - 10, 8), 1 - p(f, 392, 10))
  const markIn = p(f, 396, 16)
  const lineT = p(f, 505, 30, EIO)

  // cursor path for the manual copy/paste trips
  let cursor = [960, 1010]
  let cursorNote = null
  TRIPS.forEach(([tile, r, c], k) => {
    const t0 = TRIP0 + k * 30
    const src = [TILES[tile].x + 20, TILES[tile].y + 30]
    const dst = dotPos(r, c)
    const prev = k === 0 ? [960, 1010] : dotPos(TRIPS[k - 1][1], TRIPS[k - 1][2])
    if (f >= t0 && f < t0 + 12) cursor = arcPoint(prev, src, p(f, t0, 12, EIO), -40)
    else if (f >= t0 + 12 && f < t0 + 15) {
      cursor = src
      cursorNote = "copy"
    } else if (f >= t0 + 15 && f < t0 + 27) cursor = arcPoint(src, dst, p(f, t0 + 15, 12, EIO), -60)
    else if (f >= t0 + 27) {
      cursor = dst
      if (f < t0 + 30) cursorNote = "paste"
    }
  })

  return (
    <AbsoluteFill style={{ fontFamily: F.sans }}>
      {/* unread counter */}
      {counterO > 0 && f >= T_N(0) && (
        <div style={{ position: "absolute", left: 960 - 330, top: 168, width: 660, display: "flex", justifyContent: "space-between", opacity: counterO * p(f, T_N(0), 10) }}>
          <div style={{ color: C.muted, fontSize: 18, letterSpacing: 2, fontWeight: 700 }}>NOTIFICATIONS</div>
          <div style={{ color: C.ink, fontSize: 18, fontWeight: 700 }}>
            {counter} <span style={{ color: C.muted, fontWeight: 400 }}>unread</span>
          </div>
        </div>
      )}

      {/* source tiles */}
      {Object.entries(TILES).map(([key, tile], k) => {
        const t = tileIn(k)
        if (t <= 0) return null
        const landed = NOTIFS.filter((n, i) => n.to === key && f >= flyStart(i) + 24).length
        const lit = p(f, 510 + k * 5, 16)
        return (
          <div
            key={key}
            style={{
              position: "absolute",
              left: tile.x - TILE_W / 2,
              top: tile.y - TILE_H / 2,
              width: TILE_W,
              height: TILE_H,
              borderRadius: 20,
              background: "#121214",
              border: `1.5px solid ${lit > 0 ? `rgba(255,221,0,${0.15 + 0.55 * lit})` : "#26262b"}`,
              boxShadow: lit > 0 ? `0 0 ${40 * lit}px rgba(255,221,0,${0.12 * lit})` : "none",
              opacity: t,
              transform: `scale(${0.92 + 0.08 * t})`,
              padding: 20,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {tile.icon}
              <div style={{ color: C.ink, fontSize: 20, fontWeight: 700 }}>{tile.label}</div>
              <div style={{ flex: 1 }} />
              {landed > 0 && (
                <div style={{ minWidth: 30, height: 30, borderRadius: 15, background: C.red, color: "#fff", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
                  {landed}
                </div>
              )}
            </div>
            <TileBody kind={key} />
          </div>
        )
      })}

      {/* Master Tour (the plan) */}
      {mtIn > 0 && (
        <div
          style={{
            position: "absolute",
            left: MT_BOX.x,
            top: MT_BOX.y,
            width: MT_BOX.w,
            height: MT_BOX.h,
            borderRadius: 16,
            overflow: "hidden",
            background: C.mt.bg,
            border: "1px solid #2c2f3d",
            boxShadow: "0 40px 100px rgba(0,0,0,.6)",
            opacity: mtIn,
            transform: `translateY(${(1 - mtIn) * 24}px)`,
          }}>
          <div style={{ height: 48, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", background: `linear-gradient(120deg, ${C.mt.headerA}, ${C.mt.headerB})` }}>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>Master Tour</div>
            <div style={{ color: "#c7cede", fontSize: 16 }}>The Lanterns — Fall 2026</div>
            <div style={{ flex: 1 }} />
            <div style={{ color: "#c7cede", fontSize: 14, letterSpacing: 1.5 }}>THE PLAN</div>
          </div>
          {MT_SHOWS.map((s, r) => (
            <div key={s.date} style={{ position: "absolute", left: 20, top: 66 + r * 60, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ color: C.mt.muted, fontSize: 15, fontWeight: 700, width: 46 }}>{s.date}</div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, width: 150 }}>{s.venue}</div>
              <div style={{ color: C.mt.muted, fontSize: 15, width: 120 }}>{s.city.split(",")[0]}</div>
            </div>
          ))}
          {DOTS.map((row, r) =>
            row.map((known, c) => {
              const [dx, dy] = dotPos(r, c)
              const trip = TRIPS.findIndex(([, tr, tc]) => tr === r && tc === c)
              const manual = trip >= 0 && f >= TRIP0 + trip * 30 + 27
              const order = r * 8 + c
              const auto = !known && !manual && f >= 538 + (order % 17) * 1.5
              const fill = known || manual ? C.ink : auto ? C.green : "#2f3140"
              const ring = auto && f < 538 + (order % 17) * 1.5 + 10
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    position: "absolute",
                    left: dx - MT_BOX.x - 9,
                    top: dy - MT_BOX.y - 9,
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    background: fill,
                    boxShadow: ring ? `0 0 0 4px rgba(255,221,0,.6)` : "none",
                  }}
                />
              )
            })
          )}
        </div>
      )}

      {/* notifications */}
      {NOTIFS.map((n, i) => {
        if (f < T_N(i)) return null
        const inT = p(f, T_N(i), 12)
        const depth = NOTIFS.reduce((acc, _, j) => (j > i ? acc + p(f, T_N(j), 10) : acc), 0)
        const stackY = 230 + 98 * Math.min(depth, 4) + 26 * Math.max(0, depth - 4)
        const stackS = 1 - 0.035 * Math.min(depth, 6)
        const stackO = interpolate(depth, [4, 7], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        const fs = flyStart(i)
        const flyT = p(f, fs, 26, EIO)
        if (flyT >= 1) return null
        const tile = TILES[n.to]
        const [fx, fy] = arcPoint([960, stackY + 43], [tile.x, tile.y], flyT, -80)
        const x = flyT > 0 ? fx : 960
        const y = flyT > 0 ? fy : stackY + 43 - (1 - inT) * 40
        const s = flyT > 0 ? lerp(stackS, 0.32, flyT) : stackS * (0.96 + 0.04 * inT)
        const o = flyT > 0 ? Math.max(stackO, 0.6) * (1 - p(f, fs + 16, 10)) : stackO * inT
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 330,
              top: y - 43,
              width: 660,
              height: 86,
              transform: `scale(${s})`,
              opacity: o,
              zIndex: i,
              borderRadius: 22,
              background: "rgba(34,34,38,.97)",
              border: "1px solid rgba(255,255,255,.08)",
              boxShadow: "0 18px 40px rgba(0,0,0,.5)",
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "0 20px",
            }}>
            {n.app === "mail" ? <MailIcon size={44} /> : <MsgIcon size={44} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ color: C.ink, fontSize: 19, fontWeight: 700 }}>{n.from}</div>
                <div style={{ color: C.muted, fontSize: 14 }}>now</div>
              </div>
              <div style={{ color: "#b9b6ae", fontSize: 18, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {n.attach ? "📎 " : ""}
                {n.subject}
              </div>
            </div>
          </div>
        )
      })}

      {/* manual copy/paste cursor */}
      {cursorO > 0 && (
        <div style={{ position: "absolute", left: cursor[0] - 6, top: cursor[1] - 4, opacity: cursorO, zIndex: 70 }}>
          <CursorIcon size={36} />
          {cursorNote && (
            <div style={{ position: "absolute", left: 34, top: 26, color: C.ink, fontSize: 16, fontWeight: 700, background: "#000a", padding: "2px 8px", borderRadius: 6 }}>{cursorNote}</div>
          )}
        </div>
      )}

      {/* the assistant connects everything */}
      {markIn > 0 && (
        <>
          <svg width="1920" height="1080" style={{ position: "absolute", left: 0, top: 0 }}>
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>
            {[...LINKS, MT_LINK].map((segs, k) => {
              const d = linkPath(segs)
              return (
                <g key={k}>
                  <path d={d} stroke={C.yellow} strokeWidth="6" fill="none" opacity={0.35} filter="url(#glow)" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - lineT} />
                  <path d={d} stroke={C.yellow} strokeWidth="2.5" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - lineT} />
                </g>
              )
            })}
            {f >= 535 &&
              LINKS.map((segs, k) =>
                [0, 1].map((n) => {
                  const t = ((f - 535 + n * 22 + k * 7) % 44) / 44
                  const [px, py] = linkPoint(segs, t)
                  return <circle key={`${k}-${n}`} cx={px} cy={py} r={5} fill={C.yellow} opacity={0.9} />
                })
              )}
          </svg>
          <div style={{ position: "absolute", left: MARK[0] - 30, top: MARK[1] - 30, opacity: markIn, transform: `scale(${0.6 + 0.4 * markIn})` }}>
            <AssistantMark size={60} pulse={(f - 396) % 40 / 40} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: MARK[1] + 40, textAlign: "center", opacity: p(f, 400, 14) }}>
            <div style={{ color: C.yellow, fontSize: 26, fontWeight: 700 }}>Your personal AI assistant</div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 10, opacity: p(f, 412, 14) }}>
              <Img src={staticFile("images/benny.jpg")} style={{ width: 30, height: 30, borderRadius: 15 }} />
              <div style={{ color: C.ink, fontSize: 19 }}>
                Set up for your tour by <b>Benny Conn</b>
              </div>
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  )
}

const bar = (w, c = "#2c2c31", h = 10) => <div style={{ width: w, height: h, borderRadius: h / 2, background: c }} />

const TileBody = ({ kind }) => {
  if (kind === "mail")
    return (
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {[200, 240, 180, 220].map((w, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: i < 3 ? "#5aa0ff" : "transparent" }} />
            {bar(90, "#3a3a40")}
            {bar(w - 60)}
          </div>
        ))}
      </div>
    )
  if (kind === "texts")
    return (
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["can I get +2 for DC?", false],
          ["did DC confirm merch?", true],
          ["need the Raleigh input list", false],
        ].map(([t, right], i) => (
          <div key={i} style={{ alignSelf: right ? "flex-end" : "flex-start", background: right ? "#2a2a30" : "#1e1e22", color: "#a9a69e", fontSize: 15, padding: "7px 12px", borderRadius: 12 }}>
            {t}
          </div>
        ))}
      </div>
    )
  if (kind === "pdf")
    return (
      <div style={{ marginTop: 22, display: "flex", gap: 22 }}>
        {["tech-pack-v3", "rider-2026", "RG-44812"].map((n) => (
          <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <DocIcon size={64} />
            <div style={{ color: "#a9a69e", fontSize: 13 }}>{n}.pdf</div>
          </div>
        ))}
      </div>
    )
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} style={{ height: 22, background: i < 6 ? "#2a2c30" : [3, 8, 14, 19].includes(i) ? "#1f4d33" : "#1b1b1e", borderRadius: 2 }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 14, color: "#a9a69e", fontSize: 14 }}>
        <span>Rooming list</span>
        <span>Budget</span>
        <span>Day sheet</span>
      </div>
    </div>
  )
}
