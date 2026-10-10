"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"

export default function EventFilm({ className = "" }) {
  const videoRef = useRef(null)
  const manualPause = useRef(false)
  const manualPlay = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let visible = false
    const updatePlayback = () => {
      if (
        visible &&
        !document.hidden &&
        !manualPause.current &&
        (!reducedMotion.matches || manualPlay.current)
      ) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        updatePlayback()
      },
      { threshold: 0.15 },
    )
    observer.observe(video)
    reducedMotion.addEventListener("change", updatePlayback)
    document.addEventListener("visibilitychange", updatePlayback)
    return () => {
      observer.disconnect()
      reducedMotion.removeEventListener("change", updatePlayback)
      document.removeEventListener("visibilitychange", updatePlayback)
      video.pause()
    }
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (video.paused) {
      manualPlay.current = true
      manualPause.current = false
      video.play().catch(() => {})
    } else {
      manualPause.current = true
      video.pause()
    }
  }

  return (
    <div className={`event-film ${className}`}>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster="/images/events/gathering-poster.webp"
        aria-label="Live music at a Curation Events gathering"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/images/events/gathering.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause event video" : "Play event video"}
      >
        {isPlaying ? (
          <Pause size={14} aria-hidden="true" />
        ) : (
          <Play size={14} aria-hidden="true" />
        )}
        {isPlaying ? "Pause film" : "Play film"}
      </button>
    </div>
  )
}
