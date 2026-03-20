import { chromium, type Page, type BrowserContext } from 'playwright'
import { readCookies, writeCookies, readScrapedData, writeScrapedData } from './storage'
import { mergeScrapedData } from './merge'
import type { ScrapedData, Subject, Resource, Assignment, CourseSchedule } from './types'

interface ScrapeResult {
  subjects: Subject[]
  resources: Resource[]
  assignments: Assignment[]
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Hardcoded enrolled course IDs from myGJU Semester 2 - 2025/2026
// Update this list each semester by checking myGJU schedule
const ENROLLED_COURSE_IDS = ['ENGL1001', 'GERL102B2', 'IE0111', 'IE0121', 'IE0141', 'MATH102', 'PHYS104', 'PHYS106']

// Course colors for calendar display
const COURSE_COLORS: Record<string, string> = {
  'ENGL1001':  '#6366f1',
  'GERL102B2': '#8b5cf6',
  'IE0111':    '#06b6d4',
  'IE0121':    '#10b981',
  'IE0141':    '#f59e0b',
  'MATH102':   '#ef4444',
  'PHYS104':   '#ec4899',
  'PHYS106':   '#84cc16',
}

// Hardcoded schedule (scraped from myGJU on 2026-03-20)
const SCHEDULE: CourseSchedule[] = [
  {
    courseId: 'ENGL1001', courseName: 'Upper Intermediate English', section: '9',
    instructor: 'Deema Khasawneh', credits: 3, color: COURSE_COLORS['ENGL1001'],
    slots: [
      { day: 'Sun', startTime: '08:30', endTime: '10:00', room: 'H301' },
      { day: 'Tue', startTime: '08:30', endTime: '10:00', room: 'H301' },
    ]
  },
  {
    courseId: 'GERL102B2', courseName: 'German II B2-TRACK', section: '4',
    instructor: 'Abdo Nasr', credits: 3, color: COURSE_COLORS['GERL102B2'],
    slots: [
      { day: 'Sun', startTime: '10:00', endTime: '11:30', room: 'C310' },
      { day: 'Mon', startTime: '10:00', endTime: '11:30', room: 'C310' },
      { day: 'Tue', startTime: '10:00', endTime: '11:30', room: 'C310' },
      { day: 'Wed', startTime: '10:00', endTime: '11:30', room: 'C310' },
      { day: 'Thu', startTime: '11:30', endTime: '14:30', room: 'C309' },
    ]
  },
  {
    courseId: 'IE0111', courseName: 'Introduction to IE', section: '1',
    instructor: 'Abdallah Albashir', credits: 1, color: COURSE_COLORS['IE0111'],
    slots: [
      { day: 'Mon', startTime: '14:30', endTime: '16:30', room: 'C210' },
    ]
  },
  {
    courseId: 'IE0121', courseName: 'Probability and Statistics', section: '2',
    instructor: 'Sarah Qareish', credits: 3, color: COURSE_COLORS['IE0121'],
    slots: [
      { day: 'Mon', startTime: '08:30', endTime: '10:00', room: 'C206' },
      { day: 'Wed', startTime: '08:30', endTime: '10:00', room: 'C206' },
    ]
  },
  {
    courseId: 'IE0141', courseName: 'Engineering Workshop', section: '15',
    instructor: 'Abdallah Albashir', credits: 1, color: COURSE_COLORS['IE0141'],
    slots: [
      { day: 'Wed', startTime: '12:30', endTime: '14:30', room: 'C021' },
    ]
  },
  {
    courseId: 'MATH102', courseName: 'Calculus II', section: '5',
    instructor: 'Laith El-Hawawsha', credits: 3, color: COURSE_COLORS['MATH102'],
    slots: [
      { day: 'Sun', startTime: '11:30', endTime: '13:00', room: 'H303' },
      { day: 'Tue', startTime: '11:30', endTime: '13:00', room: 'H303' },
    ]
  },
  {
    courseId: 'PHYS104', courseName: 'Physics II', section: '5',
    instructor: 'Mahmoud Al-Grram', credits: 3, color: COURSE_COLORS['PHYS104'],
    slots: [
      { day: 'Sun', startTime: '13:00', endTime: '14:30', room: 'H306' },
      { day: 'Tue', startTime: '13:00', endTime: '14:30', room: 'H306' },
    ]
  },
  {
    courseId: 'PHYS106', courseName: 'General Physics Lab', section: '6',
    instructor: 'Samir Arabassi', credits: 1, color: COURSE_COLORS['PHYS106'],
    slots: [
      { day: 'Mon', startTime: '12:30', endTime: '14:30', room: 'C234' },
    ]
  },
]

function isEnrolledCourse(courseName: string): boolean {
  const upper = courseName.toUpperCase()
  return ENROLLED_COURSE_IDS.some(id => upper.includes(id.toUpperCase()))
}

function getCourseIdFromName(courseName: string): string | null {
  const upper = courseName.toUpperCase()
  return ENROLLED_COURSE_IDS.find(id => upper.includes(id.toUpperCase())) || null
}

async function scrapeMoodle(page: Page): Promise<ScrapeResult> {
  const username = process.env.GJU_USERNAME!
  const password = process.env.GJU_PASSWORD!
  const subjects: Subject[] = []
  const resources: Resource[] = []
  const assignments: Assignment[] = []

  await page.goto('https://e-learning.gju.edu.jo/login/index.php', { waitUntil: 'networkidle' })

  const isLoggedIn = page.url().includes('/my/') || page.url().includes('/dashboard')
  if (!isLoggedIn) {
    await page.fill('#username', username)
    await page.fill('#password', password)
    await Promise.all([page.click('#loginbtn'), page.waitForLoadState('networkidle')])
  }

  await page.goto('https://e-learning.gju.edu.jo/my/', { waitUntil: 'networkidle' })

  const courseLinks = await page.$$eval(
    'a[href*="/course/view.php"]',
    (links) => links.map(l => ({ href: (l as HTMLAnchorElement).href, text: l.textContent?.trim() || '' }))
  )

  const uniqueCourses = [...new Map(courseLinks.map(c => [c.href, c])).values()]
  // Filter to only enrolled courses
  const enrolledCourses = uniqueCourses.filter(c => isEnrolledCourse(c.text))

  for (const course of enrolledCourses) {
    const courseId = getCourseIdFromName(course.text) || slugify(course.text)
    const scheduleEntry = SCHEDULE.find(s => s.courseId === courseId)

    try {
      await page.goto(course.href, { waitUntil: 'networkidle' })

      const courseName = scheduleEntry?.courseName || await page.$eval('h1', el => el.textContent?.trim() || '').catch(() => course.text)
      const instructor = scheduleEntry?.instructor || await page.$eval('.teacher a', el => el.textContent?.trim() || '').catch(() => '')

      const resourceLinks = await page.$$eval(
        'a[href*="mod/resource"], a[href*="mod/url"], a[href*="mod/folder"], a[href*="mod/page"]',
        links => links.map(l => ({ href: (l as HTMLAnchorElement).href, text: l.textContent?.trim() || '' }))
      )

      for (const r of resourceLinks) {
        if (!r.href || !r.text) continue
        const url = r.href
        const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || ''
        const type = ext === 'pdf' ? 'pdf' : ext === 'docx' || ext === 'doc' ? 'doc' : url.includes('mod/url') ? 'link' : 'file'
        resources.push({
          id: `${courseId}-${Buffer.from(url).toString('base64').slice(0, 8)}`,
          subjectId: courseId,
          name: r.text,
          type,
          url
        })
      }

      const assignLinks = await page.$$eval(
        'a[href*="mod/assign"]',
        links => links.map(l => ({ href: (l as HTMLAnchorElement).href, text: l.textContent?.trim() || '' }))
      )

      for (const a of assignLinks) {
        if (!a.href) continue
        try {
          await page.goto(a.href, { waitUntil: 'networkidle' })
          const title = await page.$eval('h2', el => el.textContent?.trim() || a.text).catch(() => a.text)
          const dueDateText = await page.$eval(
            '.submissionstatustable td:last-child',
            el => el.textContent?.trim() || ''
          ).catch(() => '')
          const dueDate = dueDateText ? new Date(dueDateText).toISOString() : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
          const submitted = await page.$('.submissionstatussubmitted').then(() => true).catch(() => false)
          assignments.push({
            id: `${courseId}-assign-${assignments.length}`,
            subjectId: courseId,
            title,
            dueDate,
            submitted
          })
          await page.goto(course.href, { waitUntil: 'networkidle' })
        } catch { /* skip */ }
      }

      subjects.push({
        id: courseId,
        name: courseName,
        instructor,
        source: 'moodle',
        resourceCount: resourceLinks.length,
        assignmentCount: assignLinks.length
      })
    } catch { /* skip course */ }
  }

  return { subjects, resources, assignments }
}

async function scrapeMyGJU(page: Page): Promise<ScrapeResult> {
  // myGJU is used for schedule (hardcoded) and subject confirmation
  // Return enrolled subjects from schedule as subjects with mygju source
  const subjects: Subject[] = SCHEDULE.map(s => ({
    id: s.courseId,
    name: s.courseName,
    instructor: s.instructor,
    source: 'mygju' as const,
    resourceCount: 0,
    assignmentCount: 0
  }))
  return { subjects, resources: [], assignments: [] }
}

export async function scrapeAll(): Promise<ScrapedData> {
  const browser = await chromium.launch({ headless: true })
  const context: BrowserContext = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  })

  const savedCookies = readCookies()
  if (savedCookies && savedCookies.length > 0) {
    try {
      await context.addCookies(savedCookies as Parameters<typeof context.addCookies>[0])
    } catch { /* ignore */ }
  }

  const page = await context.newPage()

  try {
    const moodle = await scrapeMoodle(page)
    const mygju = await scrapeMyGJU(page)

    const cookies = await context.cookies()
    writeCookies(cookies)

    const merged = mergeScrapedData(moodle, mygju)
    const result: ScrapedData = {
      ...merged,
      scrapedAt: new Date().toISOString(),
      schedule: SCHEDULE
    }
    writeScrapedData(result)
    return result
  } catch (err) {
    const cached = readScrapedData()
    if (cached) return { ...cached, stale: true }
    throw err
  } finally {
    await browser.close()
  }
}
