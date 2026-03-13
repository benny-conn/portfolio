"use client"

import { useState, useEffect, useContext } from "react"
import Link from "next/link"
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons"
import { AudioContext } from "@/components/AudioPlayer"

const ROLES = [
  "Full-Stack Software Engineer.",
  "Backend Specialist.",
  "CTO & Founder.",
  "Jazz Trombonist.",
]
const TYPE_SPEED = 70
const DELETE_SPEED = 35
const PAUSE_MS = 2200

function useTypewriter(words) {
  const [{ text, wordIdx, phase }, setState] = useState({
    text: words[0],
    wordIdx: 0,
    phase: "pause",
  })

  useEffect(() => {
    const word = words[wordIdx]
    let id

    if (phase === "pause") {
      id = setTimeout(
        () => setState(s => ({ ...s, phase: "deleting" })),
        PAUSE_MS,
      )
    } else if (phase === "deleting") {
      if (text.length === 0) {
        setState({
          text: "",
          wordIdx: (wordIdx + 1) % words.length,
          phase: "typing",
        })
      } else {
        id = setTimeout(
          () => setState(s => ({ ...s, text: s.text.slice(0, -1) })),
          DELETE_SPEED,
        )
      }
    } else if (phase === "typing") {
      if (text.length >= word.length) {
        setState(s => ({ ...s, phase: "pause" }))
      } else {
        id = setTimeout(
          () =>
            setState(s => ({ ...s, text: word.slice(0, s.text.length + 1) })),
          TYPE_SPEED,
        )
      }
    }

    return () => clearTimeout(id)
  }, [text, phase, wordIdx, words])

  return text
}

function NYClock() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "America/New_York",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      )
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return <span className="tabular-nums">{time} ET</span>
}

// Hardcoded positions to avoid SSR/client hydration mismatch
const RAIN_DROPS = [
  { x: 3, delay: 0.0, duration: 0.8, h: 22 },
  { x: 8, delay: 0.35, duration: 0.9, h: 18 },
  { x: 13, delay: 0.7, duration: 0.75, h: 26 },
  { x: 18, delay: 0.15, duration: 0.85, h: 20 },
  { x: 23, delay: 0.55, duration: 0.95, h: 16 },
  { x: 28, delay: 0.9, duration: 0.8, h: 24 },
  { x: 33, delay: 0.25, duration: 0.88, h: 20 },
  { x: 38, delay: 0.6, duration: 0.78, h: 28 },
  { x: 43, delay: 0.05, duration: 0.92, h: 18 },
  { x: 48, delay: 0.8, duration: 0.82, h: 22 },
  { x: 53, delay: 0.4, duration: 0.76, h: 16 },
  { x: 58, delay: 0.18, duration: 0.94, h: 24 },
  { x: 63, delay: 0.72, duration: 0.84, h: 20 },
  { x: 68, delay: 0.48, duration: 0.88, h: 26 },
  { x: 73, delay: 0.1, duration: 0.79, h: 18 },
  { x: 78, delay: 0.65, duration: 0.91, h: 22 },
  { x: 83, delay: 0.3, duration: 0.83, h: 20 },
  { x: 88, delay: 0.85, duration: 0.77, h: 28 },
  { x: 93, delay: 0.2, duration: 0.89, h: 16 },
  { x: 97, delay: 0.5, duration: 0.85, h: 22 },
  { x: 10, delay: 0.95, duration: 0.81, h: 20 },
  { x: 35, delay: 0.42, duration: 0.93, h: 24 },
  { x: 56, delay: 0.77, duration: 0.87, h: 18 },
  { x: 76, delay: 0.12, duration: 0.96, h: 22 },
]

const SNOW_FLAKES = [
  { x: 4, size: 3.0, delay: 0.0, duration: 3.2 },
  { x: 10, size: 2.0, delay: 0.6, duration: 3.8 },
  { x: 16, size: 3.5, delay: 1.3, duration: 2.9 },
  { x: 22, size: 2.5, delay: 0.2, duration: 4.1 },
  { x: 28, size: 3.0, delay: 1.7, duration: 3.4 },
  { x: 34, size: 2.0, delay: 0.9, duration: 2.7 },
  { x: 40, size: 3.5, delay: 0.4, duration: 3.9 },
  { x: 46, size: 2.5, delay: 1.1, duration: 3.1 },
  { x: 52, size: 3.0, delay: 1.8, duration: 3.6 },
  { x: 58, size: 2.0, delay: 0.5, duration: 4.2 },
  { x: 64, size: 3.5, delay: 1.4, duration: 2.8 },
  { x: 70, size: 2.5, delay: 0.8, duration: 3.5 },
  { x: 76, size: 3.0, delay: 0.1, duration: 3.0 },
  { x: 82, size: 2.0, delay: 1.6, duration: 4.0 },
  { x: 88, size: 3.0, delay: 0.7, duration: 3.3 },
  { x: 94, size: 2.5, delay: 1.2, duration: 2.6 },
  { x: 7, size: 2.0, delay: 1.9, duration: 3.7 },
  { x: 19, size: 3.5, delay: 0.3, duration: 3.2 },
  { x: 31, size: 2.5, delay: 1.5, duration: 4.3 },
  { x: 43, size: 3.0, delay: 0.6, duration: 2.9 },
  { x: 55, size: 2.0, delay: 1.0, duration: 3.8 },
  { x: 67, size: 3.5, delay: 0.4, duration: 3.1 },
  { x: 79, size: 2.5, delay: 1.3, duration: 3.5 },
  { x: 91, size: 3.0, delay: 0.9, duration: 2.7 },
]

const STARS = [
  { x: 3, y: 6, size: 1.0, dur: 2.8 },
  { x: 10, y: 18, size: 1.5, dur: 3.5 },
  { x: 16, y: 4, size: 1.0, dur: 2.2 },
  { x: 22, y: 32, size: 2.0, dur: 4.0 },
  { x: 29, y: 12, size: 1.0, dur: 3.1 },
  { x: 36, y: 25, size: 1.5, dur: 2.6 },
  { x: 43, y: 7, size: 1.0, dur: 3.8 },
  { x: 50, y: 40, size: 2.0, dur: 2.4 },
  { x: 57, y: 15, size: 1.0, dur: 3.3 },
  { x: 64, y: 50, size: 1.5, dur: 2.9 },
  { x: 71, y: 22, size: 1.0, dur: 3.6 },
  { x: 78, y: 10, size: 2.0, dur: 2.1 },
  { x: 85, y: 35, size: 1.0, dur: 3.4 },
  { x: 92, y: 8, size: 1.5, dur: 2.7 },
  { x: 7, y: 55, size: 1.0, dur: 4.1 },
  { x: 14, y: 62, size: 1.5, dur: 3.2 },
  { x: 21, y: 45, size: 1.0, dur: 2.5 },
  { x: 30, y: 70, size: 2.0, dur: 3.7 },
  { x: 39, y: 58, size: 1.0, dur: 2.3 },
  { x: 48, y: 75, size: 1.5, dur: 4.2 },
  { x: 56, y: 52, size: 1.0, dur: 3.0 },
  { x: 65, y: 65, size: 2.0, dur: 2.6 },
  { x: 74, y: 42, size: 1.0, dur: 3.5 },
  { x: 83, y: 78, size: 1.5, dur: 2.8 },
  { x: 91, y: 55, size: 1.0, dur: 3.9 },
  { x: 5, y: 82, size: 1.5, dur: 2.2 },
  { x: 18, y: 88, size: 1.0, dur: 3.3 },
  { x: 33, y: 92, size: 1.0, dur: 4.0 },
  { x: 47, y: 80, size: 1.5, dur: 2.7 },
  { x: 61, y: 85, size: 1.0, dur: 3.1 },
  { x: 75, y: 90, size: 2.0, dur: 2.4 },
  { x: 89, y: 72, size: 1.0, dur: 3.8 },
  { x: 25, y: 48, size: 1.0, dur: 2.9 },
  { x: 53, y: 28, size: 1.5, dur: 3.6 },
  { x: 97, y: 30, size: 1.0, dur: 2.3 },
]

const WEATHER_META = {
  sun: { label: "Sunny", color: "text-brand" },
  stars: { label: "Clear", color: "text-indigo-300" },
  cloudy: { label: "Cloudy", color: "text-slate-400" },
  fog: { label: "Foggy", color: "text-slate-400" },
  rain: { label: "Rainy", color: "text-blue-400" },
  snow: { label: "Snowing", color: "text-sky-200" },
}

function getWeatherType(code, isDay) {
  if (code <= 1) return isDay ? "sun" : "stars"
  if (code <= 3) return "cloudy"
  if (code <= 48) return "fog"
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain"
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow"
  if (code >= 95) return "rain"
  return isDay ? "sun" : "stars"
}

function WeatherBackground({ type }) {
  if (!type) return null

  return (
    <div className="absolute top-16 left-0 right-0 bottom-0 pointer-events-none overflow-visible">
      {/* Sun — small contained orb in top-right, like actually looking at the sun */}
      {type === "sun" && (
        <div className="absolute top-0 right-20 overflow-visible">
          {/* Outer soft atmosphere */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 110,
              height: 110,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,221,0,0.09) 0%, transparent 70%)",
              filter: "blur(12px)",
            }}
          />
          {/* Corona */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,240,120,0.30) 0%, rgba(255,221,0,0.08) 55%, transparent 80%)",
              filter: "blur(5px)",
            }}
          />
          {/* Disk */}
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 40,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,230,0.95) 0%, rgba(255,235,80,0.70) 55%, transparent 85%)",
              filter: "blur(1px)",
            }}
          />
        </div>
      )}

      {/* Rain — thin streaks spanning full width */}
      {type === "rain" &&
        RAIN_DROPS.map((drop, i) => (
          <div
            key={i}
            className="absolute bg-blue-300/20"
            style={{
              left: `${drop.x}%`,
              top: 0,
              width: "1px",
              height: `${drop.h}px`,
              animation: `rain-fall ${drop.duration}s ${drop.delay}s infinite linear`,
            }}
          />
        ))}

      {/* Snow — flakes across full width */}
      {type === "snow" &&
        SNOW_FLAKES.map((flake, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/40"
            style={{
              left: `${flake.x}%`,
              top: 0,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              animation: `snow-fall ${flake.duration}s ${flake.delay}s infinite ease-in-out`,
            }}
          />
        ))}

      {/* Stars — scattered across full hero */}
      {type === "stars" &&
        STARS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/70"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animation: `twinkle ${star.dur}s ${i * 0.18}s infinite ease-in-out`,
            }}
          />
        ))}

      {/* Clouds — tight overlapping circles that form realistic cloud silhouettes */}
      {(type === "cloudy" || type === "fog") && (
        <div className="absolute top-0 right-20 overflow-visible">
          {/* Cloud 1: all 5 pieces move together as one cloud */}
          {[
            { t: 52, r: 4, w: 260, h: 64 }, // base body
            { t: 20, r: 68, w: 196, h: 92 }, // left bump
            { t: 8, r: 44, w: 208, h: 96 }, // center bump (tallest)
            { t: 22, r: 14, w: 180, h: 76 }, // right bump
            { t: 24, r: 90, w: 172, h: 68 }, // far-left small bump
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: s.t,
                right: s.r,
                width: s.w,
                height: s.h,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.11)",
                filter: "blur(11px)",
                animation: "cloud-drift 11s ease-in-out infinite",
              }}
            />
          ))}
          {/* Cloud 2: lower, slightly offset drift timing */}
          {[
            { t: 100, r: 16, w: 276, h: 68 }, // base
            { t: 74, r: 88, w: 104, h: 96 }, // left bump
            { t: 52, r: 60, w: 216, h: 104 }, // center bump
            { t: 30, r: 20, w: 188, h: 80 }, // right bump
            { t: 92, r: 112, w: 176, h: 72 }, // far-left bump
          ].map((s, i) => (
            <div
              key={i + 5}
              style={{
                position: "absolute",
                top: s.t,
                right: s.r,
                width: s.w,
                height: s.h,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.09)",
                filter: "blur(12px)",
                animation: "cloud-drift 15s ease-in-out infinite 3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function HeroSection({ githubStats, weather }) {
  const subtitle = useTypewriter(ROLES)
  const audioCtx = useContext(AudioContext)
  const currentTrack = audioCtx?.isPlaying
    ? audioCtx.playlist[audioCtx.currentTrackIndex]
    : null

  const weatherType = weather
    ? getWeatherType(weather.code, weather.isDay)
    : null

  const weatherMeta = weatherType ? WEATHER_META[weatherType] : null

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center max-w-2xl mx-auto px-6 pt-16 pb-24 overflow-hidden">
      <WeatherBackground type={weatherType} />

      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">
        New York, NY — <NYClock />
        {weatherMeta && (
          <span className={`ml-2 ${weatherMeta.color}`}>
            · {weatherMeta.label}
          </span>
        )}
      </p>

      <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
        Benny Conn
      </h1>

      <p className="text-xl sm:text-2xl text-brand font-medium mb-6 flex items-center">
        {subtitle}
        <span className="ml-0.5 inline-block w-0.5 h-5 sm:h-6 bg-brand animate-pulse" />
      </p>

      <p className="text-base text-muted-foreground max-w-lg leading-relaxed mb-10">
        I build backend systems and AI-powered products. Currently CTO at{" "}
        <a
          href="https://trackyard.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-brand transition-colors">
          Trackyard
        </a>
        , building music licensing infrastructure for film and TV. Previously
        Backend Software Engineer II at Gallery.
      </p>

      {currentTrack && (
        <Link
          href="/music"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          Now playing: {currentTrack.name}
        </Link>
      )}

      <div className="flex items-center gap-6">
        <a
          href="https://github.com/benny-conn"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors">
          <GitHubLogoIcon className="w-5 h-5" />
        </a>
        <a
          href="https://www.linkedin.com/in/benny-conn/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors">
          <LinkedInLogoIcon className="w-5 h-5" />
        </a>
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Resume
        </a>
      </div>

      {githubStats && (
        <p className="mt-3 text-xs text-muted-foreground/50">
          {githubStats.publicRepos} public repos on GitHub
        </p>
      )}
    </section>
  )
}
