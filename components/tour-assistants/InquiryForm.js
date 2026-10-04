"use client"

import { useState } from "react"
import Link from "next/link"

const ROLES = ["Tour manager", "Production manager", "Artist manager", "Something else"]
const TOOLS = ["Master Tour", "Gmail", "Outlook", "Google Sheets", "Google Docs", "Slack", "WhatsApp", "Dropbox"]

export default function InquiryForm() {
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState("")
  const [sentTo, setSentTo] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      role: data.get("role"),
      artist: data.get("artist"),
      dates: data.get("dates"),
      tools: data.getAll("tools"),
      message: data.get("message"),
      website: data.get("website"),
    }
    setStatus("sending")
    setError("")
    try {
      const res = await fetch("/api/tour-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Your request didn't go through.")
      setSentTo({ name: payload.name, email: payload.email })
      setStatus("sent")
      form.reset()
    } catch (err) {
      setError(err.message || "Your request didn't go through.")
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div className="ta-form ta-form--sent" role="status">
        <h3>Request sent.</h3>
        <p>
          Thanks, {sentTo.name}. I&apos;ll reply to {sentTo.email} with next steps and a time for the intro call.
        </p>
      </div>
    )
  }

  return (
    <form className="ta-form" onSubmit={onSubmit} noValidate={false}>
      <div className="ta-field">
        <label htmlFor="ta-name">Name</label>
        <input id="ta-name" name="name" required autoComplete="name" maxLength={120} />
      </div>
      <div className="ta-field">
        <label htmlFor="ta-email">Email</label>
        <input id="ta-email" name="email" type="email" required autoComplete="email" maxLength={200} />
      </div>
      <div className="ta-field">
        <label htmlFor="ta-role">Your role</label>
        <select id="ta-role" name="role" defaultValue={ROLES[0]}>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="ta-field">
        <label htmlFor="ta-artist">
          Artist or tour <span>optional</span>
        </label>
        <input id="ta-artist" name="artist" maxLength={160} />
      </div>
      <div className="ta-field ta-field--wide">
        <label htmlFor="ta-dates">
          Tour dates <span>optional</span>
        </label>
        <input id="ta-dates" name="dates" placeholder="e.g. 24 shows, Oct 19 to Dec 4" maxLength={160} />
      </div>
      <fieldset className="ta-field ta-field--wide ta-tools">
        <legend>
          Tools your team uses <span>pick any</span>
        </legend>
        <div>
          {TOOLS.map((t) => (
            <label key={t} className="ta-chip">
              <input type="checkbox" name="tools" value={t} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="ta-field ta-field--wide">
        <label htmlFor="ta-message">What eats most of your time?</label>
        <textarea
          id="ta-message"
          name="message"
          rows={5}
          required
          maxLength={4000}
          placeholder="Advancing 30 shows from a phone, hotel changes, guest list requests in four group chats…"
        />
      </div>
      <div className="ta-honeypot" aria-hidden="true">
        <label htmlFor="ta-website">Website</label>
        <input id="ta-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="ta-field--wide ta-form-actions">
        <button type="submit" className="ta-btn ta-btn--primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending request…" : "Request a quote"}
        </button>
        {status === "error" && (
          <p className="ta-form-error" role="alert">
            {error} Try again, or reach me through the <Link href="/contact">contact page</Link>.
          </p>
        )}
      </div>
    </form>
  )
}
