import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"

export const metadata = {
  title: "Minecraft Plugins — Benny Conn",
}

const PLUGINS = [
  {
    name: "Civilizations",
    lang: "Kotlin",
    desc: "A full land-claiming and politics system where players build cities, declare war on neighboring civilizations, and manage real economic consequences. The plugin that started everything.",
    github: "https://github.com/benny-conn/Civilizations",
  },
  {
    name: "Bundle",
    lang: "Kotlin",
    desc: "A package manager for Minecraft plugins, providing a central repository and easy install and update workflow for server administrators.",
    github: null,
  },
  {
    name: "TownyMenu",
    lang: "Java",
    desc: "A visual admin interface for the Towny plugin, replacing a wall of typed commands with a navigable GUI. Made server administration actually usable.",
    github: null,
  },
  {
    name: "Trader",
    lang: "Java",
    desc: "A safe peer-to-peer item trading system between players, eliminating scams by holding both sides in escrow until both confirm.",
    github: null,
  },
]

export default function MinecraftPluginsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <Link
        href="/#work"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        <ArrowLeft size={14} />
        Work
      </Link>

      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        Programmer
      </p>

      <h1 className="text-4xl font-bold mb-6">Minecraft Plugins</h1>

      <p className="text-base text-muted-foreground leading-relaxed mb-12">
        During COVID I wanted to run a Minecraft server to stay connected with friends.
        They had ideas for changes and additions, so I decided to teach myself how to code
        to build them. One thing led to another and I was writing Minecraft plugins in
        Kotlin, because Java kind of sucks.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 py-8 border-y border-border mb-12">
        {[
          { value: "5.5K+", label: "Downloads on Spigot" },
          { value: "4", label: "Published Plugins" },
        ].map(s => (
          <div key={s.label} className="flex flex-col gap-2">
            <span className="text-4xl font-bold text-brand">{s.value}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest leading-snug">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Plugins */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          Plugins
        </p>
        <div className="space-y-3">
          {PLUGINS.map(plugin => (
            <div
              key={plugin.name}
              className="border border-border/50 rounded-sm px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">{plugin.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground">
                    {plugin.lang}
                  </span>
                </div>
                {plugin.github && (
                  <a
                    href={plugin.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-brand transition-colors flex items-center gap-1">
                    GitHub
                    <ArrowUpRight size={11} />
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {plugin.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Origin */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          How It Started
        </p>
        <div className="space-y-2">
          {[
            ["COVID, 2020", "Wanted to run a Minecraft server to stay connected with friends stuck at home."],
            ["Friends had ideas", "They wanted custom mechanics, land claiming, player economies. Things that didn't exist yet."],
            ["Taught myself to code", "Dove into Java, then Kotlin to build what they asked for. Shipped Civilizations first."],
            ["5,500 downloads later", "The plugins found an audience on Spigot and spread across public and private servers worldwide."],
          ].map(([step, desc]) => (
            <div key={step} className="flex gap-4 border border-border/30 rounded-sm px-4 py-3">
              <span className="text-xs text-brand shrink-0 mt-0.5 w-32">{step}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stack */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Stack
        </p>
        <div className="flex flex-wrap gap-2">
          {["Kotlin", "Java", "Spigot API", "Bukkit"].map(t => (
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
