import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { AudioProvider, FixedAudioPlayer } from "@/components/AudioPlayer"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
<<<<<<< HEAD
import Nav from "@/components/Nav"
=======
>>>>>>> 037c08fdc2a89b1b49b7c0de51d0b5c62fa8c9ce

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Benny Conn",
<<<<<<< HEAD
  description: "Full-Stack Software Engineer, backend-specialized.",
=======
  description: "Programmer, musician, and fun guy!",
>>>>>>> 037c08fdc2a89b1b49b7c0de51d0b5c62fa8c9ce
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
<<<<<<< HEAD
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <AudioProvider>
          <Nav />
          {children}
          <FixedAudioPlayer />
        </AudioProvider>
=======
      <body
        className={`${haasBold.variable} ${hassRegular.variable} antialiased max-w-(--breakpoint-2xl) mx-auto`}>
        <AudioProvider>{children}</AudioProvider>
>>>>>>> 037c08fdc2a89b1b49b7c0de51d0b5c62fa8c9ce
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
