# Telehealth Web App — Design Spec
**Date:** 2026-03-28
**Status:** Approved

---

## Overview

A modern, bilingual (Arabic-first, English toggle) Telehealth web app built as a standalone Next.js workspace (`telehealth/`) in the existing monorepo. Patients can browse doctors, check symptoms via a rule-based AI chatbot, book appointments, and manage their care through a patient portal.

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Location | New `telehealth/` workspace | Isolated from fullstack, own port (3003) |
| Stack | Next.js App Router + TypeScript + Tailwind CSS | Matches monorepo pattern |
| Data | Mock/static data | No backend needed for this phase |
| Symptom engine | Rule-based keyword matching | Fast to build, easy to swap with Claude API later |
| Video chat | UI-only mock | No WebRTC complexity needed |
| Primary language | Arabic (RTL) with EN/AR toggle | User requirement |
| Color palette | Deep Sapphire — `#1d4ed8` primary, `#06b6d4` accent | Selected during design review |
| Navigation | Sticky top navbar — Home, Doctors, Book visible + "More ▾" dropdown | Selected during design review |

---

## Color System

```
Primary:     #1d4ed8  (deep blue)
Primary Dark:#1e3a8a  (button shadow, hover)
Accent:      #06b6d4  (cyan teal)
Accent Light:#38bdf8  (highlights, logo)
Surface:     #f1f5f9  (page background)
White:       #ffffff
Text:        #1e293b
Muted:       #64748b
Border:      #e2e8f0
```

Gradient CTAs: `linear-gradient(135deg, #1d4ed8, #06b6d4)`
Button depth: `box-shadow: 0 4px 0 #b3c6f5` (press-down 3D effect)

---

## Folder Structure

```
telehealth/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                  # Home
    │   ├── doctors/page.tsx
    │   ├── library/page.tsx
    │   ├── symptom-checker/page.tsx
    │   ├── book/page.tsx
    │   ├── portal/page.tsx
    │   ├── departments/page.tsx
    │   └── contact/page.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── Footer.tsx
    │   ├── home/
    │   │   └── HeroSection.tsx
    │   ├── doctors/
    │   │   ├── DoctorCard.tsx
    │   │   └── DoctorFilters.tsx
    │   ├── symptom-checker/
    │   │   └── ChatBot.tsx
    │   ├── booking/
    │   │   ├── Calendar.tsx
    │   │   └── TimeSlotPicker.tsx
    │   └── portal/
    │       ├── AppointmentList.tsx
    │       └── VideoCallUI.tsx
    ├── data/
    │   ├── doctors.ts
    │   ├── diseases.ts
    │   └── departments.ts
    └── lib/
        ├── symptom-engine.ts
        └── i18n/
            ├── ar.ts
            ├── en.ts
            └── useTranslation.ts
```

---

## Pages & Features

### Home (`/`)
- Sticky navbar with EN/AR language toggle
- Hero section:
  - Animated moving grid background
  - Floating blur orbs
  - 6 large (88–110px) 3D rotating/floating medical emoji items: 🩺 💉 💊 ❤️‍🩹 🧬 🔬
  - Headline + subtitle (Arabic default)
  - Two CTA buttons with 3D press-down depth shadow
  - 4 stat counters (500+ doctors, 98% satisfaction, 24/7, 50k+ consultations)
- 4-column feature cards with hover lift
- Top-rated doctors preview (3 cards) with "Book" button
- Footer CTA with gradient background

### Doctors (`/doctors`)
- Filter bar: specialty dropdown, availability toggle, rating filter, search by name
- Responsive grid of `DoctorCard` components
- Each card: avatar, name, specialty badge, rating stars, review count, "Book Now" button
- Mock data: 12 doctors across 8 specialties

### Health Library (`/library`)
- Search bar for diseases/symptoms
- Grid of disease cards: name, category, common symptoms list, recommended specialty tag
- Mock data: 20+ common diseases

### AI Symptom Checker (`/symptom-checker`)
- Chat bubble interface (patient on right, bot on left)
- User types symptoms → `symptom-engine.ts` matches keywords → returns:
  1. Likely conditions (top 2–3 matches with confidence %)
  2. Recommended doctor specialty
  3. CTA: "Book with a [Specialist] →" linking to `/book`
- Typing indicator animation
- Designed so `symptom-engine.ts` can be replaced with a Claude API call with no UI changes

### Book Appointment (`/book`)
- Month-view calendar with clickable available days (highlighted in blue)
- Time slot picker (morning / afternoon slots)
- Doctor selector (pre-filled if coming from a Doctor card)
- Appointment type: Video Call or In-Person
- Confirmation summary card with "Confirm Booking" button
- Success state with confirmation message

### Patient Portal (`/portal`)
- Upcoming appointments list with date, doctor, type badge
- Past appointments section
- Text chat UI: message bubbles, input field, send button (mock, no backend)
- Video call UI: mock fullscreen overlay with camera frame placeholder, patient name, mute / camera / end-call controls

### Departments (`/departments`)
- Grid of 10 specialty cards: Cardiology, Neurology, Dermatology, Pediatrics, Orthopedics, Psychiatry, Gynecology, Ophthalmology, ENT, General Medicine
- Each card: icon, name, description, doctor count, "View Doctors" button

### Contact (`/contact`)
- Contact form: name, email, subject, message
- FAQ accordion (5 common questions)
- Support info: email, phone, hours

---

## Navigation

**Navbar structure (sticky, `#1d4ed8` background):**
```
[Logo]   [Home] [Doctors] [Book]  [More ▾]        [🌐 EN/AR]  [Login]
```

**"More" dropdown contains:** Health Library, Symptom Checker, Patient Portal, Departments, Contact

**Login button:** UI-only — renders the button but no auth flow in this phase.

**Language toggle:**
- Switches `<html dir>` between `rtl` and `ltr`
- Swaps all strings from `ar.ts` / `en.ts` via `useTranslation` hook
- No page reload required

---

## i18n Architecture

```ts
// lib/i18n/useTranslation.ts
// React context + hook — no external library
// useTranslation() returns { t, lang, toggleLang }
// t('hero.title') → string from active language file
```

All user-facing strings live in `ar.ts` and `en.ts`. Components never contain hardcoded Arabic or English text.

---

## Symptom Engine

```ts
// lib/symptom-engine.ts
// Input:  string (user message)
// Output: { conditions: [{name, confidence, specialty}], topSpecialty: string }

// Keyword map: symptom keywords → disease → specialty
// Designed as a pure function — swap implementation for Claude API with no interface change
```

---

## Mock Data Scope

- **Doctors:** 12 entries — name, specialty, rating, review count, availability (days), bio, price
- **Diseases:** 20 entries — name, symptoms[], description, specialty tag
- **Departments:** 10 entries — name, icon, description, doctorCount

---

## Port & Scripts

```json
// telehealth/package.json
"scripts": {
  "dev": "next dev -p 3003",
  "build": "next build",
  "lint": "next lint"
}
```

Root `package.json` gains:
```json
"dev:telehealth": "npm -w telehealth run dev"
```

---

## Out of Scope (this phase)

- Real authentication / user accounts
- Real database or API
- Real WebRTC video
- Payment processing
- Push notifications
- Claude API integration (designed for, not implemented)
