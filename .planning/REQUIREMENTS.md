# Requirements — Portfolio Landing Page

## Must Have (v1)

### Hero
- [ ] Full-screen hero section (100vh)
- [ ] Three.js canvas: torus knot wireframe + particle field
- [ ] Mouse parallax: scene rotates tracking cursor
- [ ] GSAP split-text: name chars stagger in from bottom on load
- [ ] Tagline fades in after name
- [ ] Magnetic CTA button (follows cursor within 60px radius)
- [ ] Animated scroll cue at bottom of hero

### Global
- [ ] Custom cursor: small ivory dot + larger bronze ring with position lag
- [ ] SVG noise grain overlay (opacity ~0.04, mix-blend-mode: overlay)
- [ ] Lenis smooth scroll active across entire page
- [ ] Page load sequence: bg → nav → hero text → 3D canvas

### About
- [ ] Section heading: clip-path reveal on scroll (GSAP ScrollTrigger)
- [ ] Bio paragraphs stagger in from left
- [ ] Infinite CSS marquee strip (skills, dual-row, reversed second row)
- [ ] Mini Three.js orb that rotates based on scroll position

### Projects
- [ ] Grid of 3 placeholder project cards
- [ ] CSS perspective 3D tilt on mouse move within card
- [ ] Champagne gold sheen sweep on hover (pseudo-element)
- [ ] Framer Motion stagger entry when scrolled into view

### Contact
- [ ] Large Cormorant Garamond italic CTA headline
- [ ] Radial champagne glow pulse behind headline (CSS animation)
- [ ] Email link with animated underline on hover
- [ ] GitHub, LinkedIn, Dribbble icon links

### Footer
- [ ] Single-line minimal typographic footer

## Should Have

- [ ] Navbar with smooth scroll-to-section links
- [ ] Active section indicator in nav
- [ ] Card hover: border brightens to champagne gold

## Won't Have (v1)

- Contact form with submission
- CMS or dynamic content
- Light mode
- Blog section
- Animations on IE/Safari < 14 (use `prefers-reduced-motion` only)
