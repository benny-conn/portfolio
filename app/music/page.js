import Image from "next/image"
import MusicSection from "@/components/MusicSection"
import VideoSection from "@/components/VideoSection"

export const metadata = {
  title: "Music — Benny Conn",
}

export default function MusicPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        Jazz Trombone
      </p>
      <h1 className="text-4xl font-bold mb-4">Music</h1>
      <p className="text-base text-muted-foreground leading-relaxed mb-12">
        I lead the Benny Conn Big Band, a New York-based jazz ensemble rooted in
        the bebop and swing tradition. Click play to listen.
      </p>
      <div className="mb-12 rounded-lg overflow-hidden relative h-64 sm:h-80">
        <Image
          src="/trombone-4.jpg"
          alt="Benny Conn playing trombone"
          fill
          className="object-cover"
          priority
        />
      </div>

      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
        Recordings
      </p>
      <MusicSection />

      <p className="text-xs text-muted-foreground uppercase tracking-widest mt-16 mb-6">
        Live at Smalls
      </p>
      <VideoSection baseUrl={process.env.R2_URL} />
    </main>
  )
}
