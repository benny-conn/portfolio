"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

export default function Contact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = e => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", { name, email, message })
    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. I'll get back to you soon.",
    })
    setName("")
    setEmail("")
    setMessage("")
  }

  return (
    <section
      className="w-full py-12 md:py-24 lg:py-32 items-center justify-center flex"
      id="contact">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="space-y-2 text-center">
            <h2 className="font-serif text-4xl md:text-6xl text-brand">
              Summon my services!
            </h2>
            <p className="text-muted-foreground">
              I&apos;m always open to new opportunities and collaborations. Feel
              free to reach out!
            </p>
          </div>
          <div className="w-full max-w-screen-md space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-full text-left">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Enter your message"
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
              <Button size="lg" type="submit">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
