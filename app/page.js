import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { projects } from "@/lib/projects"
import HeroSection from "@/components/HeroSection"
import EventPortfolio from "@/components/EventPortfolio"
import MusicSection from "@/components/MusicSection"
import ContactSection from "@/components/ContactSection"

const SOFTWARE_IMAGES = {
  gallery: {
    src: "/gallery-home.png",
    alt: "Gallery's art-sharing website",
  },
  "gig-app": { src: "/gig.png", alt: "Gig App wordmark" },
}

function SoftwareProject({ project }) {
  const image = SOFTWARE_IMAGES[project.slug]
  return (
    <article className="software-project">
      <Link
        href={`/work/${project.slug}`}
        className={`software-image software-${project.slug}`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
          className="object-contain"
        />
        <span className="image-link-arrow">
          <ArrowUpRight size={23} aria-hidden="true" />
        </span>
      </Link>
      <div className="project-caption">
        <p className="eyebrow">{project.role}</p>
        <h3>
          <Link href={`/work/${project.slug}`}>{project.name}</Link>
        </h3>
        <p>{project.tagline}</p>
        <p className="project-tools">{project.tech.slice(0, 4).join(" / ")}</p>
      </div>
    </article>
  )
}

export default function Home() {
  const software = projects.filter(p => SOFTWARE_IMAGES[p.slug])
  const minecraft = projects.find(p => p.slug === "minecraft-plugins")

  return (
    <HeroSection>
      <div id="work" className="work-divider portfolio-width">
        <p className="eyebrow">Selected work</p>
        <p>On the screen. In the room. On the bandstand.</p>
        <ArrowDown size={18} aria-hidden="true" />
      </div>
      <EventPortfolio />
      <section
        id="software"
        className="portfolio-software portfolio-width"
        aria-labelledby="software-title"
      >
        <div className="section-kicker">
          <p>02 / Software &amp; products</p>
          <a
            href="https://github.com/benny-conn"
            target="_blank"
            rel="noopener noreferrer"
          >
            On GitHub <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="section-heading">
          <h2 id="software-title">
            Ideas with
            <br />
            infrastructure.
          </h2>
          <p>
            I’m a software engineer at Ambrook. My work spans backend systems,
            full-stack products, and tools for creative communities. I like
            making the complicated parts work so people can get on with theirs.
          </p>
        </div>
        <div className="software-grid">
          {software.map(project => (
            <SoftwareProject key={project.slug} project={project} />
          ))}
        </div>
        <div className="project-notes">
          <a
            href="https://jetside.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="eyebrow">Also building</span>
            <span className="note-title">
              Jetside <ArrowUpRight size={18} aria-hidden="true" />
            </span>
            <span>Maintenance coordination for business aviation.</span>
          </a>
          {minecraft && (
            <Link href={`/work/${minecraft.slug}`}>
              <span className="eyebrow">An early chapter</span>
              <span className="note-title">
                Minecraft Plugins <ArrowUpRight size={18} aria-hidden="true" />
              </span>
              <span>Java &amp; Kotlin tools used by thousands of servers.</span>
            </Link>
          )}
        </div>
        <Link href="/tour-assistants" className="tour-note">
          <div>
            <p className="eyebrow">Where software meets live music</p>
            <h3>A personal assistant for your tour.</h3>
          </div>
          <span>
            Explore a one-tour pilot{" "}
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </Link>
      </section>
      <section
        id="live-music"
        className="portfolio-music"
        aria-labelledby="music-title"
      >
        <div className="portfolio-width">
          <div className="section-kicker">
            <p>03 / Music &amp; the bandstand</p>
            <Link href="/music">
              All recordings <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="music-layout">
            <figure className="music-photo">
              <div>
                <Image
                  src="/trombone-4.jpg"
                  alt="Benny playing trombone with a jazz ensemble at Smalls"
                  fill
                  sizes="(max-width: 760px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption>
                A different kind of conversation. / Live at Smalls
              </figcaption>
            </figure>
            <div className="music-copy">
              <h2 id="music-title">
                Always room
                <br />
                for a solo.
              </h2>
              <p>
                I play jazz trombone and lead the Benny Conn Big Band, rooted in
                bebop and swing. Music is a part of my life that keeps finding
                its way into everything else I do.
              </p>
              <p className="eyebrow music-list-label">
                A few things to listen to
              </p>
              <MusicSection limit={3} />
              <Link href="/music" className="text-link">
                More from the band <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ContactSection
        idPrefix="home-contact"
        className="portfolio-contact portfolio-width"
      />
    </HeroSection>
  )
}
