import localFont from "next/font/local"
import "./globals.css"
import "./portfolio.css"
import { AudioProvider, FixedAudioPlayer } from "@/components/AudioPlayer"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
import Nav from "@/components/Nav"

const dmSans = localFont({
  src: "./fonts/DM-Sans-Latin.woff2",
  variable: "--font-body",
  weight: "400 700",
  display: "swap",
})
const fraunces = localFont({
  src: "./fonts/Fraunces-Soft-800.woff2",
  variable: "--font-display",
  weight: "800",
  display: "swap",
})

const SITE_URL = "https://bennyconn.com"

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Benny Conn",
    template: "%s — Benny Conn",
  },
  description:
    "Benny Conn is a software engineer at Ambrook, co-founder of Curation Events, and jazz trombonist in New York City. Explore software, event production, and live music.",
  keywords: [
    "Benny Conn",
    "Software Engineer",
    "Full Stack Engineer",
    "Backend Engineer",
    "CTO",
    "Go",
    "Golang",
    "React",
    "New York",
    "Jazz Trombonist",
    "Event Producer",
    "Creative Direction",
    "Curation Events",
    "Community Programming",
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
    title: "Benny Conn — Software, Events & Jazz",
    description:
      "Benny Conn is a software engineer at Ambrook, co-founder of Curation Events, and jazz trombonist in New York City. Explore software, event production, and live music.",
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
    title: "Benny Conn — Software, Events & Jazz",
    description:
      "Benny Conn is a software engineer at Ambrook, co-founder of Curation Events, and jazz trombonist in New York City. Explore software, event production, and live music.",
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
  jobTitle: "Software Engineer",
  worksFor: {
    "@type": "Organization",
    name: "Ambrook",
    url: "https://ambrook.com",
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
    "Software engineer at Ambrook, co-founder and creative director of Curation Events, and jazz trombonist in New York City. Also building Jetside.",
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
      <body className={`${dmSans.variable} ${fraunces.variable} antialiased`}>
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
