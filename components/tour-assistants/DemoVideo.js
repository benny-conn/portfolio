"use client"

import { useRef, useState } from "react"
import { Play } from "lucide-react"

// Poster first; the narrated demo only loads and plays when someone asks for it.
export default function DemoVideo({ src, poster }) {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  const play = () => {
    setStarted(true)
    // If the browser blocks playback, the native controls are already showing.
    requestAnimationFrame(() => ref.current?.play()?.catch(() => {}))
  }

  return (
    <div className="ta-video">
      <video
        ref={ref}
        src={src}
        poster={poster}
        preload="none"
        playsInline
        controls={started}
        aria-label="Demo: a tour manager's day with a personal AI assistant"
      />
      {!started && (
        <button type="button" className="ta-video-play" onClick={play}>
          <span className="ta-video-icon" aria-hidden="true">
            <Play size={30} fill="currentColor" strokeWidth={0} />
          </span>
          <span>Play the demo with sound</span>
          <span className="ta-video-length">1:52</span>
        </button>
      )}
    </div>
  )
}
