"use client"

import { Slider } from "@/components/ui/slider"
import { Pause, Play, Volume2, X, SkipForward, SkipBack } from "lucide-react"
import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react"

export const AudioContext = createContext()

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null)
  const playlistRef = useRef([])
  const currentIndexRef = useRef(0)

  const [playerOpen, setPlayerOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playlist, setPlaylist] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  // Keep refs in sync with state so callbacks always have current values
  useEffect(() => { playlistRef.current = playlist }, [playlist])
  useEffect(() => { currentIndexRef.current = currentTrackIndex }, [currentTrackIndex])

  // Create the Audio object once — never touched by React rendering
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration)
    })

    audio.addEventListener("ended", () => {
      const next = (currentIndexRef.current + 1) % (playlistRef.current.length || 1)
      const nextTrack = playlistRef.current[next]
      if (!nextTrack) return
      audio.src = nextTrack.src
      audio.currentTime = 0
      audio.play()
      setCurrentTrackIndex(next)
    })

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [])

  const playTrack = useCallback((index) => {
    const audio = audioRef.current
    const track = playlistRef.current[index]
    if (!audio || !track) return
    audio.src = track.src
    audio.currentTime = 0
    audio.play()
    setCurrentTrackIndex(index)
    setPlayerOpen(true)
    setIsPlaying(true)
  }, [])

  return (
    <AudioContext.Provider
      value={{
        audioRef,
        playTrack,
        playerOpen,
        setPlayerOpen,
        currentTime,
        setCurrentTime,
        duration,
        isPlaying,
        setIsPlaying,
        playlist,
        setPlaylist,
        currentTrackIndex,
        setCurrentTrackIndex,
      }}>
      {children}
    </AudioContext.Provider>
  )
}

const formatTime = seconds => {
  if (!seconds || isNaN(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export const FixedAudioPlayer = () => {
  const {
    audioRef,
    playerOpen,
    isPlaying,
    currentTime,
    duration,
    setCurrentTime,
    setIsPlaying,
    setPlayerOpen,
    playlist,
    currentTrackIndex,
    playTrack,
  } = useContext(AudioContext)

  const barRef = useRef(null)
  const [isHoveringVolume, setIsHoveringVolume] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(0)
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  )

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const audio = audioRef.current
      if (audio && duration) {
        setSliderPosition((audio.currentTime / duration) * 100)
      }
    }, 50)
    return () => clearInterval(id)
  }, [audioRef, duration])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const skipTrack = direction => {
    let newIndex = currentTrackIndex + direction
    if (newIndex < 0) newIndex = playlist.length - 1
    if (newIndex >= playlist.length) newIndex = 0
    playTrack(newIndex)
  }

  if (!playerOpen) return null
  const currentTrack = playlist[currentTrackIndex]
  if (!currentTrack) return null

  const isMobile = screenWidth < 768

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-neutral-900 flex flex-row items-center justify-between px-4">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => skipTrack(-1)}
          type="button"
          className="w-8 h-8 flex items-center justify-center hover:scale-110 transition-all duration-300">
          <SkipBack className="text-foreground" size={20} />
        </button>
        <button
          onClick={togglePlayPause}
          type="button"
          className="w-8 h-8 flex items-center justify-center hover:scale-110 transition-all duration-300">
          {isPlaying ? (
            <Pause className="text-foreground" size={24} />
          ) : (
            <Play className="text-foreground" size={24} />
          )}
        </button>
        <button
          onClick={() => skipTrack(1)}
          type="button"
          className="w-8 h-8 flex items-center justify-center hover:scale-110 transition-all duration-300">
          <SkipForward className="text-foreground" size={20} />
        </button>
        {!isMobile && (
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatTime(currentTime)}
            </p>
            <div
              ref={barRef}
              className="relative h-1 rounded-xl flex items-center bg-secondary w-[300px] md:w-[500px] cursor-pointer"
              onClick={e => {
                const audio = audioRef.current
                if (!audio || !duration) return
                const rect = barRef.current.getBoundingClientRect()
                const pct = (e.clientX - rect.left) / rect.width
                audio.currentTime = pct * duration
                setCurrentTime(audio.currentTime)
              }}>
              <div
                className="h-1 bg-brand rounded-xl absolute left-0 transition-all duration-100 ease-linear"
                style={{ width: `${sliderPosition}%` }}
              />
              <div
                className="w-3 h-3 bg-brand rounded-full absolute top-[-4px] transition-all duration-100 ease-linear"
                style={{ left: `${sliderPosition}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground tabular-nums w-12">
              -{formatTime(duration - currentTime)}
            </p>
          </div>
        )}
        <div
          className="relative flex flex-col items-center"
          onMouseEnter={() => setIsHoveringVolume(true)}
          onMouseLeave={() => setIsHoveringVolume(false)}>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center hover:scale-110 transition-all duration-300">
            <Volume2 className="text-muted-foreground" size={24} />
          </button>
          {isHoveringVolume && (
            <div className="absolute bottom-8 pb-4 pt-2 px-2 rounded-t-lg">
              <Slider
                min={0}
                max={100}
                step={1}
                defaultValue={[100]}
                onValueChange={e => {
                  if (audioRef.current) audioRef.current.volume = e[0] / 100
                }}
                orientation="vertical"
                className="w-4 h-16 rounded-lg bg-brand"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 mx-4 overflow-hidden">
        <p className="text-foreground text-sm font-semibold truncate">
          {currentTrack.name}
        </p>
        <p className="text-muted-foreground text-xs truncate">
          {currentTrack.description}
        </p>
      </div>
      <button
        className="w-8 h-8 flex items-center justify-center hover:scale-110 transition-all duration-300"
        onClick={() => setPlayerOpen(false)}>
        <X size={20} className="text-muted-foreground" />
      </button>
    </div>
  )
}
