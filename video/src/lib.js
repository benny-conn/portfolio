import { Easing, interpolate } from "remotion"

export const EO = Easing.bezier(0.16, 1, 0.3, 1)
export const EIO = Easing.bezier(0.65, 0, 0.35, 1)

// 0 → 1 progress between `start` and `start + dur`, clamped.
export const p = (f, start, dur, ease = EO) =>
  interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  })

export const lerp = (a, b, t) => a + (b - a) * t

export const fmtTime = (mins) => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440
  const h24 = Math.floor(m / 60)
  const mm = m % 60
  const ap = h24 >= 12 ? "PM" : "AM"
  const h = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h}:${String(mm).padStart(2, "0")} ${ap}`
}

// Point on a quadratic bezier from a to b, bowed by `arc` px.
export const arcPoint = ([x0, y0], [x1, y1], t, arc = -140) => {
  const cx = (x0 + x1) / 2
  const cy = Math.min(y0, y1) + arc
  return [
    (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1,
    (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1,
  ]
}
