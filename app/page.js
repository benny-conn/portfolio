import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { projects } from "@/lib/projects"
import HeroSection from "@/components/HeroSection"

async function fetchGitHubStats() {
  try {
    const res = await fetch("https://api.github.com/users/benny-conn", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "bennycom-portfolio" },
    })
    if (!res.ok) return null
    const user = await res.json()
    return { publicRepos: user.public_repos || 0 }
  } catch {
    return null
  }
}

async function fetchWeather() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current=weather_code,is_day&timezone=America/New_York",
      { next: { revalidate: 1800 } },
    )

    if (!res.ok) return null
    const data = await res.json()
    return {
      code: data.current.weather_code,
      isDay: data.current.is_day === 1,
    }
  } catch {
    return null
  }
}

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

export default async function Home() {
  const [githubStats, weather] = await Promise.all([
    fetchGitHubStats(),
    fetchWeather(),
  ])
  const featured = projects.filter(p => p.featured)
  const other = projects.filter(p => !p.featured)

  return (
    <main>
      <HeroSection githubStats={githubStats} weather={weather} />

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
