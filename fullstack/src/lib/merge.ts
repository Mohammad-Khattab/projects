import type { Subject, Resource, Assignment, ScrapedData } from './types'

interface PartialScrapeResult {
  subjects: Subject[]
  resources: Resource[]
  assignments: Assignment[]
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function mergeScrapedData(
  moodle: PartialScrapeResult,
  mygju: PartialScrapeResult
): Omit<ScrapedData, 'scrapedAt'> {
  const subjectMap = new Map<string, Subject>()

  for (const s of moodle.subjects) {
    subjectMap.set(s.id, { ...s })
  }

  for (const s of mygju.subjects) {
    if (subjectMap.has(s.id)) {
      const existing = subjectMap.get(s.id)!
      subjectMap.set(s.id, {
        ...existing,
        source: 'both',
        resourceCount: existing.resourceCount + s.resourceCount,
        assignmentCount: existing.assignmentCount + s.assignmentCount
      })
    } else {
      subjectMap.set(s.id, { ...s })
    }
  }

  const normalizeResources = (items: Resource[], source: string) =>
    items.map(r => ({ ...r, id: `${source}-${r.id}` }))

  const normalizeAssignments = (items: Assignment[], source: string) =>
    items.map(a => ({ ...a, id: `${source}-${a.id}` }))

  return {
    subjects: Array.from(subjectMap.values()),
    resources: [
      ...normalizeResources(moodle.resources, 'moodle'),
      ...normalizeResources(mygju.resources, 'mygju')
    ],
    assignments: [
      ...normalizeAssignments(moodle.assignments, 'moodle'),
      ...normalizeAssignments(mygju.assignments, 'mygju')
    ]
  }
}
