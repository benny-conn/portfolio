import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"

export const metadata = {
  title: "Brandon Bot — Benny Conn",
  description:
    "An open-source Go trading bot with backtesting and live paper trading via Alpaca Markets.",
  openGraph: {
    title: "Brandon Bot — Benny Conn",
    description:
      "Go-based stock trading simulator with backtesting engine, paper trading, and extensible strategy framework.",
  },
  alternates: { canonical: "/work/brandon-bot" },
}

const PIPELINE_STEPS = [
  { label: "CLI", sub: "Select mode (backtest or paper), strategy, symbols, capital, and timeframe via flags" },
  { label: "Market Data", sub: "Fetch historical bars from Alpaca REST API for backtesting, or connect via WebSocket for live ticks" },
  { label: "Strategy", sub: "Each bar is passed to OnTick() — strategy returns a list of orders based on indicator state" },
  { label: "Execution", sub: "Orders routed to simulated fill engine (backtest) or Alpaca paper trading account (live)" },
  { label: "Portfolio", sub: "Thread-safe SimulatedPortfolio tracks cash, positions, unrealized P&L, and realized P&L" },
  { label: "SQLite", sub: "Persist backtest results, fills, trades, and portfolio snapshots for post-run analysis" },
]

const STRATEGIES = [
  {
    name: "MA Crossover",
    params: "9 / 21 EMA",
    desc: "Buys when the fast EMA crosses above the slow EMA, sells on reversal or a 2% stop loss.",
  },
  {
    name: "RSI Pullback",
    params: "200-SMA + 14-RSI",
    desc: "Enters on oversold pullbacks within an established uptrend, exits on overbought signal or 2% stop.",
  },
]

const TECH = ["Go", "Alpaca Markets API", "WebSocket", "SQLite", "REST"]

export default function BrandonBotPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pt-32 pb-32">
      <Link
        href="/#work"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        <ArrowLeft size={14} />
        Work
      </Link>

      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
        Personal Project
      </p>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-4xl font-bold">Brandon Bot</h1>
        <a
          href="https://github.com/benny-conn/brandon-bot"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 mt-2 flex-shrink-0 ml-4">
          github
          <ArrowUpRight size={13} />
        </a>
      </div>

      <p className="text-base text-muted-foreground leading-relaxed mb-12">
        An open-source algorithmic trading bot I built for a friend in Go. It
        supports two modes: backtesting strategies against historical market
        data, and paper trading live against Alpaca Markets with real prices but
        no real money. The strategy framework is designed to be dropped into
        without touching engine code — you implement three methods and the bot
        handles the rest.
      </p>

      {/* Modes */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          Modes
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border p-4">
            <p className="text-sm font-medium mb-1">Backtest</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Replay historical bars through any strategy. Outputs return %,
              max drawdown, Sharpe ratio, win rate, and a full trade log.
            </p>
          </div>
          <div className="border border-border p-4">
            <p className="text-sm font-medium mb-1">Paper Trading</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Live WebSocket feed from Alpaca with simulated order execution.
              Recovers position state automatically on restart.
            </p>
          </div>
        </div>
      </div>

      {/* Built-in strategies */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          Included Strategies
        </p>
        <div className="space-y-2">
          {STRATEGIES.map(({ name, params, desc }) => (
            <div key={name} className="border border-border/50 rounded-sm px-4 py-3">
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-sm font-medium">{name}</p>
                <span className="text-xs text-muted-foreground">{params}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
          How It Works
        </p>
        <div className="space-y-0">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center flex-shrink-0 w-5">
                <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] text-muted-foreground">{i + 1}</span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-border/40 my-1" />
                )}
              </div>
              <div className="pb-4">
                <span className="text-sm font-medium">{step.label}</span>
                <span className="text-sm text-muted-foreground"> — {step.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy interface */}
      <div className="border border-border/50 bg-secondary/30 p-4 mb-12">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Strategy Interface
        </p>
        <pre className="text-xs text-muted-foreground leading-relaxed font-mono whitespace-pre-wrap">{`type Strategy interface {
    Name() string
    OnTick(tick Tick, portfolio Portfolio) []Order
    OnFill(fill Fill)
}`}</pre>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          Implement these three methods and plug into either engine. Position
          recovery and indicator warmup are handled automatically.
        </p>
      </div>

      {/* Stack */}
      <div className="mb-10">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Stack
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH.map(t => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-sm bg-secondary text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>

      <a
        href="https://github.com/benny-conn/brandon-bot"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        View on GitHub
        <ArrowUpRight size={13} />
      </a>
    </main>
  )
}
