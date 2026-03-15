// Server-only — uses SOLO_TRACE_API_KEY which is not exposed to the client

const NOTE_CHROMA = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
}

// Always display flats, not sharps
const CHROMA_TO_FLAT = [
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

function toFlatName(note) {
  const chroma = NOTE_CHROMA[note]
  return chroma !== undefined ? CHROMA_TO_FLAT[chroma] : note
}

function parseAnalysis(p) {
  if (!p.Analysis) return null
  try {
    return typeof p.Analysis === "string" ? JSON.parse(p.Analysis) : p.Analysis
  } catch {
    return null
  }
}

function buildChromaFreq(performances) {
  const freq = new Array(12).fill(0)
  for (const p of performances) {
    for (const { note, count } of parseAnalysis(p)?.most_common_notes ?? []) {
      const c = NOTE_CHROMA[note]
      if (c !== undefined) freq[c] += count
    }
  }
  return freq
}

function aggregateTopNotes(performances) {
  const freq = {}
  for (const p of performances) {
    for (const { note, count } of parseAnalysis(p)?.most_common_notes ?? []) {
      const flat = toFlatName(note)
      freq[flat] = (freq[flat] || 0) + count
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([note, count]) => ({ note, count }))
}

// Parse a "YYYY-MM-DD" upload date string as noon UTC to safely land
// on the correct NYC calendar day regardless of offset
function parseUploadDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
}

export function getRelativeDate(date) {
  const toNYCDay = d => {
    const s = new Date(
      d.toLocaleString("en-US", { timeZone: "America/New_York" }),
    )
    s.setHours(0, 0, 0, 0)
    return s
  }
  const diffDays = Math.round((toNYCDay(new Date()) - toNYCDay(date)) / 864e5)
  if (diffDays <= 1) return "last night"
  if (diffDays < 7) return `${diffDays} nights ago`
  const w = Math.floor(diffDays / 7)
  return w === 1 ? "last week" : `${w} weeks ago`
}

export async function fetchSoloTraceData() {
  const baseUrl = process.env.NEXT_PUBLIC_SOLO_TRACE_URL
  const apiKey = process.env.SOLO_TRACE_API_KEY
  const personId = process.env.NEXT_PUBLIC_SOLO_TRACE_PERSON_ID

  if (!baseUrl || !apiKey || !personId) return null

  try {
    const h = { "X-API-Key": apiKey }
    const [perfsRes, jobsRes] = await Promise.all([
      fetch(`${baseUrl}/api/persons/${personId}/performances`, {
        headers: h,
        next: { revalidate: 3600 },
      }),
      fetch(`${baseUrl}/api/persons/${personId}/jobs`, {
        headers: h,
        next: { revalidate: 3600 },
      }),
    ])

    if (!perfsRes.ok || !jobsRes.ok) return null

    const [performances, jobs] = await Promise.all([
      perfsRes.json(),
      jobsRes.json(),
    ])

    if (!performances?.length) return null

    const doneJobs = (jobs ?? []).filter(j => j.Status === "done").slice(0, 4)
    if (!doneJobs.length) return null

    const sessions = doneJobs.map(job => {
      const clips = performances.filter(p => p.JobID === job.ID)

      const totalNotes = clips.reduce(
        (s, p) => s + (parseAnalysis(p)?.note_count ?? 0),
        0,
      )

      const longestClip = clips.reduce(
        (best, p) => ((p.Duration ?? 0) > (best?.Duration ?? 0) ? p : best),
        null,
      )

      const date = job.VideoUploadDate
        ? parseUploadDate(job.VideoUploadDate)
        : new Date(job.UpdatedAt)

      return {
        jobId: job.ID,
        videoTitle: job.VideoTitle,
        date,
        relativeDate: getRelativeDate(date),
        soloCount: clips.length,
        totalNotes,
        topNotes: aggregateTopNotes(clips),
        chromaFreq: buildChromaFreq(clips),
        longestClip,
        clips,
      }
    })

    return { latest: sessions[0], sessions }
  } catch {
    return null
  }
}
