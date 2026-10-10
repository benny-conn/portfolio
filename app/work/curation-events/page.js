import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react"
import { events } from "@/lib/events"
import { EventStats } from "@/components/EventPortfolio"
import EventFilm from "@/components/EventFilm"
import ContactSection from "@/components/ContactSection"

export const metadata = {
  title: "Events & Community",
  description:
    "Benny Conn's event production and community programming: Spotify × Aetna, a full-capacity Williamsburg launch, monthly jazz at Ambrook, and Chobani event concepts.",
  alternates: { canonical: "/work/curation-events" },
}

const PROPOSALS = [
  {
    title: "Chobani Town Hall",
    desc: "A multi-location town hall concept with an immersive arrival experience and a live stream connecting four U.S. sites.",
    file: "/pdfs/curation/chobani town hall x curation.pdf",
  },
  {
    title: "Chobani Wellness Day",
    desc: "A wellness festival concept at Twin Falls County Fairgrounds, with programming around physical, financial, and emotional wellness.",
    file: "/pdfs/curation/curation x chobani - final event proposal.pdf",
  },
]

export default function CurationEventsPage() {
  return (
    <main className="event-page portfolio-width" id="main-content">
      <Link href="/#events" className="text-link event-page-back">
        <ArrowLeft size={15} aria-hidden="true" /> Events &amp; community
      </Link>
      <header className="event-page-heading">
        <p className="eyebrow">
          Co-founder &amp; Creative Director / Curation Events
        </p>
        <h1>
          Good company.
          <br />
          Thoughtful production.
        </h1>
        <p className="event-page-lede">
          I bring the idea, the people, and the practical details together.
          Through Curation Events, I produce corporate gatherings and launch
          events. At Ambrook, I’m building a recurring reason to get together
          through live jazz.
        </p>
        <a
          href="https://curation.events"
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          Visit the event studio <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </header>
      <figure>
        <EventFilm className="event-page-hero" />
        <figcaption className="event-page-caption">
          Live music / Curation Events
        </figcaption>
      </figure>
      <section
        id="spotify"
        className="event-story"
        aria-labelledby="spotify-title"
      >
        <div className="event-story-head">
          <div>
            <p className="eyebrow">Delivered / New York</p>
            <h2 id="spotify-title">{events.spotify.name}</h2>
          </div>
          <div>
            <p>{events.spotify.description}</p>
            <p className="mt-5">{events.spotify.role}</p>
          </div>
        </div>
        <EventStats stats={events.spotify.stats} />
        <div className="event-story-gallery">
          <div>
            <Image
              src="/images/events/spotify.webp"
              alt="Guests exploring the Spotify and Aetna event's activity stations"
              fill
              sizes="(max-width: 760px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
          <div>
            <Image
              src="/images/events/spotify-clay.webp"
              alt="Guests making clay pieces at the Spotify event"
              fill
              sizes="(max-width: 760px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
        <p className="mt-7 max-w-3xl">
          The experience brought together a clay workshop, illustrated
          portraits, surprise giveaways, and food. We also built an interactive
          rhythm game, connecting my software work with the physical event.
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-5">
          <a
            href={events.spotify.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            The full event story <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a
            href="/pdfs/curation/spotify x curation event proposal-v2.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            View the proposal <FileText size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section
        id="ambrook-jazz"
        className="event-story event-story-simple"
        aria-labelledby="ambrook-title"
      >
        <div>
          <p className="eyebrow">Ongoing / Monthly programming</p>
          <h2 id="ambrook-title">{events.ambrook.name}</h2>
        </div>
        <div>
          <p>{events.ambrook.description}</p>
          <EventStats stats={events.ambrook.stats} />
          <figure className="event-story-photo ambrook-photo">
            <Image
              src="/images/events/ambrook-jazz.webp"
              alt="Guests and musicians at Ambrook’s first jazz night"
              width={2000}
              height={1500}
              sizes="(max-width: 760px) 100vw, 50vw"
              className="w-full h-auto"
            />
          </figure>
          <Link href="/music" className="text-link mt-5">
            Hear the music side of my work{" "}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section
        id="gig-launch"
        className="event-story event-story-simple"
        aria-labelledby="gig-title"
      >
        <div>
          <p className="eyebrow">Delivered / Williamsburg, Brooklyn</p>
          <h2 id="gig-title">{events.gig.name}</h2>
        </div>
        <div>
          <p>{events.gig.description}</p>
          <EventStats stats={events.gig.stats} />
          <figure className="event-story-photo gig-photo">
            <Image
              src="/images/events/gig-launch.webp"
              alt="A full room at the ticketed Gig App event in Williamsburg"
              width={1800}
              height={2400}
              sizes="(max-width: 760px) 100vw, 50vw"
              className="w-full h-auto"
            />
          </figure>
          <Link href="/work/gig-app" className="text-link mt-5">
            Explore Gig App <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section
        id="chobani"
        className="event-story"
        aria-labelledby="chobani-title"
      >
        <div className="event-story-head">
          <div>
            <p className="eyebrow">Concept &amp; pre-production</p>
            <h2 id="chobani-title">{events.chobani.name}</h2>
          </div>
          <div>
            <p>{events.chobani.description}</p>
          </div>
        </div>
        <div className="event-proposals">
          {PROPOSALS.map(proposal => (
            <a
              key={proposal.title}
              href={proposal.file}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText size={18} aria-hidden="true" />
              <div>
                <h3>{proposal.title}</h3>
                <p>{proposal.desc}</p>
              </div>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>
      <div className="event-page-next">
        <Link href="/contact" className="text-link">
          Have something in mind? <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
        <Link href="/#software" className="text-link">
          Explore my software work <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <ContactSection idPrefix="events-contact" />
    </main>
  )
}
