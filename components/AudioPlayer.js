"use client"

import { Slider } from "@/components/ui/slider"
import { Pause, Play, Volume2, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect, createContext, useContext } from "react"
import dynamic from "next/dynamic"

const AudioContext = createContext()

const AudioProviderClient = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState(null)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [audioInfo, setAudioInfo] = useState({
    image: null,
    name: null,
    tag: null,
  })
  const [activeAudioId, setActiveAudioId] = useState(null)

  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && searchParams) {
      // reset all the state
      setCurrentAudio(null)
      setPlayerOpen(false)
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)
      setAudioInfo({
        image: null,
        name: null,
        user: null,
      })
    }
  }, [pathname, searchParams, setPlayerOpen])

  return (
    <AudioContext.Provider
      value={{
        currentAudio,
        setCurrentAudio,
        playerOpen,
        setPlayerOpen,
        audioInfo,
        setAudioInfo,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        isPlaying,
        setIsPlaying,

        activeAudioId,
        setActiveAudioId,
      }}>
      {children}
    </AudioContext.Provider>
  )
}

const AudioProviderDynamic = dynamic(
  () => Promise.resolve(AudioProviderClient),
  {
    ssr: false,
  }
)

// Export a server component that wraps the dynamic client component
export const AudioProvider = ({ children }) => {
  return <AudioProviderDynamic>{children}</AudioProviderDynamic>
}

const AudioPlayer = ({ src, image, name, user, audioId }) => {
  const audioRef = useRef(null)
  const {
    currentAudio,
    setCurrentAudio,
    setPlayerOpen,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    isPlaying,
    setAudioInfo,
    activeAudioId,
    setActiveAudioId,
  } = useContext(AudioContext)

  useEffect(() => {
    const audio = audioRef.current

    const handleTimeUpdate = () => {
      console.log("handleTimeUpdate")
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      console.log("handleEnded")
      setIsPlaying(false)
      setCurrentTime(0)
      audio.currentTime = 0
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [setCurrentTime, setDuration, setIsPlaying])

  const togglePlayPause = e => {
    const audio = audioRef.current
    setCurrentAudio(audio)
    setAudioInfo({ image, name, user })

    if (activeAudioId === audioId && isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      if (currentAudio && currentAudio !== audio) {
        currentAudio.pause()
      }
      audio.play()
      setIsPlaying(true)
      setActiveAudioId(audioId)
    }
    setPlayerOpen(true)
  }

  const isActiveAndPlaying = activeAudioId === audioId && isPlaying

  return (
    <div className="inline-block h-6 ml-1">
      <audio ref={audioRef} src={src}></audio>

      {isActiveAndPlaying ? (
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
    audioInfo,

    setIsPlaying,
    currentAudio,
    setPlayerOpen,
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
      console.log("pausing")
      currentAudio.pause()
      setIsPlaying(false)
    } else {
      console.log("playing")
      currentAudio.play()
      setIsPlaying(true)
    }
    setPlayerOpen(true)
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

    const intervalId = setInterval(updateSliderPosition, 50) // Update every 50ms

    return () => clearInterval(intervalId)
  }, [currentAudio, duration])

  if (!playerOpen) return null

  if (!audioInfo.user || !audioInfo.name) return null

  return (
    <div className="fixed bottom-0 left-0 w-full flex flex-row gap-8 items-center justify-center h-16 bg-[#2C2D35] z-50 py-4">
      <div className="flex items-center justify-center relative gap-4">
        <button
          onClick={togglePlayPause}
          type="button"
          className="w-8 h-8 rounded-full items-center justify-center flex aspect-square hover:scale-110 transition-all duration-300">
          {isPlaying ? (
            <Pause color="white" fill="white" size={28} />
          ) : (
            <Play color="white" fill="white" size={28} />
          )}
        </button>
        <div className="flex flex-row items-center gap-4">
          <p className="text-xs text-neutral-400 font-medium text-nowrap">
            {Math.floor(currentTime)}s
          </p>
          <div
            className="relative flex flex-row h-1 rounded-xl items-center bg-[#848486] w-[500px] z-50 hover:cursor-pointer px-2"
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
              className="h-1 bg-tertiary-accent rounded-xl absolute left-0 z-10 transition-all duration-100 ease-linear"
              style={{
                width: `${sliderPosition}%`,
              }}
            />
            <div
              className="w-3 h-3 bg-tertiary-accent rounded-full absolute top-[-4px] z-20 transition-all duration-100 ease-linear"
              style={{
                left: `${sliderPosition}%`,
              }}
            />
          </div>
          <p className="text-xs text-neutral-400 font-medium text-nowrap w-12">
            -{Math.floor(duration - currentTime)}s
          </p>
        </div>
        <div
          className="relative flex flex-col items-center"
          onMouseEnter={() => setIsHoveringVolume(true)}
          onMouseLeave={() => setIsHoveringVolume(false)}>
          <button
            type="button"
            className="w-8 h-8 rounded-full items-center justify-center flex aspect-square hover:scale-110 transition-all duration-300">
            <Volume2 className="text-zinc-400" size={28} />
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
                className="w-4 h-16 rounded-lg transition-all duration-300"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 items-center justify-center">
        {audioInfo.image && (
          <div className="w-12 h-12 rounded-sm relative overflow-hidden">
            <Image
              src={audioInfo.image}
              fill
              alt="Audio cover image"
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <p className="text-neutral-100 text-sm font-semibold">
            {audioInfo.name}
          </p>
          <Link href={`/users/${audioInfo.user.evmAddress}`}>
            <p className="text-neutral-400 text-xs font-medium">
              @{audioInfo.user.username}
            </p>
          </Link>
        </div>
      </div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
        <button
          className="w-8 h-8 rounded-full items-center justify-center flex aspect-square hover:scale-110 transition-all duration-300"
          onClick={() => setPlayerOpen(false)}>
          <X size={24} className="text-neutral-400" />
        </button>
      </div>
    </div>
  )
}

export default AudioPlayer
