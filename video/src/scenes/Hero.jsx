import React from "react"
import { AbsoluteFill, interpolate } from "remotion"
import { C, F } from "../theme"
import { useFrame } from "../time"
import { RICHMOND_EMAIL } from "../data"
import { p } from "../lib"
import { Chip, FlyChip, Pill, SceneFade, Spinner } from "../components/ui"
import { MT, MTField, MTHeader, MTPanel, MTWindow } from "../components/MasterTour"
import { MessageBanner } from "../components/Chat"

// 0:17–0:36 — one venue reply → matched to the right show → fields updated → verified.

export const HERO_DUR = 570

const MAIL = { x: 70, y: 110, w: 770, h: 760 }
const WIN = { x: 880, y: 110, w: 980, h: 760 }
const CONTENT = { x: WIN.x + MT.navW, y: WIN.y + MT.titleH }
const BODY_Y = MAIL.y + 190
const LH = 48
const lineY = (k) => BODY_Y + k * LH + LH / 2

const SCAN0 = 30
const SCAN_DUR = 52
const scanAt = (k) => SCAN0 + ((lineY(k) - BODY_Y) / (11 * LH)) * SCAN_DUR
const KEY_LINES = [0, 1, 2, 3, 4, 5, 7, 8]

const MATCH = 92
const SELECT = 124
const FILL0 = 168
const VERIFY = 300
const HOLD = 336

const SCHED = (f, loadIn) => [
  { label: "Lobby call", value: "12:45 PM" },
  { label: "Load-in", value: "2:00 PM", ...loadIn },
  { label: "Soundcheck", value: "4:30 PM" },
  { label: "Doors", value: "7:00 PM" },
  { label: "Support", value: "8:00 PM" },
  { label: "The Lanterns", value: "9:15 – 10:45 PM" },
]

const UPDATES = [
  { line: 1, chip: "Load-in 2:00 PM", target: [CONTENT.x + 120, CONTENT.y + 124 + 38 + 66 + 33] },
  { line: 2, chip: "1 bus spot · Canal St", target: [CONTENT.x + 298 + 120, CONTENT.y + 124 + 38 + 40] },
  { line: 3, chip: "Shore power 50A", target: [CONTENT.x + 298 + 120, CONTENT.y + 124 + 38 + 80 + 40] },
  { line: 4, chip: "Buyout · $25 pp", target: [CONTENT.x + 298 + 120, CONTENT.y + 124 + 38 + 160 + 40] },
  { line: 5, chip: "Dana Whitfield", target: [CONTENT.x + 298 + 120, CONTENT.y + 124 + 38 + 240 + 40] },
]
const landAt = (k) => FILL0 + k * 22 + 22
const verifyAt = (k) => VERIFY + 22 + k * 6

const ADVANCE = [
  { label: "Bus parking", value: "1 bus spot · Canal St" },
  { label: "Power", value: "Shore power · 50A" },
  { label: "Catering", value: "Buyout · $25 pp" },
  { label: "Settlement contact", value: "Dana Whitfield" },
]

export const Hero = () => {
  const f = useFrame()
  const inT = p(f, 0, 18)
  const scanY = interpolate(f, [SCAN0, SCAN0 + SCAN_DUR], [BODY_Y - 6, BODY_Y + 11 * LH], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const scanO = f >= SCAN0 && f <= SCAN0 + SCAN_DUR + 6 ? 1 - p(f, SCAN0 + SCAN_DUR, 6) : 0

  const scanIdx = f >= MATCH + 6 && f < SELECT ? Math.min(3, Math.floor((f - MATCH - 6) / 6)) : null
  const selected = f >= SELECT ? 3 : 0
  const ric = p(f, SELECT + 4, 18)
  const tagT = Math.min(p(f, SELECT, 12), 1 - p(f, 176, 12))
  const allVerified = f >= verifyAt(4) + 8

  return (
    <AbsoluteFill style={{ fontFamily: F.sans }}>
      <SceneFade dur={HERO_DUR} outF={12}>
        {/* the email */}
        <div
          style={{
            position: "absolute",
            left: MAIL.x,
            top: MAIL.y,
            width: MAIL.w,
            height: MAIL.h,
            borderRadius: 18,
            background: "#fbfbfa",
            boxShadow: "0 40px 100px rgba(0,0,0,.6)",
            overflow: "hidden",
            opacity: inT,
            transform: `translateX(${(1 - inT) * -40}px)`,
            fontFamily: F.ui,
            color: "#1f1f1f",
          }}>
          <div style={{ height: 44, background: "#f1f3f4", display: "flex", alignItems: "center", padding: "0 20px", gap: 10, color: "#5f6368", fontSize: 15 }}>
            <span style={{ fontWeight: 700, color: "#3c4043" }}>Inbox</span>
            <span>›</span>
            <span>Advance</span>
          </div>
          <div style={{ padding: "22px 40px 0" }}>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.2 }}>{RICHMOND_EMAIL.subject}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: "#7b5ea7", color: "#fff", fontWeight: 700, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {RICHMOND_EMAIL.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>
                  {RICHMOND_EMAIL.from} <span style={{ fontWeight: 400, color: "#5f6368", fontSize: 15 }}>&lt;{RICHMOND_EMAIL.email}&gt;</span>
                </div>
                <div style={{ fontSize: 14, color: "#5f6368", marginTop: 2 }}>to me, production</div>
              </div>
              <div style={{ fontSize: 14, color: "#5f6368" }}>{RICHMOND_EMAIL.time}</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, top: 168, height: 1, background: "#e3e3e3" }} />
          {RICHMOND_EMAIL.lines.map((line, k) => {
            const isKey = KEY_LINES.includes(k)
            const hl = isKey ? p(f, scanAt(k), 8) : 0
            const held = (k === 7 || k === 8) && f >= HOLD
            const heldT = held ? p(f, HOLD, 12) : 0
            const used = UPDATES.find((u) => u.line === k)
            const usedT = used ? p(f, FILL0 + UPDATES.indexOf(used) * 22, 10) : 0
            const wash = held
              ? `rgba(255,82,71,${0.1 + 0.08 * heldT})`
              : hl > 0
                ? `rgba(255,221,0,${0.32 * hl * (1 - 0.6 * usedT)})`
                : "transparent"
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: 26,
                  right: 26,
                  top: lineY(k) - MAIL.y - LH / 2 + 4,
                  height: LH - 8,
                  borderRadius: 6,
                  background: wash,
                  borderLeft: hl > 0 ? `4px solid ${held ? C.red : C.yellow}` : "4px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 10,
                  fontSize: 23,
                  color: "#202124",
                }}>
                {line}
                {k === 8 && held && (
                  <Pill color={C.red} style={{ marginLeft: 18, opacity: heldT, background: "#fde4e2" }}>
                    Held for you
                  </Pill>
                )}
              </div>
            )
          })}
          {scanO > 0 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: scanY - MAIL.y, height: 3, background: C.yellow, boxShadow: `0 0 24px 6px rgba(255,221,0,.55)`, opacity: scanO }} />
          )}
        </div>

        {/* Master Tour */}
        <MTWindow
          {...WIN}
          selected={selected}
          scan={scanIdx !== null ? { idx: scanIdx, alpha: 1 } : f >= SELECT && f < SELECT + 14 ? { idx: 3, alpha: 1 - p(f, SELECT, 14) } : null}
          style={{ opacity: inT, transform: `translateX(${(1 - inT) * 40}px)` }}>
          <MTHeader title="Lantern Hall NYC" sub="New York, NY 10036" date="Mon, Oct 19" opacity={1 - ric} />
          <MTHeader title="River Room Richmond" sub="Richmond, VA 23220" date="Thu, Oct 22" opacity={ric} />
          {/* NYC (today) panels, fading out */}
          <div style={{ position: "absolute", inset: 0, opacity: (1 - ric) * 0.55 }}>
            <MTPanel x={14} y={124} w={272} h={436} title="SCHEDULE">
              {["9:00 AM", "11:00 AM", "4:00 PM", "7:00 PM", "8:00 PM", "9:15 – 10:45 PM"].map((v, i) => (
                <MTField key={i} h={66} label={["Lobby call", "Load-in", "Soundcheck", "Doors", "Support", "The Lanterns"][i]} value={v} />
              ))}
            </MTPanel>
            <MTPanel x={298} y={124} w={268} h={436} title="ADVANCE">
              {["Bus · 44th St", "50A", "Buyout · $30 pp", "J. Ortiz"].map((v, i) => (
                <MTField key={i} h={80} label={ADVANCE[i].label} value={v} />
              ))}
            </MTPanel>
          </div>
          {/* Richmond panels */}
          <div style={{ position: "absolute", inset: 0, opacity: ric }}>
            <MTPanel x={14} y={124} w={272} h={436} title="SCHEDULE">
              {SCHED(f).map((row, i) => {
                const isLoad = i === 1
                const landed = isLoad && f >= landAt(0)
                return (
                  <MTField
                    key={i}
                    h={66}
                    label={row.label}
                    value={row.value}
                    empty={isLoad && !landed}
                    flash={landed ? 1 - p(f, landAt(0), 40) : 0}
                    verifyT={isLoad ? p(f, verifyAt(0), 10) : 0}
                    accent={i === 5}
                  />
                )
              })}
            </MTPanel>
            <MTPanel x={298} y={124} w={268} h={436} title="ADVANCE">
              {ADVANCE.map((row, i) => {
                const k = i + 1
                const landed = f >= landAt(k)
                return <MTField key={i} h={80} label={row.label} value={row.value} empty={!landed} flash={landed ? 1 - p(f, landAt(k), 40) : 0} verifyT={p(f, verifyAt(k), 10)} />
              })}
            </MTPanel>
            {/* status footer */}
            {f >= VERIFY && (
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  top: 574,
                  height: 46,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 16px",
                  background: allVerified ? "rgba(63,210,123,.12)" : "rgba(255,221,0,.08)",
                  border: `1px solid ${allVerified ? "rgba(63,210,123,.5)" : "rgba(255,221,0,.35)"}`,
                  color: allVerified ? C.green : C.yellow,
                  fontSize: 17,
                  fontWeight: 700,
                  opacity: p(f, VERIFY, 10),
                }}>
                {allVerified ? null : <Spinner f={f} />}
                {allVerified ? "✓  5 updates saved — verified in Master Tour" : "Saving and re-reading Master Tour…"}
              </div>
            )}
          </div>
        </MTWindow>

        {/* "Thursday" → the right show */}
        <FlyChip f={f} start={MATCH} dur={26} from={[310, lineY(0)]} to={[WIN.x + WIN.w - MT.listW / 2, CONTENT.y + 34 + 3 * MT.rowH + 32]} arc={-90} chipProps={{ size: 20 }}>
          Thursday
        </FlyChip>
        {tagT > 0 && (
          <div style={{ position: "absolute", right: 1920 - (WIN.x + WIN.w - MT.listW) + 12, top: CONTENT.y + 34 + 3 * MT.rowH + 12, opacity: tagT, transform: `translateX(${(1 - tagT) * 20}px)`, zIndex: 50 }}>
            <Chip size={18}>Thursday → Thu, Oct 22 · Richmond</Chip>
          </div>
        )}

        {/* facts fly into their fields */}
        {UPDATES.map((u, k) => (
          <FlyChip key={k} f={f} start={FILL0 + k * 22} dur={22} from={[560, lineY(u.line)]} to={u.target} arc={-70} chipProps={{ size: 19 }}>
            {u.chip}
          </FlyChip>
        ))}

        {/* the assistant reports back */}
        <MessageBanner f={f} at={384} x={WIN.x + 40} y={WIN.y + WIN.h + 26} w={WIN.w - 80}>
          Richmond's advance reply is in. I updated 5 fields in Master Tour and checked they saved.{" "}
          <span style={{ color: C.red, fontWeight: 700 }}>One thing needs you: the new curfew.</span>
        </MessageBanner>
      </SceneFade>

      {/* curfew lifts out toward the next scene */}
      <FlyChip f={f} start={540} dur={30} from={[420, lineY(8)]} to={[960, 560]} arc={-40} chipProps={{ bg: C.red, fg: "#fff", size: 24 }}>
        Curfew 10:30 PM
      </FlyChip>
    </AbsoluteFill>
  )
}
