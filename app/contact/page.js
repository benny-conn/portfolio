import ContactForm from "@/components/ContactForm"

export const metadata = {
  title: "Contact — Benny Conn",
}

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        Get in touch
      </p>
      <h1 className="text-4xl font-bold mb-4">Contact</h1>
      <p className="text-base text-muted-foreground leading-relaxed mb-12">
        Open to new opportunities and collaborations. Feel free to reach out.
      </p>

      <ContactForm />
    </main>
  )
}
