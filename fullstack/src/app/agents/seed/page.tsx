'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TODAY = '2026-03-27'

const SEED_TASKS = [
  // --- Today's tasks ---
  {
    id: 'seed-1',
    title: 'Prepare for English speaking presentation',
    description: 'Review notes, practice delivery, prepare key points.',
    priority: 'high',
    category: 'Work',
    dueDate: '2026-04-05',
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'seed-2',
    title: 'Go to the gym',
    description: 'Daily workout session.',
    priority: 'high',
    category: 'Health',
    dueDate: TODAY,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'seed-3',
    title: 'Read Quran',
    description: '',
    priority: 'medium',
    category: 'Personal',
    dueDate: TODAY,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'seed-4',
    title: 'Organize my room',
    description: 'Full room organization.',
    priority: 'medium',
    category: 'Personal',
    dueDate: TODAY,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'seed-5',
    title: 'Tidy up the shelves',
    description: '',
    priority: 'low',
    category: 'Personal',
    dueDate: TODAY,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },

  // --- This week's tasks ---
  {
    id: 'seed-6',
    title: 'Study Calculus 2',
    description: 'First exam on April 9. Work through lecture material and practice problems.',
    priority: 'high',
    category: 'Work',
    dueDate: '2026-04-09',
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'seed-7',
    title: 'Call PSUT — check transferable credit hours',
    description: 'Find out how many credit hours can be transferred from current university.',
    priority: 'high',
    category: 'Work',
    dueDate: '2026-04-03',
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'seed-8',
    title: 'Search PSUT computer engineering requirements',
    description: 'Look up admission requirements and program details for CE at PSUT.',
    priority: 'medium',
    category: 'Work',
    dueDate: '2026-04-03',
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'seed-9',
    title: 'Finish Coursera courses',
    description: 'Complete pending Coursera course modules.',
    priority: 'medium',
    category: 'Work',
    dueDate: '2026-04-03',
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },

  // --- Daily habits ---
  {
    id: 'seed-10',
    title: 'Walk 10,000 steps',
    description: 'Daily step goal.',
    priority: 'medium',
    category: 'Health',
    dueDate: TODAY,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'seed-11',
    title: 'Eat healthy',
    description: 'Stick to clean meals — no junk food.',
    priority: 'medium',
    category: 'Health',
    dueDate: TODAY,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
]

export default function SeedPage() {
  const router = useRouter()

  useEffect(() => {
    const KEY = 'agents_tasks'
    let existing: any[] = []
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) existing = JSON.parse(raw)
    } catch {}

    const seedMap = new Map(SEED_TASKS.map(t => [t.id, t]))
    // Update existing seed tasks, keep non-seed tasks untouched
    const updated = existing.map((t: any) => seedMap.has(t.id) ? { ...t, ...seedMap.get(t.id) } : t)
    const existingIds = new Set(existing.map((t: any) => t.id))
    const toAdd = SEED_TASKS.filter(t => !existingIds.has(t.id))
    const merged = [...toAdd, ...updated]
    localStorage.setItem(KEY, JSON.stringify(merged))

    router.replace('/agents')
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#472D1F', background: '#FDF8EC' }}>
      Loading your tasks…
    </div>
  )
}
