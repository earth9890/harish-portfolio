# Harish Sugandhi — Portfolio

An interactive, WebGL-heavy personal site with a light and dark theme, a notes (blog) section, and zero stock imagery — every visual is generated in code.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, fully static (Vercel-ready)
npm start
```

## Stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind v4 · three.js + @react-three/fiber · GSAP (ScrollTrigger, SplitText) · Lenis smooth scroll.

## Art direction — "Darkroom Editorial"

The site behaves like a photographic print in a darkroom. **Lights off** is ink-black ground with bone-paper type; **lights on** inverts to warm paper with ink type. One vermilion accent acts as heat in both. Brass hairlines. Nothing glows purple.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--ink` | `#0a0908` | `#f1ebdf` | ground |
| `--bone` | `#ece4d3` | `#141210` | type, contour lines |
| `--vermilion` | `#ff4a1c` | `#e83d0f` | the single accent: heat, focus, action |
| `--brass` | `#c8a45a` | `#8a6d2e` | hairlines, secondary labels |
| `--teal` | `#63d8c8` | `#12857a` | ops/tooling colour in the gravity well only |

Theme is applied pre-paint by an inline script (`localStorage` → `prefers-color-scheme`), persisted, and switched with a circular clip-path wipe that expands from the toggle. Canvases follow the theme: the hero shader lerps a `uLight` uniform, the ring repaints its card textures, the gravity well re-reads CSS variables.

**Type**: Bricolage Grotesque (display, variable width/optical size, set tight) · Instrument Serif italic (editorial asides) · IBM Plex Mono (labels, HUD).

**Motion language**: one easing family (`expo.out` for entries, `expo.inOut` for wipes), scroll is scrubbed not triggered, and every section has exactly one signature interaction.

## Scenes

1. **Preloader** — counter, scramble-text wordmark, vermilion progress hairline, clip-path curtain lift (~2.5s total).
2. **Hero / Ink Field** — custom GLSL: domain-warped fBm rendered as topographic contour lines. A 24-point pointer trail is passed as uniforms; each point displaces the field and injects vermilion heat. Clicking drops ink (a burst of trail points). Reveals with a noisy wipe, parallaxes with scroll, follows the theme.
3. **About** — scroll-scrubbed word-by-word ignition of the manifesto, counting number, parallax side column.
4. **Work / The Ring** — six project cards on a 3D ring. Drag, horizontal-scroll, arrow buttons or the index rail to spin; it snaps to the nearest card on release. A hint pill explains the interaction until the first drag. Card textures are painted procedurally on a 2D canvas; a card shader bends geometry with angular velocity, splits RGB while moving, and dims non-front cards. Clicking the front card (or "Open case study") slides in a **case-study sheet** with problem / approach / result and next-project navigation.
5. **Process** — a pinned, horizontally-scrolling scene (desktop): four steps travel across the screen as you scroll, with scrubbed giant numerals and line draws. Stacks vertically on mobile.
6. **Craft / Gravity Well** — skills are Verlet-integrated bodies on a Canvas 2D. The cursor attracts, holding repels, clicking emits a shockwave; same-group skills draw threads when close.
7. **Notes** — the blog. Three latest entries on the home page with a cursor-following generative thumbnail; `/notes` index and `/notes/[slug]` statically generated from `src/lib/posts.ts`, with typographic prose, a reading-progress bar and next-note footer. Add a post by appending to that file.
8. **Log** — reverse-chronological history with hairline draws.
9. **Contact** — character-split headline, magnetic copy-email button, marquee, footer HUD.

System pieces: difference-blend custom cursor with contextual labels, magnetic nav, **⌘K command palette** (sections, notes, theme, contact), full-screen mobile menu, SVG grain overlay, Pune clock, custom 404.

## Performance & accessibility

- Hero canvas capped at 1.5× DPR, `antialias: false`; ring canvas at 1.75×.
- The gravity well only simulates while on screen (IntersectionObserver) and re-measures on resize.
- `prefers-reduced-motion`: shader hero and 3D ring are replaced by static layouts, Lenis is disabled, preloader is near-instant, the Process scene un-pins.
- Coarse pointers get the native cursor; all sections are semantic HTML underneath; sheets and palette are keyboard-dismissable.
- No runtime network calls other than Google Fonts via `next/font`.

## Editing content

- `src/lib/data.ts` — person, projects, skills, log.
- `src/components/work/ProjectSheet.tsx` — case-study copy per project.
- `src/lib/posts.ts` — notes/blog posts (blocks: `h2`, `p`, `quote`, `code`, `ul`).

Project and case-study content is illustrative placeholder copy, as requested.
