import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { fetchSoloTraceData } from "@/lib/solo-trace"

export const revalidate = 1800

export const metadata = {
  title: "Solo Trace — Benny Conn",
  description:
    "A pipeline that automatically finds and archives every jazz solo I play from live Smalls Jazz Club recordings.",
  openGraph: {
    title: "Solo Trace — Benny Conn",
    description:
      "Auto-detects and archives jazz solos from live Smalls Jazz Club recordings using CLAP, Demucs, and Basic Pitch.",
  },
  alternates: { canonical: "/work/solo-trace" },
}

const PIPELINE_STEPS = [
  { label: "yt-dlp", sub: "Download video from YouTube" },
  {
    label: "CLAP",
    sub: "Scan audio in 2-second windows against a reference recording of my playing",
  },
  {
    label: "CLIP + Face Recognition",
    sub: "Detect a trombone on stage (CLIP), then confirm I appear on screen (face recognition)",
  },
  { label: "Demucs", sub: "Source separation — isolate the brass/wind stem" },
  {
    label: "Basic Pitch",
    sub: "MIDI transcription — extract note events, pitch range, phrase analysis",
  },
  { label: "R2 Upload", sub: "Store MP4 clip and MIDI file to Cloudflare R2" },
  {
    label: "SQLite",
    sub: "Persist clip metadata, audio scores, visual confidence, transcription stats",
  },
]

const TECH = [
  "Go",
  "Gin",
  "Python",
  "SQLite",
  "CLAP",
  "CLIP",
  "Demucs",
  "Basic Pitch",
  "Cloudflare R2",
  "Cloudflare Tunnel",
  "yt-dlp",
]

// Maps chroma index to flat-preferred note names
const CHROMA_LABELS = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
]

function formatDuration(seconds) {
  if (!seconds) return ""
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function NoteFrequencyChart({ chromaFreq }) {
  const max = Math.max(...chromaFreq, 1)
  const topIdx = chromaFreq.indexOf(Math.max(...chromaFreq))
  const BAR_H = 44

  return (
    <div>
      <div className="flex items-end gap-0.5" style={{ height: BAR_H }}>
        {chromaFreq.map((v, i) => {
          const h = v > 0 ? Math.max(4, Math.round((v / max) * BAR_H)) : 3
          const isTop = i === topIdx && v > 0
          return (
            <div
              key={i}
              className="flex-1 min-w-0"
              style={{
                height: h,
                backgroundColor: isTop
                  ? "#FFDD00"
                  : v > 0
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.05)",
              }}
            />
          )
        })}
      </div>
      <div className="flex gap-0.5 mt-1.5">
        {CHROMA_LABELS.map(l => (
          <div key={l} className="flex-1 min-w-0 text-center">
            <span className="text-[8px] text-muted-foreground/40 leading-none">
              {l}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoPlayer({ src }) {
  if (!src) return null
  return (
    <video
      src={src}
      controls
      className="w-full block border border-border"
      preload="metadata"
    />
  )
}

function SessionCard({ session }) {
  return (
    <div className="border border-border p-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-sm font-medium truncate flex-1 mr-4">
          {session.videoTitle || "Smalls Jazz Club"}
        </p>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {session.relativeDate}
        </span>
      </div>
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span>
          {session.soloCount} solo{session.soloCount !== 1 ? "s" : ""}
        </span>
        <span>{session.totalNotes.toLocaleString()} notes</span>
        {session.topNotes[0] && (
          <span>{session.topNotes[0].note} most played</span>
        )}
      </div>
      <NoteFrequencyChart chromaFreq={session.chromaFreq} />
    </div>
  )
}

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function GigsByMonthChart({ data }) {
  if (!data?.length) return null
  const last12 = data.slice(-12)
  const max = Math.max(...last12.map(d => d.count), 1)
  const BAR_H = 44

  return (
    <div>
      <div className="flex items-end gap-0.5" style={{ height: BAR_H }}>
        {last12.map(({ month, count }) => {
          const h =
            count > 0 ? Math.max(4, Math.round((count / max) * BAR_H)) : 3
          return (
            <div
              key={month}
              className="flex-1 min-w-0"
              title={`${month}: ${count} gig${count !== 1 ? "s" : ""}`}
              style={{
                height: h,
                backgroundColor:
                  count > 0
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.05)",
              }}
            />
          )
        })}
      </div>
      <div className="flex gap-0.5 mt-1.5">
        {last12.map(({ month }) => (
          <div key={month} className="flex-1 min-w-0 text-center">
            <span className="text-[8px] text-muted-foreground/40 leading-none">
              {month.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DayOfWeekChart({ data }) {
  if (!data?.length) return null
  const byDay = Object.fromEntries(data.map(d => [d.day, d.count]))
  const counts = DAY_ORDER.map(d => byDay[d] ?? 0)
  const max = Math.max(...counts, 1)
  const topIdx = counts.indexOf(Math.max(...counts))
  const BAR_H = 44

  return (
    <div>
      <div className="flex items-end gap-0.5" style={{ height: BAR_H }}>
        {counts.map((count, i) => {
          const h =
            count > 0 ? Math.max(4, Math.round((count / max) * BAR_H)) : 3
          return (
            <div
              key={DAY_ORDER[i]}
              className="flex-1 min-w-0"
              title={`${DAY_ORDER[i]}: ${count} session${count !== 1 ? "s" : ""}`}
              style={{
                height: h,
                backgroundColor:
                  i === topIdx && count > 0
                    ? "#FFDD00"
                    : count > 0
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.05)",
              }}
            />
          )
        })}
      </div>
      <div className="flex gap-0.5 mt-1.5">
        {DAY_SHORT.map(d => (
          <div key={d} className="flex-1 min-w-0 text-center">
            <span className="text-[8px] text-muted-foreground/40 leading-none">
              {d}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function parseAnalysis(clip) {
  if (!clip?.Analysis) return null
  try {
    return typeof clip.Analysis === "string"
      ? JSON.parse(clip.Analysis)
      : clip.Analysis
  } catch {
    return null
  }
}

export default async function SoloTracePage() {
  const data = await fetchSoloTraceData()
  const latest = data?.latest
  const analytics = data?.analytics

  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <Link
        href="/#work"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        <ArrowLeft size={14} />
        Work
      </Link>

      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        Personal Project
      </p>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-4xl font-bold">Solo Trace</h1>
        <a
          href="https://github.com/benny-conn/solo-trace"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 mt-2 flex-shrink-0 ml-4">
          github
          <ArrowUpRight size={13} />
        </a>
      </div>

      <p className="text-base text-muted-foreground leading-relaxed mb-12">
        A personal tool that automatically finds and archives every jazz solo I
        play from live recordings at Smalls Jazz Club in NYC,so I can study my
        own playing without scrubbing through hours of footage. Each night a
        cron job scrapes the Smalls website, checks the lineup, and kicks off a
        pipeline to hunt for me in the video. All deployed to my Mac Mini
        through a Cloudflare Tunnel.
      </p>

      {/* Live section */}
      {latest ? (
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Live Data
            </p>
          </div>

          <div className="flex items-baseline justify-between mb-6">
            <p className="text-sm font-medium">
              {latest.videoTitle || "Smalls Jazz Club recording"}
            </p>
            <span className="text-xs text-muted-foreground ml-4 flex-shrink-0">
              {latest.relativeDate}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="border border-border p-4">
              <p className="text-2xl font-bold">{latest.soloCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                solo{latest.soloCount !== 1 ? "s" : ""} detected
              </p>
            </div>
            <div className="border border-border p-4">
              <p className="text-2xl font-bold">
                {latest.totalNotes.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">total notes</p>
            </div>
            <div className="border border-border p-4">
              <p className="text-2xl font-bold text-brand">
                {latest.topNotes[0]?.note ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                most played
                {latest.topNotes[0] ? ` · ×${latest.topNotes[0].count}` : ""}
              </p>
            </div>
          </div>

          {/* Note frequency chart */}
          <div className="mb-8">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
              Most Played Notes
            </p>
            <NoteFrequencyChart chromaFreq={latest.chromaFreq} />
          </div>

          {/* Longest solo video */}
          {latest.longestClip &&
            (() => {
              const a = parseAnalysis(latest.longestClip)
              return (
                <div className="mb-8">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
                    Best Match
                    {latest.longestClip.AudioHitRatio
                      ? ` — ${(latest.longestClip.AudioHitRatio * 100).toFixed(0)}% audio match`
                      : ""}
                    {latest.longestClip.Duration
                      ? ` · ${formatDuration(latest.longestClip.Duration)}`
                      : ""}
                    {a?.note_count ? ` · ${a.note_count} notes` : ""}
                  </p>
                  <VideoPlayer src={latest.longestClip.R2VideoURL} />
                  {a?.note_density_per_s && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {a.lowest_note && a.highest_note && (
                        <>
                          Range: {a.lowest_note}–{a.highest_note}
                          {" · "}
                        </>
                      )}
                      {a.note_density_per_s} notes/sec
                    </p>
                  )}
                </div>
              )
            })()}

          {/* All clips in session */}
          {latest.clips.length > 1 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
                All Clips — {latest.clips.length} detected
              </p>
              <div className="space-y-2">
                {latest.clips.map((clip, i) => {
                  const a = parseAnalysis(clip)
                  return (
                    <div
                      key={clip.ID}
                      className="flex items-center justify-between border border-border px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        Solo {i + 1}
                      </span>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {clip.Duration > 0 && (
                          <span>{formatDuration(clip.Duration)}</span>
                        )}
                        {a?.note_count > 0 && <span>{a.note_count} notes</span>}
                        {clip.AudioHitRatio > 0 && (
                          <span>
                            {(clip.AudioHitRatio * 100).toFixed(0)}% audio match
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className="border border-border p-6 mb-16">
          <p className="text-sm text-muted-foreground">
            Live data unavailable — the API is offline or no sessions have been
            recorded yet.
          </p>
        </div>
      )}

      {/* Recent sessions */}
      {data?.sessions && data.sessions.length > 1 && (
        <div className="mb-16">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
            Recent Sessions
          </p>
          <div className="space-y-3">
            {data.sessions.slice(1).map(s => (
              <SessionCard key={s.jobId} session={s} />
            ))}
          </div>
        </div>
      )}

      {/* All-time analytics */}
      {analytics && (
        <div className="mb-16">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
            All-Time Stats
          </p>

          {/* Key numbers */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="border border-border p-4">
              <p className="text-2xl font-bold">
                {analytics.attendance?.total_gigs ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">sessions</p>
            </div>
            <div className="border border-border p-4">
              <p className="text-2xl font-bold">
                {analytics.music?.total_notes != null
                  ? analytics.music.total_notes.toLocaleString()
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">notes played</p>
            </div>
            <div className="border border-border p-4">
              <p className="text-2xl font-bold text-brand">
                {analytics.attendance?.longest_streak_days ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">day streak</p>
            </div>
          </div>

          {/* Gigs by month */}
          {analytics.attendance?.gigs_by_month?.length > 0 && (
            <div className="mb-8">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
                Sessions by Month
              </p>
              <GigsByMonthChart data={analytics.attendance.gigs_by_month} />
            </div>
          )}

          {/* Gigs by day of week */}
          {analytics.attendance?.gigs_by_day_of_week?.length > 0 && (
            <div className="mb-8">
              <div className="flex items-baseline justify-between mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Sessions by Day
                </p>
                {analytics.attendance.busiest_week && (
                  <p className="text-xs text-muted-foreground">
                    busiest week: {analytics.attendance.busiest_week.week_of} ·{" "}
                    {analytics.attendance.busiest_week.count} sessions
                  </p>
                )}
              </div>
              <DayOfWeekChart data={analytics.attendance.gigs_by_day_of_week} />
            </div>
          )}

          {/* Pitch extremes + note density */}
          {analytics.music && (
            <div className="grid grid-cols-2 gap-3">
              {(analytics.music.highest_note_ever ||
                analytics.music.lowest_note_ever) && (
                <div className="border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    Pitch Range
                  </p>
                  <p className="text-sm font-medium">
                    {analytics.music.lowest_note_ever ?? "?"}–
                    {analytics.music.highest_note_ever ?? "?"}
                  </p>
                  {analytics.music.avg_pitch_range_semitones != null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      avg {analytics.music.avg_pitch_range_semitones} semitones
                    </p>
                  )}
                </div>
              )}
              {analytics.music.avg_note_density_per_s != null && (
                <div className="border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    Note Density
                  </p>
                  <p className="text-sm font-medium">
                    {analytics.music.avg_note_density_per_s} notes/sec
                  </p>
                  {analytics.music.avg_note_duration_s != null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      avg {analytics.music.avg_note_duration_s}s per note
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="mb-16">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
          How It Works
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          The challenge: find a single trombone in a full live jazz band (drums,
          bass, piano, saxophone) from a noisy stream recording, with no manual
          labeling. The audio model doesn&apos;t recognize me by voice or timbre
          directly. It learns a similarity embedding from a reference clip, then
          finds windows in the concert audio that occupy the same region of
          embedding space.
        </p>
        <div className="space-y-0">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center flex-shrink-0 w-5">
                <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] text-muted-foreground">
                    {i + 1}
                  </span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-border/40 my-1" />
                )}
              </div>
              <div className="pb-4">
                <span className="text-sm font-medium">{step.label}</span>
                <span className="text-sm text-muted-foreground">
                  {" "}
                  — {step.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy note */}
      <div className="border border-border/50 bg-secondary/30 p-4 mb-16">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground/70">
            A note on accuracy:
          </span>{" "}
          The audio model identifies me by similarity to a reference recording,
          not a unique voice print. On crowded bandstands it occasionally picks
          up other trombonists or trumpet players who favor the same low range.
          CLIP and face recognition catch most of these false positives, but not
          all of them.
        </p>
      </div>

      {/* Stack */}
      <div className="mb-10">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Stack
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH.map(t => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-sm bg-secondary text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>

      <a
        href="https://github.com/benny-conn/solo-trace"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        View on GitHub
        <ArrowUpRight size={13} />
      </a>
    </main>
  )
}
