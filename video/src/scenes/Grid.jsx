import React from "react"
import { AbsoluteFill, interpolate } from "remotion"
import { C, F } from "../theme"
import { useFrame } from "../time"
import { FIELDS, GRID, GRID_STATS } from "../data"
import { EIO, p } from "../lib"
import { Check, MailIcon, SceneFade, SheetIcon } from "../components/ui"
import { ActionBtn, ABubble, ChatCard } from "../components/Chat"

// 0:48–1:02 — the whole tour at a glance: what's missing → drafted follow-ups → replies fill it in.

export const GRID_DUR = 420

const WIN = { x: 70, y: 110, w: 1350, h: 860 }
const NUM_W = 44
const SHOW_W = 266
const COL_W = 102
const ROW_H = 56
const TITLE_H = 62
const HEAD_H = 44
const GX = WIN.x + NUM_W + SHOW_W
const GY = WIN.y + TITLE_H + HEAD_H

const FLAG0 = 30
const FLAG_SPAN = 58
const DRAFTS0 = 92
const SEND = 196
const SENT = 206
const REPLY0 = 226

const MISSING = []
GRID.forEach((row, r) => row.cells.forEach((cell, c) => cell.start === "M" && MISSING.push([r, c])))
const flagAt = (r, c) => {
  const i = MISSING.findIndex(([mr, mc]) => mr === r && mc === c)
  return FLAG0 + (i / MISSING.length) * FLAG_SPAN
}

const ASKED_ROWS = GRID.map((row, r) => (row.cells.some((c) => c.start === "M") ? r : null)).filter((r) => r !== null)
const REPLY_ORDER = [3, 1, 2, 4, 6, 5, 8, 7, 10, 9, 11]
const replyAt = (r) => REPLY0 + REPLY_ORDER.indexOf(r) * 14

const DRAFT_PANEL = { x: 1450, y: 110, w: 410, h: 640 }
const DRAFT_H = 50
const draftY = (i) => DRAFT_PANEL.y + 62 + i * DRAFT_H

const cellState = (cell, r, c, f) => {
  if (cell.start === "C") return { kind: "C" }
  if (cell.start === "X") return { kind: "X" }
  const flagged = f >= flagAt(r, c)
  if (!flagged) return { kind: "M" }
  if (f < SENT) return { kind: "F", t: p(f, flagAt(r, c), 8) }
  const fillAt = replyAt(r) + c * 2
  if (cell.end === "C" && f >= fillAt) return { kind: "C", t: p(f, fillAt, 10) }
  return { kind: "A" }
}

export const Grid = () => {
  const f = useFrame()
  const inT = p(f, 0, 18)

  let flagged = 0
  let stillOut = 0
  GRID.forEach((row, r) =>
    row.cells.forEach((cell, c) => {
      const s = cellState(cell, r, c, f)
      if (s.kind === "F" || s.kind === "A") flagged++
      if (s.kind === "M" || s.kind === "F" || s.kind === "A") stillOut++
    })
  )

  return (
    <AbsoluteFill style={{ fontFamily: F.sans }}>
      <SceneFade dur={GRID_DUR} inF={10} outF={14}>
        {/* the sheet */}
        <div
          style={{
            position: "absolute",
            left: WIN.x,
            top: WIN.y,
            width: WIN.w,
            height: WIN.h,
            borderRadius: 16,
            background: "#ffffff",
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,.6)",
            opacity: inT,
            transform: `translateY(${(1 - inT) * 24}px)`,
            fontFamily: F.ui,
          }}>
          <div style={{ height: TITLE_H, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", borderBottom: "1px solid #e3e3e3" }}>
            <SheetIcon size={34} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#202124" }}>Advance Tracker — The Lanterns · Fall 2026</div>
              <div style={{ fontSize: 13, color: "#5f6368", marginTop: 2 }}>Google Sheets · kept current by your assistant</div>
            </div>
            <div style={{ flex: 1 }} />
            {f >= FLAG0 && (
              <div style={{ fontSize: 20, fontWeight: 700, color: f < SENT ? "#b08900" : stillOut > GRID_STATS.waiting ? "#b08900" : "#137333", fontVariantNumeric: "tabular-nums" }}>
                {f < SENT ? `${flagged} missing` : `${stillOut} still out`}
              </div>
            )}
          </div>
          {/* header row */}
          <div style={{ position: "absolute", left: 0, top: TITLE_H, height: HEAD_H, right: 0, background: "#f8f9fa", borderBottom: "1px solid #dadce0", display: "flex", alignItems: "center" }}>
            <div style={{ width: NUM_W }} />
            <div style={{ width: SHOW_W, fontSize: 15, fontWeight: 700, color: "#3c4043", paddingLeft: 10 }}>Show</div>
            {FIELDS.map((fl) => (
              <div key={fl} style={{ width: COL_W, fontSize: 14, fontWeight: 700, color: "#3c4043", textAlign: "center" }}>
                {fl}
              </div>
            ))}
          </div>
          {GRID.map((row, r) => {
            const y = TITLE_H + HEAD_H + r * ROW_H
            const replied = ASKED_ROWS.includes(r) && f >= replyAt(r)
            const replyPop = replied ? p(f, replyAt(r), 10) : 0
            return (
              <div key={r} style={{ position: "absolute", left: 0, top: y, height: ROW_H, right: 0, borderBottom: "1px solid #ececec", display: "flex", alignItems: "center" }}>
                <div style={{ width: NUM_W, height: "100%", background: "#f8f9fa", borderRight: "1px solid #dadce0", fontSize: 13, color: "#5f6368", display: "flex", alignItems: "center", justifyContent: "center" }}>{r + 2}</div>
                <div style={{ width: SHOW_W, paddingLeft: 10, display: "flex", alignItems: "baseline", gap: 10, whiteSpace: "nowrap", overflow: "hidden" }}>
                  <span style={{ fontSize: 14, color: "#5f6368", fontWeight: 600, width: 44 }}>{row.date}</span>
                  <span style={{ fontSize: 16, color: "#202124", fontWeight: 600 }}>{row.city.split(",")[0]}</span>
                  <span style={{ fontSize: 13, color: "#80868b" }}>{row.venue.split(" · ")[0]}</span>
                </div>
                {row.cells.map((cell, c) => (
                  <Cell key={c} cell={cell} s={cellState(cell, r, c, f)} />
                ))}
                {replyPop > 0 && f < replyAt(r) + 40 && (
                  <div style={{ position: "absolute", left: NUM_W + SHOW_W - 32, opacity: 1 - p(f, replyAt(r) + 24, 16), transform: `scale(${0.6 + 0.4 * replyPop})` }}>
                    <MailIcon size={22} />
                  </div>
                )}
              </div>
            )
          })}
          {/* footer stats */}
          {f >= 372 && (
            <div style={{ position: "absolute", left: 22, bottom: 22, display: "flex", gap: 14, opacity: p(f, 372, 14) }}>
              <Stat bg="#e6f4ea" fg="#137333">
                <Check size={18} color="#34a853" /> {GRID_STATS.filled} filled since 4 PM
              </Stat>
              <Stat bg="#fff7d6" fg="#8a6d00">{GRID_STATS.waiting} still waiting on replies</Stat>
              <Stat bg="#fde8e7" fg="#c5221f">{GRID_STATS.conflicts} need you</Stat>
            </div>
          )}
        </div>

        {/* drafts */}
        {f >= DRAFTS0 && (
          <>
            <svg width="1920" height="1080" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
              {ASKED_ROWS.map((r, i) => {
                const t = p(f, DRAFTS0 + i * 4, 18, EIO)
                const gone = p(f, SENT + i * 2, 10)
                const x0 = WIN.x + WIN.w - 4
                const y0 = GY + r * ROW_H + ROW_H / 2
                const x1 = DRAFT_PANEL.x + 10
                const y1 = draftY(i) + DRAFT_H / 2
                const d = `M${x0},${y0} C${x0 + 20},${y0} ${x1 - 20},${y1} ${x1},${y1}`
                return <path key={r} d={d} stroke={C.yellow} strokeWidth={2} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} opacity={0.8 * (1 - gone)} />
              })}
            </svg>
            <div
              style={{
                position: "absolute",
                left: DRAFT_PANEL.x,
                top: DRAFT_PANEL.y,
                width: DRAFT_PANEL.w,
                height: DRAFT_PANEL.h,
                borderRadius: 16,
                background: "#131316",
                border: "1px solid #2b2b31",
                opacity: p(f, DRAFTS0 - 6, 12),
                overflow: "hidden",
              }}>
              <div style={{ height: 62, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", borderBottom: "1px solid #232328" }}>
                <MailIcon size={28} />
                <div style={{ color: C.ink, fontSize: 19, fontWeight: 700 }}>{f < SENT ? "Drafts" : "Sent"}</div>
                <div style={{ color: C.muted, fontSize: 17 }}>· {ASKED_ROWS.filter((_, i) => f >= DRAFTS0 + i * 5).length}</div>
              </div>
              {ASKED_ROWS.map((r, i) => {
                const at = DRAFTS0 + i * 5
                if (f < at) return null
                const t = p(f, at, 12)
                const out = p(f, SENT + i * 2, 14, EIO)
                const row = GRID[r]
                const asks = row.cells.map((c, ci) => (c.start === "M" ? FIELDS[ci].toLowerCase() : null)).filter(Boolean)
                return (
                  <div
                    key={r}
                    style={{
                      position: "absolute",
                      left: 12,
                      right: 12,
                      top: draftY(i) - DRAFT_PANEL.y,
                      height: DRAFT_H - 6,
                      borderRadius: 10,
                      background: "#1d1d22",
                      borderLeft: `3px solid ${C.yellow}`,
                      padding: "5px 12px",
                      opacity: t * (1 - out),
                      transform: `translateX(${(1 - t) * 20 + out * 260}px)`,
                    }}>
                    <div style={{ color: C.ink, fontSize: 15, fontWeight: 700, whiteSpace: "nowrap" }}>
                      To: {row.venue.split(" · ")[0]} <span style={{ color: C.muted, fontWeight: 400 }}>· {row.city.split(",")[0]}</span>
                    </div>
                    <div style={{ color: C.muted, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                      Asking: {asks.slice(0, 3).join(", ")}
                      {asks.length > 3 ? ` +${asks.length - 3}` : ""}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <ChatCard f={f} enterAt={148} x={DRAFT_PANEL.x} y={DRAFT_PANEL.y + DRAFT_PANEL.h + 18} w={DRAFT_PANEL.w} h={206} compact>
          <ABubble f={f} at={156} size={18}>
            {GRID_STATS.venuesAsked} follow-ups drafted, one per venue, asking only for what's missing.
          </ABubble>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <ActionBtn f={f} at={170} label="Review" size={17} />
            <ActionBtn f={f} at={176} label="Send all" pressAt={SEND} doneLabel="Sent" size={17} primary />
          </div>
        </ChatCard>
      </SceneFade>
    </AbsoluteFill>
  )
}

const Cell = ({ cell, s }) => {
  const base = { width: COL_W - 6, height: ROW_H - 14, margin: "0 3px", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden" }
  if (s.kind === "C") {
    const t = s.t ?? 1
    return (
      <div style={{ ...base, background: `rgba(52,168,83,${0.14 + 0.25 * (1 - t)})`, color: "#137333", fontWeight: 600, transform: `scale(${interpolate(t, [0, 0.4, 1], [0.9, 1.06, 1])})` }}>
        {cell.value}
      </div>
    )
  }
  if (s.kind === "X") return <div style={{ ...base, background: "#fde8e7", color: "#c5221f", fontWeight: 700, boxShadow: "inset 0 0 0 2px #f28b82" }}>{cell.value}</div>
  if (s.kind === "F") return <div style={{ ...base, background: `rgba(255,221,0,${0.18 * s.t})`, color: "#b9b9b9", boxShadow: `inset 0 0 0 2px rgba(242,194,0,${s.t})` }}>—</div>
  if (s.kind === "A") return <div style={{ ...base, background: "#fffbe6", color: "#9a7b00", fontStyle: "italic", boxShadow: "inset 0 0 0 2px #f2c200" }}>asked</div>
  return <div style={{ ...base, background: "#f3f3f3", color: "#bdbdbd" }}>—</div>
}

const Stat = ({ bg, fg, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: bg, color: fg, fontSize: 18, fontWeight: 700 }}>{children}</div>
)
