"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleWorkClick = e => {
    if (pathname === "/") {
      e.preventDefault()
      document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const linkClass = active =>
    `text-sm transition-colors duration-150 ${
      active ? "text-brand" : "text-muted-foreground hover:text-foreground"
    }`

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-background/95 backdrop-blur-sm border-b border-border" : ""
      }`}>
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
          benny conn
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/#work"
            onClick={handleWorkClick}
            className={linkClass(false)}>
            work
          </Link>
          <Link href="/music" className={linkClass(pathname === "/music")}>
            music
          </Link>
          <Link href="/contact" className={linkClass(pathname === "/contact")}>
            contact
          </Link>
        </div>
      </div>
    </nav>
  )
}
