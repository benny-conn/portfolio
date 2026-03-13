import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { TrackStats, SearchDemo } from "./TrackComponents"

export const metadata = {
  title: "Trackyard — Benny Conn",
}

const ARCH_NODES = [
  { label: "Music Catalog", sub: "50K+ tracks · GCP Storage" },
  { label: "AI Indexer", sub: "Embeddings · Vector search" },
  { label: "Search API", sub: "Go · PostgreSQL" },
  { label: "Film & TV", sub: "Licensing clients" },
]

export default function TrackyardPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <Link
        href="/#work"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        <ArrowLeft size={14} />
        Work
      </Link>

      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        CTO & Founding Engineer
      </p>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-4xl font-bold">Trackyard</h1>
        <a
          href="https://trackyard.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 mt-2 flex-shrink-0 ml-4">
          trackyard.com
          <ArrowUpRight size={13} />
        </a>
      </div>

      <p className="text-base text-muted-foreground leading-relaxed mb-12">
        Trackyard is a music licensing platform built for film and TV
        professionals. As CTO and founding engineer, I architected the core AI
        search infrastructure, automated media pipelines, and social content
        tools that became the company&apos;s primary revenue driver.
      </p>

      {/* Animated stats */}
      <TrackStats />

      {/* AI search demo */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          AI Search — See it in action
        </p>
        <SearchDemo />
      </div>

      {/* Architecture diagram */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
          Architecture
        </p>
        <div className="flex items-stretch">
          {ARCH_NODES.map((node, i) => (
            <div key={i} className="flex items-center flex-1 min-w-0">
              <div className="border border-border rounded-sm px-2 py-3 text-center flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground leading-snug">
                  {node.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  {node.sub}
                </p>
              </div>
              {i < ARCH_NODES.length - 1 && (
                <div className="px-1 shrink-0 text-muted-foreground/40 text-sm">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Stack
        </p>
        <div className="flex flex-wrap gap-2">
          {["Go", "PostgreSQL", "React", "AWS", "AI/ML"].map(t => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-sm bg-secondary text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
