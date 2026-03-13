import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { AudioProvider, FixedAudioPlayer } from "@/components/AudioPlayer"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
import Nav from "@/components/Nav"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Benny Conn",
  description: "Full-Stack Software Engineer, backend-specialized.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <AudioProvider>
          <Nav />
          {children}
          <FixedAudioPlayer />
        </AudioProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
