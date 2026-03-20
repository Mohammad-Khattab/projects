import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

let tmpDir: string
let storage: typeof import('../src/lib/storage')

beforeEach(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gju-test-'))
  process.env.DATA_DIR_OVERRIDE = tmpDir
  jest.resetModules()
  storage = await import('../src/lib/storage')
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true })
  delete process.env.DATA_DIR_OVERRIDE
})

describe('storage', () => {
  it('readScrapedData returns null when file does not exist', () => {
    expect(storage.readScrapedData()).toBeNull()
  })

  it('writeScrapedData then readScrapedData round-trips data', () => {
    const data = {
      subjects: [{ id: 'cs-310', name: 'CS 310', instructor: 'Dr. X', source: 'moodle' as const, resourceCount: 2, assignmentCount: 1 }],
      resources: [],
      assignments: [],
      scrapedAt: '2026-03-20T10:00:00Z'
    }
    storage.writeScrapedData(data)
    const result = storage.readScrapedData()
    expect(result).toEqual(data)
  })

  it('readNotes returns null when no notes saved', () => {
    expect(storage.readNotes('cs-310')).toBeNull()
  })

  it('writeNotes then readNotes round-trips content', () => {
    storage.writeNotes('cs-310', '# My Notes\nHello')
    const result = storage.readNotes('cs-310')
    expect(result?.content).toBe('# My Notes\nHello')
    expect(result?.subjectId).toBe('cs-310')
  })

  it('readCookies returns null when no cookies saved', () => {
    expect(storage.readCookies()).toBeNull()
  })

  it('writeCookies then readCookies round-trips', () => {
    const cookies = [{ name: 'MoodleSession', value: 'abc123', domain: 'e-learning.gju.edu.jo' }]
    storage.writeCookies(cookies)
    expect(storage.readCookies()).toEqual(cookies)
  })
})
