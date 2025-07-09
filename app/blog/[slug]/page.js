import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPostSlugs } from '@/lib/blog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, TagIcon, ArrowLeft } from 'lucide-react'

export async function generateStaticParams() {
  const posts = getAllPostSlugs()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({ params }) {
  const post = await getPostBySlug(params.slug)
  
  if (!post) {
    notFound()
  }

  return (
    <main className="p-4 sm:p-8 flex flex-col gap-8 sm:gap-12">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" asChild className="self-start">
          <Link href="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </Button>
        
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl sm:text-6xl font-serif leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <TagIcon className="w-4 h-4" />
                {post.tags.join(', ')}
              </div>
            )}
          </div>
        </div>
        
        <Separator className="w-full my-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <article className="lg:col-span-3">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div 
                className="prose prose-lg prose-neutral dark:prose-invert max-w-none
                  prose-headings:font-serif prose-headings:text-foreground
                  prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-8
                  prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-8
                  prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-3 prose-h3:mt-6
                  prose-h4:text-xl prose-h4:font-bold prose-h4:mb-2 prose-h4:mt-4
                  prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-brand prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-em:text-foreground prose-em:italic
                  prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4
                  prose-pre:overflow-x-auto prose-pre:my-6
                  prose-blockquote:border-l-4 prose-blockquote:border-brand prose-blockquote:bg-muted/50
                  prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-6
                  prose-ul:text-foreground prose-ul:my-4 prose-ul:pl-6
                  prose-ol:text-foreground prose-ol:my-4 prose-ol:pl-6
                  prose-li:text-foreground prose-li:my-1 prose-li:marker:text-muted-foreground
                  prose-table:border-collapse prose-table:my-6
                  prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2
                  prose-th:text-left prose-th:font-semibold
                  prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
                  prose-hr:border-border prose-hr:my-8"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            </CardContent>
          </Card>
        </article>

        <aside className="lg:col-span-1">
          <div className="sticky top-8">
            <TableOfContents content={post.contentHtml} />
          </div>
        </aside>
      </div>

      <div className="flex justify-center mt-8">
        <Button variant="outline" asChild>
          <Link href="/blog">
            ← Back to Blog
          </Link>
        </Button>
      </div>
    </main>
  )
}

function TableOfContents({ content }) {
  const headings = extractHeadings(content)
  
  if (headings.length === 0) {
    return null
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-serif text-lg font-semibold mb-4">Table of Contents</h3>
        <nav>
          <ul className="space-y-2">
            {headings.map((heading, index) => {
              const marginLeft = (heading.level - 1) * 12 // Use px value instead of Tailwind class
              return (
                <li key={index} style={{ marginLeft: `${marginLeft}px` }}>
                  <a
                    href={`#${heading.id}`}
                    className="text-sm text-muted-foreground hover:text-brand transition-colors block py-1"
                  >
                    {heading.text}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </CardContent>
    </Card>
  )
}

function extractHeadings(html) {
  const headings = []
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/g
  let match
  
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const id = match[2]
    const text = match[3].replace(/<[^>]*>/g, '') // Remove HTML tags
    
    headings.push({
      level,
      id,
      text
    })
  }
  
  return headings
}