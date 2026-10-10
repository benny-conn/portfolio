import ContactForm from "@/components/ContactForm"

export default function ContactSection({
  idPrefix,
  className = "portfolio-contact",
}) {
  const titleId = `${idPrefix}-title`
  return (
    <section id="contact" className={className} aria-labelledby={titleId}>
      <div className="portfolio-contact-copy">
        <p className="eyebrow">Get in touch</p>
        <h2 id={titleId}>Let’s talk.</h2>
        <p>
          For opportunities and collaborations in software, events, and music.
        </p>
      </div>
      <ContactForm idPrefix={idPrefix} />
    </section>
  )
}
