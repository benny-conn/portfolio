import React from "react"
import { AbsoluteFill } from "remotion"
import { C, F } from "../theme"
import { useFrame } from "../time"
import { EIO, arcPoint, p } from "../lib"
import { Chip, Pill, SceneFade } from "../components/ui"
import { ABubble, ActionBtn, ChatCard } from "../components/Chat"

// 0:36–0:48 — the new curfew collides with the set. The assistant asks instead of guessing.

export const CATCH_DUR = 360

const CARD = { x: 90, y: 170, w: 1110, h: 520 }
const AX0 = 60
const PX_H = 198
const H0 = 18.5 // 6:30 PM
const tx = (h) => AX0 + (h - H0) * PX_H
const LANE_Y = 200
const LANE_H = 130
const CURFEW = 22.5
const DROP = 34

const BLOCKS = [
  { from: 20, to: 20.75, label: "Support", sub: "8:00 – 8:45", bg: "#2a2c36", fg: "#b9bdc9" },
  { from: 21.25, to: 22.75, label: "The Lanterns", sub: "9:15 – 10:45 PM", bg: C.mt.block, fg: "#fff" },
  { from: 22.75, to: 23.5, label: "Load-out", sub: "", bg: "#1a1c24", fg: "#6c7182" },
]

export const Catch = () => {
  const f = useFrame()
  const cardIn = p(f, 0, 18)
  const chipT = p(f, 4, 26, EIO)
  const drop = p(f, DROP, 16)
  const over = p(f, DROP + 18, 14)
  const pulse = f > DROP + 18 ? 0.55 + 0.45 * Math.sin((f - DROP - 18) / 5) : 0
  const cx = CARD.x + tx(CURFEW)
  const [chipX, chipY] = arcPoint([960, 560], [cx, CARD.y + 120], chipT, -60)

  return (
    <AbsoluteFill style={{ fontFamily: F.sans }}>
      <SceneFade dur={CATCH_DUR} inF={8} outF={14}>
        <div
          style={{
            position: "absolute",
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD.h,
            borderRadius: 18,
            background: C.mt.bg,
            border: "1px solid #2a2c38",
            boxShadow: "0 40px 100px rgba(0,0,0,.6)",
            opacity: cardIn,
            transform: `translateY(${(1 - cardIn) * 20}px)`,
            overflow: "hidden",
          }}>
          <div style={{ padding: "24px 30px", background: `linear-gradient(120deg, ${C.mt.headerA}, ${C.mt.headerB} 70%)` }}>
            <div style={{ color: "#c7cede", fontSize: 15, letterSpacing: 1.6 }}>MASTER TOUR · SCHEDULE</div>
            <div style={{ color: "#fff", fontSize: 30, fontWeight: 700, marginTop: 6 }}>Thu, Oct 22 · River Room, Richmond</div>
          </div>
          {/* hour grid */}
          {[19, 20, 21, 22, 23].map((h) => (
            <div key={h}>
              <div style={{ position: "absolute", left: tx(h), top: 120, bottom: 70, width: 1, background: "#22242e" }} />
              <div style={{ position: "absolute", left: tx(h) - 40, width: 80, textAlign: "center", bottom: 30, color: C.mt.muted, fontSize: 16 }}>
                {h - 12}:00 PM
              </div>
            </div>
          ))}
          {/* doors */}
          <div style={{ position: "absolute", left: tx(19), top: LANE_Y - 40, color: C.mt.muted, fontSize: 15 }}>Doors 7:00</div>
          {BLOCKS.map((b) => (
            <div
              key={b.label}
              style={{
                position: "absolute",
                left: tx(b.from) + 2,
                width: (b.to - b.from) * PX_H - 4,
                top: LANE_Y,
                height: LANE_H,
                borderRadius: 8,
                background: b.bg,
                padding: "16px 16px",
                overflow: "hidden",
              }}>
              <div style={{ color: b.fg, fontSize: 21, fontWeight: 700 }}>{b.label}</div>
              <div style={{ color: b.fg, opacity: 0.75, fontSize: 16, marginTop: 6 }}>{b.sub}</div>
            </div>
          ))}
          {/* overlap */}
          {over > 0 && (
            <div
              style={{
                position: "absolute",
                left: tx(CURFEW),
                width: (22.75 - CURFEW) * PX_H - 2,
                top: LANE_Y,
                height: LANE_H,
                borderRadius: "0 8px 8px 0",
                background: `rgba(255,82,71,${0.55 + 0.35 * pulse})`,
                boxShadow: `0 0 ${30 * pulse}px rgba(255,82,71,.7)`,
                opacity: over,
              }}
            />
          )}
          {/* curfew line */}
          {drop > 0 && (
            <>
              <div style={{ position: "absolute", left: tx(CURFEW) - 1.5, top: 120, width: 3, height: (LANE_Y + LANE_H + 12 - 120) * drop, background: C.red, boxShadow: "0 0 16px rgba(255,82,71,.8)" }} />
              <div style={{ position: "absolute", left: tx(CURFEW) - 210, top: 128, width: 200, textAlign: "right", opacity: drop }}>
                <div style={{ color: C.red, fontSize: 16, fontWeight: 700, letterSpacing: 1.4 }}>NEW CURFEW</div>
                <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>10:30 PM</div>
              </div>
            </>
          )}
          {over > 0 && (
            <div style={{ position: "absolute", left: tx(22.75) - 420, width: 420, textAlign: "right", top: LANE_Y + LANE_H + 18, opacity: p(f, DROP + 28, 12) }}>
              <div style={{ color: C.red, fontSize: 22, fontWeight: 700 }}>Set runs 15 min past curfew</div>
            </div>
          )}
        </div>

        {/* curfew chip arriving from the email */}
        {chipT < 1 && (
          <div style={{ position: "absolute", left: chipX, top: chipY, transform: `translate(-50%,-50%) scale(${1 - 0.25 * chipT})`, opacity: 1 - p(f, 24, 8), zIndex: 60 }}>
            <Chip bg={C.red} fg="#fff" size={24}>
              Curfew 10:30 PM
            </Chip>
          </div>
        )}

        {/* the assistant asks */}
        <ChatCard f={f} enterAt={104} x={1240} y={150} w={600} h={560} time="Today 2:05 PM" badge={<Pill color={C.red}>Needs you</Pill>}>
          <ABubble f={f} at={116} tail={false}>
            River Room moved its weeknight curfew to <b>10:30 PM</b>. The Lanterns are scheduled until <b>10:45</b>.
          </ABubble>
          <ABubble f={f} at={150}>I haven't changed the schedule. How do you want to handle it?</ABubble>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, marginTop: 14 }}>
            <ActionBtn f={f} at={184} label="Ask Dana for a 15-min extension" />
            <ActionBtn f={f} at={192} label="Start the set at 9:00 PM" />
            <ActionBtn f={f} at={200} label="I'll call her myself" />
          </div>
        </ChatCard>

        {/* legend: what it did vs what it left for you */}
        <div style={{ position: "absolute", left: CARD.x, top: CARD.y + CARD.h + 40, display: "flex", gap: 40, opacity: p(f, 228, 16) }}>
          <Legend color={C.green} text="Facts it confirmed: saved" />
          <Legend color={C.red} text="Decisions: yours" />
        </div>
      </SceneFade>
    </AbsoluteFill>
  )
}

const Legend = ({ color, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 14, height: 14, borderRadius: 7, background: color }} />
    <div style={{ color: C.ink, fontSize: 24, fontWeight: 700 }}>{text}</div>
  </div>
)
