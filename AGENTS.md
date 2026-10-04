# Working on bennyconn.com

This is Benny Conn’s personal portfolio: software projects, jazz recordings, an interactive musical homepage, and a small tour-assistant service page.

## Stack and commands

- Next.js 16 App Router, React 19, JavaScript/JSX (no TypeScript migration needed).
- Tailwind CSS 4, Radix/shadcn components, Lucide icons, Vercel Analytics.
- Use npm and commit `package-lock.json` when dependencies change.
- `npm ci` installs dependencies.
- `npm run dev` starts the local Next.js preview (default port 3000).
- `npm run build` validates the production build; `npm start` serves it.
- `npm run lint` runs ESLint.
- `npm test` checks the band score and interaction/audio lifecycle with Node.

Agents may install dependencies and run local development, build, lint, and test commands as needed. Check for an existing preview before starting another. Leave a useful preview running for the user. Publishing/deployment is separate from local implementation; do it when requested.

## Where things live

- `app/page.js`: homepage project listing, rendered inside the musical homepage.
- `components/HeroSection.js`: homepage markup and React lifecycle for the band.
- `components/band.css`: scoped homepage/band styling.
- `lib/band/create-band.js`: canvas drawing, character choreography, input, and Web Audio. `createBand` returns `pause()` and `destroy()`.
- `lib/band/score.js`: concert B-flat jazz blues arrangement and Benny’s walking bassline.
- `lib/band/samples.js`: lazy-loaded instrument sample manifest.
- `public/audio/band/`: sampled instruments and attribution. Keep the sound credits and asset license information.
- `lib/projects.js`: portfolio content. Keep existing projects and their detail routes accessible.
- `app/work/[slug]/page.js`: generic project pages; some projects have dedicated routes/components.
- `app/music/page.js`, `components/MusicSection.js`, `components/VideoSection.js`: music and video portfolio.
- `components/AudioPlayer.js`: shared recordings player/provider.
- `app/tour-assistants/page.js`: intentionally bare-bones service page, ready for separate copy/design work.
- `app/contact/page.js`: native form posting to the existing Formspree endpoint. Do not submit it while testing.
- `app/layout.js`, `components/Nav.js`, `app/globals.css`: shared metadata, navigation, fonts, and base styles.
- `app/fonts/`: self-hosted Fraunces and DM Sans with OFL licenses.
- `app/sitemap.js`, `public/llms.txt`: public site discovery/content summaries; keep current when routes or bio change.
- `tests/band-lifecycle.cjs`: deterministic Web Audio/DOM harness; run after changing score, playback, or lifecycle behavior.

## Design and content commitments

- Keep the yellow (`#ffdd00`) and black (`#0a0a0a`) identity.
- Fraunces is the soft, expressive display face; DM Sans is the body/control face.
- The homepage name is lowercase `benny` over `conn`. Its nine letters each play a horn; piano, bass, and drums sit together to their left.
- The band is opt-in. “Start the band” fetches instruments; a separate “Start the music” begins the jazz blues. Stop has a staggered musical tail. Reset returns the plain letters with the established step-aside/nudge choreography.
- Keep the full trombone cursor and live pitch readout on the homepage only. Other routes use the normal cursor and must not keep the band playing.
- Preserve touch scrolling outside the stage, keyboard play, visible focus, reduced-motion behavior, explicit mute, and cleanup of audio/timers/listeners on unmount or hidden documents.
- Benny’s supplied bassline is 48 quarter notes in a 12-bar B-flat form. Preserve its pitches and rhythm unless asked to change them.
- Current bio: works at Ambrook and is also building Runbook Aviation. Don’t invent product capabilities or claim the tour-assistant pilot is an already proven Master Tour integration.

## Verification and scope

Follow existing `@/` import aliases and JavaScript conventions. Keep changes focused; preserve unrelated work. Validate changes with the relevant commands above and inspect desktop/mobile UI for visual work. For the band, check entrance, music, solo/pitch, mute, staggered stop, reset, restart, route navigation, and reduced motion. The Node harness does not replace visual browser checks or listening.

No credentials belong in client code or committed files. External content/API failures should degrade gracefully. Do not send contact forms or modify external services merely to test the site.
