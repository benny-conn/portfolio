import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { events } from "@/lib/events"

export function EventStats({ stats, className = "" }) {
  return (
    <dl className={`event-stats ${className}`}>
      {stats.map(({ value, label }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function EventPortfolio() {
  return (
    <section
      id="events"
      className="portfolio-events"
      aria-labelledby="events-title"
    >
      <div className="portfolio-width">
        <div className="section-kicker">
          <p>01 / Events &amp; community</p>
          <a
            href="https://curation.events"
            target="_blank"
            rel="noopener noreferrer"
          >
            My event studio <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="section-heading">
          <h2 id="events-title">
            A reason to
            <br />
            get together.
          </h2>
          <p>
            I co-founded Curation Events to make gatherings worth showing up
            for. From the first idea to the last guest, I bring the creative
            direction, people, and production together.
          </p>
        </div>
        <article className="event-feature">
          <Link
            href="/work/curation-events#spotify"
            className="event-feature-image"
          >
            <Image
              src="/images/events/spotify.webp"
              alt="Guests exploring activity stations at the Spotify and Aetna wellness event"
              fill
              sizes="(max-width: 760px) 100vw, 60vw"
              className="object-cover"
            />
            <span className="photo-caption">Spotify × Aetna / New York</span>
          </Link>
          <div className="event-feature-copy">
            <p className="eyebrow">{events.spotify.category}</p>
            <h3>{events.spotify.name}</h3>
            <p>{events.spotify.description}</p>
            <EventStats stats={events.spotify.stats} />
            <Link href="/work/curation-events#spotify" className="text-link">
              Inside the event <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </article>
        <div className="event-duo">
          <article className="event-teaser">
            <Link
              href="/work/curation-events#ambrook-jazz"
              className="event-teaser-image"
            >
              <Image
                src="/images/events/ambrook-jazz.webp"
                alt="Guests and musicians gathered for the first jazz night at Ambrook"
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
                className="object-cover"
              />
              <span className="photo-caption">Jazz at Ambrook / New York</span>
              <span className="image-link-arrow">
                <ArrowUpRight size={23} aria-hidden="true" />
              </span>
            </Link>
            <div className="event-teaser-copy">
              <p className="eyebrow">{events.ambrook.category}</p>
              <h3>Jazz at Ambrook</h3>
              <p>{events.ambrook.description}</p>
              <EventStats stats={events.ambrook.stats} />
            </div>
          </article>
          <article className="event-teaser">
            <Link
              href="/work/curation-events#gig-launch"
              className="event-teaser-image event-gig-photo"
            >
              <Image
                src="/images/events/gig-launch.webp"
                alt="The full room at the ticketed Gig App launch in Williamsburg"
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
                className="object-cover"
              />
              <span className="photo-caption">
                Gig App × Curation / Williamsburg
              </span>
              <span className="image-link-arrow">
                <ArrowUpRight size={23} aria-hidden="true" />
              </span>
            </Link>
            <div className="event-teaser-copy">
              <p className="eyebrow">{events.gig.category}</p>
              <h3>Gig App launch</h3>
              <p>{events.gig.description}</p>
              <EventStats stats={events.gig.stats} />
              <Link href="/work/gig-app" className="text-link">
                See the app behind it{" "}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
        <article className="planned-event">
          <div>
            <p className="eyebrow">{events.chobani.category}</p>
            <h3>{events.chobani.name}</h3>
          </div>
          <div>
            <p>{events.chobani.description}</p>
            <Link href="/work/curation-events#chobani" className="text-link">
              Explore the proposals{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
