export default function ContactForm({ idPrefix = "contact" }) {
  return (
    <form
      action="https://formspree.io/f/mrbzwrzv"
      method="POST"
      className="contact-form space-y-6"
    >
      <div>
        <label
          htmlFor={`${idPrefix}-name`}
          className="text-xs text-muted-foreground uppercase tracking-widest block mb-2"
        >
          Name
        </label>
        <input
          id={`${idPrefix}-name`}
          name="name"
          autoComplete="name"
          required
          className="w-full bg-secondary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
        />
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-email`}
          className="text-xs text-muted-foreground uppercase tracking-widest block mb-2"
        >
          Email
        </label>
        <input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full bg-secondary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
        />
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-message`}
          className="text-xs text-muted-foreground uppercase tracking-widest block mb-2"
        >
          Message
        </label>
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          required
          rows={5}
          className="w-full bg-secondary border border-border rounded px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors resize-y"
        />
      </div>
      <button
        type="submit"
        className="bg-brand text-black text-sm font-semibold px-8 py-3 rounded hover:opacity-90 transition-opacity"
      >
        Send message
      </button>
    </form>
  )
}
