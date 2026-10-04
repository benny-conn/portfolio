import React from "react"
import "./fonts"
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion"
import { C } from "./theme"
import { SCENES, SEGMENTS, SFX, TOTAL, VO } from "./timeline"
import { Remap } from "./time"
import manifest from "./audio-manifest.json"
import { TourClock } from "./components/TourClock"
import { Intro } from "./scenes/Intro"
import { Hero } from "./scenes/Hero"
import { Catch } from "./scenes/Catch"
import { Grid } from "./scenes/Grid"
import { Montage } from "./scenes/Montage"
import { Settle } from "./scenes/Settle"
import { Bus } from "./scenes/Bus"
import { Close, Layers } from "./scenes/End"
import { Service } from "./scenes/Service"

const SCENE_COMPONENTS = { intro: Intro, hero: Hero, catch: Catch, grid: Grid, montage: Montage, settle: Settle, bus: Bus, layers: Layers, service: Service, close: Close }

const voFrames = (id) => Math.ceil((manifest.vo[id] ?? 2) * 30)

const Backdrop = () => {
  const f = useCurrentFrame()
  const busT = interpolate(f, [SCENES.bus[0] - 10, SCENES.bus[0] + 20, SCENES.layers[0] - 10, SCENES.layers[0] + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 45%, #141416 0%, ${C.bg} 70%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 80% at 50% 60%, #0d1424 0%, #06070b 75%)", opacity: busT }} />
    </AbsoluteFill>
  )
}

const Grain = () => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.05, mixBlendMode: "overlay" }}>
    <svg width="1920" height="1080">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="1920" height="1080" filter="url(#n)" />
    </svg>
  </AbsoluteFill>
)

const Soundtrack = () => {
  const spans = VO.map((v) => [v.at, v.at + voFrames(v.id)])
  const underVO = (from, len) => spans.some(([a, b]) => from < b && from + len > a)
  const music = (f) => {
    const duck = spans.reduce((acc, [a, b]) => {
      const d = interpolate(f, [a - 8, a, b, b + 12], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      return Math.max(acc, d)
    }, 0)
    const fadeIn = interpolate(f, [0, 40], [0, 1], { extrapolateRight: "clamp" })
    const fadeOut = interpolate(f, [TOTAL - 90, TOTAL - 5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    return 0.42 * (1 - 0.55 * duck) * fadeIn * fadeOut
  }
  return (
    <>
      {manifest.music && <Audio src={staticFile(manifest.music)} volume={music} />}
      {VO.map((v) =>
        manifest.vo[v.id] ? (
          <Sequence key={v.id} from={v.at} durationInFrames={voFrames(v.id) + 6}>
            <Audio src={staticFile(`audio/vo/${v.id}.mp3`)} volume={1} />
          </Sequence>
        ) : null
      )}
      {SFX.map((s, i) =>
        manifest.sfx[s.id] ? (
          <Sequence key={i} from={s.at} durationInFrames={s.dur ?? Math.ceil(manifest.sfx[s.id] * 30) + 2}>
            <Audio src={staticFile(`audio/sfx/${s.id}.mp3`)} volume={(f) => s.vol * (!s.dur && underVO(s.at, manifest.sfx[s.id] * 30) ? 0.55 : 1) * (s.dur ? interpolate(f, [0, 20, s.dur - 30, s.dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1)} loop={Boolean(s.dur)} />
          </Sequence>
        ) : null
      )}
    </>
  )
}

export const Main = ({ audio = true }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Backdrop />
    {Object.entries(SCENES).map(([key, [from, dur]]) => {
      const Scene = SCENE_COMPONENTS[key]
      return (
        <Sequence key={key} from={from} durationInFrames={dur} name={key}>
          <Remap segs={SEGMENTS[key]}>
            <Scene />
          </Remap>
        </Sequence>
      )
    })}
    <TourClock />
    <Grain />
    {audio && <Soundtrack />}
  </AbsoluteFill>
)
