import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react"

export const metadata = {
  title: "Curation Events — Benny Conn",
}

const LOGOS = [
  { src: "/images/curation/logos/spotify.png", alt: "Spotify", w: 100 },
  { src: "/images/curation/logos/aetna.png", alt: "Aetna", w: 80 },
  { src: "/images/curation/logos/niva-trans.png", alt: "NIVA", w: 60 },
  { src: "/images/curation/logos/A2IM-trans.png", alt: "A2IM", w: 70 },
  {
    src: "/images/curation/logos/interlude-trans.png",
    alt: "Interlude",
    w: 90,
    invert: true,
  },
  { src: "/images/curation/logos/rr-trans.png", alt: "RR", w: 50 },
]

const PROPOSALS = [
  {
    title: "Chobani Town Hall",
    sub: "New York, NY · April 2026",
    desc: "Full event production proposal for a multi-location branded town hall tied to Chobani's World Cup involvement, featuring an inflatable tunnel entrance, live-stream to four U.S. sites, and immersive arrival experience.",
    file: "/pdfs/curation/chobani town hall x curation.pdf",
  },
  {
    title: "Chobani Wellness Day",
    sub: "Twin Falls, ID · June 2026/2027",
    desc: "1,000–1,500 attendee wellness festival at Twin Falls County Fairgrounds. Multi-generational programming across physical, financial, and emotional wellness pillars, including a mock farmer's market with AI nutrition receipts.",
    file: "/pdfs/curation/curation x chobani - final event proposal.pdf",
  },
  {
    title: "Spotify Event Proposal",
    sub: "New York & Los Angeles",
    desc: "Experiential activation proposal for Spotify, bringing the brand to life through curated music-forward environments.",
    file: "/pdfs/curation/spotify x curation event proposal-v2.pdf",
  },
]

export default function CurationEventsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <Link
        href="/#work"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        <ArrowLeft size={14} />
        Work
      </Link>

      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        Co-Founder & Creative Director
      </p>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-4xl font-bold">Curation Events</h1>
        <a
          href="https://curation.events"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 mt-2 flex-shrink-0 ml-4">
          curation.events
          <ArrowUpRight size={13} />
        </a>
      </div>

      <p className="text-base text-muted-foreground leading-relaxed mb-12">
        Co-founded a full-service experiential event studio delivering
        large-scale corporate activations across New York and Los Angeles. We
        handled everything from creative concept and vendor coordination to
        on-site production and digital engagement systems for clients including
        Spotify and Aetna.
      </p>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2 mb-12">
        <div className="col-span-2 relative aspect-[4/3] overflow-hidden rounded-sm">
          <Image
            src="/images/curation/background.jpg"
            alt="Curation Events production"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="relative flex-1 overflow-hidden rounded-sm">
            <Image
              src="/images/curation/having-fun.jpg"
              alt="Guests at Curation event"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative flex-1 overflow-hidden rounded-sm">
            <Image
              src="/images/curation/food.jpg"
              alt="Curation event catering"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 py-8 border-y border-border mb-12">
        {[
          { value: "1,000+", label: "Attendees Served" },
          { value: "200+", label: "Staff & Vendors" },
          { value: "2", label: "Markets: NYC & LA" },
        ].map(s => (
          <div key={s.label} className="flex flex-col gap-2">
            <span className="text-4xl font-bold text-brand">{s.value}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest leading-snug">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Client logos */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
          Trusted By
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          {LOGOS.map(logo => (
            <Image
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              width={logo.w * 2}
              height={40}
              className={`object-contain opacity-60 hover:opacity-100 transition-opacity ${logo.invert ? "invert" : ""}`}
              style={{ width: logo.w, height: "auto" }}
            />
          ))}
        </div>
      </div>

      {/* Proposals */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          Event Proposals
        </p>
        <div className="space-y-3">
          {PROPOSALS.map(p => (
            <a
              key={p.title}
              href={p.file}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 border border-border rounded-sm px-5 py-4 hover:border-brand/60 transition-all duration-200">
              <FileText
                size={16}
                className="text-muted-foreground group-hover:text-brand transition-colors mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium">{p.title}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {p.sub}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </div>
              <ArrowUpRight
                size={13}
                className="text-muted-foreground group-hover:text-brand transition-colors shrink-0 mt-0.5"
              />
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
