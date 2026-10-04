import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { projects } from "@/lib/projects"
import HeroSection from "@/components/HeroSection"
function ProjectCard({ project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex flex-col border border-border rounded-none p-6 hover:border-brand/60 transition-colors duration-200 min-h-44"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs text-muted-foreground">{project.role}</span>
        <ArrowUpRight
          size={14}
          className="text-muted-foreground group-hover:text-brand transition-colors flex-shrink-0"
        />
      </div>
      <h3 className="text-2xl font-semibold mb-2">{project.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
        {project.tagline}
      </p>
      {project.tech.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

export default function Home() {
  const featured = projects.filter((p) => p.featured)
  const other = projects.filter((p) => !p.featured && !p.openSource)
  const brandonBotProject = projects.find((p) => p.slug === "brandon-bot")

  return (
    <HeroSection>
      <section id="work" className="site-width bc-work">
        <h2 className="text-3xl mb-8">Selected work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>

        {other.length > 0 && (
          <>
            <h2 className="text-3xl mb-6">More projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
              {other.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </>
        )}

        <h2 className="text-3xl mb-6">Open source</h2>
        {brandonBotProject && (
          <div className="mb-3">
            <ProjectCard project={brandonBotProject} />
          </div>
        )}
      </section>
    </HeroSection>
  )
}
