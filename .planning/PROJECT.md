# Portfolio Landing Page

## What This Is

A luxury, highly interactive portfolio landing page for a Full Stack Developer & Designer. Built as a standalone Next.js 15 app in `portfolio/`, showcasing work through immersive 3D animations, scroll-triggered effects, and a warm editorial aesthetic.

## Core Value

**First impression that feels crafted, not generated.** This isn't a template portfolio — it's a statement piece that demonstrates both engineering skill and design sensibility through the experience itself.

## Target Audience

- Potential employers and clients reviewing the owner's work
- The owner themselves (personal brand asset)

## Aesthetic Direction

Warm luxury editorial — Bottega Veneta meets high-end digital agency. Earthy refinement, not cold tech startup.

**Palette:**
- Background: `#1C1410` Deep Espresso
- Surface: `#2A1F18` Warm Charcoal
- Border: `#6B5140` Aged Bronze
- Accent: `#A79277` Donkey Brown (user-specified)
- Highlight: `#C4A882` Champagne Gold
- Text: `#F5EFE6` Ivory (user-specified)

**Typography:** Cormorant Garamond (display) + Jost (body/UI)

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Full-screen hero with 3D canvas animation (torus knot + particle field)
- [ ] Mouse parallax on 3D scene
- [ ] GSAP split-text reveal for hero name/tagline
- [ ] Magnetic hover effect on CTA buttons
- [ ] Custom cursor (ivory dot + bronze ring with lag)
- [ ] About section with clip-path scroll reveal + staggered text
- [ ] Infinite CSS marquee strip for skills
- [ ] Mini 3D orb in About that reacts to scroll
- [ ] Projects section with 3D tilt cards (CSS perspective)
- [ ] Champagne gold sheen sweep on project card hover
- [ ] Framer Motion stagger entry for project cards
- [ ] Contact section with large typographic CTA + champagne glow pulse
- [ ] Social links (GitHub, LinkedIn, Dribbble)
- [ ] SVG noise grain overlay across entire page
- [ ] Lenis smooth scroll synced with GSAP ScrollTrigger
- [ ] Page load animation sequence
- [ ] Mobile fallback: disable 3D canvas on < 768px

### Out of Scope

- Blog / writing section — not requested
- CMS / admin panel — static content only for v1
- Dark/light mode toggle — dark-only by design
- Backend / contact form submission — links only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Standalone `portfolio/` app | Clean separation from study hub / MMKL apps | — Pending |
| Cormorant Garamond + Jost fonts | Editorial luxury feel, avoids generic AI-slop fonts | — Pending |
| @react-three/fiber over vanilla Three.js | React ecosystem, easier component composition | — Pending |
| GSAP over CSS-only scroll animations | Fine-grained control, ScrollTrigger integration | — Pending |

## Tech Stack

- Next.js 15 App Router + TypeScript
- Tailwind CSS + CSS variables
- @react-three/fiber + @react-three/drei + Three.js
- GSAP + ScrollTrigger
- Lenis (smooth scroll)
- Framer Motion

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after initialization*
