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

      <form
        action="https://formspree.io/f/mrbzwrzv"
        method="POST"
        className="space-y-6">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
            Name
          </label>
          <input
            name="name"
            required
            className="w-full bg-secondary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full bg-secondary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
            Message
          </label>
          <textarea
            name="message"
            required
            rows={5}
            className="w-full bg-secondary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
          />
        </div>
        <button
          type="submit"
          className="bg-brand text-black text-sm font-semibold px-8 py-3 rounded hover:opacity-90 transition-opacity">
          Send
        </button>
      </form>
    </main>
  )
}
