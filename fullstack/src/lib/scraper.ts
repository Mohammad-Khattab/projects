import { chromium, type Page, type BrowserContext } from 'playwright'
import { readCookies, writeCookies, readTeamsCookies, writeTeamsCookies, readScrapedData, writeScrapedData } from './storage'
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

// Section-specific Moodle course IDs (scraped 2026-03-20 — update each semester)
const COURSE_MOODLE_IDS: Record<string, number> = {
  'ENGL1001':  40526,  // Section 9
  'GERL102B2': 39934,  // Section 4
  'IE0111':    40277,  // Section 1
  'IE0121':    39912,  // Section 2
  'IE0141':    39554,  // Section 15
  'MATH102':   40197,  // Section 5
  'PHYS104':   39879,  // Section 5
  'PHYS106':   39111,  // Section 6
}

async function scrapeMoodle(page: Page): Promise<ScrapeResult> {
  const username = process.env.GJU_USERNAME!
  const password = process.env.GJU_PASSWORD!
  const subjects: Subject[] = []
  const resources: Resource[] = []
  const assignments: Assignment[] = []

  // Login
  await page.goto('https://e-learning.gju.edu.jo/login/index.php', { waitUntil: 'networkidle' })
  const isLoggedIn = page.url().includes('/my/') || page.url().includes('/dashboard')
  if (!isLoggedIn) {
    await page.fill('#username', username)
    await page.fill('#password', password)
    await Promise.all([page.click('#loginbtn'), page.waitForLoadState('networkidle')])
  }

  // Navigate directly to each section-specific course URL
  for (const courseId of ENROLLED_COURSE_IDS) {
    const moodleId = COURSE_MOODLE_IDS[courseId]
    if (!moodleId) continue
    const scheduleEntry = SCHEDULE.find(s => s.courseId === courseId)
    const courseUrl = `https://e-learning.gju.edu.jo/course/view.php?id=${moodleId}`

    try {
      await page.goto(courseUrl, { waitUntil: 'networkidle' })

      const courseName = scheduleEntry?.courseName || courseId
      const instructor = scheduleEntry?.instructor || ''

      // Collect resource links grouped by section heading (chapter)
      const sectionLinks = await page.$$eval(
        `a[href*="course/view.php?id=${moodleId}&section="]`,
        links => [...new Set(links.map(l => (l as HTMLAnchorElement).href))]
      )

      interface ResourceWithChapter { href: string; text: string; chapter?: string }
      const allResourceLinks: ResourceWithChapter[] = []
      const allVideoLinks: ResourceWithChapter[] = []

      // Helper: scrape one page, grouping links by section heading
      async function scrapePageWithChapters(currentChapterOverride?: string) {
        // Try section-based extraction (Moodle topics/weeks format)
        const sections = await page.$$eval(
          'li.section',
          (sectionEls) => sectionEls.map(section => {
            const heading = (
              section.querySelector('.sectionname') ||
              section.querySelector('h3') ||
              section.querySelector('.section-title')
            )?.textContent?.trim().replace(/^\d+\.\s*/, '') || ''
            const links = Array.from(section.querySelectorAll(
              'a[href*="mod/resource"], a[href*="mod/url"], a[href*="mod/folder"], a[href*="mod/page"]'
            )).map(a => ({ href: (a as HTMLAnchorElement).href, text: a.textContent?.trim() || '' }))
            const videos = Array.from(section.querySelectorAll(
              'a[href*="youtube.com/watch"], a[href*="youtu.be"]'
            )).map(a => ({ href: (a as HTMLAnchorElement).href, text: a.textContent?.trim() || '' }))
            return { heading, links, videos }
          })
        ).catch(() => [] as { heading: string; links: { href: string; text: string }[]; videos: { href: string; text: string }[] }[])

        if (sections.length > 0 && sections.some(s => s.links.length > 0)) {
          for (const s of sections) {
            const chapter = currentChapterOverride || s.heading || undefined
            allResourceLinks.push(...s.links.map(l => ({ ...l, chapter })))
            allVideoLinks.push(...s.videos.map(v => ({ ...v, chapter })))
          }
        } else {
          // Fallback: grab all links, use override chapter if on a sub-page
          const rl = await page.$$eval(
            'a[href*="mod/resource"], a[href*="mod/url"], a[href*="mod/folder"], a[href*="mod/page"]',
            links => links.map(l => ({ href: (l as HTMLAnchorElement).href, text: l.textContent?.trim() || '' }))
          ).catch(() => [] as { href: string; text: string }[])
          const vl = await page.$$eval(
            'a[href*="youtube.com/watch"], a[href*="youtu.be"]',
            links => links.map(l => ({ href: (l as HTMLAnchorElement).href, text: l.textContent?.trim() || '' }))
          ).catch(() => [] as { href: string; text: string }[])
          allResourceLinks.push(...rl.map(r => ({ ...r, chapter: currentChapterOverride })))
          allVideoLinks.push(...vl.map(v => ({ ...v, chapter: currentChapterOverride })))
        }
      }

      await scrapePageWithChapters()

      // For tile-layout courses: navigate to each section sub-page
      if (sectionLinks.length > 0) {
        for (const sectionUrl of sectionLinks.slice(0, 14)) {
          try {
            await page.goto(sectionUrl, { waitUntil: 'domcontentloaded' })
            // Get section heading from page title or h2
            const sectionHeading = await page.$eval(
              'h2.section-title, .section-title h2, h2, .page-header-headings h1',
              el => el.textContent?.trim() || ''
            ).catch(() => '')
            // Extract section number from URL as fallback
            const sectionNum = sectionUrl.match(/section=(\d+)/)?.[1]
            const chapter = sectionHeading || (sectionNum ? `Section ${sectionNum}` : undefined)
            await scrapePageWithChapters(chapter)
          } catch { continue }
        }
        await page.goto(courseUrl, { waitUntil: 'domcontentloaded' })
      }

      // Deduplicate by URL
      const resourceLinks = [...new Map(allResourceLinks.map(r => [r.href, r])).values()]
      const videoLinks = [...new Map(allVideoLinks.filter(v => v.text && !v.text.includes('youtube.com')).map(v => [v.href, v])).values()]

      for (const r of resourceLinks) {
        if (!r.href || !r.text) continue
        const url = r.href
        const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || ''
        const type: Resource['type'] = ext === 'pdf' ? 'pdf' : ext === 'docx' || ext === 'doc' ? 'doc' : url.includes('mod/url') ? 'link' : 'file'
        resources.push({
          id: `${courseId}-${Buffer.from(url).toString('base64').slice(0, 8)}`,
          subjectId: courseId,
          name: r.text,
          type,
          url,
          chapter: r.chapter || undefined
        })
      }

      for (const v of videoLinks) {
        if (!v.href || !v.text || v.text.includes('youtube.com')) continue
        resources.push({
          id: `${courseId}-yt-${Buffer.from(v.href).toString('base64').slice(0, 8)}`,
          subjectId: courseId,
          name: v.text,
          type: 'video',
          url: v.href,
          chapter: v.chapter || undefined
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
          const dueDateText = await page.$eval('.submissionstatustable td:last-child', el => el.textContent?.trim() || '').catch(() => '')
          const dueDate = dueDateText ? new Date(dueDateText).toISOString() : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
          const submitted = await page.$('.submissionstatussubmitted').then(() => true).catch(() => false)
          assignments.push({ id: `${courseId}-assign-${assignments.length}`, subjectId: courseId, title, dueDate, submitted })
          await page.goto(courseUrl, { waitUntil: 'networkidle' })
        } catch { /* skip */ }
      }

      subjects.push({
        id: courseId,
        name: courseName,
        instructor,
        source: 'moodle',
        resourceCount: resourceLinks.length + videoLinks.length,
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

// Keywords used to match Teams channel names to enrolled courses
function getCourseKeywords(courseId: string, courseName: string): string[] {
  const keywords: string[] = [courseId.toLowerCase()]
  // Add significant words from course name (skip short common words)
  const stopWords = new Set(['the', 'and', 'for', 'lab', 'ii', 'i'])
  const nameWords = courseName.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
  keywords.push(...nameWords)
  return keywords
}

function matchesCourse(teamName: string, courseId: string, courseName: string): boolean {
  const lower = teamName.toLowerCase()
  const keywords = getCourseKeywords(courseId, courseName)
  // Must match courseId OR at least 2 keywords from course name
  if (lower.includes(courseId.toLowerCase())) return true
  const matchCount = keywords.filter(k => lower.includes(k)).length
  return matchCount >= 2
}

async function scrapeTeams(context: BrowserContext): Promise<ScrapeResult> {
  const resources: Resource[] = []

  const teamsCookies = readTeamsCookies()
  if (!teamsCookies || teamsCookies.length === 0) {
    console.log('[Teams] No saved session — skipping.')
    return { subjects: [], resources, assignments: [] }
  }

  let teamsContext: BrowserContext | null = null

  try {
    teamsContext = await context.browser()!.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    await teamsContext.addCookies(teamsCookies as Parameters<typeof teamsContext.addCookies>[0])
    const teamsPage = await teamsContext.newPage()

    // ── Step 1: Intercept any Bearer token Teams uses for Graph API calls ──
    let graphToken = ''
    await teamsPage.route('**/*', async route => {
      const auth = route.request().headers()['authorization'] || ''
      if (!graphToken && auth.startsWith('Bearer ') && auth.length > 100) {
        graphToken = auth
      }
      await route.continue().catch(() => {})
    })

    // Load Teams — this triggers a cascade of API calls we can intercept
    await teamsPage.goto('https://teams.microsoft.com/v2/', { waitUntil: 'domcontentloaded', timeout: 60000 })

    // Check session validity
    await teamsPage.waitForTimeout(3000)
    if (teamsPage.url().includes('login') || teamsPage.url().includes('microsoftonline')) {
      console.log('[Teams] Session expired — reconnect via "Connect Teams".')
      await teamsPage.close()
      return { subjects: [], resources, assignments: [] }
    }

    // Wait up to 15s for Teams to make API calls (auth token interception)
    const deadline = Date.now() + 15000
    while (!graphToken && Date.now() < deadline) {
      await teamsPage.waitForTimeout(500)
    }

    // ── Step 2: If we caught a token, use Graph API ──
    if (graphToken) {
      console.log('[Teams] Got Bearer token — using Graph API')
      const graphResources = await scrapeTeamsViaGraph(graphToken)
      resources.push(...graphResources)
    } else {
      // ── Step 3: Fallback — call Graph API from inside the browser (same auth context) ──
      console.log('[Teams] No intercepted token — trying in-browser Graph calls')
      const graphResources = await scrapeTeamsInBrowser(teamsPage)
      resources.push(...graphResources)
    }

    // Refresh cookies
    const updatedCookies = await teamsContext.cookies()
    if (updatedCookies.length > 0) writeTeamsCookies(updatedCookies)
    await teamsPage.close()

  } catch (err) {
    console.error('[Teams] Scrape failed (non-fatal):', err instanceof Error ? err.message : err)
  } finally {
    if (teamsContext) await teamsContext.close().catch(() => {})
  }

  console.log(`[Teams] Found ${resources.length} resources`)
  return { subjects: [], resources, assignments: [] }
}

/** Call Microsoft Graph API from Node.js using the intercepted Bearer token */
async function scrapeTeamsViaGraph(bearerToken: string): Promise<Resource[]> {
  const resources: Resource[] = []

  interface GraphTeam   { id: string; displayName: string }
  interface GraphChannel { id: string; displayName: string }
  interface GraphDriveItem { id: string; name: string; webUrl: string; file?: object; folder?: object; parentReference?: { driveId: string } }

  const g = async <T>(path: string): Promise<{ value?: T[] } & Partial<T>> => {
    const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
      headers: { Authorization: bearerToken, Accept: 'application/json' }
    })
    if (!res.ok) throw new Error(`Graph ${path} → ${res.status}`)
    return res.json() as Promise<{ value?: T[] } & Partial<T>>
  }

  const { value: teams = [] } = await g<GraphTeam>('/me/joinedTeams')

  for (const team of teams) {
    const schedule = SCHEDULE.find(s => matchesCourse(team.displayName, s.courseId, s.courseName))
    if (!schedule) continue

    try {
      const { value: channels = [] } = await g<GraphChannel>(`/teams/${team.id}/channels`)
      const general = channels.find(c => c.displayName === 'General') || channels[0]
      if (!general) continue

      // Get the SharePoint folder that backs this channel
      const folder = await g<GraphDriveItem>(`/teams/${team.id}/channels/${general.id}/filesFolder`)
      const driveId = (folder as GraphDriveItem).parentReference?.driveId
      const folderId = (folder as GraphDriveItem).id
      if (!driveId || !folderId) continue

      // List files recursively (max 2 levels)
      const files = await listDriveItems(bearerToken, driveId, folderId, 0)
      for (const file of files) {
        if (!file.name) continue
        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        const type: Resource['type'] =
          ext === 'pdf' ? 'pdf'
          : ['docx','doc','pptx','ppt','xlsx','xls'].includes(ext) ? 'doc'
          : 'file'
        resources.push({
          id: `${schedule.courseId}-teams-${file.id.slice(0, 10)}`,
          subjectId: schedule.courseId,
          name: `[Teams] ${file.name}`,
          type,
          url: file.webUrl || 'https://teams.microsoft.com',
          chapter: 'Teams Files'
        })
      }
    } catch (err) {
      console.warn(`[Teams] Failed to get files for ${team.displayName}:`, err)
    }
  }

  return resources
}

async function listDriveItems(
  token: string,
  driveId: string,
  folderId: string,
  depth: number
): Promise<Array<{ id: string; name: string; webUrl: string }>> {
  if (depth > 2) return []
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children`,
    { headers: { Authorization: token, Accept: 'application/json' } }
  )
  if (!res.ok) return []
  const data = await res.json() as { value?: Array<{ id: string; name: string; webUrl: string; file?: object; folder?: object }> }
  const items = data.value || []
  const files: Array<{ id: string; name: string; webUrl: string }> = []
  for (const item of items) {
    if (item.file) {
      files.push({ id: item.id, name: item.name, webUrl: item.webUrl })
    } else if (item.folder && depth < 2) {
      const nested = await listDriveItems(token, driveId, item.id, depth + 1)
      files.push(...nested)
    }
  }
  return files
}

/** Fallback: call Graph API from inside the browser page (uses MSAL tokens in memory) */
async function scrapeTeamsInBrowser(page: import('playwright').Page): Promise<Resource[]> {
  // Wait a bit more for Teams to fully initialize its auth state
  await page.waitForTimeout(8000)

  const result = await page.evaluate(async (schedule: typeof SCHEDULE) => {
    const files: Array<{ courseId: string; name: string; url: string; ext: string }> = []

    const g = async (path: string) => {
      const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      })
      if (!res.ok) return null
      return res.json()
    }

    const teams = await g('/me/joinedTeams')
    if (!teams?.value) return files

    for (const team of teams.value) {
      const matchedCourse = schedule.find((s: { courseId: string; courseName: string }) => {
        const lower = team.displayName.toLowerCase()
        return lower.includes(s.courseId.toLowerCase()) ||
          s.courseName.toLowerCase().split(' ').filter((w: string) => w.length > 3).filter((w: string) => lower.includes(w)).length >= 2
      })
      if (!matchedCourse) continue

      const channels = await g(`/teams/${team.id}/channels`)
      const general = channels?.value?.find((c: {displayName: string}) => c.displayName === 'General') || channels?.value?.[0]
      if (!general) continue

      const folder = await g(`/teams/${team.id}/channels/${general.id}/filesFolder`)
      if (!folder?.id || !folder?.parentReference?.driveId) continue

      const children = await g(`/drives/${folder.parentReference.driveId}/items/${folder.id}/children`)
      for (const item of children?.value || []) {
        if (!item.file) continue
        files.push({
          courseId: matchedCourse.courseId,
          name: item.name,
          url: item.webUrl,
          ext: item.name.split('.').pop()?.toLowerCase() || ''
        })
      }
    }
    return files
  }, SCHEDULE as Parameters<typeof page.evaluate>[1])

  const resources: Resource[] = []
  for (const f of (result as Array<{ courseId: string; name: string; url: string; ext: string }> || [])) {
    const type: Resource['type'] =
      f.ext === 'pdf' ? 'pdf'
      : ['docx','doc','pptx','ppt'].includes(f.ext) ? 'doc'
      : 'file'
    resources.push({
      id: `${f.courseId}-teams-${Buffer.from(f.name).toString('base64').slice(0, 10)}`,
      subjectId: f.courseId,
      name: `[Teams] ${f.name}`,
      type,
      url: f.url || 'https://teams.microsoft.com',
      chapter: 'Teams Files'
    })
  }
  return resources
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
    const teams = await scrapeTeams(context)

    const cookies = await context.cookies()
    writeCookies(cookies)

    // Merge moodle + mygju first, then add Teams resources on top
    const merged = mergeScrapedData(moodle, mygju)
    const allResources = [...merged.resources, ...teams.resources]
    const result: ScrapedData = {
      ...merged,
      resources: allResources,
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
