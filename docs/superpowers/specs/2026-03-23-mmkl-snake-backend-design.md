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
- **Port:** 3002 — set via `PORT=3002` in the `dev` and `start` npm scripts in `package.json`

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
| activeSkinId | String? | nullable FK → Skin; null until first equip (resolved to 'default' at runtime) |
| createdAt | DateTime | |
| updatedAt | DateTime | auto-updated by Prisma `@updatedAt` |

**Registration side-effects:** On register, all three steps must execute inside a single **Prisma transaction**:
1. Create the User row (activeSkinId = null)
2. Insert a `UserSkin` row for `skinId = 'default'` (grants default skin ownership)
3. Update the User row: `activeSkinId = 'default'`

If any step fails, the entire transaction rolls back. This ensures no partial state can leave a user without their default skin.

**Seed-before-register dependency:** The `Skin` table must be seeded before any user can register. Attempting to register on an empty DB returns a 500. Deployment runbook must enforce `prisma db seed` before the app goes live.

### Skin (seeded — 20 skins)
| Field | Type | Notes |
|-------|------|-------|
| id | String | PK — exact values listed below |
| name | String | display name |
| price | Int | in lamps (0 = free) |
| trail | String | trail effect name |
| colors | Json | string array of hex colors |
| glow | String | hex glow color |
| isFree | Boolean | true only for id = 'default' |

**Skin IDs and prices (from snake-3d.html):**
`default` (0, free), `ocean` (25), `phantom` (30), `venom` (30), `inferno` (40), `arctic` (40), `neon_candy` (45), `toxic` (45), `thunder` (50), `void` (55), `solar` (55), `rose_gold` (60), `magma` (65), `shadow` (65), `cyber` (75), `matrix` (80), `crimson` (80), `aurora` (90), `galaxy` (120), `prism` (150).

### Map (seeded — 9 maps)
| Field | Type | Notes |
|-------|------|-------|
| id | String | PK — exact values listed below |
| name | String | display name |
| vibe | String | subtitle |
| borderColor | String | hex accent color |
| env | Json | See env shape below |
| challenge | Json | `{ name: string, color: string, desc: string }` |

**Map IDs:** `ocean`, `earth`, `moon`, `space`, `desert`, `arctic`, `lava`, `city`, `jungle`.

**`env` JSON shape** (all values are hex integers as stored in Three.js, e.g. `0x000d1a`):
```ts
{
  bg: number,      // scene background color
  fog: number,     // fog color
  fogD: number,    // fog density (float, e.g. 0.03)
  floor: number,   // floor plane color
  grid: number,    // grid helper color
  amb: number,     // ambient light color
  ambI: number,    // ambient light intensity (float)
  accent: number,  // point light color
  accentI: number  // point light intensity (float)
}
```

**`challenge` JSON shape:**
```ts
{ name: string, color: string, desc: string }
// e.g. { name: "🌊 Tidal Current", color: "#00b4d8", desc: "Every 8s a current..." }
```

### Level (seeded — 3 levels)
| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK: 1, 2, 3 |
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
| score | Int | best score on this combo, default 0 |
| @@unique([userId, mapId, levelId]) | | prevents duplicates |

**Response shape for `POST /api/user/progress`:** returns `{ data: { mapId, levelId, completed, score } }`.

### UserSkin (purchases + grants)
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
| status | Enum | `pending` \| `accepted` \| `declined` |
| createdAt | DateTime | |
| @@unique([requesterId, addresseeId]) | | |

**Friendship state machine:**
- `POST /api/friends` — requester sends request → status = `pending`. Before inserting, server checks for an existing row in either direction `(A→B)` or `(B→A)`. If one exists with status `pending` or `accepted`, returns 409. If one exists with status `declined`, the old row is deleted and a new `pending` row is created with the **current caller as requester** (i.e., the new row direction reflects who is sending the new request, regardless of who sent the original). Declined rows are not returned in `GET /api/friends` — only `accepted` and `pending` rows are exposed.
- `PUT /api/friends/[id]` with `action: 'accept'` — addressee only → status = `accepted`. Requester calling `accept` returns 403 `"Only the recipient can accept a friend request"`.
- `PUT /api/friends/[id]` with `action: 'decline'` — addressee only → status = `declined`. Requester calling `decline` returns 403 `"Only the recipient can decline a friend request — use DELETE to cancel your own request"`. The declined row is kept in the DB; it blocks duplicate requests until the requester retries (which deletes it).
- `DELETE /api/friends/[id]` — either party can remove an `accepted` friendship, or the requester can cancel their own `pending` request. The addressee cannot delete a `pending` request (they must use `decline`). Attempting an unauthorized delete returns 403.
- Authorization: only the requester or addressee of a friendship row may act on it. Any other authenticated user gets 403. A non-existent `[id]` returns 404 before any authorization check (i.e., 404 takes precedence over 403 — do not leak existence via a 403 for non-existent rows).

**Note:** `next.config.ts` and `tsconfig.json` are standard Next.js boilerplate generated by `create-next-app` and are not enumerated in the project structure above.


**Level unlock rule:** Medium unlocks after completing Easy on that map. Hard unlocks after completing Medium. `POST /api/user/progress` enforces this server-side: if `levelId = 2`, the server checks that `UserProgress` for `(userId, mapId, levelId=1)` has `completed = true` before saving. Same check applies for `levelId = 3` requiring level 2. Submitting an out-of-order level returns 403 `"Level locked — complete the previous level first"`.

**`POST /api/user/progress` input validation:**
- `mapId` must match a seeded Map id — 404 `"Map not found"` if not
- `levelId` must be 1, 2, or 3 — 400 `"Invalid level"` if not
- `score` must be a non-negative integer — 400 `"Invalid score"` if not

**Lamps earning:** lamps are awarded server-side the first time a level+map combo is completed (when `completed` flips `false → true`). Awards: Easy = 5 lamps, Medium = 15 lamps, Hard = 30 lamps. The score upsert and lamps credit must execute in a single **Prisma transaction**. Re-submitting to an already-completed level+map combo earns no lamps — response returns the current state: `{ completed: true, score: <highest>, lamps: <unchanged> }`. `POST /api/user/progress` always includes `lamps` in the response: `{ data: { mapId, levelId, completed, score, lamps } }`.

**Progress upsert rules:**
- Client sends only `{ mapId, levelId, score }` — no `completed` field in the request body
- `completed`: determined server-side as `score >= level.target`. Can only transition `false → true`, never `true → false`
- `score`: server keeps the highest score seen across all runs. If `newScore > existingScore`, update; otherwise keep existing. Row is created on first submission.

**`PUT /api/user/profile`:** `username` field is required — missing or empty body returns 400 `"Username is required"`. If the username is already taken by another user, returns 409. The `PUT` response intentionally omits `skinsOwned` (requires a separate `UserSkin` query); clients that need the full profile including owned skins should call `GET /api/user/profile`. The JWT is never re-issued on profile update — `username` is not in the JWT payload and is always fetched from the DB on demand.

**`GET /api/user/progress`:** returns all `UserProgress` rows scoped to the JWT `userId`. The user ID is always taken from the verified JWT — there is no `?userId=` query param. Only the authenticated user's own records are returned.

---

## Auth

- **Register:** email + username + password → bcrypt hash (12 rounds) → DB insert + default skin grant → JWT issued
- **Login:** email + password → bcrypt compare → JWT issued
- **JWT:** signed with `JWT_SECRET` env var, payload `{ userId, email }`, expires 7 days
- **Cookie attributes:** `HttpOnly; Path=/; SameSite=Lax; Secure` (`Secure` flag omitted when `NODE_ENV !== 'production'` to support `http://localhost`)
- **Password validation:** minimum 6 characters, maximum 100 characters. Returns 400 if violated.
- **Protected routes:** `requireAuth(request)` helper on all `/api/user/*` (GET and PUT profile, GET and POST progress, POST purchase, PUT skin) and `/api/friends/*`
- **Public routes:** `/api/game/*` — no auth required; `/api/game/skins` optionally reads the auth cookie if present to attach `owned` and `equipped` boolean flags per skin. If the cookie is absent, malformed, or contains an expired token, the route silently falls back to the unauthenticated response (no flags). No error is returned and no error is thrown — the failure is swallowed with a try/catch.
- **Logout:** clears cookie server-side (sets Max-Age=0)
- **Expired token handling:** when `requireAuth` encounters an expired JWT, it returns 401 and also clears the stale cookie (sets Max-Age=0) so the client does not continue sending it
- **Brute-force protection:** out of scope for v1; noted for future implementation (e.g. rate-limit login by IP)
- **Email format validation:** register and friend-lookup routes validate email format with a standard regex. Returns 400 if malformed.
- **Username validation:** 3–30 characters, alphanumeric and underscores only (`^[a-zA-Z0-9_]{3,30}$`). Returns 400 if violated at registration or profile update.
- **Email changes:** not supported in v1; `PUT /api/user/profile` only updates `username`
- **Known limitation:** rotating `JWT_SECRET` invalidates all active sessions (all users silently logged out on next request)

---

## API Routes

### Auth
| Method | Route | Body | Response |
|--------|-------|------|----------|
| POST | `/api/auth/register` | `{ email, username, password }` | `{ data: { id, email, username, lamps, activeSkinId } }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ data: { id, email, username, lamps, activeSkinId } }` |
| POST | `/api/auth/logout` | — | `{ data: { ok: true } }` + clears cookie |

### Game Data (public)
| Method | Route | Response |
|--------|-------|----------|
| GET | `/api/game/maps` | `{ data: Map[] }` — all 9 maps with env + challenge |
| GET | `/api/game/levels` | `{ data: Level[] }` — all 3 levels |
| GET | `/api/game/skins` | `{ data: Skin[] }` — all 20 skins; if authed cookie is present, each skin includes `owned: boolean` and `equipped: boolean` |

### User (protected — all require valid JWT cookie)
| Method | Route | Body | Response |
|--------|-------|------|----------|
| GET | `/api/user/profile` | — | `{ data: { id, email, username, lamps, activeSkinId, skinsOwned: string[] } }` |
| PUT | `/api/user/profile` | `{ username }` | `{ data: { id, email, username, lamps, activeSkinId } }` |
| GET | `/api/user/progress` | — | `{ data: UserProgress[] }` — all records for this user |
| POST | `/api/user/progress` | `{ mapId, levelId, score }` | `{ data: { mapId, levelId, completed, score, lamps } }` |
| POST | `/api/user/purchase` | `{ skinId }` | `{ data: { lamps: number } }` — new lamps balance |
| PUT | `/api/user/skin` | `{ skinId }` | `{ data: { activeSkinId: string } }` |

**`PUT /api/user/skin` validation:** verifies `skinId` is present in body (400 if missing), skin exists in DB (404 `"Skin not found"` if not), and user owns the skin via `UserSkin` row (403 `"Skin not owned"` if not). Updates `activeSkinId` on success.

**`POST /api/user/purchase` validation** (checks run in this exact order):
1. Skin exists → 404 `"Skin not found"` if not
2. User already owns it → 409 `"Already owned"` if so (this fires before the free check — since `default` is always auto-granted at registration, it will always hit this branch first)
3. Skin is free (`isFree = true`) → 400 `"This skin is free and granted automatically at registration"` (only reachable for future free skins)
4. Insufficient lamps → 400 `"Insufficient lamps"` if `user.lamps < skin.price`
5. Deduct lamps and insert `UserSkin` atomically in a Prisma transaction

**`POST /api/user/progress` — per-run score model:** the client submits the score for a single completed run. The server keeps the highest score across all runs for that map+level combo.

### Friends (protected)
| Method | Route | Body | Response |
|--------|-------|------|----------|
| GET | `/api/friends` | — | See detailed shape below |
| POST | `/api/friends` | `{ email }` | `{ data: { friendshipId, status, addresseeId, addresseeUsername } }` — `friendshipId` is `Friendship.id` |
| PUT | `/api/friends/[id]` | `{ action: 'accept'\|'decline' }` | `{ data: { id, status } }` |
| DELETE | `/api/friends/[id]` | — | `{ data: { ok: true } }` |

**`GET /api/friends` full response shape** (all user data joined from the `User` table via Prisma `include: { requester: true, addressee: true }`):
```ts
{
  data: {
    friends: Array<{
      friendshipId: string,   // Friendship.id — used for DELETE /api/friends/[id]
      userId: string,         // User.id of the friend
      username: string,
      activeSkinId: string | null
    }>,
    pending: {
      incoming: Array<{
        id: string,            // Friendship.id — used for PUT /api/friends/[id]
        requesterId: string,   // User.id of the requester
        requesterUsername: string,
        createdAt: string
      }>,
      outgoing: Array<{
        id: string,            // Friendship.id
        addresseeId: string,   // User.id of the addressee
        addresseeUsername: string,
        createdAt: string
      }>
    }
  }
}
```

**`POST /api/friends` — validation rules:**
- `email` must be a valid email format; returns 400 if malformed
- If no user with that email exists, returns 404 `"User not found"`
- Email lookup is intentional by design — users share emails to find friends
- Self-request (requester email == own email) returns 400 `"Cannot send friend request to yourself"`
- Duplicate/existing request (any direction, any status except declined) returns 409

**`PUT /api/friends/[id]` — idempotency and invalid transitions:**
- Calling `accept` on an already-`accepted` friendship → 200 with current state (idempotent)
- Calling `decline` on an already-`declined` friendship → 200 with current state (idempotent)
- Calling `accept` on a `declined` friendship → 400 `"Cannot accept a declined request — the requester must send a new friend request"`
- Calling `decline` on an `accepted` friendship → 400 `"Cannot decline an already accepted friendship — use DELETE to remove a friend"`
- Any invalid `action` value → 400 `"Invalid action"`

**`DELETE /api/friends/[id]` — authorization rules:**
- Requester may delete a `pending` or `accepted` row
- Addressee may delete an `accepted` row only (they use `PUT decline` for pending)
- Addressee calling DELETE on a `pending` row returns 403 `"Use decline to reject a pending request"`

---

## Miscellaneous

**`src/app/page.tsx`:** returns a simple JSON health-check response: `{ data: { status: "ok", app: "mmkl-snake" } }`.

**Malformed JSON request bodies:** Next.js App Router automatically returns a 400 for unparseable JSON bodies. No custom handling needed.

---

## Error Handling

All routes return consistent JSON:

```json
{ "data": { ... } }    // success (2xx)
{ "error": "message" } // failure (4xx / 5xx)
```

HTTP status codes:
- 400 — bad input (missing fields, insufficient lamps, invalid action)
- 401 — unauthenticated (missing or expired JWT)
- 403 — forbidden (wrong user for this resource, skin not owned, level locked)
- 404 — not found (skin/map/level/friendship does not exist)
- 409 — conflict (email taken, username taken, already owns skin, friendship already exists)
- 500 — server error

---

## Seed Data

`prisma/seed.ts` upserts all maps, levels, and skins. Safe to re-run. **Must be run before any user can register.**

```bash
npx prisma db seed
```

---

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mmkl_snake"
JWT_SECRET="your-secret-here"
NODE_ENV="development"
```

Port is set via `cross-env` in `package.json` scripts (required for Windows compatibility):
```json
"dev": "cross-env PORT=3002 next dev",
"start": "cross-env PORT=3002 next start"
```
`cross-env` must be installed as a dev dependency: `npm install --save-dev cross-env`.
