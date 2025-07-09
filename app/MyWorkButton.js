"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function MyWorkButton({ className }) {
  return (
    <Button
      size="lg"
      variant="secondary"
      className={cn("rounded-full font-haas-bold", className)}
      onClick={() => {
        window.location.href = "#work"
      }}>
      My Work
    </Button>
  )
}
