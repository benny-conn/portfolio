import AudioPlayer, { FixedAudioPlayer } from "@/components/AudioPlayer"
import { MapPin } from "lucide-react"
import Image from "next/image"
import Work from "./Work"
import Contact from "./Contact"
import ContactButton from "./ContactButton"
import MyWorkButton from "./MyWorkButton"
import BlogButton from "./BlogButton"
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons"

const playlist = [
  {
    src: "/audio/blues.wav",
    name: "Blues to Be There - Duke Ellington",
    description: "The Benny Conn Big Band",
  },
  {
    src: "/audio/quietude.wav",
    name: "Quietude - Thad Jones",
    description: "The Benny Conn Big Band",
  },
  {
    src: "/audio/queen.wav",
    name: "Queen Bee - Count Basie",
    description: "The Benny Conn Big Band",
  },
  {
    src: "/audio/solo.wav",
    name: "Short Trombone Solo",
    description: "Benny Conn",
  },
  {
    src: "/audio/original-big-band.m4a",
    name: "Everything After",
    description: "Big Band Original Section",
  },
]

export default function Home() {
  return (
    <main className="p-4 sm:p-8 pb-20 flex flex-col gap-8 sm:gap-12 relative">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        <div className="relative w-48 h-24 md:w-64 md:h-24">
          <Image
            src="/logo.png"
            alt="logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-row gap-4 items-center">
          <BlogButton />
          <a href="https://github.com/benny-conn" target="_blank">
            <GitHubLogoIcon className="w-6 h-6" />
          </a>
          <a href="https://www.linkedin.com/in/benny-conn/" target="_blank">
            <LinkedInLogoIcon className="w-6 h-6" />
          </a>
          <a href="https://github.com/benny-conn" target="_blank">
            <ContactButton />
          </a>
        </div>
      </div>
      <div className="flex flex-col gap-8 sm:gap-12">
        <div className="flex flex-col sm:flex-row gap-8 sm:h-[600px]">
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] sm:h-full w-full sm:w-[440px] rounded-lg overflow-hidden">
              <Image
                src="/happy.jpg"
                alt="benny looking happy"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:h-full justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-5xl sm:text-8xl font-serif">
                Hi, I&apos;m <span className="text-brand">Benny!</span>
              </h1>
              <h2 className="text-2xl sm:text-4xl font-sans">
                Programmer and Jazz Trombonist, specializing in full stack
                app/web development and bebop trombone.{" "}
                <AudioPlayer playlist={playlist} />
                <span className="text-brand text-xs ml-4">
                  (Click to listen)
                </span>
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-start pt-4">
                <MyWorkButton className="w-full sm:w-auto h-12 rounded-full text-xl font-serif px-12" />
                <ContactButton className="w-full sm:w-auto h-12 rounded-full text-xl font-serif px-12" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2 items-center justify-end">
                <div className="flex flex-row gap-2 items-center justify-center">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-base text-muted-foreground">
                    New York, NY
                  </p>
                </div>
              </div>
              <div className="w-full h-60 sm:h-80 rounded-lg overflow-hidden relative">
                <Image
                  src="/trombone-4.jpg"
                  alt="benny playing trombone"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        <Work />
        <Contact />
      </div>
      <FixedAudioPlayer />
    </main>
  )
}
