# Project memory

## Product intent & audience

- Emotional support / comfort web app (Russian language UI).
- Core experience: a gentle, calming single-screen app titled “Я рядом с тобой” with a card of 15 supportive phrases and a “Отправлено тепла и объятий” warmth/hug counter.
- Audience: end users seeking a cozy, reassuring interaction; emphasis on tactile warmth and atmosphere.

## Brand personality & voice

- Tone: tender, gentle, cozy, supportive, understated.
- Russian-language copy throughout; phrases are short and emotionally warm.
- Visual metaphor: pink peonies, soft petals, hearts, warmth and hugs.

## Visual design & UX direction

- Palette: soft pastel pink, cream, soft white — “pink peony” aesthetic.
- Typography: clean, gentle; layout centered, single calming screen.
- Falling petals + small hearts animation: natural, airy, varied speed, side-to-side sway, slow rotation. Implemented via CSS keyframes + CSS variables rather than dynamic per-element JS animation.
- Supportive message card: messages appear with soft fade transitions, no abrupt jumps; dot indicators at bottom.
- Sound toggle: small unobtrusive speaker icon in top-right corner.
- Stack: Vite + React + Tailwind; entry point `src/App.tsx` (app created from scratch; original `src/routes/index.tsx` no longer exists).

## Decisions, constraints & rationale

- Cleaned out all Grok App Builder specifics from `vite.config.ts`, `package.json`, and `src/`: removed PWA plugin, auth-popup, PGLite loader, Nitro/Vercel integration, env wrappers.
- Build target: simple Vite + React + Tailwind; must build and preview cleanly in Bolt.
- All audio generated via Web Audio API only — no external audio files.
- Button sound: soft muted warm chord with low “hug” tone and smooth decay; must handle rapid clicks without crackling/overlapping distortion.
- Petal/ambient sound: filtered pink noise with slow modulation (breeze/rustle), starts only after first user interaction (browser autoplay policy), fades out as petals settle.
- Audio initialization deferred to first user gesture for reliability.
- Removed unused/duplicated code during refactor to keep files clean.

## Open questions & assumptions

- Assumed original `src/routes/index.tsx` content was replaced/recreated since `src/` was absent; exact original phrase wording may differ.
- No explicit user `.bolt/prompt` exists; current context inferred from this turn only.
- Accessibility needs (screen reader labels, reduced-motion preference) not yet requested/verified.
- No tests or lint config established yet.