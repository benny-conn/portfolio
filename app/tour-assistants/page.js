import Image from "next/image"
import "./tour-assistants.css"
import DemoVideo from "@/components/tour-assistants/DemoVideo"
import Laminates from "@/components/tour-assistants/Laminates"
import InquiryForm from "@/components/tour-assistants/InquiryForm"

export const metadata = {
  title: "Tour assistants",
  description:
    "A personal AI assistant set up for your tour. It reads the advance, keeps Master Tour current, chases what's missing and asks you about anything that needs a decision. One-time setup in about a week.",
  alternates: { canonical: "/tour-assistants" },
  openGraph: {
    title: "A personal AI assistant, set up for your tour",
    description:
      "Benny Conn sets up an AI assistant around the way your touring team already works. One-time setup in about a week.",
    images: [{ url: "/tour-assistants/demo-poster.jpg", width: 1600, height: 900 }],
  },
}

const THREAD = [
  { time: "11:20 AM" },
  {
    from: "assistant",
    text: "Richmond's advance reply is in. Load-in, parking, power, catering and the settlement contact are updated in Master Tour, and I checked they saved.",
  },
  { time: "2:05 PM" },
  {
    from: "assistant",
    flag: true,
    text: "River Room moved its curfew to 10:30. Your set is scheduled until 10:45. I haven't changed anything. How do you want to handle it?",
    replies: ["Ask Dana for 15 min", "Start the set at 9:00", "I'll call her"],
  },
  { from: "you", text: "ask for 15" },
  { from: "assistant", text: "Sent to Dana. I'll update the schedule when she answers." },
  { time: "1:10 AM" },
  {
    from: "assistant",
    text: "While you ran the show: 64 updates saved, 11 venues followed up, Richmond day sheet drafted. Two things need you in the morning.",
  },
]

const JOBS = [
  "Reads your inbox, riders and PDFs",
  "Matches each detail to the right show",
  "Updates Master Tour and checks it saved",
  "Spots contradictions between sources",
  "Chases what's missing",
  "Drafts replies and follow-ups",
  "Tracks unanswered questions",
  "Prepares day sheets and settlement",
  "Watches deadlines",
  "Brings decisions to you",
]

const STEPS = [
  {
    when: "Week 0",
    title: "Intro call",
    body: "We walk through your tour, your team, and the tools you already use. I'll tell you what I'd set up and send a quote.",
  },
  {
    when: "Week 1",
    title: "Setup",
    body: "In about a week I configure your assistant and connect it to Master Tour, email, Sheets, Docs, Slack or whatever your team runs on. Together we decide what it can update on its own and what waits for your OK.",
  },
  {
    when: "On tour",
    title: "Pilot",
    body: "It runs on one real tour's advance. We review what it does, and I revise the setup until it fits the way you work.",
  },
  {
    when: "After",
    title: "Ongoing support",
    body: "I keep it tuned as the tour changes: fixes, adjustments to how it works, new automations, and a direct line to me when something's off.",
  },
]

const FAQ = [
  {
    q: "Do I have to switch tools?",
    a: "No. The assistant works inside what you already use: Master Tour, your email, Google Sheets and Docs, Slack, WhatsApp and similar tools.",
  },
  {
    q: "Will it send emails or change things without asking?",
    a: "Only the things you've approved. During setup we agree which updates it makes on its own and which ones wait for your OK, and you can change that any time.",
  },
  {
    q: "What does the pilot cover?",
    a: "One tour: incoming advance correspondence, reviewed updates in Master Tour, and a clear list of what still needs attention.",
  },
  {
    q: "Is this custom software I'll have to maintain?",
    a: "No. I set it up on an existing AI assistant platform and add small connectors where your tools need them. I handle the maintenance as part of support.",
  },
  {
    q: "How is it priced?",
    a: "Setup is a one-time fee for you and your team, not a charge per tour. I quote it after the intro call based on how you work and the tools we connect. Ongoing support is a separate monthly quote.",
  },
]

export default function TourAssistantsPage() {
  return (
    <main className="ta">
      <section className="ta-hero ta-wrap">
        <h1 className="ta-title">A personal AI assistant, set up for your tour.</h1>
        <p className="ta-lede">
          I configure an AI assistant around the way your team already works. It reads the advance, keeps Master Tour
          current, chases what&apos;s missing, and texts you when something needs your call.
        </p>
        <div className="ta-actions">
          <a href="#quote" className="ta-btn ta-btn--primary">
            Get a quote
          </a>
          <a href="#demo" className="ta-btn">
            Watch the demo
          </a>
        </div>
      </section>

      <section id="demo" className="ta-wrap ta-wrap--wide ta-demo" aria-label="Demo video">
        <DemoVideo src="/tour-assistants/demo.mp4" poster="/tour-assistants/demo-poster.jpg" />
      </section>

      <section className="ta-wrap ta-split" aria-labelledby="ta-thread-title">
        <div className="ta-split-copy">
          <h2 id="ta-thread-title">It texts you when it matters.</h2>
          <p>
            Most of the work happens quietly: replies read, fields updated, follow-ups drafted. You hear about it in one
            thread. It tells you what changed, what&apos;s still out, and the few things that need your call.
          </p>
          <p>
            It doesn&apos;t guess. When two sources disagree, it brings you the conflict and the options, and you decide.
          </p>
        </div>
        <figure className="ta-thread">
          <div className="ta-thread-head">
            <span className="ta-dot" aria-hidden="true" />
            <span>Assistant</span>
          </div>
          <ol className="ta-thread-body">
            {THREAD.map((m, i) =>
              m.time ? (
                <li key={i} className="ta-thread-time">
                  {m.time}
                </li>
              ) : (
                <li key={i} className={`ta-msg ta-msg--${m.from}${m.flag ? " ta-msg--flag" : ""}`}>
                  <p>{m.text}</p>
                  {m.replies && (
                    <div className="ta-replies" aria-label="Suggested replies">
                      {m.replies.map((r, j) => (
                        <span key={r} className={j === 0 ? "is-picked" : undefined}>
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              )
            )}
          </ol>
          <figcaption>Sample thread from a fictional tour.</figcaption>
        </figure>
      </section>

      <section className="ta-wrap ta-layers-section" aria-labelledby="ta-layers-title">
        <h2 id="ta-layers-title">It takes the paperwork. You keep the calls.</h2>
        <div className="ta-layers">
          <div className="ta-layer ta-layer--you">
            <div className="ta-layer-name">
              <span>Layer 3</span>
              You
            </div>
            <p>Negotiation, relationships, priorities, emergencies, money decisions and show day stay with you.</p>
          </div>
          <div className="ta-layer ta-layer--assistant">
            <div className="ta-layer-name">
              <span>Layer 2</span>
              Your assistant
            </div>
            <ul>
              {JOBS.map((j) => (
                <li key={j}>{j}</li>
              ))}
            </ul>
          </div>
          <div className="ta-layer ta-layer--plan">
            <div className="ta-layer-name">
              <span>Layer 1</span>
              Master Tour
            </div>
            <p>Still your source of truth for dates, schedules, hotels, travel, contacts, guests and settlement.</p>
          </div>
        </div>
      </section>

      <section className="ta-wrap ta-steps-section" aria-labelledby="ta-steps-title">
        <h2 id="ta-steps-title">How setup works</h2>
        <ol className="ta-steps">
          {STEPS.map((s) => (
            <li key={s.title}>
              <span className="ta-step-when">{s.when}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="ta-pricing" aria-labelledby="ta-pricing-title">
        <div className="ta-wrap">
          <h2 id="ta-pricing-title">Set up once, for you.</h2>
          <p className="ta-pricing-lede">
            Setup is a one-time fee for you and your team, not a charge per tour. I quote it after the intro call based on
            how you work and the tools we connect. Here&apos;s what each part includes.
          </p>
        </div>
        <Laminates />
        <div className="ta-wrap ta-pricing-cta">
          <a href="#quote" className="ta-btn ta-btn--primary">
            Get a quote
          </a>
        </div>
      </section>

      <section className="ta-wrap ta-faq-section" aria-labelledby="ta-faq-title">
        <h2 id="ta-faq-title">Questions</h2>
        <div className="ta-faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="quote" className="ta-wrap ta-quote" aria-labelledby="ta-quote-title">
        <div className="ta-quote-intro">
          <h2 id="ta-quote-title">Tell me about your tour.</h2>
          <div className="ta-me">
            <Image src="/tour-assistants/benny.jpg" alt="Benny Conn" width={72} height={72} />
            <p>
              I&apos;m Benny, a software engineer and jazz trombonist in New York. I set up every assistant myself and
              stay on to support it. I&apos;ll reply with next steps and a time for the intro call.
            </p>
          </div>
        </div>
        <InquiryForm />
      </section>
    </main>
  )
}
