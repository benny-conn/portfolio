import { outLength, srcToOut } from "./time"

export const FPS = 30

// Each scene is authored in source frames. Segments [srcStart, srcEnd, speed] tighten the
// quiet stretches (speed > 1) so the cut stays succinct without re-timing the animations.
export const SEGMENTS = {
  intro: [
    [0, 176, 1],
    [176, 228, 2],
    [228, 575, 1],
  ],
  hero: [
    [0, 124, 1],
    [124, 168, 1.4],
    [168, 352, 1],
    [352, 384, 2],
    [384, 424, 1],
    [424, 540, 2.2],
    [540, 570, 1],
  ],
  catch: [
    [0, 240, 1],
    [240, 360, 2.5],
  ],
  grid: [
    [0, 226, 1],
    [226, 372, 1.4],
    [372, 420, 1.2],
  ],
  montage: [
    [0, 74, 1],
    [74, 100, 1.6],
    [100, 176, 1],
    [176, 200, 1.6],
    [200, 272, 1],
    [272, 300, 1.4],
  ],
  settle: [
    [0, 30, 1],
    [30, 134, 1.5],
    [134, 240, 1],
  ],
  bus: [
    [0, 230, 1],
    [230, 300, 2],
  ],
  layers: [
    [0, 60, 1],
    [60, 132, 1.5],
    [132, 150, 1],
  ],
  service: [
    [0, 560, 1],
    [560, 600, 2],
  ],
  close: [[0, 230, 1]],
}

export const SCENES = {}
let cursor = 0
for (const [key, segs] of Object.entries(SEGMENTS)) {
  const dur = Math.round(outLength(segs))
  SCENES[key] = [cursor, dur]
  cursor += dur
}
export const TOTAL = cursor

// Absolute output frame for a source frame inside a scene.
export const at = (scene, f = 0) => SCENES[scene][0] + Math.round(srcToOut(SEGMENTS[scene], f))

// Tour clock keyframes: [frame, minutes since midnight of show day]
export const CLOCK = [
  [0, 8 * 60 + 12],
  [at("intro", 570), 8 * 60 + 19],
  [at("hero"), 11 * 60 + 20],
  [at("hero", 565), 11 * 60 + 26],
  [at("catch"), 14 * 60 + 5],
  [at("catch", 355), 14 * 60 + 9],
  [at("grid"), 16 * 60 + 0],
  [at("grid", 210), 16 * 60 + 6],
  [at("grid", 400), 18 * 60 + 52],
  [at("montage"), 19 * 60 + 10],
  [at("montage", 295), 19 * 60 + 14],
  [at("settle"), 23 * 60 + 30],
  [at("settle", 235), 23 * 60 + 34],
  [at("bus"), 25 * 60 + 10],
  [at("bus", 300), 25 * 60 + 14],
]

// Narration placement. Durations come from audio-manifest.json.
export const VO = [
  { id: "vo01", at: at("intro", 40) },
  { id: "vo02", at: at("intro", 238) },
  { id: "vo03", at: at("intro", 392) },
  { id: "vo04", at: at("hero", 50) },
  { id: "vo05", at: at("catch", 66) },
  { id: "vo06", at: at("grid", 18) },
  { id: "vo07a", at: at("montage", 10) },
  { id: "vo07b", at: at("montage", 110) },
  { id: "vo07c", at: at("montage", 210) },
  { id: "vo08", at: at("settle", 140) },
  { id: "vo09", at: at("bus", 96) },
  { id: "vo11", at: at("service", 16) },
  { id: "vo12", at: at("service", 252) },
  { id: "vo10", at: at("close", 12) },
]

const sfx = (id, scene, f, vol, extra = {}) => ({ id, at: at(scene, f), vol, ...extra })

// Effects that land under narration are ducked automatically in Main.jsx.
export const SFX = [
  sfx("buzz", "intro", 0, 0.035),
  sfx("notif", "intro", 18, 0.1),
  sfx("whoosh", "intro", 226, 0.3),
  sfx("tick", "intro", 316, 0.25),
  sfx("tick", "intro", 346, 0.25),
  sfx("tick", "intro", 376, 0.25),
  sfx("chime", "intro", 506, 0.3),
  sfx("scan", "hero", 30, 0.35),
  sfx("tick", "hero", 100, 0.2),
  sfx("tick", "hero", 106, 0.2),
  sfx("tick", "hero", 112, 0.2),
  sfx("land", "hero", 122, 0.4),
  sfx("land", "hero", 190, 0.4),
  sfx("land", "hero", 212, 0.4),
  sfx("land", "hero", 234, 0.4),
  sfx("land", "hero", 256, 0.4),
  sfx("land", "hero", 278, 0.4),
  sfx("chime", "hero", 330, 0.4),
  sfx("notif", "hero", 386, 0.3),
  sfx("whoosh", "hero", 540, 0.3),
  sfx("alert", "catch", 52, 0.5),
  sfx("notif", "catch", 112, 0.25),
  sfx("scan", "grid", 30, 0.25),
  sfx("whoosh", "grid", 92, 0.25),
  sfx("notif", "grid", 152, 0.25),
  sfx("tick", "grid", 196, 0.35),
  sfx("whoosh", "grid", 206, 0.35),
  sfx("chime", "grid", 300, 0.2),
  sfx("whoosh", "montage", 0, 0.3),
  sfx("alert", "montage", 58, 0.3),
  sfx("notif", "montage", 60, 0.25),
  sfx("whoosh", "montage", 100, 0.3),
  sfx("land", "montage", 140, 0.3),
  sfx("land", "montage", 152, 0.3),
  sfx("land", "montage", 164, 0.3),
  sfx("whoosh", "montage", 200, 0.3),
  sfx("tick", "settle", 100, 0.2),
  sfx("tick", "settle", 108, 0.2),
  sfx("tick", "settle", 116, 0.2),
  sfx("alert", "settle", 134, 0.45),
  sfx("notif", "settle", 162, 0.3),
  sfx("bus", "bus", 0, 0.5, { dur: 265 }),
  sfx("notif", "bus", 16, 0.2),
  sfx("tick", "bus", 140, 0.4),
  sfx("tick", "bus", 162, 0.4),
  sfx("typing", "bus", 178, 0.35),
  sfx("notif", "bus", 212, 0.2),
  sfx("whoosh", "layers", 0, 0.25),
  sfx("whoosh", "service", 0, 0.2),
  sfx("land", "service", 64, 0.3),
  sfx("chime", "service", 132, 0.3),
  sfx("land", "service", 286, 0.3),
  sfx("land", "service", 316, 0.3),
  sfx("land", "service", 353, 0.3),
  sfx("land", "service", 382, 0.3),
  sfx("land", "service", 406, 0.3),
  sfx("tick", "service", 430, 0.2),
  sfx("tick", "service", 440, 0.2),
  sfx("tick", "service", 450, 0.2),
  sfx("tick", "service", 462, 0.2),
]
