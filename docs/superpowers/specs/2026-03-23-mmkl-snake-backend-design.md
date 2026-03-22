# MMKL Snake — Backend Design Spec

**Date:** 2026-03-23
**Status:** Approved

---

## Overview

A standalone Next.js backend for MMKL Snake — a cyberpunk snake game with maps, skins, campaign levels, and a friends system. All game data (maps, levels, skins) from the existing `games/snake-3d/snake-3d.html` is ported into a seeded PostgreSQL database. Users can register, log in, track campaign progress, purchase skins with lamps currency, and manage a friends list.

---

## Project Location

`C:\Claude Code Test 1\mmkl-snake\` — standalone Next.js app, separate from `fullstack/`.

---

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** bcrypt (password hashing) + JWT in HTTP-only cookies
- **Port:** 3002 (to avoid conflict with fullstack on 3001)

---

## Project Structure

```
mmkl-snake/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── game/
│   │   │   │   ├── maps/route.ts
│   │   │   │   ├── levels/route.ts
│   │   │   │   └── skins/route.ts
│   │   │   ├── user/
│   │   │   │   ├── profile/route.ts
│   │   │   │   ├── progress/route.ts
│   │   │   │   ├── purchase/route.ts
│   │   │   │   └── skin/route.ts
│   │   │   └── friends/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   └── page.tsx
│   └── lib/
│       ├── prisma.ts
│       ├── auth.ts
│       └── middleware.ts
├── .env
└── package.json
```

---

## Database Schema

### User
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| email | String | unique |
| username | String | unique |
| passwordHash | String | bcrypt 12 rounds |
| lamps | Int | default 0, currency balance |
| activeSkinId | String | FK → Skin, default 'default' |
| createdAt | DateTime | |

### Skin (seeded — 20 skins)
| Field | Type | Notes |
|-------|------|-------|
| id | String | e.g. 'phantom', 'cyber' |
| name | String | display name |
| price | Int | in lamps (0 = free) |
| trail | String | trail effect name |
| colors | Json | string array of hex colors |
| glow | String | hex glow color |
| isFree | Boolean | true only for 'default' |

**All 20 skins from snake-3d.html:**
Default (free), Ocean (25), Phantom (30), Venom (30), Inferno (40), Arctic (40), Neon Candy (45), Toxic (45), Thunder (50), Void Walker (55), Solar (55), Rose Gold (60), Magma (65), Shadow (65), Cyber (75), Matrix (80), Crimson (80), Aurora (90), Galaxy (120), Prism (150).

### Map (seeded — 9 maps)
| Field | Type | Notes |
|-------|------|-------|
| id | String | e.g. 'ocean', 'lava' |
| name | String | display name |
| vibe | String | subtitle |
| borderColor | String | hex accent color |
| env | Json | bg, fog, fogDensity, floor, grid, ambient, accent settings |
| challenge | Json | { name, color, desc } |

**All 9 maps from snake-3d.html:** Ocean, Earth, Moon, Space, Desert, Arctic, Lava, City, Jungle.

### Level (seeded — 3 levels)
| Field | Type | Notes |
|-------|------|-------|
| id | Int | 1, 2, 3 |
| label | String | 'Easy', 'Medium', 'Hard' |
| target | Int | food to collect: 5, 20, 45 |
| speed | Float | tick interval (s): 0.18, 0.12, 0.08 |

### UserProgress
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| mapId | String | FK → Map |
| levelId | Int | FK → Level |
| completed | Boolean | default false |
| score | Int | best score on this combo |
| @@unique([userId, mapId, levelId]) | | |

### UserSkin (purchases)
| Field | Type | Notes |
|-------|------|-------|
| userId | String | FK → User |
| skinId | String | FK → Skin |
| @@id([userId, skinId]) | | composite PK |

### Friendship
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| requesterId | String | FK → User |
| addresseeId | String | FK → User |
| status | Enum | 'pending' \| 'accepted' \| 'declined' |
| createdAt | DateTime | |
| @@unique([requesterId, addresseeId]) | | |

**Level unlock rule:** Medium unlocks after completing Easy on that map. Hard unlocks after completing Medium. Each map's progression is independent.

---

## Auth

- **Register:** email + username + password → bcrypt hash (12 rounds) → DB insert → JWT issued
- **Login:** email + password → bcrypt compare → JWT issued
- **JWT:** signed with `JWT_SECRET` env var, payload `{ userId, email }`, expires 7 days
- **Storage:** HTTP-only cookie (XSS-safe)
- **Protected routes:** `requireAuth(request)` helper on all `/api/user/*` and `/api/friends/*`
- **Public routes:** `/api/game/*` (maps, levels, skins) — no auth required
- **Logout:** clears cookie server-side

---

## API Routes

### Auth
| Method | Route | Body | Response |
|--------|-------|------|----------|
| POST | `/api/auth/register` | `{ email, username, password }` | `{ data: { user } }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ data: { user } }` |
| POST | `/api/auth/logout` | — | clears cookie |

### Game Data (public)
| Method | Route | Response |
|--------|-------|----------|
| GET | `/api/game/maps` | all 9 maps with env + challenge |
| GET | `/api/game/levels` | all 3 levels |
| GET | `/api/game/skins` | all 20 skins (owned/equipped flags added if authed) |

### User (protected)
| Method | Route | Body | Response |
|--------|-------|------|----------|
| GET | `/api/user/profile` | — | `{ username, lamps, activeSkin, skinsOwned }` |
| PUT | `/api/user/profile` | `{ username }` | updated profile |
| GET | `/api/user/progress` | — | all 27 combos with completed/score |
| POST | `/api/user/progress` | `{ mapId, levelId, score }` | upserted progress |
| POST | `/api/user/purchase` | `{ skinId }` | updated lamps balance |
| PUT | `/api/user/skin` | `{ skinId }` | updated active skin |

### Friends (protected)
| Method | Route | Body | Response |
|--------|-------|------|----------|
| GET | `/api/friends` | — | accepted friends + pending requests |
| POST | `/api/friends` | `{ email }` | friendship record |
| PUT | `/api/friends/[id]` | `{ action: 'accept'\|'decline' }` | updated friendship |
| DELETE | `/api/friends/[id]` | — | removed friendship |

---

## Error Handling

All routes return consistent JSON:

```json
{ "data": { ... } }   // success
{ "error": "message" } // failure
```

HTTP status codes: 400 (bad input), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict — e.g. email taken), 500 (server error).

**Lamps validation:** purchase route verifies balance server-side before deducting. Client cannot fake a purchase.

---

## Seed Data

`prisma/seed.ts` upserts all maps, levels, and skins on run. Safe to re-run. Run with:

```bash
npx prisma db seed
```

---

## Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
```
