"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"

const VIDEOS = [
  { title: "I'll Remember April", file: "1. i'll remember april.mov" },
  { title: "If I Were a Bell", file: "5. if i were a bell.mov" },
  { title: "Rhythm Changes", file: "4. rhythm changes.mov" },
  { title: "All of Me", file: "3. all of me.MOV" },
  { title: "Tea for Two", file: "6. tea for two.MOV" },
  { title: "Nobody Else but Me", file: "7. nobody else but me.mov" },
]

export default function VideoSection({ baseUrl }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)
  const shouldAutoplay = useRef(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    el.addEventListener("play", onPlay)
    el.addEventListener("pause", onPause)
    el.addEventListener("ended", onEnded)
    return () => {
      el.removeEventListener("play", onPlay)
      el.removeEventListener("pause", onPause)
      el.removeEventListener("ended", onEnded)
    }
  }, [activeIdx])

  const selectVideo = idx => {
    if (idx === activeIdx) {
      if (isPlaying) {
        videoRef.current?.pause()
      } else {
        videoRef.current?.play()
      }
      return
    }
    shouldAutoplay.current = true
    setActiveIdx(idx)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (shouldAutoplay.current) {
      shouldAutoplay.current = false
      videoRef.current?.play().catch(() => {})
    }
  }, [activeIdx])

  const activeVideo = VIDEOS[activeIdx]

  return (
    <div>
      {/* Video player */}
      <div className="mb-4 aspect-video bg-secondary/20 rounded-sm overflow-hidden relative">
        <video
          ref={videoRef}
          key={activeVideo.file}
          className="w-full h-full object-cover"
          controls
          playsInline
          preload="metadata">
          <source
            src={`${baseUrl}/${encodeURIComponent(activeVideo.file)}`}
            type="video/quicktime"
          />
          <source
            src={`${baseUrl}/${encodeURIComponent(activeVideo.file)}`}
            type="video/mp4"
          />
        </video>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        <span className="text-foreground">{activeVideo.title}</span> · Live at
        Smalls Jazz Club, NYC
      </p>

      {/* Track list */}
      <div className="border-t border-border">
        {VIDEOS.map((v, i) => {
          const isActive = activeIdx === i
          return (
            <div
              key={i}
              onClick={() => selectVideo(i)}
              className="group flex items-center gap-5 py-4 border-b border-border cursor-pointer hover:bg-secondary/40 transition-colors rounded px-3 -mx-3">
              <div className="w-4 flex items-center justify-center shrink-0">
                {isActive && isPlaying ? (
                  <Pause size={13} className="text-brand" />
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground tabular-nums group-hover:hidden">
                      {i + 1}
                    </span>
                    <Play
                      size={13}
                      className="text-foreground hidden group-hover:block"
                    />
                  </>
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium transition-colors ${isActive ? "text-brand" : "group-hover:text-foreground"}`}>
                  {v.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live at Smalls Jazz Club, NYC
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
