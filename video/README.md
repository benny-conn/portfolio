# Tour ops demo video

A ~1:52 motion demo of the tour-ops AI assistant service, built with [Remotion](https://remotion.dev). It lives outside the Next.js site and has its own `package.json`.

## Commands

```bash
npm install
npm run studio     # live preview / scrub the timeline
npm run render     # raw render → out/tour-ops-demo-raw.mp4
npm run finalize   # loudness-normalize → out/tour-ops-demo.mp4
```

## Where things are

- `src/data.js` — the one fictional tour (The Lanterns, Fall 2026) every surface renders from. The first five dates mirror the "Tour Ops Sandbox" tour in Master Tour.
- `src/timeline.js` — per-scene segments (quiet stretches play faster), tour-clock keyframes, narration and SFX cues. `src/time.js` maps output frames back to each scene's source frames.
- `src/scenes/` — one file per beat: Intro, Hero (email → Master Tour), Catch (curfew conflict), Grid (Advance Tracker), Montage (hotels / guest lists / day sheets), Settle, Bus (1 AM brief), End (three layers + close), Service (what Benny sets up and the tools it connects to).
- `src/components/` — the stylized Master Tour window, the texting-style assistant (thread, bubbles, quick replies, notification banner), the tour clock.
- `public/audio/` — ElevenLabs narration (`vo/`), SFX (`sfx/`) and music. After replacing any clip, run `python3 scripts/build-manifest.py` so durations update. `music.mp3` is take A with bars 8–16 repeated and time-stretched to 0.99 so it resolves under the close card. Unused takes live in `reference/unused-audio/`.
- `reference/` — Master Tour screenshots from the sandbox tour, used as layout reference.

Color grammar: yellow = the assistant touched it, green = verified saved, red = needs you, gray = missing.
