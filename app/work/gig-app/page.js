import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { StripeFlow, StackDiagram } from "./GigComponents"

export const metadata = {
  title: "Gig App — Benny Conn",
}

export default function GigAppPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <Link
        href="/#work"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        <ArrowLeft size={14} />
        Work
      </Link>

      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        Founder & Full-Stack Engineer
      </p>

      <h1 className="text-4xl font-bold mb-6">Gig App</h1>

      <p className="text-base text-muted-foreground leading-relaxed mb-12">
        A full-stack platform for booking live musicians, built for the wedding and events
        industry. Musicians create profiles, clients browse and book, and Stripe Connect
        handles escrow and automatic post-event payouts split across band members.
      </p>

      {/* iPhone mockup */}
      <div className="flex justify-center mb-12">
        <div className="relative w-56">
          <Image
            src="/images/gig/campaign-mockup.png"
            alt="Gig App mobile interface"
            width={224}
            height={484}
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Stripe payment flow */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          Payment Flow
        </p>
        <StripeFlow />
      </div>

      {/* Stack */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
          Architecture
        </p>
        <StackDiagram />
      </div>

      {/* What I built */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          What I Built
        </p>
        <div className="space-y-2">
          {[
            ["Musician Profiles & Search", "Browse musicians by instrument, style, and location, with media uploads and availability calendars"],
            ["Stripe Connect Escrow", "Funds held in escrow at booking, automatically split and transferred to each band member after event confirmation"],
            ["Go REST API", "Auth, gig management, payments, and notifications, all served from a Go backend deployed on Hetzner"],
            ["React Native App", "Cross-platform iOS and Android client for musicians to manage bookings, set availability, and receive payouts"],
          ].map(([title, desc]) => (
            <div key={title} className="border border-border/50 rounded-sm px-4 py-3">
              <p className="text-sm font-medium mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
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
          {["React Native", "Next.js", "Go", "PostgreSQL", "Stripe Connect", "Hetzner"].map(t => (
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
