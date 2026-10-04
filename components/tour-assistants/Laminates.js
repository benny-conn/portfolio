"use client"

import { useEffect, useRef, useState } from "react"

const PASSES = [
  {
    access: "ALL ACCESS",
    title: "Setup + pilot",
    price: "One-time, quoted per tour",
    items: [
      "Intro call and a walkthrough of how your team works",
      "About one week of setup",
      "An assistant configured for your tour",
      "Connected to Master Tour, email, Sheets, Docs, Slack and the rest of your stack",
      "Approval rules you choose",
      "Testing on your real advance",
      "Revisions through the pilot",
    ],
    footer: "Ready in about a week",
  },
  {
    access: "CREW",
    title: "Ongoing support",
    price: "Monthly, quoted per tour",
    items: [
      "Monitoring and fixes",
      "Revisions as your process changes",
      "New automations when you need them",
      "Updates when your tools change",
      "A direct line to Benny",
    ],
    footer: "Starts after the pilot",
  },
]

// Two tour laminates on lanyards. They swing into place once when they scroll into view.
export default function Laminates() {
  const ref = useRef(null)
  const [hung, setHung] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHung(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`ta-passes${hung ? " is-hung" : ""}`}>
      {PASSES.map((pass, i) => (
        <article key={pass.title} className={`ta-pass ta-pass--${i + 1}`} aria-label={`${pass.title}: ${pass.price}`}>
          <div className="ta-pass-strap" aria-hidden="true" />
          <div className="ta-pass-clip" aria-hidden="true" />
          <div className="ta-pass-card">
            <div className="ta-pass-slot" aria-hidden="true" />
            <div className="ta-pass-access" aria-hidden="true">
              {pass.access}
            </div>
            <h3>{pass.title}</h3>
            <p className="ta-pass-price">{pass.price}</p>
            <ul>
              {pass.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="ta-pass-foot">
              <span className="ta-pass-code" aria-hidden="true" />
              <span>{pass.footer}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
