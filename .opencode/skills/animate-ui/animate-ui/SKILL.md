---
name: animate-ui
description: Animate UI — an open, copy-first distribution of animated React components built on the shadcn registry with Tailwind CSS and Motion. Use when the user wants pre-built animated UI pieces (animated primitives, buttons, effects, text animations, animated icons, community components) dropped into a React/Tailwind project, or when shadcn-style component additions are needed. Not for vanilla HTML/CSS/JS sites.
---

# Animate UI

Animate UI is a distribution of React components built with Tailwind CSS and Motion, based on the shadcn registry (inspired by shadcn/ui and Magic UI). It is **not an npm library** — components are copied into your codebase as source code via the shadcn CLI, so you own and can restyle every line.

Official source: `https://github.com/imskyleen/animate-ui` — docs: `https://animate-ui.com/docs`

## Requirements

- React (19 recommended), Tailwind CSS v4
- The `motion` package (Motion for React, `motion/react`) — installed automatically as a dependency when adding components
- A project already initialized with shadcn/ui (`npx shadcn@latest init`), or an existing components.json

## Adding components

```bash
npx shadcn@latest add @animate-ui/primitives-texts-sliding-number
# pnpm: pnpm dlx shadcn@latest add @animate-ui/...
# bun:   bunx --bun shadcn@latest add @animate-ui/...
```

Components land under `components/animate-ui/...` and are imported from there:

```tsx
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number';
```

## Naming convention

Registry names follow `@animate-ui/<category>-<name>(-<variant>)`:

- **primitives-*** — animated building blocks: `avatar-group`, `code-block`, `cursor`, `github-stars`, `motion-grid`, `pinned-list`, `scroll-progress`, `slot`, `spring`, `tabs`, `tooltip`
- **base-*** / **radix-*** / **headless-*** — primitives ported from Base UI, Radix UI, Headless UI: `accordion`, `dialog`, `menu`, `popover`, `tabs`, `tooltip`, `checkbox`, `switch`, `dropdown-menu`, `sheet`, `progress`, etc.
- **buttons-*** — `button`, `copy`, `flip`, `github-stars`, `icon`, `liquid`, `ripple`, `theme-toggler`
- **effects-*** — `auto-height`, `blur`, `click`, `fade`, `highlight`, `image-zoom`, `magnetic`, `particles`, `shine`, `slide`, `theme-toggler`, `tilt`, `zoom`, `effect`
- **texts-*** — `counting-number`, `gradient`, `highlight`, `morphing`, `rolling`, `rotating`, `scrolling-number`, `shimmering`, `sliding-number`, `splitting`, `typing`
- **icons-*** — animated Lucide icons (`@animate-ui/icons-[lucide-icon-name]`)
- **community components** — `flip-card`, `management-bar`, `motion-carousel`, `notification-list`, `pin-list`, `playful-todolist`, `radial-intro`, `radial-menu`, `radial-nav`, `share-button`, `user-presence-avatar`

When unsure of an exact name, browse the registry: `apps/www/public/r/*.json` in the repo, or search docs at `https://animate-ui.com/docs`.

## Common patterns

- Components are `'use client'` (Motion + React hooks).
- Many animate on viewport entry via the internal `useIsInView` hook — props like `inView`, `inViewOnce`, `inViewMargin` control it.
- Text counters (e.g. SlidingNumber) accept `number`, `fromNumber`, `delay`, `transition` (spring options), `padStart`, separators, and `onNumberChange`.
- Effects are composable — stack `effect`, `fade`, `slide`, `highlight`, etc. with `delay`/`duration` props rather than writing bespoke animations.

## When NOT to use

- Vanilla HTML/CSS/JS projects (no React/Tailwind/shadcn pipeline) — use GSAP/ScrollTrigger directly instead.
- Projects with no Tailwind — components ship Tailwind classes.
- The user needs hand-tuned motion (pinned hero, scrub timelines, Lenis integration) — that belongs in GSAP, not component libraries.

## Quality bar

- Copy-first: after `add`, tweak the source to match the project's design tokens rather than fighting defaults.
- Keep `@animate-ui` deps minimal — a component pulls only what its registry entry lists (e.g. `motion`, `react-use-measure`).
- Respect reduced motion: components with `inView`/entrance animations should honor the user's `prefers-reduced-motion` setting (check Motion's `useReducedMotion` or CSS media queries).
