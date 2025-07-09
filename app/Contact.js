import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

export default function Contact() {
  return (
    <section
      className="w-full py-12 md:py-24 lg:py-32 items-center justify-center flex md:flex-row flex-col-reverse gap-12"
      id="contact">
      <div className="relative h-[500px] w-96 rounded-lg overflow-hidden">
        <Image
          src="/cool.jpg"
          alt="benny looking cool"
          fill
          className="object-cover"
        />
      </div>
      <div className="px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="space-y-2">
            <h2 className="font-haas-bold text-4xl md:text-6xl text-brand">
              Summon my services!
            </h2>
            <p className="text-muted-foreground">
              I&apos;m always open to new opportunities and collaborations. Feel
              free to reach out!
            </p>
          </div>
          <div className="w-full max-w-(--breakpoint-md) space-y-4">
            <form
              action="https://formspree.io/f/mrbzwrzv"
              method="POST"
              className="space-y-4">
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
                  name="name"
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
                  name="email"
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
                  name="message"
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
