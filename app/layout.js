import localFont from "next/font/local"
import "./globals.css"
import { AudioProvider } from "@/components/AudioPlayer"
import { Toaster } from "@/components/ui/toaster"

const haasBold = localFont({
  src: "./fonts/AlteHaasBold.ttf",
  variable: "--font-haas-bold",
  weight: "100 900",
})
const hassRegular = localFont({
  src: "./fonts/AlteHaasRegular.ttf",
  variable: "--font-haas-regular",
  weight: "100 900",
})

export const metadata = {
  title: "Benny Conn",
  description: "Programmer, musician, and fun guy!",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${haasBold.variable} ${hassRegular.variable} antialiased max-w-(--breakpoint-2xl) mx-auto`}>
        <AudioProvider>{children}</AudioProvider>
        <Toaster />
      </body>
    </html>
  )
}
