import Link from "next/link"

export const metadata = {
  title: "Tour assistants",
  description:
    "A personal AI assistant for your tour operations. Start with a one-tour pilot with Benny Conn.",
  alternates: { canonical: "/tour-assistants" },
}

export default function TourAssistantsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <h1 className="text-4xl sm:text-5xl leading-tight mb-6">
        A personal AI assistant for your tour operations.
      </h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-6">
        I build and configure assistants that help touring teams turn incoming
        correspondence into current, usable tour records.
      </p>
      <p className="text-base text-muted-foreground leading-relaxed mb-8">
        The first pilot focuses on one tour: incoming advance correspondence,
        reviewed updates in Master Tour, and a clear list of what still needs
        attention.
      </p>
      <Link
        href="/contact"
        className="inline-block bg-brand text-black px-6 py-3 font-semibold"
      >
        Talk about your tour
      </Link>
    </main>
  )
}
