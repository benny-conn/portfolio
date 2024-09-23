"use client"

import { Slider } from "@/components/ui/slider"
import { Pause, Play, Volume2, X, SkipForward, SkipBack } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react"
import dynamic from "next/dynamic"

const AudioContext = createContext()

const AudioProviderClient = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState(null)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const [playlist, setPlaylist] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  return (
    <AudioContext.Provider
      value={{
        currentAudio,
        setCurrentAudio,
        playerOpen,
        setPlayerOpen,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
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

const AudioProviderDynamic = dynamic(
  () => Promise.resolve(AudioProviderClient),
  { ssr: false }
)

export const AudioProvider = ({ children }) => {
  return <AudioProviderDynamic>{children}</AudioProviderDynamic>
}

const AudioPlayer = ({ playlist }) => {
  const audioRef = useRef(null)
  const {
    setCurrentAudio,
    setPlayerOpen,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    isPlaying,
    setPlaylist,
    setCurrentTrackIndex,
    currentTrackIndex,
  } = useContext(AudioContext)

  useEffect(() => {
    console.log("setting playlist", playlist)
    setPlaylist(playlist)
    // Set the initial track index if it hasn't been set yet
    setCurrentTrackIndex(prevIndex => (prevIndex === -1 ? 0 : prevIndex))
  }, [playlist, setPlaylist, setCurrentTrackIndex])

  const playTrack = useCallback(
    index => {
      try {
        console.log("playing track", index)
        const audio = audioRef.current
        setCurrentAudio(audio)
        setCurrentTrackIndex(index)
        console.log("opening player")
        setPlayerOpen(true)
        setIsPlaying(true)
        setTimeout(() => {
          audio.play()
        }, 100)
      } catch (error) {
        console.error("error playing track", error)
      }
    },
    [setCurrentAudio, setCurrentTrackIndex, setPlayerOpen, setIsPlaying]
  )

  useEffect(() => {
    console.log("setting up audio player")
    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      const nextIndex = (currentTrackIndex + 1) % playlist.length
      console.log("nextIndex", nextIndex)
      playTrack(nextIndex)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [
    setCurrentTime,
    setDuration,
    currentTrackIndex,
    playlist.length,
    playTrack,
  ])

  const togglePlayPause = () => {
    const audio = audioRef.current
    console.log("togglePlayPause", isPlaying)
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      playTrack(currentTrackIndex)
      setIsPlaying(true)
    }
  }

  return (
    <div className="inline-block h-6 ml-1">
      <audio ref={audioRef} src={playlist[currentTrackIndex]?.src}></audio>
      {isPlaying ? (
        <Pause
          className="text-brand hover:cursor-pointer"
          size={28}
          onClick={togglePlayPause}
        />
      ) : (
        <Volume2
          className="text-brand hover:cursor-pointer"
          size={28}
          onClick={togglePlayPause}
        />
      )}
    </div>
  )
}

export const FixedAudioPlayer = () => {
  const {
    playerOpen,
    isPlaying,
    currentTime,
    duration,
    setCurrentTime,
    setIsPlaying,
    currentAudio,
    setPlayerOpen,
    playlist,
    currentTrackIndex,
    setCurrentTrackIndex,
  } = useContext(AudioContext)

  const barRef = useRef(null)

  const handleVolumeChange = e => {
    const newVolume = e[0]
    if (currentAudio) {
      currentAudio.volume = newVolume / 100
    }
  }

  const togglePlayPause = () => {
    if (!currentAudio) return
    if (isPlaying) {
      currentAudio.pause()
      setIsPlaying(false)
    } else {
      currentAudio.play()
      setIsPlaying(true)
    }
  }

  const [isHoveringVolume, setIsHoveringVolume] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(0)

  useEffect(() => {
    const updateSliderPosition = () => {
      if (currentAudio && duration) {
        const position = (currentAudio.currentTime / duration) * 100
        setSliderPosition(position)
      }
    }

    const intervalId = setInterval(updateSliderPosition, 50)
    return () => clearInterval(intervalId)
  }, [currentAudio, duration])

  const skipTrack = direction => {
    if (!currentAudio) return
    let newIndex = currentTrackIndex + direction
    if (newIndex < 0) newIndex = playlist.length - 1
    if (newIndex >= playlist.length) newIndex = 0

    setCurrentTrackIndex(newIndex)
    setTimeout(() => {
      setIsPlaying(true)
      currentAudio.play()
    }, 100)
  }

  // Add a new state for screen width
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  )

  // Add useEffect to handle screen resize
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!playerOpen) return null

  const currentTrack = playlist[currentTrackIndex]

  if (!currentTrack) {
    console.log("No current track, returning null")
    return null
  }

  const isMobile = screenWidth < 768 // Define mobile breakpoint

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-neutral-900 flex flex-row items-center justify-between px-4">
      <div className="flex items-center justify-center relative gap-2 md:gap-4">
        <button
          onClick={() => skipTrack(-1)}
          type="button"
          className="w-8 h-8 rounded-full items-center justify-center flex aspect-square hover:scale-110 transition-all duration-300">
          <SkipBack className="text-foreground" size={20} />
        </button>
        <button
          onClick={togglePlayPause}
          type="button"
          className="w-8 h-8 rounded-full items-center justify-center flex aspect-square hover:scale-110 transition-all duration-300">
          {isPlaying ? (
            <Pause className="text-foreground" size={24} />
          ) : (
            <Play className="text-foreground" size={24} />
          )}
        </button>
        <button
          onClick={() => skipTrack(1)}
          type="button"
          className="w-8 h-8 rounded-full items-center justify-center flex aspect-square hover:scale-110 transition-all duration-300">
          <SkipForward className="text-foreground" size={20} />
        </button>
        {!isMobile && (
          <div className="flex flex-row items-center gap-4">
            <p className="text-xs text-muted-foreground font-medium text-nowrap">
              {Math.floor(currentTime)}s
            </p>
            <div
              className="relative flex flex-row h-1 rounded-xl items-center bg-secondary w-[300px] md:w-[500px] z-50 hover:cursor-pointer px-2"
              ref={barRef}
              onClick={e => {
                if (currentAudio) {
                  const rect = barRef.current.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const percentage = x / rect.width
                  currentAudio.currentTime = percentage * duration
                  setCurrentTime(currentAudio.currentTime)
                }
              }}>
              <div
                className="h-1 bg-brand rounded-xl absolute left-0 z-10 transition-all duration-100 ease-linear"
                style={{ width: `${sliderPosition}%` }}
              />
              <div
                className="w-3 h-3 bg-brand rounded-full absolute top-[-4px] z-20 transition-all duration-100 ease-linear"
                style={{ left: `${sliderPosition}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium text-nowrap w-12">
              -{Math.floor(duration - currentTime)}s
            </p>
          </div>
        )}
        <div
          className="relative flex flex-col items-center"
          onMouseEnter={() => setIsHoveringVolume(true)}
          onMouseLeave={() => setIsHoveringVolume(false)}>
          <button
            type="button"
            className="w-8 h-8 rounded-full items-center justify-center flex aspect-square hover:scale-110 transition-all duration-300">
            <Volume2 className="text-muted-foreground" size={24} />
          </button>
          {isHoveringVolume && (
            <div className="absolute bottom-8 pb-4 pt-2 px-2 rounded-t-lg">
              <Slider
                min={0}
                max={100}
                step={1}
                defaultValue={[100]}
                onValueChange={handleVolumeChange}
                orientation="vertical"
                className="w-4 h-16 rounded-lg transition-all duration-300 bg-brand"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 mx-4 overflow-hidden">
        <div className="w-full max-w-[200px] md:max-w-none">
          <p className="text-foreground text-sm font-semibold truncate">
            {currentTrack.name}
          </p>
          <p className="text-muted-foreground text-xs font-medium truncate">
            {currentTrack.description}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <button
          className="w-8 h-8 rounded-full items-center justify-center flex aspect-square hover:scale-110 transition-all duration-300"
          onClick={() => setPlayerOpen(false)}>
          <X size={20} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}

export default AudioPlayer
