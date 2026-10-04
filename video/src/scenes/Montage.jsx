import React from "react"
import { AbsoluteFill } from "remotion"
import { C, F } from "../theme"
import { useFrame } from "../time"
import { EIO, arcPoint, p } from "../lib"
import { Chip, MsgIcon, SceneFade, SheetIcon } from "../components/ui"
import { MessageBanner } from "../components/Chat"

// 1:02–1:12 — the same loop on hotels, guest lists and day sheets.

export const MONTAGE_DUR = 300
const SEG = 100

const Title = ({ f, n, children }) => {
  const t = p(f, 2, 14)
  return (
    <div style={{ position: "absolute", left: 110, top: 118, opacity: t, transform: `translateY(${(1 - t) * 16}px)` }}>
      <div style={{ color: C.muted, fontSize: 18, fontWeight: 700, letterSpacing: 3 }}>{n}</div>
      <div style={{ color: C.ink, fontSize: 54, fontWeight: 700, marginTop: 2 }}>{children}</div>
    </div>
  )
}

const Seg = ({ f, start, children }) => {
  const lf = f - start
  if (lf < 0 || lf >= SEG) return null
  const o = Math.min(p(lf, 0, 10), 1 - p(lf, SEG - 10, 10))
  return <AbsoluteFill style={{ opacity: o, transform: `translateX(${(1 - p(lf, 0, 14)) * 60 - p(lf, SEG - 10, 10) * 60}px)` }}>{children(lf)}</AbsoluteFill>
}

const AssistNote = ({ f, at, children, y = 900, w = 760 }) => (
  <MessageBanner f={f} at={at} x={(1920 - w) / 2} y={y} w={w}>
    {children}
  </MessageBanner>
)

const ROOMING = ["Theo — vocals", "Jess — drums", "Mara — bass", "Eli — keys", "Sam — FOH", "Rae — monitors", "Kai — lighting", "Nico — backline", "June — merch", "Lou — production", "Dev — driver", "You — tour manager"]

const Hotels = ({ f }) => {
  const scan = p(f, 18, 26)
  const named = Math.min(12, Math.floor(p(f, 18, 26) * 12.99))
  const clash = p(f, 50, 12)
  return (
    <>
      <Title f={f} n="01">Hotels</Title>
      {/* confirmation PDF */}
      <div style={{ position: "absolute", left: 250, top: 250, width: 580, height: 620, background: "#fbfaf7", borderRadius: 8, boxShadow: "0 40px 100px rgba(0,0,0,.6)", padding: "40px 44px", fontFamily: F.ui, color: "#222" }}>
        <div style={{ fontSize: 14, letterSpacing: 2.4, color: "#777", fontWeight: 700 }}>GLENWOOD HOTEL · RALEIGH</div>
        <div style={{ fontSize: 32, fontWeight: 700, marginTop: 10 }}>Reservation Confirmation</div>
        <div style={{ fontSize: 16, color: "#666", marginTop: 6 }}>Confirmation # RG-44812 · PDF</div>
        <div style={{ height: 1, background: "#ddd", margin: "26px 0" }} />
        {[
          ["Group", "The Lanterns"],
          ["Arrive", "Fri, Oct 23"],
          ["Depart", "Sat, Oct 24"],
          ["Room type", "Standard King / Double"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", fontSize: 20, marginBottom: 14 }}>
            <div style={{ width: 170, color: "#777" }}>{k}</div>
            <div style={{ fontWeight: 600 }}>{v}</div>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", fontSize: 20, marginTop: 10, padding: "12px 14px", marginLeft: -14, borderRadius: 8, background: `rgba(255,221,0,${0.35 * scan})`, boxShadow: clash > 0 ? `inset 0 0 0 3px rgba(255,82,71,${clash})` : "none" }}>
          <div style={{ width: 170, color: "#777" }}>Rooms</div>
          <div style={{ fontWeight: 800, fontSize: 34 }}>10</div>
        </div>
      </div>
      {/* rooming list sheet */}
      <div style={{ position: "absolute", left: 1090, top: 250, width: 580, height: 620, background: "#fff", borderRadius: 8, boxShadow: "0 40px 100px rgba(0,0,0,.6)", fontFamily: F.ui, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", borderBottom: "1px solid #e3e3e3" }}>
          <SheetIcon size={30} />
          <div style={{ fontSize: 19, fontWeight: 600, color: "#202124" }}>Rooming list — Raleigh, Oct 23</div>
        </div>
        {ROOMING.map((name, i) => (
          <div key={name} style={{ display: "flex", alignItems: "center", height: 40, padding: "0 22px", borderBottom: "1px solid #f0f0f0", fontSize: 17, color: "#202124", background: i < named ? `rgba(255,221,0,${0.22 * (1 - clash * 0.6)})` : "transparent" }}>
            <div style={{ width: 34, color: "#80868b" }}>{i + 1}</div>
            {name}
          </div>
        ))}
      </div>
      {clash > 0 && (
        <div style={{ position: "absolute", left: 960 - 110, top: 500, width: 220, textAlign: "center", opacity: clash, transform: `scale(${0.7 + 0.3 * clash})` }}>
          <div style={{ display: "inline-block", background: C.red, color: "#fff", fontSize: 40, fontWeight: 700, padding: "10px 24px", borderRadius: 16, boxShadow: "0 0 40px rgba(255,82,71,.5)" }}>10 ≠ 12</div>
          <div style={{ color: C.red, fontSize: 20, fontWeight: 700, marginTop: 12 }}>2 rooms short</div>
        </div>
      )}
      <AssistNote f={f} at={60}>Raleigh is 2 rooms short. I drafted a note to the hotel. Send it?</AssistNote>
    </>
  )
}

const REQUESTS = [
  { from: "Jess (drums)", text: "can I get +2 for DC? my cousins", row: ["Jess's cousins", "DC · 10/21", "2", "Jess"] },
  { from: "Theo (vocals)", text: "parents for Richmond, 2 tix", row: ["Theo's parents", "RIC · 10/22", "2", "Theo"] },
  { from: "Sam (FOH)", text: "+1 DC please", row: ["Sam +1", "DC · 10/21", "1", "Sam"] },
]
const REQ_Y = (i) => 300 + i * 150
const ROW_Y = (i) => 420 + i * 64

const GuestLists = ({ f }) => {
  const landAt = (i) => 34 + i * 12 + 18
  const dc = 7 + (f >= landAt(0) ? 2 : 0) + (f >= landAt(2) ? 1 : 0)
  return (
    <>
      <Title f={f} n="02">Guest lists</Title>
      {REQUESTS.map((r, i) => {
        const t = p(f, 6 + i * 6, 12)
        return (
          <div key={i} style={{ position: "absolute", left: 140, top: REQ_Y(i), opacity: t, transform: `translateY(${(1 - t) * 14}px)`, display: "flex", gap: 14, alignItems: "flex-start" }}>
            <MsgIcon size={40} />
            <div>
              <div style={{ color: C.muted, fontSize: 17, fontWeight: 700 }}>{r.from}</div>
              <div style={{ marginTop: 6, background: "#232327", color: C.ink, fontSize: 24, padding: "12px 18px", borderRadius: "4px 18px 18px 18px" }}>{r.text}</div>
            </div>
          </div>
        )
      })}
      {/* Master Tour guest list */}
      <div style={{ position: "absolute", left: 900, top: 250, width: 880, height: 600, background: C.mt.bg, border: "1px solid #2a2c38", borderRadius: 14, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,.6)" }}>
        <div style={{ padding: "20px 26px", background: `linear-gradient(120deg, ${C.mt.headerA}, ${C.mt.headerB} 70%)` }}>
          <div style={{ color: "#c7cede", fontSize: 14, letterSpacing: 1.6 }}>MASTER TOUR · GUEST LIST</div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 700, marginTop: 4 }}>Requests this week</div>
        </div>
        <div style={{ display: "flex", padding: "12px 26px", color: C.mt.muted, fontSize: 14, letterSpacing: 1.2, borderBottom: `1px solid ${C.mt.line}` }}>
          {["NAME", "SHOW", "# OF TIX", "REQUESTED BY"].map((h, i) => (
            <div key={h} style={{ width: [300, 200, 120, 200][i] }}>{h}</div>
          ))}
        </div>
        {REQUESTS.map((r, i) => {
          const landed = f >= landAt(i)
          const flash = landed ? 1 - p(f, landAt(i), 30) : 0
          return (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: ROW_Y(i) - 250, height: 64, display: "flex", alignItems: "center", padding: "0 26px", borderBottom: `1px solid #1b1d26`, background: `rgba(255,221,0,${0.2 * flash})`, opacity: landed ? 1 : 0.25 }}>
              {r.row.map((v, k) => (
                <div key={k} style={{ width: [300, 200, 120, 200][k], color: landed ? "#fff" : "#4a4e5c", fontSize: 20, fontWeight: k === 0 ? 700 : 400 }}>
                  {landed ? v : "—"}
                </div>
              ))}
            </div>
          )
        })}
        <div style={{ position: "absolute", left: 26, bottom: 26, display: "flex", gap: 14, opacity: p(f, 70, 12) }}>
          <Chip size={18} bg={dc >= 10 ? "#3a3000" : "#1c2a20"} fg={dc >= 10 ? C.yellow : C.green} style={{ boxShadow: "none" }}>
            DC comps {dc} / 10{dc >= 10 ? " · at cap" : ""}
          </Chip>
          <Chip size={18} bg="#1c2a20" fg={C.green} style={{ boxShadow: "none" }}>
            Richmond comps 2 / 8
          </Chip>
        </div>
      </div>
      {REQUESTS.map((r, i) => {
        const start = 34 + i * 12
        if (f < start || f > start + 18) return null
        const t = p(f, start, 18, EIO)
        const [x, y] = arcPoint([520, REQ_Y(i) + 50], [1060, ROW_Y(i) + 32], t, -50)
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", opacity: 1 - p(f, start + 14, 4), zIndex: 50 }}>
            <Chip size={18}>{r.row[0]} · {r.row[2]}</Chip>
          </div>
        )
      })}
    </>
  )
}

const DAY = [
  ["12:45 PM", "Lobby call — Canal House Hotel"],
  ["2:00 PM", "Load-in — Canal St dock"],
  ["4:30 PM", "Soundcheck"],
  ["7:00 PM", "Doors"],
  ["8:00 PM", "Support"],
  ["9:15 PM", "The Lanterns", "Curfew 10:30 — waiting on your call"],
  ["Parking", "1 bus spot · Canal St · shore power 50A"],
  ["Catering", "Buyout · $25 per person"],
  ["Settlement", "Dana Whitfield, after the show"],
  ["Hotel", "Canal House Hotel · 12 rooms"],
]

const DaySheets = ({ f }) => (
  <>
    <Title f={f} n="03">Day sheets</Title>
    <div style={{ position: "absolute", left: 560, top: 210, width: 860, height: 700, background: "#fbfaf7", borderRadius: 8, boxShadow: "0 40px 100px rgba(0,0,0,.6)", padding: "40px 52px", fontFamily: F.ui, color: "#222" }}>
      <div style={{ fontSize: 14, letterSpacing: 2.4, color: "#777", fontWeight: 700 }}>DAY SHEET · THE LANTERNS</div>
      <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>Thursday, Oct 22 · River Room, Richmond VA</div>
      <div style={{ height: 1, background: "#ddd", margin: "22px 0 10px" }} />
      {DAY.map(([k, v, warn], i) => {
        const t = p(f, 12 + i * 5, 10)
        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", padding: "11px 0", borderBottom: "1px solid #eee", opacity: t, transform: `translateX(${(1 - t) * -24}px)` }}>
            <div style={{ width: 150, fontSize: 21, fontWeight: 700, color: i < 6 ? "#222" : "#777" }}>{k}</div>
            <div style={{ fontSize: 22 }}>{v}</div>
            {warn && <div style={{ marginLeft: 14, fontSize: 15, fontWeight: 700, color: "#c5221f", background: "#fde8e7", padding: "3px 10px", borderRadius: 6 }}>{warn}</div>}
          </div>
        )
      })}
      <div style={{ position: "absolute", right: 40, bottom: 34, opacity: p(f, 70, 12), transform: `rotate(-3deg) scale(${0.8 + 0.2 * p(f, 70, 12)})`, border: `3px solid #c9a400`, color: "#8a6d00", fontWeight: 800, fontSize: 18, letterSpacing: 1.5, padding: "8px 16px", borderRadius: 8 }}>
        DRAFT · READY FOR YOUR REVIEW
      </div>
    </div>
    <div style={{ position: "absolute", left: 150, top: 470, width: 300, opacity: p(f, 6, 12) }}>
      <div style={{ color: C.muted, fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>BUILT FROM</div>
      <div style={{ color: C.ink, fontSize: 24, fontWeight: 700, marginTop: 8 }}>Master Tour</div>
      <div style={{ color: C.muted, fontSize: 20, marginTop: 4 }}>+ today's advance replies</div>
      <div style={{ marginTop: 18, height: 3, width: 260 * p(f, 10, 40), background: C.yellow, boxShadow: "0 0 14px rgba(255,221,0,.6)" }} />
    </div>
  </>
)

export const Montage = () => {
  const f = useFrame()
  return (
    <AbsoluteFill style={{ fontFamily: F.sans }}>
      <SceneFade dur={MONTAGE_DUR} inF={6} outF={8}>
        <Seg f={f} start={0}>{(lf) => <Hotels f={lf} />}</Seg>
        <Seg f={f} start={SEG}>{(lf) => <GuestLists f={lf} />}</Seg>
        <Seg f={f} start={SEG * 2}>{(lf) => <DaySheets f={lf} />}</Seg>
      </SceneFade>
    </AbsoluteFill>
  )
}
