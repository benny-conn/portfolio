"use client"

import { useContext, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { AudioContext } from "@/components/AudioPlayer"

const playlist = [
  {
    src: "/audio/blues.wav",
    name: "Blues to Be There",
    description: "Duke Ellington — The Benny Conn Big Band",
  },
  {
    src: "/audio/quietude.wav",
    name: "Quietude",
    description: "Thad Jones — The Benny Conn Big Band",
  },
  {
    src: "/audio/queen.wav",
    name: "Queen Bee",
    description: "Count Basie — The Benny Conn Big Band",
  },
  {
    src: "/audio/solo.wav",
    name: "Short Trombone Solo",
    description: "Benny Conn",
  },
  {
    src: "/audio/original-big-band.m4a",
    name: "Everything After",
    description: "Big Band Original — Benny Conn",
  },
]

export default function MusicSection({ limit = playlist.length }) {
  const {
    audioRef,
    isPlaying,
    currentTrackIndex,
    setPlaylist,
    playTrack,
    setIsPlaying,
  } = useContext(AudioContext)

  useEffect(() => {
    setPlaylist(prev => (prev.length === 0 ? playlist : prev))
  }, [setPlaylist])

  const toggleTrack = index => {
    if (currentTrackIndex === index && isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      playTrack(index)
    }
  }

  return (
    <div className="border-t border-border">
      {playlist.slice(0, limit).map((track, i) => {
        const isActive = currentTrackIndex === i && isPlaying
        return (
          <button
            key={track.src}
            type="button"
            aria-label={`${isActive ? "Pause" : "Play"} ${track.name}`}
            aria-pressed={isActive}
            onClick={() => toggleTrack(i)}
            className="group w-full text-left flex items-center gap-5 py-4 border-b border-border cursor-pointer hover:bg-secondary/40 transition-colors rounded px-3 -mx-3"
          >
            <span className="w-4 flex items-center justify-center shrink-0">
              {isActive ? (
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
            </span>
            <span>
              <span
                className={`text-sm font-medium transition-colors ${
                  isActive ? "text-brand" : "group-hover:text-foreground"
                }`}
              >
                {track.name}
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                {track.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
