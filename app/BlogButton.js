import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function BlogButton({ className = "", ...props }) {
  return (
    <Button 
      variant="outline" 
      className={`bg-background hover:bg-muted border-border ${className}`}
      asChild
      {...props}
    >
      <Link href="/blog">
        Blog
      </Link>
    </Button>
  )
}