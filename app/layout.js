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

const SITE_URL = "https://bennyconn.com"

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Benny Conn",
    template: "%s — Benny Conn",
  },
  description:
    "Benny Conn is a Full-Stack Software Engineer, CTO & Founding Engineer at Trackyard, and Jazz Trombonist based in New York City.",
  keywords: [
    "Benny Conn",
    "Software Engineer",
    "Full Stack Engineer",
    "Backend Engineer",
    "CTO",
    "Trackyard",
    "Go",
    "Golang",
    "React",
    "New York",
    "Jazz Trombonist",
    "Music Tech",
    "Founder",
  ],
  authors: [{ name: "Benny Conn", url: SITE_URL }],
  creator: "Benny Conn",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Benny Conn",
    title: "Benny Conn — Full-Stack Engineer & CTO",
    description:
      "Benny Conn is a Full-Stack Software Engineer, CTO & Founding Engineer at Trackyard, and Jazz Trombonist based in New York City.",
    images: [
      {
        url: "/happy.jpg",
        width: 1200,
        height: 630,
        alt: "Benny Conn",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Benny Conn — Full-Stack Engineer & CTO",
    description:
      "Benny Conn is a Full-Stack Software Engineer, CTO & Founding Engineer at Trackyard, and Jazz Trombonist based in New York City.",
    images: ["/happy.jpg"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Benny Conn",
  url: SITE_URL,
  image: `${SITE_URL}/happy.jpg`,
  jobTitle: "CTO & Full-Stack Software Engineer",
  worksFor: {
    "@type": "Organization",
    name: "Trackyard",
    url: "https://trackyard.com",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "New York",
    addressRegion: "NY",
    addressCountry: "US",
  },
  sameAs: [
    "https://github.com/benny-conn",
    "https://linkedin.com/in/benny-conn",
  ],
  description:
    "Full-Stack Software Engineer, CTO & Founding Engineer at Trackyard, and Jazz Trombonist based in New York City.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
