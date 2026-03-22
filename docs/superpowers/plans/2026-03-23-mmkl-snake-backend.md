# MMKL Snake Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js + Prisma + PostgreSQL backend for MMKL Snake with auth, game data, user progress, skin purchases, and a friends system.

**Architecture:** Next.js 14 App Router with route handlers as the API layer. Prisma ORM manages a PostgreSQL database. Auth uses bcrypt + JWT stored in HTTP-only cookies. All game data (9 maps, 3 levels, 20 skins) is seeded from the existing `snake-3d.html` game.

**Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL, bcrypt, jsonwebtoken, Jest, cross-env

---

## File Map

```
mmkl-snake/
├── prisma/
│   ├── schema.prisma               # DB schema: User, Skin, Map, Level, UserProgress, UserSkin, Friendship
│   └── seed.ts                     # Upserts all 9 maps, 3 levels, 20 skins
├── src/
│   ├── app/
│   │   ├── page.tsx                # Health check: GET / → { data: { status: "ok", app: "mmkl-snake" } }
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts   # POST /api/auth/register
│   │       │   ├── login/route.ts      # POST /api/auth/login
│   │       │   └── logout/route.ts     # POST /api/auth/logout
│   │       ├── game/
│   │       │   ├── maps/route.ts       # GET /api/game/maps
│   │       │   ├── levels/route.ts     # GET /api/game/levels
│   │       │   └── skins/route.ts      # GET /api/game/skins (+ optional owned/equipped flags)
│   │       ├── user/
│   │       │   ├── profile/route.ts    # GET + PUT /api/user/profile
│   │       │   ├── progress/route.ts   # GET + POST /api/user/progress
│   │       │   ├── purchase/route.ts   # POST /api/user/purchase
│   │       │   └── skin/route.ts       # PUT /api/user/skin
│   │       └── friends/
│   │           ├── route.ts            # GET + POST /api/friends
│   │           └── [id]/route.ts       # PUT + DELETE /api/friends/[id]
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── auth.ts                 # signJwt, verifyJwt, setCookie, clearCookie
│   │   └── middleware.ts           # requireAuth(request) → { userId, email }
│   └── __tests__/
│       ├── lib/
│       │   ├── auth.test.ts
│       │   └── middleware.test.ts
│       └── api/
│           ├── auth.register.test.ts
│           ├── auth.login.test.ts
│           ├── game.maps.test.ts
│           ├── game.skins.test.ts
│           ├── user.profile.test.ts
│           ├── user.progress.test.ts
│           ├── user.purchase.test.ts
│           ├── user.skin.test.ts
│           ├── friends.test.ts
│           └── friends-id.test.ts
├── jest.config.ts
├── jest.setup.ts
├── .env
├── .env.example
└── package.json
```

---

## Task 1: Scaffold the Project

**Files:**
- Create: `mmkl-snake/package.json`
- Create: `mmkl-snake/.env`
- Create: `mmkl-snake/.env.example`
- Create: `mmkl-snake/jest.config.ts`
- Create: `mmkl-snake/jest.setup.ts`

- [ ] **Step 1: Create the Next.js app**

```bash
cd "C:\Claude Code Test 1"
npx create-next-app@latest mmkl-snake --typescript --app --no-tailwind --no-eslint --import-alias "@/*" --use-npm
```

Then move `src` directory inside manually if not created by default (Next.js 14 prompts for it). Verify `mmkl-snake/src/app/` exists.

- [ ] **Step 2: Install dependencies**

```bash
cd "C:\Claude Code Test 1\mmkl-snake"
npm install --legacy-peer-deps prisma @prisma/client bcrypt jsonwebtoken
npm install --legacy-peer-deps --save-dev @types/bcrypt @types/jsonwebtoken jest @types/jest ts-jest cross-env
```

- [ ] **Step 3: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`.

- [ ] **Step 4: Update `package.json` scripts**

Edit `mmkl-snake/package.json` — replace the scripts section:

```json
{
  "scripts": {
    "dev": "cross-env PORT=3002 next dev",
    "build": "next build",
    "start": "cross-env PORT=3002 next start",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:seed": "npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "prisma": {
    "seed": "npm run db:seed"
  }
}
```

- [ ] **Step 5: Create `.env`**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mmkl_snake"
JWT_SECRET="dev-secret-change-in-production"
NODE_ENV="development"
```

- [ ] **Step 6: Create `.env.example`**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mmkl_snake"
JWT_SECRET="your-jwt-secret-min-32-chars"
NODE_ENV="development"
```

- [ ] **Step 7: Create `jest.config.ts`**

```typescript
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: { module: 'commonjs' },
    },
  },
}

export default config
```

- [ ] **Step 8: Create `jest.setup.ts`**

```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    skin: { findUnique: jest.fn(), findMany: jest.fn() },
    map: { findMany: jest.fn(), findUnique: jest.fn() },
    level: { findMany: jest.fn(), findUnique: jest.fn() },
    userProgress: { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn() },
    userSkin: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    friendship: { findFirst: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn(),
  },
}))
```

- [ ] **Step 9: Verify Jest is configured**

```bash
cd "C:\Claude Code Test 1\mmkl-snake"
npx jest --listTests
```

Expected: no errors (no tests found yet is fine)

- [ ] **Step 10: Commit**

```bash
git add mmkl-snake/
git commit -m "feat(mmkl-snake): scaffold Next.js app with Prisma, Jest, cross-env"
```

---

## Task 2: Prisma Schema

**Files:**
- Modify: `mmkl-snake/prisma/schema.prisma`

- [ ] **Step 1: Write the full schema**

Replace the contents of `mmkl-snake/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  username     String   @unique
  passwordHash String
  lamps        Int      @default(0)
  activeSkinId String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  activeSkin   Skin?         @relation("ActiveSkin", fields: [activeSkinId], references: [id])
  ownedSkins   UserSkin[]
  progress     UserProgress[]
  sentRequests     Friendship[] @relation("Requester")
  receivedRequests Friendship[] @relation("Addressee")
}

model Skin {
  id     String  @id
  name   String
  price  Int
  trail  String
  colors Json
  glow   String
  isFree Boolean @default(false)

  activeUsers UserSkin[]
  equippedBy  User[]     @relation("ActiveSkin")
}

model Map {
  id          String @id
  name        String
  vibe        String
  borderColor String
  env         Json
  challenge   Json

  progress UserProgress[]
}

model Level {
  id     Int    @id
  label  String
  target Int
  speed  Float

  progress UserProgress[]
}

model UserProgress {
  id        String  @id @default(cuid())
  userId    String
  mapId     String
  levelId   Int
  completed Boolean @default(false)
  score     Int     @default(0)

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  map   Map   @relation(fields: [mapId], references: [id])
  level Level @relation(fields: [levelId], references: [id])

  @@unique([userId, mapId, levelId])
}

model UserSkin {
  userId String
  skinId String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  skin Skin @relation(fields: [skinId], references: [id])

  @@id([userId, skinId])
}

enum FriendshipStatus {
  pending
  accepted
  declined
}

model Friendship {
  id          String           @id @default(cuid())
  requesterId String
  addresseeId String
  status      FriendshipStatus @default(pending)
  createdAt   DateTime         @default(now())

  requester User @relation("Requester", fields: [requesterId], references: [id], onDelete: Cascade)
  addressee User @relation("Addressee", fields: [addresseeId], references: [id], onDelete: Cascade)

  @@unique([requesterId, addresseeId])
}
```

- [ ] **Step 2: Create and apply the migration**

```bash
cd "C:\Claude Code Test 1\mmkl-snake"
npx prisma migrate dev --name init
```

Expected: migration created, DB tables created, Prisma client generated.

- [ ] **Step 3: Commit**

```bash
git add mmkl-snake/prisma/schema.prisma mmkl-snake/prisma/migrations/
git commit -m "feat(mmkl-snake): add Prisma schema with all models"
```

---

## Task 3: Seed Data

**Files:**
- Create: `mmkl-snake/prisma/seed.ts`

- [ ] **Step 1: Write the seed file**

Create `mmkl-snake/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ── SKINS ──────────────────────────────────────────────────────────
  const skins = [
    { id: 'default',    name: 'Default',     price: 0,   trail: 'No Trail',       colors: ['#8eff71','#4cd420','#1a8000'], glow: '#8eff71',  isFree: true  },
    { id: 'ocean',      name: 'Ocean',       price: 25,  trail: 'Water Ripple',   colors: ['#00e5ff','#0096c7','#023e8a'], glow: '#00e5ff',  isFree: false },
    { id: 'phantom',    name: 'Phantom',     price: 30,  trail: 'Smoke Wisps',    colors: ['#d966ff','#9900cc','#3d0066'], glow: '#cc44ff',  isFree: false },
    { id: 'venom',      name: 'Venom',       price: 30,  trail: 'Toxic Drip',     colors: ['#c8ff00','#7aad00','#1f3d00'], glow: '#c8ff00',  isFree: false },
    { id: 'inferno',    name: 'Inferno',     price: 40,  trail: 'Fire Sparks',    colors: ['#ff9f00','#ff4500','#7a0000'], glow: '#ff6600',  isFree: false },
    { id: 'arctic',     name: 'Arctic',      price: 40,  trail: 'Frost Crystals', colors: ['#e0f7ff','#5ccfff','#006f99'], glow: '#80e8ff',  isFree: false },
    { id: 'neon_candy', name: 'Neon Candy',  price: 45,  trail: 'Rainbow Sparks', colors: ['#ff79c6','#bd93f9','#50fa7b'], glow: '#ff79c6',  isFree: false },
    { id: 'toxic',      name: 'Toxic',       price: 45,  trail: 'Acid Bubbles',   colors: ['#aaff00','#55cc00','#004400'], glow: '#aaff00',  isFree: false },
    { id: 'thunder',    name: 'Thunder',     price: 50,  trail: 'Lightning Arc',  colors: ['#fff500','#c800ff','#3d0066'], glow: '#fff500',  isFree: false },
    { id: 'void',       name: 'Void Walker', price: 55,  trail: 'Dark Matter',    colors: ['#ffffff','#888888','#222222'], glow: '#aaaaaa',  isFree: false },
    { id: 'solar',      name: 'Solar',       price: 55,  trail: 'Light Orbs',     colors: ['#ffe566','#ffaa00','#cc5500'], glow: '#ffcc00',  isFree: false },
    { id: 'rose_gold',  name: 'Rose Gold',   price: 60,  trail: 'Petal Drift',    colors: ['#ffb3c6','#ff6b9d','#9b2256'], glow: '#ff6b9d',  isFree: false },
    { id: 'magma',      name: 'Magma',       price: 65,  trail: 'Lava Drips',     colors: ['#ff8c00','#cc2200','#330000'], glow: '#ff4400',  isFree: false },
    { id: 'shadow',     name: 'Shadow',      price: 65,  trail: 'Shadow Streak',  colors: ['#9b59b6','#2c1654','#0a0010'], glow: '#6c3483',  isFree: false },
    { id: 'cyber',      name: 'Cyber',       price: 75,  trail: 'Digital Glitch', colors: ['#00ffea','#ff6b00','#001a20'], glow: '#00ffea',  isFree: false },
    { id: 'matrix',     name: 'Matrix',      price: 80,  trail: 'Data Rain',      colors: ['#00ff41','#00aa2b','#002208'], glow: '#00ff41',  isFree: false },
    { id: 'crimson',    name: 'Crimson',     price: 80,  trail: 'Blood Streaks',  colors: ['#ff1a2e','#aa0011','#330006'], glow: '#ff1a2e',  isFree: false },
    { id: 'aurora',     name: 'Aurora',      price: 90,  trail: 'Light Waves',    colors: ['#00ffaa','#00aaff','#aa00ff'], glow: '#00ffaa',  isFree: false },
    { id: 'galaxy',     name: 'Galaxy',      price: 120, trail: 'Star Nebula',    colors: ['#ff6ef7','#6e6eff','#0033ff'], glow: '#aa66ff',  isFree: false },
    { id: 'prism',      name: 'Prism',       price: 150, trail: 'Spectrum Burst', colors: ['#ff0080','#ffaa00','#00ffaa','#0080ff'], glow: '#ffffff', isFree: false },
  ]

  for (const skin of skins) {
    await prisma.skin.upsert({ where: { id: skin.id }, update: skin, create: skin })
  }
  console.log(`Seeded ${skins.length} skins`)

  // ── MAPS ───────────────────────────────────────────────────────────
  const maps = [
    {
      id: 'ocean', name: 'Ocean', vibe: 'Deep Sea · Bioluminescent · Teal Neon', borderColor: '#00b4d8',
      env: { bg: 0x000d1a, fog: 0x001030, fogD: 0.03, floor: 0x001020, grid: 0x003366, amb: 0x112244, ambI: 0.6, accent: 0x00b4d8, accentI: 2 },
      challenge: { name: '🌊 Tidal Current', color: '#00b4d8', desc: 'Every 8s a current surges across the arena — it pushes your snake 1 cell. Use it or fight it.' },
    },
    {
      id: 'earth', name: 'Earth', vibe: 'Terrain · Green Grid · Satellite View', borderColor: '#4aff50',
      env: { bg: 0x020c02, fog: 0x020c02, fogD: 0.025, floor: 0x021005, grid: 0x0a3010, amb: 0x112211, ambI: 0.7, accent: 0x4aff50, accentI: 2 },
      challenge: { name: '🌍 Seismic Shift', color: '#4aff50', desc: 'Every 12s an earthquake rattles the grid — all food teleports to new positions. Map your route fast.' },
    },
    {
      id: 'moon', name: 'Moon', vibe: 'Craters · Silver · Zero-G Neon', borderColor: '#c0c0d0',
      env: { bg: 0x08080f, fog: 0x08080f, fogD: 0.02, floor: 0x0d0d1a, grid: 0x1e1e2e, amb: 0x111122, ambI: 0.6, accent: 0xc0c0d0, accentI: 1.5 },
      challenge: { name: '🌕 Low Gravity', color: '#c0c0d0', desc: 'Zero-G momentum — your snake slides 1 extra cell after each turn before responding. Plan your turns early.' },
    },
    {
      id: 'space', name: 'Space', vibe: 'Deep Universe · Nebula · Star Field', borderColor: '#6e6eff',
      env: { bg: 0x000004, fog: 0x000004, fogD: 0.012, floor: 0x000008, grid: 0x080820, amb: 0x080810, ambI: 0.4, accent: 0x6e6eff, accentI: 1.5 },
      challenge: { name: '🕳️ Black Hole', color: '#6e6eff', desc: 'A gravity well pulses at a random position. Get within 3 cells and it yanks your snake toward it every tick.' },
    },
    {
      id: 'desert', name: 'Desert', vibe: 'Sand Dunes · Amber · Heat Haze', borderColor: '#ffaa00',
      env: { bg: 0x0a0400, fog: 0x0a0400, fogD: 0.04, floor: 0x1a0800, grid: 0x3a1800, amb: 0x221100, ambI: 0.7, accent: 0xffaa00, accentI: 2.5 },
      challenge: { name: '🏜️ Sandstorm', color: '#ffaa00', desc: 'Every 15s a storm hits — the arena goes nearly dark for 4 seconds. Navigate from memory. Food glows faintly.' },
    },
    {
      id: 'arctic', name: 'Arctic', vibe: 'Ice Fields · Aurora · Frozen Circuit', borderColor: '#80e8ff',
      env: { bg: 0x001525, fog: 0x001525, fogD: 0.03, floor: 0x0a1a25, grid: 0x1a3040, amb: 0x102030, ambI: 0.8, accent: 0x80e8ff, accentI: 2 },
      challenge: { name: '❄️ Black Ice', color: '#80e8ff', desc: 'The frozen floor kills your brakes — turning takes 1 extra tick to register. The faster you move, the longer the slide.' },
    },
    {
      id: 'lava', name: 'Lava', vibe: 'Volcanic · Molten Core · Fire Grid', borderColor: '#ff4400',
      env: { bg: 0x080000, fog: 0x080000, fogD: 0.045, floor: 0x100000, grid: 0x2a0500, amb: 0x220000, ambI: 0.5, accent: 0xff4400, accentI: 3 },
      challenge: { name: '🌋 Eruption Zones', color: '#ff4400', desc: 'Random lava tiles erupt on the grid, glowing red before they burst. Touch one = instant death. They cool after 5s.' },
    },
    {
      id: 'city', name: 'City', vibe: 'Neon Skyline · Cyber Streets · Rain', borderColor: '#c47fff',
      env: { bg: 0x020008, fog: 0x020008, fogD: 0.03, floor: 0x060010, grid: 0x1a002a, amb: 0x100018, ambI: 0.6, accent: 0xc47fff, accentI: 2 },
      challenge: { name: '🚗 Neon Traffic', color: '#c47fff', desc: "Glowing traffic lines sweep across the arena. Time your crossings — get hit and it's game over. Speed increases with score." },
    },
    {
      id: 'jungle', name: 'Jungle', vibe: 'Dense Canopy · Bio Neon · Overgrowth', borderColor: '#00ff88',
      env: { bg: 0x000a02, fog: 0x000a02, fogD: 0.04, floor: 0x030d03, grid: 0x0a200a, amb: 0x061206, ambI: 0.7, accent: 0x00ff88, accentI: 2 },
      challenge: { name: '🌿 Creeping Vines', color: '#00ff88', desc: 'Vines grow inward from the edges every 20 seconds, permanently shrinking the arena. The longer you survive, the tighter the cage.' },
    },
  ]

  for (const map of maps) {
    await prisma.map.upsert({ where: { id: map.id }, update: map, create: map })
  }
  console.log(`Seeded ${maps.length} maps`)

  // ── LEVELS ─────────────────────────────────────────────────────────
  const levels = [
    { id: 1, label: 'Easy',   target: 5,  speed: 0.18 },
    { id: 2, label: 'Medium', target: 20, speed: 0.12 },
    { id: 3, label: 'Hard',   target: 45, speed: 0.08 },
  ]

  for (const level of levels) {
    await prisma.level.upsert({ where: { id: level.id }, update: level, create: level })
  }
  console.log(`Seeded ${levels.length} levels`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Run the seed**

```bash
cd "C:\Claude Code Test 1\mmkl-snake"
npm run db:seed
```

Expected output:
```
Seeded 20 skins
Seeded 9 maps
Seeded 3 levels
```

- [ ] **Step 3: Verify in Prisma Studio (optional)**

```bash
npx prisma studio
```

Check that Skin, Map, Level tables are populated. Close Prisma Studio after.

- [ ] **Step 4: Commit**

```bash
git add mmkl-snake/prisma/seed.ts
git commit -m "feat(mmkl-snake): add seed data — 20 skins, 9 maps, 3 levels"
```

---

## Task 4: Lib Utilities

**Files:**
- Create: `mmkl-snake/src/lib/prisma.ts`
- Create: `mmkl-snake/src/lib/auth.ts`
- Create: `mmkl-snake/src/lib/middleware.ts`
- Create: `mmkl-snake/src/__tests__/lib/auth.test.ts`
- Create: `mmkl-snake/src/__tests__/lib/middleware.test.ts`

- [ ] **Step 1: Write failing tests for auth lib**

Create `mmkl-snake/src/__tests__/lib/auth.test.ts`:

```typescript
import { signJwt, verifyJwt } from '@/lib/auth'

describe('signJwt', () => {
  it('returns a string token', () => {
    const token = signJwt({ userId: 'abc', email: 'a@b.com' })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })
})

describe('verifyJwt', () => {
  it('returns payload for a valid token', () => {
    const token = signJwt({ userId: 'abc', email: 'a@b.com' })
    const payload = verifyJwt(token)
    expect(payload).toMatchObject({ userId: 'abc', email: 'a@b.com' })
  })

  it('throws for an invalid token', () => {
    expect(() => verifyJwt('invalid.token.here')).toThrow()
  })

  it('throws for an expired token', () => {
    // sign with -1s expiry to simulate expired
    const token = signJwt({ userId: 'abc', email: 'a@b.com' }, '-1s')
    expect(() => verifyJwt(token)).toThrow()
  })
})

describe('isTokenExpired', () => {
  it('returns true for expired token', () => {
    const { isTokenExpired } = require('@/lib/auth')
    const token = signJwt({ userId: 'abc', email: 'a@b.com' }, '-1s')
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns false for valid token', () => {
    const { isTokenExpired } = require('@/lib/auth')
    const token = signJwt({ userId: 'abc', email: 'a@b.com' })
    expect(isTokenExpired(token)).toBe(false)
  })
})
```

- [ ] **Step 2: Run — expect FAIL (auth module not found)**

```bash
cd "C:\Claude Code Test 1\mmkl-snake"
npx jest src/__tests__/lib/auth.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/auth'`

- [ ] **Step 3: Write `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 4: Write `src/lib/auth.ts`**

```typescript
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  userId: string
  email: string
}

export function signJwt(payload: JwtPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, SECRET, { expiresIn } as jwt.SignOptions)
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload
}

const COOKIE_NAME = 'mmkl_token'

export function setCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export function clearCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
}

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

/** Returns true if the token is expired (but otherwise structurally valid JWT) */
export function isTokenExpired(token: string): boolean {
  try {
    jwt.verify(token, SECRET)
    return false
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) return true
    return false
  }
}
```

- [ ] **Step 5: Run auth tests — expect PASS**

```bash
npx jest src/__tests__/lib/auth.test.ts
```

Expected: all 3 tests PASS

- [ ] **Step 6: Write failing tests for middleware**

Create `mmkl-snake/src/__tests__/lib/middleware.test.ts`:

```typescript
import { requireAuth, unauthorized } from '@/lib/middleware'
import { signJwt } from '@/lib/auth'

function makeRequest(cookie?: string): Request {
  const headers = new Headers()
  if (cookie) headers.set('cookie', cookie)
  return new Request('http://localhost/api/test', { headers })
}

describe('requireAuth', () => {
  it('returns payload for a valid JWT cookie', () => {
    const token = signJwt({ userId: 'user1', email: 'a@b.com' })
    const req = makeRequest(`mmkl_token=${token}`)
    const { payload } = requireAuth(req)
    expect(payload).toMatchObject({ userId: 'user1', email: 'a@b.com' })
  })

  it('returns null payload when no cookie is present', () => {
    const req = makeRequest()
    const { payload, expired } = requireAuth(req)
    expect(payload).toBeNull()
    expect(expired).toBe(false)
  })

  it('returns null payload for an invalid token', () => {
    const req = makeRequest('mmkl_token=bad.token.here')
    const { payload } = requireAuth(req)
    expect(payload).toBeNull()
  })

  it('returns null payload and expired=true for an expired token', () => {
    const expiredToken = signJwt({ userId: 'user1', email: 'a@b.com' }, '-1s')
    const req = makeRequest(`mmkl_token=${expiredToken}`)
    const { payload, expired } = requireAuth(req)
    expect(payload).toBeNull()
    expect(expired).toBe(true)
  })
})

describe('unauthorized', () => {
  it('returns 401 with clear-cookie header when expiredCookie=true', () => {
    const res = unauthorized(true)
    expect(res.status).toBe(401)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('mmkl_token=')
    expect(setCookie).toContain('Max-Age=0')
  })
})
```

- [ ] **Step 7: Run — expect FAIL**

```bash
npx jest src/__tests__/lib/middleware.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/middleware'`

- [ ] **Step 8: Write `src/lib/middleware.ts`**

```typescript
import { verifyJwt, getTokenFromRequest, isTokenExpired, JwtPayload } from '@/lib/auth'
import { NextResponse } from 'next/server'

export type AuthResult =
  | { payload: JwtPayload; expired: false }
  | { payload: null; expired: boolean }

/**
 * Verifies the JWT cookie.
 * Returns { payload, expired: false } on success.
 * Returns { payload: null, expired: true } if token is expired (caller should clear cookie).
 * Returns { payload: null, expired: false } if token is missing or invalid.
 */
export function requireAuth(request: Request): AuthResult {
  const token = getTokenFromRequest(request)
  if (!token) return { payload: null, expired: false }
  try {
    const payload = verifyJwt(token)
    return { payload, expired: false }
  } catch {
    return { payload: null, expired: isTokenExpired(token) }
  }
}

/** Returns 401. Pass expired=true to also clear the stale cookie. */
export function unauthorized(expired = false): NextResponse {
  const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (expired) {
    res.cookies.set('mmkl_token', '', { httpOnly: true, path: '/', maxAge: 0 })
  }
  return res
}
```

**Important:** Every protected route handler must now use this pattern:

```typescript
const { payload, expired } = requireAuth(request)
if (!payload) return unauthorized(expired)
// use payload.userId and payload.email below
```

Apply this pattern in every route handler in Tasks 7–10.

- [ ] **Step 9: Run middleware tests — expect PASS**

```bash
npx jest src/__tests__/lib/middleware.test.ts
```

Expected: all 3 tests PASS

- [ ] **Step 10: Commit**

```bash
git add mmkl-snake/src/lib/ mmkl-snake/src/__tests__/lib/
git commit -m "feat(mmkl-snake): add prisma singleton, auth helpers, requireAuth middleware"
```

---

## Task 5: Health Check + Game Data Routes

**Files:**
- Create: `mmkl-snake/src/app/page.tsx`
- Create: `mmkl-snake/src/app/api/game/maps/route.ts`
- Create: `mmkl-snake/src/app/api/game/levels/route.ts`
- Create: `mmkl-snake/src/app/api/game/skins/route.ts`
- Create: `mmkl-snake/src/__tests__/api/game.maps.test.ts`
- Create: `mmkl-snake/src/__tests__/api/game.skins.test.ts`

- [ ] **Step 1: Write `src/app/page.tsx`**

`page.tsx` is a React component in Next.js App Router — it cannot export a `GET` function. Put the health check in a route handler instead:

Create `mmkl-snake/src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ data: { status: 'ok', app: 'mmkl-snake' } })
}
```

Replace the contents of `mmkl-snake/src/app/page.tsx` with a minimal React page:

```typescript
export default function Home() {
  return <main><h1>MMKL Snake API</h1><p>Health: <a href="/api/health">/api/health</a></p></main>
}
```

Update the file map at the top of the plan: `src/app/api/health/route.ts` replaces `src/app/page.tsx` as the health check endpoint.

- [ ] **Step 2: Write failing tests for game routes**

Create `mmkl-snake/src/__tests__/api/game.maps.test.ts`:

```typescript
import { GET } from '@/app/api/game/maps/route'
import { prisma } from '@/lib/prisma'

const mockMaps = [
  { id: 'ocean', name: 'Ocean', vibe: 'Deep Sea', borderColor: '#00b4d8', env: {}, challenge: {} },
]

beforeEach(() => jest.clearAllMocks())

describe('GET /api/game/maps', () => {
  it('returns all maps', async () => {
    ;(prisma.map.findMany as jest.Mock).mockResolvedValue(mockMaps)
    const req = new Request('http://localhost/api/game/maps')
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].id).toBe('ocean')
  })
})
```

Create `mmkl-snake/src/__tests__/api/game.skins.test.ts`:

```typescript
import { GET } from '@/app/api/game/skins/route'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/auth'

const mockSkins = [
  { id: 'default', name: 'Default', price: 0, trail: 'No Trail', colors: [], glow: '#8eff71', isFree: true },
  { id: 'phantom', name: 'Phantom', price: 30, trail: 'Smoke', colors: [], glow: '#cc44ff', isFree: false },
]

beforeEach(() => jest.clearAllMocks())

describe('GET /api/game/skins', () => {
  it('returns all skins without flags when unauthenticated', async () => {
    ;(prisma.skin.findMany as jest.Mock).mockResolvedValue(mockSkins)
    const req = new Request('http://localhost/api/game/skins')
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(2)
    expect(body.data[0].owned).toBeUndefined()
  })

  it('attaches owned/equipped flags when authenticated', async () => {
    ;(prisma.skin.findMany as jest.Mock).mockResolvedValue(mockSkins)
    ;(prisma.userSkin.findMany as jest.Mock).mockResolvedValue([{ skinId: 'default' }])
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ activeSkinId: 'default' })

    const token = signJwt({ userId: 'user1', email: 'a@b.com' })
    const req = new Request('http://localhost/api/game/skins', {
      headers: { cookie: `mmkl_token=${token}` },
    })
    const res = await GET(req)
    const body = await res.json()
    expect(body.data[0].owned).toBe(true)
    expect(body.data[0].equipped).toBe(true)
    expect(body.data[1].owned).toBe(false)
  })
})
```

- [ ] **Step 3: Run — expect FAIL**

```bash
npx jest src/__tests__/api/game.maps.test.ts src/__tests__/api/game.skins.test.ts
```

Expected: FAIL — route files not found

- [ ] **Step 4: Write `src/app/api/game/maps/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const maps = await prisma.map.findMany()
  return NextResponse.json({ data: maps })
}
```

- [ ] **Step 5: Write `src/app/api/game/levels/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const levels = await prisma.level.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json({ data: levels })
}
```

- [ ] **Step 6: Write `src/app/api/game/skins/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyJwt } from '@/lib/auth'

export async function GET(request: Request) {
  const skins = await prisma.skin.findMany()

  // Optionally attach owned/equipped flags if authenticated
  try {
    const token = getTokenFromRequest(request)
    if (token) {
      const payload = verifyJwt(token)
      const [ownedSkins, user] = await Promise.all([
        prisma.userSkin.findMany({ where: { userId: payload.userId } }),
        prisma.user.findUnique({ where: { id: payload.userId }, select: { activeSkinId: true } }),
      ])
      const ownedIds = new Set(ownedSkins.map((s) => s.skinId))
      const enriched = skins.map((skin) => ({
        ...skin,
        owned: ownedIds.has(skin.id),
        equipped: user?.activeSkinId === skin.id,
      }))
      return NextResponse.json({ data: enriched })
    }
  } catch {
    // Invalid/expired token — fall through to unauthenticated response
  }

  return NextResponse.json({ data: skins })
}
```

- [ ] **Step 7: Run game tests — expect PASS**

```bash
npx jest src/__tests__/api/game.maps.test.ts src/__tests__/api/game.skins.test.ts
```

Expected: all tests PASS

- [ ] **Step 8: Commit**

```bash
git add mmkl-snake/src/app/page.tsx mmkl-snake/src/app/api/game/ mmkl-snake/src/__tests__/api/game.maps.test.ts mmkl-snake/src/__tests__/api/game.skins.test.ts
git commit -m "feat(mmkl-snake): add game data routes — maps, levels, skins"
```

---

## Task 6: Auth Routes

**Files:**
- Create: `mmkl-snake/src/app/api/auth/register/route.ts`
- Create: `mmkl-snake/src/app/api/auth/login/route.ts`
- Create: `mmkl-snake/src/app/api/auth/logout/route.ts`
- Create: `mmkl-snake/src/__tests__/api/auth.register.test.ts`
- Create: `mmkl-snake/src/__tests__/api/auth.login.test.ts`

- [ ] **Step 1: Write failing tests for register**

Create `mmkl-snake/src/__tests__/api/auth.register.test.ts`:

```typescript
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'

const mockUser = {
  id: 'user1', email: 'test@test.com', username: 'tester',
  lamps: 0, activeSkinId: 'default',
}

beforeEach(() => jest.clearAllMocks())

function makeRegisterRequest(body: object) {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/register', () => {
  it('returns 400 for missing fields', async () => {
    const res = await POST(makeRegisterRequest({ email: 'a@b.com' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid email format', async () => {
    const res = await POST(makeRegisterRequest({ email: 'notanemail', username: 'user1', password: 'pass123' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for short password', async () => {
    const res = await POST(makeRegisterRequest({ email: 'a@b.com', username: 'user1', password: '12' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid username format', async () => {
    const res = await POST(makeRegisterRequest({ email: 'a@b.com', username: 'u!', password: 'pass123' }))
    expect(res.status).toBe(400)
  })

  it('returns 409 when email already taken', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser)
    const res = await POST(makeRegisterRequest({ email: 'test@test.com', username: 'newuser', password: 'pass123' }))
    expect(res.status).toBe(409)
  })

  it('returns 201 and sets cookie on success', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.$transaction as jest.Mock).mockResolvedValue(mockUser)
    const res = await POST(makeRegisterRequest({ email: 'new@test.com', username: 'newuser', password: 'pass123' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toMatchObject({ email: 'new@test.com', username: 'tester' })
    expect(res.headers.get('set-cookie')).toContain('mmkl_token=')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx jest src/__tests__/api/auth.register.test.ts
```

Expected: FAIL — register route not found

- [ ] **Step 3: Write `src/app/api/auth/register/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { signJwt, setCookie } from '@/lib/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { email, username, password } = body

  if (!email || !username || !password)
    return NextResponse.json({ error: 'email, username, and password are required' }, { status: 400 })

  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

  if (!USERNAME_RE.test(username))
    return NextResponse.json({ error: 'Username must be 3–30 characters, alphanumeric or underscore' }, { status: 400 })

  if (password.length < 6 || password.length > 100)
    return NextResponse.json({ error: 'Password must be 6–100 characters' }, { status: 400 })

  // Check uniqueness
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const existingUsername = await prisma.user.findUnique({ where: { username } })
  if (existingUsername) return NextResponse.json({ error: 'Username already taken' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)

  // Atomic: create user + grant default skin + set activeSkinId
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, username, passwordHash },
    })
    await tx.userSkin.create({ data: { userId: created.id, skinId: 'default' } })
    return tx.user.update({
      where: { id: created.id },
      data: { activeSkinId: 'default' },
    })
  })

  const token = signJwt({ userId: user.id, email: user.email })
  const res = NextResponse.json(
    { data: { id: user.id, email: user.email, username: user.username, lamps: user.lamps, activeSkinId: user.activeSkinId } },
    { status: 201 }
  )
  setCookie(res, token)
  return res
}
```

- [ ] **Step 4: Run register tests — expect PASS**

```bash
npx jest src/__tests__/api/auth.register.test.ts
```

Expected: all tests PASS

- [ ] **Step 5: Write failing tests for login**

Create `mmkl-snake/src/__tests__/api/auth.login.test.ts`:

```typescript
import { POST } from '@/app/api/auth/login/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

beforeEach(() => jest.clearAllMocks())

function makeLoginRequest(body: object) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/login', () => {
  it('returns 400 for missing fields', async () => {
    const res = await POST(makeLoginRequest({ email: 'a@b.com' }))
    expect(res.status).toBe(400)
  })

  it('returns 401 for unknown email', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    const res = await POST(makeLoginRequest({ email: 'x@x.com', password: 'pass123' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 for wrong password', async () => {
    const hash = await bcrypt.hash('correctpass', 12)
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1', email: 'a@b.com', username: 'user', lamps: 0, activeSkinId: 'default', passwordHash: hash,
    })
    const res = await POST(makeLoginRequest({ email: 'a@b.com', password: 'wrongpass' }))
    expect(res.status).toBe(401)
  })

  it('returns 200 and sets cookie on success', async () => {
    const hash = await bcrypt.hash('pass123', 12)
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1', email: 'a@b.com', username: 'user', lamps: 50, activeSkinId: 'default', passwordHash: hash,
    })
    const res = await POST(makeLoginRequest({ email: 'a@b.com', password: 'pass123' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.lamps).toBe(50)
    expect(res.headers.get('set-cookie')).toContain('mmkl_token=')
  })
})
```

- [ ] **Step 6: Write `src/app/api/auth/login/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { signJwt, setCookie } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { email, password } = body
  if (!email || !password)
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = signJwt({ userId: user.id, email: user.email })
  const res = NextResponse.json({
    data: { id: user.id, email: user.email, username: user.username, lamps: user.lamps, activeSkinId: user.activeSkinId },
  })
  setCookie(res, token)
  return res
}
```

- [ ] **Step 7: Write `src/app/api/auth/logout/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { clearCookie } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ data: { ok: true } })
  clearCookie(res)
  return res
}
```

- [ ] **Step 8: Run login tests — expect PASS**

```bash
npx jest src/__tests__/api/auth.login.test.ts
```

Expected: all tests PASS

- [ ] **Step 9: Commit**

```bash
git add mmkl-snake/src/app/api/auth/ mmkl-snake/src/__tests__/api/auth.register.test.ts mmkl-snake/src/__tests__/api/auth.login.test.ts
git commit -m "feat(mmkl-snake): add auth routes — register, login, logout"
```

---

## Task 7: User Profile Routes

**Files:**
- Create: `mmkl-snake/src/app/api/user/profile/route.ts`
- Create: `mmkl-snake/src/__tests__/api/user.profile.test.ts`

- [ ] **Step 1: Write failing tests**

Create `mmkl-snake/src/__tests__/api/user.profile.test.ts`:

```typescript
import { GET, PUT } from '@/app/api/user/profile/route'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/auth'

const mockUser = {
  id: 'u1', email: 'a@b.com', username: 'tester',
  lamps: 100, activeSkinId: 'default',
}

function makeRequest(method: string, body?: object, authed = true) {
  const token = signJwt({ userId: 'u1', email: 'a@b.com' })
  return new Request('http://localhost/api/user/profile', {
    method,
    headers: {
      'content-type': 'application/json',
      ...(authed ? { cookie: `mmkl_token=${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => jest.clearAllMocks())

describe('GET /api/user/profile', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await GET(makeRequest('GET', undefined, false))
    expect(res.status).toBe(401)
  })

  it('returns profile with skinsOwned', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.userSkin.findMany as jest.Mock).mockResolvedValue([{ skinId: 'default' }])
    const res = await GET(makeRequest('GET'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.username).toBe('tester')
    expect(body.data.skinsOwned).toContain('default')
  })
})

describe('PUT /api/user/profile', () => {
  it('returns 400 when username missing', async () => {
    const res = await PUT(makeRequest('PUT', {}))
    expect(res.status).toBe(400)
  })

  it('returns 409 when username taken', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'other' })
    const res = await PUT(makeRequest('PUT', { username: 'taken' }))
    expect(res.status).toBe(409)
  })

  it('returns updated profile on success', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null)
    ;(prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, username: 'newname' })
    const res = await PUT(makeRequest('PUT', { username: 'newname' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.username).toBe('newname')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx jest src/__tests__/api/user.profile.test.ts
```

- [ ] **Step 3: Write `src/app/api/user/profile/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, unauthorized } from '@/lib/middleware'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/

export async function GET(request: Request) {
  const { payload: auth, expired } = requireAuth(request)
  if (!auth) return unauthorized(expired)

  const [user, ownedSkins] = await Promise.all([
    prisma.user.findUnique({ where: { id: auth.userId } }),
    prisma.userSkin.findMany({ where: { userId: auth.userId } }),
  ])
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      lamps: user.lamps,
      activeSkinId: user.activeSkinId,
      skinsOwned: ownedSkins.map((s) => s.skinId),
    },
  })
}

export async function PUT(request: Request) {
  const { payload: auth, expired } = requireAuth(request)
  if (!auth) return unauthorized(expired)

  const body = await request.json().catch(() => null)
  const username = body?.username

  if (!username || typeof username !== 'string')
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })

  if (!USERNAME_RE.test(username))
    return NextResponse.json({ error: 'Username must be 3–30 characters, alphanumeric or underscore' }, { status: 400 })

  // Check uniqueness (exclude self)
  const taken = await prisma.user.findUnique({ where: { username } })
  if (taken && taken.id !== auth.userId)
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 })

  const user = await prisma.user.update({ where: { id: auth.userId }, data: { username } })

  return NextResponse.json({
    data: { id: user.id, email: user.email, username: user.username, lamps: user.lamps, activeSkinId: user.activeSkinId },
  })
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx jest src/__tests__/api/user.profile.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add mmkl-snake/src/app/api/user/profile/ mmkl-snake/src/__tests__/api/user.profile.test.ts
git commit -m "feat(mmkl-snake): add user profile routes — GET and PUT"
```

---

## Task 8: User Progress Routes

**Files:**
- Create: `mmkl-snake/src/app/api/user/progress/route.ts`
- Create: `mmkl-snake/src/__tests__/api/user.progress.test.ts`

- [ ] **Step 1: Write failing tests**

Create `mmkl-snake/src/__tests__/api/user.progress.test.ts`:

```typescript
import { GET, POST } from '@/app/api/user/progress/route'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/auth'

const token = signJwt({ userId: 'u1', email: 'a@b.com' })

function makeReq(method: string, body?: object) {
  return new Request('http://localhost/api/user/progress', {
    method,
    headers: { 'content-type': 'application/json', cookie: `mmkl_token=${token}` },
    body: body ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => jest.clearAllMocks())

describe('GET /api/user/progress', () => {
  it('returns 401 without auth', async () => {
    const res = await GET(new Request('http://localhost/api/user/progress'))
    expect(res.status).toBe(401)
  })

  it('returns all progress records for user', async () => {
    ;(prisma.userProgress.findMany as jest.Mock).mockResolvedValue([
      { mapId: 'ocean', levelId: 1, completed: true, score: 10 },
    ])
    const res = await GET(makeReq('GET'))
    const body = await res.json()
    expect(body.data).toHaveLength(1)
  })
})

describe('POST /api/user/progress', () => {
  it('returns 400 for invalid levelId', async () => {
    const res = await POST(makeReq('POST', { mapId: 'ocean', levelId: 99, score: 5 }))
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown mapId', async () => {
    ;(prisma.map.findUnique as jest.Mock).mockResolvedValue(null)
    const res = await POST(makeReq('POST', { mapId: 'unknown', levelId: 1, score: 5 }))
    expect(res.status).toBe(404)
  })

  it('returns 403 when level is locked', async () => {
    ;(prisma.map.findUnique as jest.Mock).mockResolvedValue({ id: 'ocean' })
    ;(prisma.level.findUnique as jest.Mock).mockResolvedValue({ id: 2, target: 20, speed: 0.12 })
    ;(prisma.userProgress.findUnique as jest.Mock).mockResolvedValue(null) // no Easy completion
    const res = await POST(makeReq('POST', { mapId: 'ocean', levelId: 2, score: 10 }))
    expect(res.status).toBe(403)
  })

  it('saves progress and awards lamps on first completion', async () => {
    ;(prisma.map.findUnique as jest.Mock).mockResolvedValue({ id: 'ocean' })
    ;(prisma.level.findUnique as jest.Mock).mockResolvedValue({ id: 1, target: 5, speed: 0.18 })
    ;(prisma.userProgress.findUnique as jest.Mock).mockResolvedValue(null) // first submission
    ;(prisma.$transaction as jest.Mock).mockResolvedValue({
      progress: { mapId: 'ocean', levelId: 1, completed: true, score: 6 },
      lamps: 5,
    })
    const res = await POST(makeReq('POST', { mapId: 'ocean', levelId: 1, score: 6 }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.completed).toBe(true)
    expect(body.data.lamps).toBe(5)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx jest src/__tests__/api/user.progress.test.ts
```

- [ ] **Step 3: Write `src/app/api/user/progress/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, unauthorized } from '@/lib/middleware'

const LAMPS_BY_LEVEL: Record<number, number> = { 1: 5, 2: 15, 3: 30 }

export async function GET(request: Request) {
  const { payload: auth, expired } = requireAuth(request)
  if (!auth) return unauthorized(expired)

  const records = await prisma.userProgress.findMany({ where: { userId: auth.userId } })
  return NextResponse.json({ data: records })
}

export async function POST(request: Request) {
  const { payload: auth, expired } = requireAuth(request)
  if (!auth) return unauthorized(expired)

  const body = await request.json().catch(() => null)
  const { mapId, levelId, score } = body ?? {}

  // Input validation
  if (!mapId || !levelId || score === undefined)
    return NextResponse.json({ error: 'mapId, levelId, and score are required' }, { status: 400 })

  if (![1, 2, 3].includes(levelId))
    return NextResponse.json({ error: 'Invalid level — must be 1, 2, or 3' }, { status: 400 })

  if (typeof score !== 'number' || score < 0 || !Number.isInteger(score))
    return NextResponse.json({ error: 'Invalid score — must be a non-negative integer' }, { status: 400 })

  const [map, level] = await Promise.all([
    prisma.map.findUnique({ where: { id: mapId } }),
    prisma.level.findUnique({ where: { id: levelId } }),
  ])

  if (!map) return NextResponse.json({ error: 'Map not found' }, { status: 404 })
  if (!level) return NextResponse.json({ error: 'Level not found' }, { status: 404 })

  // Unlock check: Medium requires Easy completed, Hard requires Medium
  if (levelId > 1) {
    const prerequisite = await prisma.userProgress.findUnique({
      where: { userId_mapId_levelId: { userId: auth.userId, mapId, levelId: levelId - 1 } },
    })
    if (!prerequisite?.completed)
      return NextResponse.json({ error: 'Level locked — complete the previous level first' }, { status: 403 })
  }

  // Fetch existing progress
  const existing = await prisma.userProgress.findUnique({
    where: { userId_mapId_levelId: { userId: auth.userId, mapId, levelId } },
  })

  const alreadyCompleted = existing?.completed ?? false
  const bestScore = Math.max(score, existing?.score ?? 0)
  const nowCompleted = alreadyCompleted || score >= level.target
  const lampsEarned = !alreadyCompleted && nowCompleted ? (LAMPS_BY_LEVEL[levelId] ?? 0) : 0

  const result = await prisma.$transaction(async (tx) => {
    const progress = await tx.userProgress.upsert({
      where: { userId_mapId_levelId: { userId: auth.userId, mapId, levelId } },
      update: { score: bestScore, completed: nowCompleted },
      create: { userId: auth.userId, mapId, levelId, score: bestScore, completed: nowCompleted },
    })

    let newLamps = existing ? undefined : 0
    if (lampsEarned > 0) {
      const updated = await tx.user.update({
        where: { id: auth.userId },
        data: { lamps: { increment: lampsEarned } },
      })
      newLamps = updated.lamps
    } else {
      const user = await tx.user.findUnique({ where: { id: auth.userId }, select: { lamps: true } })
      newLamps = user?.lamps ?? 0
    }

    return { progress, lamps: newLamps }
  })

  return NextResponse.json({
    data: {
      mapId: result.progress.mapId,
      levelId: result.progress.levelId,
      completed: result.progress.completed,
      score: result.progress.score,
      lamps: result.lamps,
    },
  })
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx jest src/__tests__/api/user.progress.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add mmkl-snake/src/app/api/user/progress/ mmkl-snake/src/__tests__/api/user.progress.test.ts
git commit -m "feat(mmkl-snake): add user progress routes with level unlock + lamps earning"
```

---

## Task 9: Skin + Purchase Routes

**Files:**
- Create: `mmkl-snake/src/app/api/user/skin/route.ts`
- Create: `mmkl-snake/src/app/api/user/purchase/route.ts`
- Create: `mmkl-snake/src/__tests__/api/user.skin.test.ts`
- Create: `mmkl-snake/src/__tests__/api/user.purchase.test.ts`

- [ ] **Step 1: Write failing tests for skin equip**

Create `mmkl-snake/src/__tests__/api/user.skin.test.ts`:

```typescript
import { PUT } from '@/app/api/user/skin/route'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/auth'

const token = signJwt({ userId: 'u1', email: 'a@b.com' })
function makeReq(body?: object) {
  return new Request('http://localhost/api/user/skin', {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie: `mmkl_token=${token}` },
    body: body ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => jest.clearAllMocks())

describe('PUT /api/user/skin', () => {
  it('returns 400 when skinId missing', async () => {
    const res = await PUT(makeReq({}))
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown skin', async () => {
    ;(prisma.skin.findUnique as jest.Mock).mockResolvedValue(null)
    const res = await PUT(makeReq({ skinId: 'unknown' }))
    expect(res.status).toBe(404)
  })

  it('returns 403 when skin not owned', async () => {
    ;(prisma.skin.findUnique as jest.Mock).mockResolvedValue({ id: 'phantom' })
    ;(prisma.userSkin.findUnique as jest.Mock).mockResolvedValue(null)
    const res = await PUT(makeReq({ skinId: 'phantom' }))
    expect(res.status).toBe(403)
  })

  it('returns 200 and updates activeSkinId on success', async () => {
    ;(prisma.skin.findUnique as jest.Mock).mockResolvedValue({ id: 'phantom' })
    ;(prisma.userSkin.findUnique as jest.Mock).mockResolvedValue({ userId: 'u1', skinId: 'phantom' })
    ;(prisma.user.update as jest.Mock).mockResolvedValue({ activeSkinId: 'phantom' })
    const res = await PUT(makeReq({ skinId: 'phantom' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.activeSkinId).toBe('phantom')
  })
})
```

- [ ] **Step 2: Write failing tests for purchase**

Create `mmkl-snake/src/__tests__/api/user.purchase.test.ts`:

```typescript
import { POST } from '@/app/api/user/purchase/route'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/auth'

const token = signJwt({ userId: 'u1', email: 'a@b.com' })
function makeReq(body?: object) {
  return new Request('http://localhost/api/user/purchase', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `mmkl_token=${token}` },
    body: body ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => jest.clearAllMocks())

describe('POST /api/user/purchase', () => {
  it('returns 404 for unknown skin', async () => {
    ;(prisma.skin.findUnique as jest.Mock).mockResolvedValue(null)
    const res = await POST(makeReq({ skinId: 'unknown' }))
    expect(res.status).toBe(404)
  })

  it('returns 409 when already owned', async () => {
    ;(prisma.skin.findUnique as jest.Mock).mockResolvedValue({ id: 'phantom', price: 30, isFree: false })
    ;(prisma.userSkin.findUnique as jest.Mock).mockResolvedValue({ userId: 'u1', skinId: 'phantom' })
    const res = await POST(makeReq({ skinId: 'phantom' }))
    expect(res.status).toBe(409)
  })

  it('returns 400 for free skin', async () => {
    ;(prisma.skin.findUnique as jest.Mock).mockResolvedValue({ id: 'default', price: 0, isFree: true })
    ;(prisma.userSkin.findUnique as jest.Mock).mockResolvedValue(null)
    const res = await POST(makeReq({ skinId: 'default' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for insufficient lamps', async () => {
    ;(prisma.skin.findUnique as jest.Mock).mockResolvedValue({ id: 'phantom', price: 30, isFree: false })
    ;(prisma.userSkin.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ lamps: 10 })
    const res = await POST(makeReq({ skinId: 'phantom' }))
    expect(res.status).toBe(400)
  })

  it('returns updated lamps on success', async () => {
    ;(prisma.skin.findUnique as jest.Mock).mockResolvedValue({ id: 'phantom', price: 30, isFree: false })
    ;(prisma.userSkin.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ lamps: 100 })
    ;(prisma.$transaction as jest.Mock).mockResolvedValue({ lamps: 70 })
    const res = await POST(makeReq({ skinId: 'phantom' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.lamps).toBe(70)
  })
})
```

- [ ] **Step 3: Run — expect FAIL**

```bash
npx jest src/__tests__/api/user.skin.test.ts src/__tests__/api/user.purchase.test.ts
```

- [ ] **Step 4: Write `src/app/api/user/skin/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, unauthorized } from '@/lib/middleware'

export async function PUT(request: Request) {
  const { payload: auth, expired } = requireAuth(request)
  if (!auth) return unauthorized(expired)

  const body = await request.json().catch(() => null)
  const skinId = body?.skinId

  if (!skinId) return NextResponse.json({ error: 'skinId is required' }, { status: 400 })

  const skin = await prisma.skin.findUnique({ where: { id: skinId } })
  if (!skin) return NextResponse.json({ error: 'Skin not found' }, { status: 404 })

  const owned = await prisma.userSkin.findUnique({
    where: { userId_skinId: { userId: auth.userId, skinId } },
  })
  if (!owned) return NextResponse.json({ error: 'Skin not owned' }, { status: 403 })

  const user = await prisma.user.update({ where: { id: auth.userId }, data: { activeSkinId: skinId } })

  return NextResponse.json({ data: { activeSkinId: user.activeSkinId } })
}
```

- [ ] **Step 5: Write `src/app/api/user/purchase/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, unauthorized } from '@/lib/middleware'

export async function POST(request: Request) {
  const { payload: auth, expired } = requireAuth(request)
  if (!auth) return unauthorized(expired)

  const body = await request.json().catch(() => null)
  const skinId = body?.skinId

  if (!skinId) return NextResponse.json({ error: 'skinId is required' }, { status: 400 })

  // Check order per spec: exists → owned → free → lamps → purchase
  const skin = await prisma.skin.findUnique({ where: { id: skinId } })
  if (!skin) return NextResponse.json({ error: 'Skin not found' }, { status: 404 })

  const owned = await prisma.userSkin.findUnique({
    where: { userId_skinId: { userId: auth.userId, skinId } },
  })
  if (owned) return NextResponse.json({ error: 'Already owned' }, { status: 409 })

  if (skin.isFree)
    return NextResponse.json({ error: 'This skin is free and granted automatically at registration' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { lamps: true } })
  if (!user || user.lamps < skin.price)
    return NextResponse.json({ error: 'Insufficient lamps' }, { status: 400 })

  const updated = await prisma.$transaction(async (tx) => {
    await tx.userSkin.create({ data: { userId: auth.userId, skinId } })
    return tx.user.update({
      where: { id: auth.userId },
      data: { lamps: { decrement: skin.price } },
    })
  })

  return NextResponse.json({ data: { lamps: updated.lamps } })
}
```

- [ ] **Step 6: Run — expect PASS**

```bash
npx jest src/__tests__/api/user.skin.test.ts src/__tests__/api/user.purchase.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add mmkl-snake/src/app/api/user/skin/ mmkl-snake/src/app/api/user/purchase/ mmkl-snake/src/__tests__/api/user.skin.test.ts mmkl-snake/src/__tests__/api/user.purchase.test.ts
git commit -m "feat(mmkl-snake): add skin equip and purchase routes"
```

---

## Task 10: Friends Routes

**Files:**
- Create: `mmkl-snake/src/app/api/friends/route.ts`
- Create: `mmkl-snake/src/app/api/friends/[id]/route.ts`
- Create: `mmkl-snake/src/__tests__/api/friends.test.ts`
- Create: `mmkl-snake/src/__tests__/api/friends-id.test.ts`

- [ ] **Step 1: Write failing tests for `GET/POST /api/friends`**

Create `mmkl-snake/src/__tests__/api/friends.test.ts`:

```typescript
import { GET, POST } from '@/app/api/friends/route'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/auth'

const token = signJwt({ userId: 'u1', email: 'a@b.com' })
function makeReq(method: string, body?: object) {
  return new Request('http://localhost/api/friends', {
    method,
    headers: { 'content-type': 'application/json', cookie: `mmkl_token=${token}` },
    body: body ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => jest.clearAllMocks())

describe('GET /api/friends', () => {
  it('returns 401 without auth', async () => {
    const res = await GET(new Request('http://localhost/api/friends'))
    expect(res.status).toBe(401)
  })

  it('returns friends and pending arrays', async () => {
    ;(prisma.friendship.findMany as jest.Mock).mockResolvedValue([])
    const res = await GET(makeReq('GET'))
    const body = await res.json()
    expect(body.data.friends).toEqual([])
    expect(body.data.pending.incoming).toEqual([])
    expect(body.data.pending.outgoing).toEqual([])
  })
})

describe('POST /api/friends', () => {
  it('returns 400 for invalid email', async () => {
    const res = await POST(makeReq('POST', { email: 'notvalid' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for self-request', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', email: 'a@b.com', username: 'me' })
    const res = await POST(makeReq('POST', { email: 'a@b.com' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown user email', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    const res = await POST(makeReq('POST', { email: 'unknown@x.com' }))
    expect(res.status).toBe(404)
  })

  it('returns 409 when request already exists', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u2', email: 'b@b.com', username: 'user2' })
    ;(prisma.friendship.findFirst as jest.Mock).mockResolvedValue({ id: 'f1', status: 'pending' })
    const res = await POST(makeReq('POST', { email: 'b@b.com' }))
    expect(res.status).toBe(409)
  })

  it('creates pending friendship on success', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u2', email: 'b@b.com', username: 'user2' })
    ;(prisma.friendship.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.friendship.create as jest.Mock).mockResolvedValue({
      id: 'f1', status: 'pending', requesterId: 'u1', addresseeId: 'u2',
      addressee: { id: 'u2', username: 'user2' },
    })
    const res = await POST(makeReq('POST', { email: 'b@b.com' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.status).toBe('pending')
  })
})
```

- [ ] **Step 2: Write failing tests for `PUT/DELETE /api/friends/[id]`**

Create `mmkl-snake/src/__tests__/api/friends-id.test.ts`:

```typescript
import { PUT, DELETE } from '@/app/api/friends/[id]/route'
import { prisma } from '@/lib/prisma'
import { signJwt } from '@/lib/auth'

const token = signJwt({ userId: 'u1', email: 'a@b.com' })
function makeReq(method: string, id: string, body?: object) {
  return new Request(`http://localhost/api/friends/${id}`, {
    method,
    headers: { 'content-type': 'application/json', cookie: `mmkl_token=${token}` },
    body: body ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => jest.clearAllMocks())

describe('PUT /api/friends/[id]', () => {
  it('returns 404 for non-existent friendship', async () => {
    ;(prisma.friendship.findUnique as jest.Mock).mockResolvedValue(null)
    const res = await PUT(makeReq('PUT', 'bad-id', { action: 'accept' }), { params: { id: 'bad-id' } })
    expect(res.status).toBe(404)
  })

  it('returns 403 when requester tries to accept', async () => {
    ;(prisma.friendship.findUnique as jest.Mock).mockResolvedValue({
      id: 'f1', requesterId: 'u1', addresseeId: 'u2', status: 'pending',
    })
    const res = await PUT(makeReq('PUT', 'f1', { action: 'accept' }), { params: { id: 'f1' } })
    expect(res.status).toBe(403)
  })

  it('returns 200 and accepts a pending request', async () => {
    ;(prisma.friendship.findUnique as jest.Mock).mockResolvedValue({
      id: 'f1', requesterId: 'u2', addresseeId: 'u1', status: 'pending',
    })
    ;(prisma.friendship.update as jest.Mock).mockResolvedValue({ id: 'f1', status: 'accepted' })
    const res = await PUT(makeReq('PUT', 'f1', { action: 'accept' }), { params: { id: 'f1' } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.status).toBe('accepted')
  })
})

describe('DELETE /api/friends/[id]', () => {
  it('returns 404 for non-existent friendship', async () => {
    ;(prisma.friendship.findUnique as jest.Mock).mockResolvedValue(null)
    const res = await DELETE(makeReq('DELETE', 'bad-id'), { params: { id: 'bad-id' } })
    expect(res.status).toBe(404)
  })

  it('returns 403 when addressee tries to delete a pending request', async () => {
    ;(prisma.friendship.findUnique as jest.Mock).mockResolvedValue({
      id: 'f1', requesterId: 'u2', addresseeId: 'u1', status: 'pending',
    })
    const res = await DELETE(makeReq('DELETE', 'f1'), { params: { id: 'f1' } })
    expect(res.status).toBe(403)
  })

  it('allows requester to delete a pending request', async () => {
    ;(prisma.friendship.findUnique as jest.Mock).mockResolvedValue({
      id: 'f1', requesterId: 'u1', addresseeId: 'u2', status: 'pending',
    })
    ;(prisma.friendship.delete as jest.Mock).mockResolvedValue({})
    const res = await DELETE(makeReq('DELETE', 'f1'), { params: { id: 'f1' } })
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 3: Run — expect FAIL**

```bash
npx jest src/__tests__/api/friends.test.ts src/__tests__/api/friends-id.test.ts
```

- [ ] **Step 4: Write `src/app/api/friends/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, unauthorized } from '@/lib/middleware'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(request: Request) {
  const { payload: auth, expired } = requireAuth(request)
  if (!auth) return unauthorized(expired)

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: auth.userId }, { addresseeId: auth.userId }],
      status: { in: ['accepted', 'pending'] },
    },
    include: { requester: { select: { id: true, username: true, activeSkinId: true } }, addressee: { select: { id: true, username: true, activeSkinId: true } } },
  })

  const friends = friendships
    .filter((f) => f.status === 'accepted')
    .map((f) => {
      const friend = f.requesterId === auth.userId ? f.addressee : f.requester
      return { friendshipId: f.id, userId: friend.id, username: friend.username, activeSkinId: friend.activeSkinId }
    })

  const incoming = friendships
    .filter((f) => f.status === 'pending' && f.addresseeId === auth.userId)
    .map((f) => ({ id: f.id, requesterId: f.requesterId, requesterUsername: f.requester.username, createdAt: f.createdAt }))

  const outgoing = friendships
    .filter((f) => f.status === 'pending' && f.requesterId === auth.userId)
    .map((f) => ({ id: f.id, addresseeId: f.addresseeId, addresseeUsername: f.addressee.username, createdAt: f.createdAt }))

  return NextResponse.json({ data: { friends, pending: { incoming, outgoing } } })
}

export async function POST(request: Request) {
  const { payload: auth, expired } = requireAuth(request)
  if (!auth) return unauthorized(expired)

  const body = await request.json().catch(() => null)
  const email = body?.email

  if (!email || !EMAIL_RE.test(email))
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })

  if (email === (await prisma.user.findUnique({ where: { id: auth.userId }, select: { email: true } }))?.email)
    return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })

  const addressee = await prisma.user.findUnique({ where: { email } })
  if (!addressee) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (addressee.id === auth.userId)
    return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })

  // Check for existing row in either direction
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: auth.userId, addresseeId: addressee.id },
        { requesterId: addressee.id, addresseeId: auth.userId },
      ],
    },
  })

  if (existing) {
    if (existing.status === 'declined') {
      // Delete old declined row and allow re-request
      await prisma.friendship.delete({ where: { id: existing.id } })
    } else {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 409 })
    }
  }

  const friendship = await prisma.friendship.create({
    data: { requesterId: auth.userId, addresseeId: addressee.id },
    include: { addressee: { select: { id: true, username: true } } },
  })

  return NextResponse.json(
    { data: { friendshipId: friendship.id, status: friendship.status, addresseeId: friendship.addresseeId, addresseeUsername: friendship.addressee.username } },
    { status: 201 }
  )
}
```

- [ ] **Step 5: Write `src/app/api/friends/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, unauthorized } from '@/lib/middleware'

type Params = { params: { id: string } }

export async function PUT(request: Request, { params }: Params) {
  const { payload: auth, expired } = requireAuth(request)
  if (!auth) return unauthorized(expired)

  const friendship = await prisma.friendship.findUnique({ where: { id: params.id } })
  if (!friendship) return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })

  if (friendship.requesterId !== auth.userId && friendship.addresseeId !== auth.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const action = body?.action

  if (!['accept', 'decline'].includes(action))
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  // Only addressee can accept/decline
  if (friendship.addresseeId !== auth.userId) {
    if (action === 'accept')
      return NextResponse.json({ error: 'Only the recipient can accept a friend request' }, { status: 403 })
    if (action === 'decline')
      return NextResponse.json({ error: 'Only the recipient can decline a friend request — use DELETE to cancel your own request' }, { status: 403 })
  }

  // Invalid transitions
  if (action === 'accept' && friendship.status === 'declined')
    return NextResponse.json({ error: 'Cannot accept a declined request — the requester must send a new friend request' }, { status: 400 })
  if (action === 'decline' && friendship.status === 'accepted')
    return NextResponse.json({ error: 'Cannot decline an already accepted friendship — use DELETE to remove a friend' }, { status: 400 })

  // Idempotent: already in desired state
  const targetStatus = action === 'accept' ? 'accepted' : 'declined'
  if (friendship.status === targetStatus)
    return NextResponse.json({ data: { id: friendship.id, status: friendship.status } })

  const updated = await prisma.friendship.update({
    where: { id: params.id },
    data: { status: targetStatus },
  })

  return NextResponse.json({ data: { id: updated.id, status: updated.status } })
}

export async function DELETE(request: Request, { params }: Params) {
  const { payload: auth, expired } = requireAuth(request)
  if (!auth) return unauthorized(expired)

  const friendship = await prisma.friendship.findUnique({ where: { id: params.id } })
  if (!friendship) return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })

  if (friendship.requesterId !== auth.userId && friendship.addresseeId !== auth.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Addressee cannot delete a pending request (must use decline)
  if (friendship.status === 'pending' && friendship.addresseeId === auth.userId)
    return NextResponse.json({ error: 'Use decline to reject a pending request' }, { status: 403 })

  await prisma.friendship.delete({ where: { id: params.id } })

  return NextResponse.json({ data: { ok: true } })
}
```

- [ ] **Step 6: Run — expect PASS**

```bash
npx jest src/__tests__/api/friends.test.ts src/__tests__/api/friends-id.test.ts
```

- [ ] **Step 7: Run all tests**

```bash
npx jest
```

Expected: all tests across all files PASS

- [ ] **Step 8: Commit**

```bash
git add mmkl-snake/src/app/api/friends/ mmkl-snake/src/__tests__/api/friends.test.ts mmkl-snake/src/__tests__/api/friends-id.test.ts
git commit -m "feat(mmkl-snake): add friends routes — list, send request, accept/decline, remove"
```

---

## Task 11: Final Integration Check

- [ ] **Step 1: Run the full test suite**

```bash
cd "C:\Claude Code Test 1\mmkl-snake"
npx jest --verbose
```

Expected: all tests PASS, 0 failures

- [ ] **Step 2: Seed the database first**

```bash
npm run db:seed
```

Expected: `Seeded 20 skins`, `Seeded 9 maps`, `Seeded 3 levels`

- [ ] **Step 3: Start the dev server**

```bash
npm run dev
```

Expected: server starts on `http://localhost:3002`

- [ ] **Step 4: Smoke-test the API**

```bash
curl http://localhost:3002/api/health
curl http://localhost:3002/api/game/maps
```

Expected first: `{"data":{"status":"ok","app":"mmkl-snake"}}`
Expected second: JSON array of 9 maps

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(mmkl-snake): backend complete — all routes, tests, seed data"
```
