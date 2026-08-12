---
name: lenis
description: Lenis — the smooth scroll library from darkroom.engineering. Use when implementing or fixing smooth scrolling, integrating it with GSAP ScrollTrigger, driving parallax/scroll-linked animation loops, handling anchors or nested scroll containers, or reviewing scroll behavior for quality. Covers core setup, GSAP wiring, options, methods, events, and project conventions.
---

# Lenis

Lenis ("smooth" in latin) is a lightweight, dependency-free smooth scroll library designed by darkroom.engineering. It wraps the browser's native scroll (so `position: sticky`, anchor links, and accessibility keep working) and is built to drive WebGL scenes, GSAP ScrollTrigger, and parallax off a single loop.

Official source: `https://github.com/darkroomengineering/lenis` — docs/demo: `https://lenis.darkroom.engineering/` — latest version is **1.3.x** (check npm before pinning).

## When to use

- Smooth scrolling on marketing sites, portfolios, long-form pages.
- Scroll-synced effects: pinned sections, parallax, scrub timelines (GSAP ScrollTrigger).
- Any page mixing smooth scroll with modals, anchor links, or nested scrollable areas.

## Installation

```bash
npm i lenis        # package manager
# or script tag:
<script src="https://unpkg.com/lenis@1.3.25/dist/lenis.min.js"></script>
```

**Recommended CSS** (handles `height:auto`, scroll-behavior, `lenis-stopped` overflow, iframe pointer-events):

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.25/dist/lenis.css">
```

## Basic setup

```js
const lenis = new Lenis({ autoRaf: true });
lenis.on('scroll', (e) => console.log(e));
```

Without `autoRaf`, drive it yourself:

```js
const lenis = new Lenis();
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
```

### No-code one-liner (no build step)

```html
<script>
new Lenis({ autoRaf: true, autoToggle: true, anchors: true, allowNestedScroll: true, naiveDimensions: true, stopInertiaOnNavigate: true });
</script>
```

## GSAP ScrollTrigger integration (the canonical wiring)

```js
const lenis = new Lenis();

lenis.on('scroll', ScrollTrigger.update);          // sync triggers with Lenis scroll

gsap.ticker.add((time) => {                         // drive Lenis off GSAP's ticker
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);                        // kill lag smoothing
```

## Key options

| Option | Default | Notes |
|---|---|---|
| `smoothWheel` | `true` | Smooth wheel-initiated scroll |
| `duration` | `1.2` | Seconds; ignored if `lerp` set |
| `easing` | expo-out `t => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | Ignored if `lerp` set |
| `lerp` | `0.1` | 0–1 interpolation intensity (alternative to duration/easing) |
| `anchors` | `false` | `true` or `ScrollToOptions` — enables anchor link scrolling (off by default!) |
| `allowNestedScroll` | `false` | Auto-detect nested scrollables (perf cost — prefer `prevent` / `data-lenis-prevent`) |
| `prevent` | — | `(node) => bool` — return true to keep native scroll for that element |
| `virtualScroll` | — | `(e) => ...` mutate events, e.g. `(e) => { e.deltaY /= 2 }` to slow scroll |
| `wheelMultiplier` / `touchMultiplier` | `1` | Scale wheel/touch deltas |
| `syncTouch` | `false` | Mimic touch scroll while syncing (unstable iOS < 16) |
| `infinite` | `false` | Infinite scrolling (needs `syncTouch: true` on touch) |
| `orientation` | `vertical` | `vertical` / `horizontal` |
| `autoRaf` | `false` | Run the rAF loop internally |
| `autoToggle` | `false` | Start/stop based on wrapper overflow (needs lenis.css; modern browsers) |
| `stopInertiaOnNavigate` | `false` | Kill inertia when an internal link is clicked |

## Methods

- `lenis.raf(time)` — per-frame update (ms)
- `lenis.scrollTo(target, options)` — `target`: pixel number, CSS selector/keyword, or HTMLElement. `options`: `offset`, `lerp`, `duration`, `easing`, `immediate`, `lock`, `force`, `onComplete`, `userData`
- `lenis.on(id, fn)` / `lenis.start()` / `lenis.stop()` / `lenis.destroy()` / `lenis.resize()`

## Properties & events

- Useful getters: `progress` (0–1), `velocity`, `limit`, `isScrolling` (`smooth`/`native`/`false`), `isStopped`, `direction` (`1` up / `-1` down), `actualScroll` vs `animatedScroll`
- Events: `'scroll'` (passes the instance), `'virtual-scroll'` (`{deltaX, deltaY, event}`)

## Nested scroll & modals

```html
<div data-lenis-prevent>scrollable content</div>
<!-- data-lenis-prevent-wheel / -touch / -vertical / -horizontal for granular control -->
```

```js
new Lenis({ prevent: (node) => node.id === 'modal' });
```

## Anchor links

Not enabled by default — set `anchors: true` (optionally `anchors: { offset: 100, ...scrollToOptions }`), or intercept clicks and call `lenis.scrollTo(hash, { offset: 0 })`.

## Reduced motion

Check `window.matchMedia('(prefers-reduced-motion: reduce)')` before initializing and skip Lenis entirely — native scroll is the accessible fallback.

## Limitations

- No CSS scroll-snap support (use `lenis/snap` package)
- Safari caps at 60fps; low-power mode at 30fps
- No smoothing inside iframes (wheel events aren't forwarded)
- `position: fixed` lags on pre-M1 Safari
- Don't combine with other smooth scroll libraries (locomotive etc.)

## Project conventions (SuperHyre)

This project already implements Lenis in `Superhyre/lenis.js` (defer-loaded in the head after GSAP/ScrollTrigger, CDN pinned via unpkg). The pattern: guard on `Lenis && gsap && ScrollTrigger` presence, bail on reduced motion, add `js-motion` class to `<html>` (CSS masks/reveals gate on it), `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker` raf + `lagSmoothing(0)`, and a delegated click handler routing `a[href^="#"]` through `lenis.scrollTo(target, { offset: 0, duration: 1.4 })`. Keep this file as the single source of truth — never initialize a second Lenis instance.

## Quality bar

- Always include the recommended CSS (`lenis/dist/lenis.css`) or the manual `html.lenis, html.lenis body { height: auto }` equivalent.
- Always pair with reduced-motion gating.
- Prefer `data-lenis-prevent` attributes over `allowNestedScroll` for known scrollable regions (no per-event DOM tree walks).
- Anchor hijacking must preserve default behavior when the target doesn't exist (`href="#"` links included).
