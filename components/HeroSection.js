"use client"

import { useContext, useEffect, useRef } from "react"
import Link from "next/link"
import "./band.css"
import { AudioContext } from "@/components/AudioPlayer"
import { createBand } from "@/lib/band/create-band"

export default function HeroSection({ children }) {
  const rootRef = useRef(null)
  const bandRef = useRef(null)
  const { audioRef, setIsPlaying, isPlaying } = useContext(AudioContext)

  useEffect(() => {
    const band = createBand(rootRef.current, {
      onAudioStart() {
        // The homepage band and the recordings player take turns.
        audioRef.current?.pause()
        setIsPlaying(false)
      },
    })
    bandRef.current = band
    return () => {
      band.destroy()
      bandRef.current = null
    }
  }, [audioRef, setIsPlaying])

  useEffect(() => {
    if (isPlaying) bandRef.current?.pause()
  }, [isPlaying])

  return (
    <main ref={rootRef} className="bc-band" id="main-content">
      <section className="bc-hero site-width" aria-label="Meet Benny">
        <div className="bc-hero-top">
          <span>New York, NY</span>
          <button type="button" className="bc-sound" aria-pressed="false">
            <i aria-hidden="true" />
            <span>Sound off</span>
          </button>
        </div>
        <div className="bc-stage">
          <h1 className="bc-name">
            benny
            <br />
            conn
          </h1>
          <canvas aria-hidden="true" />
          <button
            type="button"
            className="bc-stage-control"
            aria-label="Play trombone. Hold and drag, or hold Space and use Left and Right arrows."
            aria-describedby="band-instructions"
          />
        </div>
        <p id="band-instructions" className="bc-sr">
          Start the band to bring out the instruments, then start the music.
          Hold and drag horizontally to play trombone. With the stage focused,
          hold Space or Enter and use the Left and Right arrow keys to change
          pitch. Release to stop your note.
        </p>
        <div className="bc-playbar">
          <button type="button" className="bc-start">
            Start the band
          </button>
          <button
            type="button"
            className="bc-music"
            aria-pressed="false"
            hidden
          >
            Start the music
          </button>
          <button type="button" className="bc-reset" hidden>
            Reset letters
          </button>
          <span className="bc-hint" hidden>
            Hold &amp; drag to solo.
          </span>
        </div>
        <div className="portfolio-intro">
          <h2>
            Software, events,
            <br />
            and music.
          </h2>
          <div>
            <p>
              I’m a software engineer and event producer in New York. I also
              play jazz trombone and lead the Benny Conn Big Band.
            </p>
            <p className="bc-current">
              Now at{" "}
              <a
                href="https://ambrook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ambrook
              </a>
              . Co-founder of{" "}
              <a
                href="https://curation.events"
                target="_blank"
                rel="noopener noreferrer"
              >
                Curation Events
              </a>
              .
            </p>
          </div>
        </div>
        <nav className="portfolio-index" aria-label="Explore my work">
          <a href="#events">
            <span>01</span> Events &amp; community{" "}
            <span aria-hidden="true">↓</span>
          </a>
          <a href="#software">
            <span>02</span> Software &amp; products{" "}
            <span aria-hidden="true">↓</span>
          </a>
          <a href="#live-music">
            <span>03</span> Live music <span aria-hidden="true">↓</span>
          </a>
        </nav>
      </section>
      {children}
      <footer className="bc-footer portfolio-width">
        <div className="bc-footer-links">
          <a
            href="https://github.com/benny-conn"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/benny-conn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
            Résumé
          </a>
          <Link href="/contact">Get in touch</Link>
        </div>
        <details className="bc-credits">
          <summary>Sound credits</summary>
          <p>
            Instrument samples from{" "}
            <a
              href="https://github.com/nbrosowsky/tonejs-instruments"
              target="_blank"
              rel="noopener noreferrer"
            >
              tonejs-instruments, N. Brosowsky and contributors
            </a>
            , under{" "}
            <a
              href="https://creativecommons.org/licenses/by/3.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY 3.0
            </a>
            . Original brass, piano, and bass: VSCO 2 / Versilian Studios.
            Saxophone: Karoryfer. Samples trimmed, normalized, and resampled for
            this arrangement. Walking bassline by Benny Conn.
          </p>
        </details>
      </footer>
      <div className="bc-slide-cursor" aria-hidden="true">
        <canvas className="bc-cursor-instrument" width="204" height="88" />
        <span className="bc-pitch" hidden>
          B♭3
        </span>
      </div>
      <div className="bc-announcement bc-sr" role="status" aria-live="polite" />
    </main>
  )
}
