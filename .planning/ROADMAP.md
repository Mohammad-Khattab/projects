# Roadmap — Portfolio Landing Page

## Milestone 1 — v1.0 Launch

### Phase 1 — Scaffolding & Foundation
**Goal:** Working Next.js app with correct palette, fonts, global styles, and custom cursor.
- [ ] Create `portfolio/` Next.js 15 app
- [ ] Install all dependencies
- [ ] Configure Tailwind with full palette + fonts
- [ ] `globals.css` — CSS variables, noise overlay, base reset
- [ ] `layout.tsx` — fonts, Lenis provider, cursor mount
- [ ] `CustomCursor.tsx` — dot + ring cursor

**Verification:** `npm run dev` → dark background, custom cursor visible

---

### Phase 2 — Hero Section
**Goal:** Full-screen 3D hero with text reveal and magnetic CTA.
- [ ] `HeroSection.tsx` — layout wrapper, full viewport
- [ ] `HeroCanvas.tsx` — Three.js torus knot + particles, mouse parallax
- [ ] `HeroText.tsx` — GSAP split-text reveal
- [ ] `ScrollCue.tsx` — animated chevron/line indicator
- [ ] Magnetic button hook

**Verification:** 3D renders, mouse moves scene, text animates on load

---

### Phase 3 — About Section
**Goal:** Scroll-animated about with marquee and mini 3D orb.
- [ ] `AboutSection.tsx`
- [ ] `MarqueeStrip.tsx` — CSS infinite scroll
- [ ] `About3DOrb.tsx` — mini Three.js canvas

**Verification:** Scroll triggers all animations correctly

---

### Phase 4 — Projects Section
**Goal:** 3D tilt project cards with scroll entry.
- [ ] `ProjectsSection.tsx`
- [ ] `ProjectCard.tsx` + `useTilt.ts` hook
- [ ] `projects.ts` placeholder data

**Verification:** Cards tilt on hover, stagger in on scroll

---

### Phase 5 — Contact + Footer
**Goal:** Typographic contact section and footer.
- [ ] `ContactSection.tsx`
- [ ] `Footer.tsx`

**Verification:** Glow pulse animates, all links present

---

### Phase 6 — Polish & Ship
**Goal:** Full experience polished and build-clean.
- [ ] Lenis + GSAP ScrollTrigger sync
- [ ] Page load sequence
- [ ] Mobile 3D fallback
- [ ] `npm run build` passes

**Verification:** Full walk-through passes all checks
