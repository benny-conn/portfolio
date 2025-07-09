import Link from "next/link"
import { getAllPosts } from "@/lib/blog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, TagIcon } from "lucide-react"

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="p-4 sm:p-8 flex flex-col gap-8 sm:gap-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl sm:text-8xl font-serif">Blog</h1>
        <p className="text-xl text-muted-foreground max-w-prose">
          Thoughts I thought were worth sharing.
        </p>
        <Separator className="w-full my-4" />
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-xl text-muted-foreground mb-4">
            No blog posts yet.
          </p>
          <p className="text-base text-muted-foreground">
            Create your first post by adding a markdown file to the{" "}
            <code className="bg-muted px-2 py-1 rounded">content/blog/</code>{" "}
            directory.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:gap-8">
          {posts.map(post => (
            <Card key={post.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col gap-2">
                  <CardTitle className="text-2xl font-serif hover:text-brand transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <TagIcon className="w-4 h-4" />
                        {post.tags.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              {post.excerpt && (
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                </CardContent>
              )}
              <CardContent className="pt-0">
                <Button variant="outline" asChild>
                  <Link href={`/blog/${post.slug}`}>Read More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Button variant="outline" asChild>
          <Link href="/">← Back to Home</Link>
        </Button>
      </div>
    </main>
  )
}
