import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons"
import { projects } from "@/lib/projects"

function ProjectCard({ project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex flex-col border border-border rounded-none p-6 hover:border-brand/60 transition-all duration-200 min-h-44">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs text-muted-foreground">{project.role}</span>
        <ArrowUpRight
          size={14}
          className="text-muted-foreground group-hover:text-brand transition-colors flex-shrink-0"
        />
      </div>
      <h3 className="text-base font-semibold mb-2">{project.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
        {project.tagline}
      </p>
      {project.tech.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map(t => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

export default function Home() {
  const featured = projects.filter(p => p.featured)
  const other = projects.filter(p => !p.featured)

  return (
    <main>
      <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center max-w-2xl mx-auto px-6 pt-16 pb-24">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">
          New York, NY
        </p>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
          Benny Conn
        </h1>
        <p className="text-xl sm:text-2xl text-brand font-medium mb-6">
          Full-Stack Software Engineer, backend-specialized.
        </p>
        <p className="text-base text-muted-foreground max-w-lg leading-relaxed mb-10">
          I build backend systems and AI-powered products. Currently CTO at
          Trackyard, building music licensing infrastructure for film and TV.
          Previously Backend Software Engineer II at Gallery.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/benny-conn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors">
            <GitHubLogoIcon className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/benny-conn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors">
            <LinkedInLogoIcon className="w-5 h-5" />
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Resume
          </a>
        </div>
      </section>

      <section id="work" className="max-w-2xl mx-auto px-6 pb-32">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">
          Selected Work
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
          {featured.map(p => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>

        {other.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
              Other
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
              {other.map(p => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
          Open Source
        </p>
        <a
          href="https://clawhub.ai/benny-conn/trackyard"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between border border-border rounded-none p-6 hover:border-brand/60 transition-all duration-200">
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Published OpenClaw Skill
            </p>
            <h3 className="text-base font-semibold mb-1">trackyard</h3>
            <p className="text-sm text-muted-foreground">
              AI music search across the Trackyard catalog, published on
              OpenClaw.
            </p>
          </div>
          <ArrowUpRight
            size={14}
            className="text-muted-foreground group-hover:text-brand transition-colors ml-6 flex-shrink-0"
          />
        </a>
      </section>
    </main>
  )
}
