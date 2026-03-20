import { mergeScrapedData } from '../src/lib/merge'

describe('mergeScrapedData', () => {
  it('combines subjects from both sources', () => {
    const moodle = {
      subjects: [{ id: 'cs-310', name: 'CS 310', instructor: 'Dr. A', source: 'moodle' as const, resourceCount: 2, assignmentCount: 1 }],
      resources: [],
      assignments: []
    }
    const mygju = {
      subjects: [{ id: 'math-201', name: 'Math 201', instructor: 'Dr. B', source: 'mygju' as const, resourceCount: 0, assignmentCount: 0 }],
      resources: [],
      assignments: []
    }
    const result = mergeScrapedData(moodle, mygju)
    expect(result.subjects).toHaveLength(2)
  })

  it('deduplicates subjects with same name, marks source as both', () => {
    const moodle = {
      subjects: [{ id: 'cs-310', name: 'CS 310', instructor: 'Dr. A', source: 'moodle' as const, resourceCount: 2, assignmentCount: 1 }],
      resources: [{ id: 'r1', subjectId: 'cs-310', name: 'Lec1.pdf', type: 'pdf' as const, url: 'http://moodle/r1' }],
      assignments: []
    }
    const mygju = {
      subjects: [{ id: 'cs-310', name: 'CS 310', instructor: 'Dr. A', source: 'mygju' as const, resourceCount: 1, assignmentCount: 0 }],
      resources: [{ id: 'r2', subjectId: 'cs-310', name: 'Lec2.pdf', type: 'pdf' as const, url: 'http://mygju/r2' }],
      assignments: []
    }
    const result = mergeScrapedData(moodle, mygju)
    expect(result.subjects).toHaveLength(1)
    expect(result.subjects[0].source).toBe('both')
    expect(result.resources).toHaveLength(2)
  })

  it('combines resources and assignments from both', () => {
    const moodle = {
      subjects: [],
      resources: [{ id: 'r1', subjectId: 's1', name: 'F1', type: 'pdf' as const, url: 'u1' }],
      assignments: [{ id: 'a1', subjectId: 's1', title: 'HW1', dueDate: '2026-04-01', submitted: false }]
    }
    const mygju = {
      subjects: [],
      resources: [{ id: 'r2', subjectId: 's1', name: 'F2', type: 'link' as const, url: 'u2' }],
      assignments: []
    }
    const result = mergeScrapedData(moodle, mygju)
    expect(result.resources).toHaveLength(2)
    expect(result.assignments).toHaveLength(1)
  })
})
