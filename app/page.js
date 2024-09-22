import AudioPlayer from "@/components/AudioPlayer"
import { Button } from "@/components/ui/button"
import { MapPin, Volume2 } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <main className="p-8 pb-20 flex flex-col gap-12 relative">
      <div className="flex flex-row items-center justify-between">
        <div className="relative w-64 h-24">
          <Image src="/logo.png" alt="logo" fill className="object-cover" />
        </div>
        <Button size="lg" className="rounded-full font-serif">
          Get in touch
        </Button>
      </div>
      <div className="flex flex-col gap-12">
        <div className="flex flex-row gap-8 h-[600px]">
          <div className="flex items-center justify-center">
            <div className="relative h-full w-[440px] rounded-lg overflow-hidden">
              <Image
                src="/happy.jpeg"
                alt="benny looking happy"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 h-full justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-8xl font-serif">
                Hi, I&apos;m <span className="text-brand">Benny!</span>
              </h1>
              <h4 className="text-4xl font-sans">
                Programmer and Jazz Trombonist, specializing in full stack app
                development and bebop trombone.{" "}
                {/* <Volume2 className="inline-block w-7 h-7 text-brand ml-1" /> */}
                <AudioPlayer
                  audioId="1"
                  src="/original-big-band.m4a"
                  name={"Test"}
                  image="/happy.jpeg"
                />
                <span className="text-brand text-xs ml-4">
                  (Click to listen)
                </span>
              </h4>
              <div className="flex flex-row gap-4 items-center justify-start pt-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 rounded-full text-xl font-serif px-12">
                  My Work
                </Button>
                <Button
                  size="lg"
                  className="h-12 rounded-full text-xl font-serif px-12">
                  Get in touch
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2 items-center justify-end">
                <div className="flex flex-row gap-2 items-center justify-center">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-base text-muted-foreground">
                    Paris, France
                  </p>
                </div>
              </div>
              <div className="w-full h-80 rounded-lg overflow-hidden relative">
                <Image
                  src="/trombone-4.jpg"
                  alt="benny playing trombone"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
