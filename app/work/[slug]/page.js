import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { projects } from "@/lib/projects"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const project = projects.find(p => p.slug === slug)
  if (!project) return {}
  return { title: `${project.name} — Benny Conn` }
}

export default async function ProjectPage({ params }) {
  const { slug } = await params
  const project = projects.find(p => p.slug === slug)
  if (!project) notFound()

  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <Link
        href="/#work"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        <ArrowLeft size={14} />
        Work
      </Link>

      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        {project.role}
      </p>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-4xl font-bold">{project.name}</h1>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 mt-2 flex-shrink-0 ml-4">
            {project.url.replace("https://", "")}
            <ArrowUpRight size={13} />
          </a>
        )}
      </div>

      <p className="text-base text-muted-foreground leading-relaxed mb-10">
        {project.description}
      </p>

      <ul className="space-y-4 mb-10">
        {project.bullets.map((b, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed">
            <span className="text-brand mt-0.5 flex-shrink-0">—</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {project.tech.length > 0 && (
        <div className="mb-10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tech.map(t => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded-sm bg-secondary text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          View on GitHub
          <ArrowUpRight size={13} />
        </a>
      )}
    </main>
  )
}
