import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { PipelineViz, GoroutinePool } from "./GalleryComponents"

export const metadata = {
  title: "Gallery — Benny Conn",
}

const CODE_SNIPPET = `// StartProcessing marks a token as processing. It returns a callback that must be called when work on the token is finished in order to mark
// it as finished. If withRetry is true, the callback will attempt to reenqueue the token if an error is passed. attemps is ignored when MaxRetries
// is set to the default value of 0.
func (m Manager) StartProcessing(ctx context.Context, td db.TokenDefinition, attempts int, cause persist.ProcessingCause) (func(db.TokenMedia, error) error, error) {
	if m.Paused(ctx, td) {
		recordPipelinePaused(ctx, m.metricReporter, td.Chain, td.ContractAddress, cause)
		err := ErrContractPaused{Chain: td.Chain, Contract: td.ContractAddress}
		sentryutil.ReportError(ctx, err)
		return nil, err
	}

	err := m.throttle.Lock(ctx, "lock:"+td.ID.String())
	if err != nil {
		return nil, err
	}

	stop := make(chan bool)
	done := make(chan bool)
	tick := time.NewTicker(10 * time.Second)

	go func() {
		defer tick.Stop()
		m.Registry.keepAlive(ctx, td.ID)
		for {
			select {
			case <-tick.C:
				m.Registry.keepAlive(ctx, td.ID)
			case <-stop:
				close(done)
				return
			}
		}
	}()

	start := time.Now()

	callback := func(tm db.TokenMedia, err error) error {
		close(stop)
		<-done
		m.tickTokenF(td) // mark that the token ran so if an error occured tryRetry delays the next run appropriately
		m.recordError(ctx, td, err)
		m.tryRetry(ctx, td, err, attempts)
		m.throttle.Unlock(ctx, "lock:"+td.ID.String())
		recordMetrics(ctx, m.metricReporter, td.Chain, tm.Media.MediaType, err, time.Since(start), cause)
		return nil
	}

	return callback, err
}
`

export default function GalleryPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <Link
        href="/#work"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        <ArrowLeft size={14} />
        Work
      </Link>

      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        Backend Software Engineer II
      </p>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-4xl font-bold">Gallery</h1>
        <a
          href="https://gallery.so"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 mt-2 flex-shrink-0 ml-4">
          gallery.so
          <ArrowUpRight size={13} />
        </a>
      </div>

      <p className="text-base text-muted-foreground leading-relaxed mb-12">
        Gallery is an NFT art platform where collectors curate and share onchain
        work. I built and maintained the token processing pipeline, the backend
        system responsible for fetching, resolving, and caching media for every
        NFT across Ethereum, Polygon, and other chains into GCP.
      </p>

      {/* Pipeline visualization */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          Media Pipeline
        </p>
        <PipelineViz />
      </div>

      {/* Goroutine pool */}
      <div className="mb-12 border border-border rounded-sm p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-5">
          Concurrent Processing
        </p>
        <GoroutinePool />
      </div>

      {/* Code snippet */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          From the Codebase
        </p>
        <div className="border border-border rounded-sm overflow-hidden">
          {/* chrome */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-secondary/20">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            <span className="text-xs text-muted-foreground/50 ml-2">
              service/tokenmanage/tokenmanage.go
            </span>
          </div>
          <pre className="text-xs text-muted-foreground leading-relaxed p-4 overflow-x-auto">
            <code>{CODE_SNIPPET}</code>
          </pre>
        </div>
      </div>

      {/* What I built */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          What I Built
        </p>
        <div className="space-y-2">
          {[
            [
              "Token Processing Pipeline",
              "Concurrent batch processing with sourcegraph/conc goroutine pools, handling 50 parallel workers per batch across all supported chains",
            ],
            [
              "Multi-source Media Resolution",
              "Resolves media from IPFS, Arweave, and HTTP, with fallback chains and placeholder images when sources are unavailable",
            ],
            [
              "GCP Media Caching",
              "Image, animation, and profile image assets fetched and stored concurrently via channel-based goroutines with pipeline metadata tracing",
            ],
            [
              "GraphQL API",
              "Go + GraphQL backend serving gallery data to the web client",
            ],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="border border-border/50 rounded-sm px-4 py-3">
              <p className="text-sm font-medium mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stack */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Stack
        </p>
        <div className="flex flex-wrap gap-2">
          {["Go", "GraphQL", "PostgreSQL", "GCP", "IPFS", "Arweave"].map(t => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-sm bg-secondary text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
