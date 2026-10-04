import React from "react"
import { AbsoluteFill } from "remotion"
import { C, F } from "../theme"
import { useFrame } from "../time"
import { GRID_STATS, HERO_UPDATES } from "../data"
import { p } from "../lib"
import { AssistantMark, Check, SceneFade } from "../components/ui"
import { ABubble, ActionBtn, UBubble } from "../components/Chat"

// 1:20–1:30 — 1 AM on the bus. One message with the day, two decisions, done.

export const BUS_DUR = 300

const PHONE = { x: 740, y: 92, w: 440, h: 930 }

const LIGHTS = Array.from({ length: 9 }).map((_, i) => ({
  y: 160 + ((i * 137) % 760),
  speed: 22 + (i % 4) * 9,
  len: 120 + (i % 3) * 90,
  offset: (i * 523) % 1920,
  warm: i % 3 === 0,
}))

export const Bus = () => {
  const f = useFrame()
  const phoneIn = p(f, 0, 20)
  return (
    <AbsoluteFill style={{ fontFamily: F.sans }}>
      <SceneFade dur={BUS_DUR} inF={12} outF={16}>
        {/* passing road lights */}
        {LIGHTS.map((l, i) => {
          const x = 1920 + l.len - ((f * l.speed + l.offset) % (1920 + l.len * 2))
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: l.y,
                width: l.len,
                height: 3,
                borderRadius: 2,
                background: l.warm ? "rgba(255,190,90,.35)" : "rgba(160,190,255,.22)",
                filter: "blur(2px)",
              }}
            />
          )
        })}

        <div
          style={{
            position: "absolute",
            left: PHONE.x,
            top: PHONE.y,
            width: PHONE.w,
            height: PHONE.h,
            borderRadius: 60,
            background: "#1b1b1f",
            padding: 11,
            boxShadow: "0 50px 120px rgba(0,0,0,.8), 0 0 0 1px #2c2c31",
            opacity: phoneIn,
            transform: `translateY(${(1 - phoneIn) * 40}px)`,
          }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 50, background: "#0e0e10", overflow: "hidden", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 30px 0", color: C.ink, fontSize: 16, fontWeight: 700 }}>
              <span>1:10</span>
              <span style={{ width: 110, height: 30, borderRadius: 16, background: "#000", marginTop: -6 }} />
              <span>5G</span>
            </div>
            <ThreadTop />
            <div style={{ textAlign: "center", color: C.muted, fontSize: 13, marginTop: 10 }}>Today 1:10 AM</div>
            <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              <ABubble f={f} at={14} size={18} tail={false}>
                While you ran the show today:
              </ABubble>
              <ABubble f={f} at={28} size={17} tail={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "2px 0" }}>
                  {[
                    [`${GRID_STATS.filled + HERO_UPDATES} updates saved to Master Tour`, true],
                    [`${GRID_STATS.venuesAsked} venues followed up`, true],
                    ["Richmond day sheet drafted", true],
                    [`${GRID_STATS.waiting} items still out. I'm on them`, false],
                  ].map(([t, done], i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: p(f, 32 + i * 6, 10) }}>
                      {done ? <Check size={19} /> : <div style={{ width: 17, height: 17, borderRadius: 9, border: `2px solid ${C.yellow}` }} />}
                      {t}
                    </div>
                  ))}
                </div>
              </ABubble>
              <ABubble f={f} at={66} size={18}>
                <span style={{ color: "#ff6b61", fontWeight: 700 }}>2 things need you:</span>
              </ABubble>
              <ABubble f={f} at={78} size={17} tail={false}>
                <Decision title="Richmond curfew" sub="Set ends 10:45 · curfew is 10:30" />
              </ABubble>
              <Chips>
                <ActionBtn f={f} at={84} label="Ask Dana for 15 min" pressAt={140} doneLabel="Asked Dana" size={16} />
              </Chips>
              <ABubble f={f} at={90} size={17} tail={false}>
                <Decision title="Raleigh hotel" sub="Booked 10 rooms · rooming list has 12" />
              </ABubble>
              <Chips>
                <ActionBtn f={f} at={96} label="Send the draft to the hotel" pressAt={162} doneLabel="Sent to Glenwood Hotel" size={16} />
              </Chips>
              <UBubble f={f} at={190} size={18}>
                thanks. night
              </UBubble>
              <ABubble f={f} at={214} size={18}>
                Night. I'll keep an eye on the inbox.
              </ABubble>
            </div>
            <div style={{ position: "absolute", left: 14, right: 14, bottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: "#1f1f22", color: C.muted, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>+</div>
              <div style={{ flex: 1, height: 38, borderRadius: 19, border: "1px solid #303034", color: "#6b6b70", fontSize: 16, display: "flex", alignItems: "center", paddingLeft: 16 }}>Text message</div>
            </div>
          </div>
        </div>
      </SceneFade>
    </AbsoluteFill>
  )
}

const ThreadTop = () => (
  <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 0 10px", borderBottom: "1px solid #1f1f24", background: "rgba(28,28,30,.9)" }}>
    <div style={{ position: "absolute", left: 18, top: 22, color: "#0a84ff", fontSize: 30, lineHeight: 1 }}>‹</div>
    <AssistantMark size={46} />
    <div style={{ color: C.ink, fontSize: 14, fontWeight: 700 }}>
      Assistant <span style={{ color: C.muted, fontWeight: 400 }}>›</span>
    </div>
  </div>
)

const Chips = ({ children }) => <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 6, marginBottom: 4 }}>{children}</div>

const Decision = ({ title, sub }) => (
  <div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18 }}>
      <div style={{ width: 9, height: 9, borderRadius: 5, background: C.red }} />
      {title}
    </div>
    <div style={{ color: "#b9b6ae", fontSize: 16, marginTop: 3 }}>{sub}</div>
  </div>
)
