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

  const handleWorkClick = (e) => {
    if (pathname === "/") {
      e.preventDefault()
      document.getElementById("work")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      })
    }
  }

  const linkClass = (active) =>
    `text-[13px] sm:text-sm min-h-8 inline-flex items-center transition-colors duration-150 ${
      active ? "text-brand" : "text-muted-foreground hover:text-foreground"
    }`

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/95 backdrop-blur-sm border-b border-border"
          : ""
      }`}
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-6 min-h-16 py-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <Link
          href="/"
          className="site-logo text-xl text-foreground hover:text-brand transition-colors duration-150"
        >
          benny conn
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/#work"
            onClick={handleWorkClick}
            className={linkClass(false)}
          >
            work
          </Link>
          <Link
            href="/tour-assistants"
            className={linkClass(pathname === "/tour-assistants")}
          >
            tour assistants
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
