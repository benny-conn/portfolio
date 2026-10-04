import React, { createContext, useContext } from "react"
import { useCurrentFrame } from "remotion"

// Scenes are authored in "source" frames. A scene's segments ([srcStart, srcEnd, speed])
// play its quiet stretches faster without re-timing every animation inside it.

export const outLength = (segs) => segs.reduce((acc, [a, b, speed]) => acc + (b - a) / speed, 0)

export const outToSrc = (segs, f) => {
  let o = 0
  for (const [a, b, speed] of segs) {
    const len = (b - a) / speed
    if (f <= o + len) return a + (f - o) * speed
    o += len
  }
  return segs[segs.length - 1][1] + (f - o)
}

export const srcToOut = (segs, s) => {
  let o = 0
  for (const [a, b, speed] of segs) {
    if (s <= b) return o + Math.max(0, s - a) / speed
    o += (b - a) / speed
  }
  return o + (s - segs[segs.length - 1][1])
}

const RemapContext = createContext(null)

export const Remap = ({ segs, children }) => <RemapContext.Provider value={segs}>{children}</RemapContext.Provider>

// Source frame of the current scene.
export const useFrame = () => {
  const f = useCurrentFrame()
  const segs = useContext(RemapContext)
  return segs ? outToSrc(segs, f) : f
}
