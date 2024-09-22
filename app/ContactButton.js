"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ContactButton({ className, ...props }) {
  return (
    <Button
      size="lg"
      {...props}
      className={cn("rounded-full font-serif", className)}
      onClick={() => {
        window.location.href = "#contact"
      }}>
      Get in touch
    </Button>
  )
}
