# Project memory

## Product intent & audience

- Emotional support / comfort web app (Russian language UI).
- Core experience: a gentle, calming single-screen app titled "Я рядом с тобой" with a card of 15 supportive phrases and a "Отправлено тепла и объятий" warmth/hug counter.
- Audience: end users seeking a cozy, reassuring interaction; emphasis on tactile warmth and atmosphere.
- Photo avatar above the title reinforces personal/emotional connection; its visual quality improves as the hug counter grows, rewarding engagement.

## Brand personality & voice

- Tone: tender, gentle, cozy, supportive, understated.
- Russian-language copy throughout; phrases are short and emotionally warm.
- Visual metaphor: pink peonies, soft petals, hearts, warmth and hugs.

## Visual design & UX direction

- Palette: soft pastel pink, cream, soft white — "pink peony" aesthetic.
- Typography: clean, gentle; layout centered, single calming screen.
- Photo avatar: large soft circular image above the title (between sound toggle and heading), styled to match pink-peony aesthetic.
- Avatar progressive enhancement tied to hug count: as hugs increase, contrast, saturation, and brightness rise gradually; pink glow/halo around avatar intensifies. Smooth interpolated transitions, no abrupt jumps.
- Falling petals + small hearts animation: natural, airy, varied speed, side-to-side sway, slow rotation. Implemented via CSS keyframes + CSS variables rather than dynamic per-element JS animation.
- Supportive message card: messages appear with soft fade transitions, no abrupt jumps; dot indicators at bottom.
- Sound toggle: small unobtrusive speaker icon in top-right corner.
- Responsive: avatar and layout adapt for phone and desktop.
- Stack: Vite + React + Tailwind; entry point `src/App.tsx`.

## Decisions, constraints & rationale

- Cleaned out all Grok App Builder specifics from `vite.config.ts`, `package.json`, and `src/`: removed PWA plugin, auth-popup, PGLite loader, Nitro/Vercel integration, env wrappers.
- Build target: simple Vite + React + Tailwind; must build and preview cleanly in Bolt.
- Photo asset already existed in project; used as-is for avatar.
- All audio generated via Web Audio API only — no external audio files.
- Button sound: soft muted warm chord with low "hug" tone and smooth decay; must handle rapid clicks without crackling/overlapping distortion.
- Petal/ambient sound: filtered pink noise with slow modulation (breeze/rustle), starts only after first user interaction (browser autoplay policy), fades out as petals settle.
- Audio initialization deferred to first user gesture for reliability.
- Removed unused/duplicated code during refactor to keep files clean.

## Open questions & assumptions

- No explicit user `.bolt/prompt` exists; current context inferred from accumulated turns.
- Exact original phrase wording may differ from any original template.
- Accessibility needs (screen reader labels, reduced-motion preference) not yet requested/verified.
- No tests or lint config established yet.