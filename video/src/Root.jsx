import React from "react"
import { Composition } from "remotion"
import { Main } from "./Main"
import { FPS, TOTAL } from "./timeline"

export const Root = () => (
  <>
    <Composition id="TourOpsDemo" component={Main} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} defaultProps={{ audio: true }} />
    <Composition id="TourOpsDemoSilent" component={Main} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} defaultProps={{ audio: false }} />
  </>
)
