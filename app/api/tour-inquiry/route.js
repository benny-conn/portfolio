// Sends tour-assistant quote requests to Benny through Resend.
// Needs RESEND_API_KEY and TOUR_INQUIRY_TO; TOUR_INQUIRY_FROM defaults to Resend's test sender,
// which can only deliver to the email address that owns the Resend account.

const RESEND_URL = "https://api.resend.com/emails"
const DEFAULT_FROM = "Tour assistants <onboarding@resend.dev>"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const recent = new Map()

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "")
const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

const tooSoon = (ip) => {
  const now = Date.now()
  const hits = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  hits.push(now)
  recent.set(ip, hits)
  return hits.length > 5
}

export async function POST(request) {
  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ error: "The form data couldn't be read." }, { status: 400 })

  // Bots fill the hidden field; accept quietly and drop it.
  if (clean(body.website, 200)) return Response.json({ ok: true })

  const name = clean(body.name, 120)
  const email = clean(body.email, 200)
  const role = clean(body.role, 60)
  const artist = clean(body.artist, 160)
  const dates = clean(body.dates, 160)
  const message = clean(body.message, 4000)
  const tools = Array.isArray(body.tools) ? body.tools.map((t) => clean(t, 40)).filter(Boolean).slice(0, 12) : []

  if (!name) return Response.json({ error: "Add your name." }, { status: 400 })
  if (!EMAIL_RE.test(email)) return Response.json({ error: "Add an email address I can reply to." }, { status: 400 })
  if (!message) return Response.json({ error: "Tell me a little about your tour." }, { status: 400 })

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (tooSoon(ip)) return Response.json({ error: "That's a lot of requests in a few minutes. Wait a moment." }, { status: 429 })

  const key = process.env.RESEND_API_KEY
  const to = process.env.TOUR_INQUIRY_TO
  if (!key || !to) {
    console.error("tour-inquiry: RESEND_API_KEY or TOUR_INQUIRY_TO is not set")
    return Response.json({ error: "The quote form isn't connected yet." }, { status: 503 })
  }

  const rows = [
    ["Name", name],
    ["Email", email],
    ["Role", role],
    ["Artist or tour", artist],
    ["Tour dates", dates],
    ["Tools", tools.join(", ")],
  ].filter(([, v]) => v)

  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${message}`
  const html = `<table style="font:14px/1.5 -apple-system,Helvetica,Arial,sans-serif;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="padding:2px 16px 2px 0;color:#666">${escape(k)}</td><td>${escape(v)}</td></tr>`)
    .join("")}</table><p style="font:14px/1.6 -apple-system,Helvetica,Arial,sans-serif;white-space:pre-wrap">${escape(message)}</p>`

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.TOUR_INQUIRY_FROM || DEFAULT_FROM,
        to: to.split(",").map((s) => s.trim()),
        reply_to: email,
        subject: `Tour assistant quote request: ${artist || name}`,
        text,
        html,
      }),
    })
    if (!res.ok) {
      console.error("tour-inquiry: Resend responded", res.status, await res.text().catch(() => ""))
      return Response.json({ error: "Your request didn't go through." }, { status: 502 })
    }
  } catch (err) {
    console.error("tour-inquiry: Resend request failed", err)
    return Response.json({ error: "Your request didn't go through." }, { status: 502 })
  }

  return Response.json({ ok: true })
}
