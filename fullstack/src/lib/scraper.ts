import { chromium, type Page, type BrowserContext } from 'playwright'
import { readCookies, writeCookies, readScrapedData, writeScrapedData } from './storage'
import { mergeScrapedData } from './merge'
import type { ScrapedData, Subject, Resource, Assignment } from './types'

interface ScrapeResult {
  subjects: Subject[]
  resources: Resource[]
  assignments: Assignment[]
}

// Exported for testing
export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function isLoggedInToMoodle(page: Page): Promise<boolean> {
  return page.url().includes('/my/') || page.url().includes('/dashboard')
}

async function scrapeMoodle(page: Page): Promise<ScrapeResult> {
  const username = process.env.GJU_USERNAME!
  const password = process.env.GJU_PASSWORD!
  const subjects: Subject[] = []
  const resources: Resource[] = []
  const assignments: Assignment[] = []

  await page.goto('https://e-learning.gju.edu.jo/login/index.php', { waitUntil: 'networkidle' })

  if (!(await isLoggedInToMoodle(page))) {
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

  for (const course of uniqueCourses) {
    const subjectId = slugify(course.text || new URL(course.href).searchParams.get('id') || 'unknown')
    if (!subjectId) continue

    try {
      await page.goto(course.href, { waitUntil: 'networkidle' })

      const courseName = await page.$eval('h1', el => el.textContent?.trim() || '').catch(() => course.text)
      const instructor = await page.$eval('.teacher a', el => el.textContent?.trim() || '').catch(() => '')

      const resourceLinks = await page.$$eval(
        'a[href*="mod/resource"], a[href*="mod/url"], a[href*="mod/folder"]',
        links => links.map(l => ({ href: (l as HTMLAnchorElement).href, text: l.textContent?.trim() || '' }))
      )

      for (const r of resourceLinks) {
        const url = r.href
        const ext = url.split('.').pop()?.toLowerCase() || ''
        const type = ext === 'pdf' ? 'pdf' : ext === 'docx' || ext === 'doc' ? 'doc' : 'file'
        resources.push({
          id: `${subjectId}-${Buffer.from(url).toString('base64').slice(0, 8)}`,
          subjectId,
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
        try {
          await page.goto(a.href, { waitUntil: 'networkidle' })
          const title = await page.$eval('h2', el => el.textContent?.trim() || a.text).catch(() => a.text)
          const dueDateText = await page.$eval(
            '.submissionstatustable td:last-child, .generaltable td:last-child',
            el => el.textContent?.trim() || ''
          ).catch(() => '')

          const dueDate = dueDateText ? new Date(dueDateText).toISOString() : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
          const submitted = await page.$('.submissionstatussubmitted').then(() => true).catch(() => false)

          assignments.push({
            id: `${subjectId}-assign-${assignments.length}`,
            subjectId,
            title,
            dueDate,
            submitted
          })
          await page.goto(course.href, { waitUntil: 'networkidle' })
        } catch {
          // Skip assignment if scraping fails
        }
      }

      subjects.push({
        id: subjectId,
        name: courseName,
        instructor,
        source: 'moodle',
        resourceCount: resourceLinks.length,
        assignmentCount: assignLinks.length
      })
    } catch {
      // Skip course if scraping fails
    }
  }

  return { subjects, resources, assignments }
}

async function scrapeMyGJU(page: Page): Promise<ScrapeResult> {
  const username = process.env.GJU_USERNAME!
  const password = process.env.GJU_PASSWORD!
  const subjects: Subject[] = []
  const resources: Resource[] = []
  const assignments: Assignment[] = []

  try {
    await page.goto('https://mygju.gju.edu.jo/faces/index.xhtml', { waitUntil: 'networkidle' })

    const usernameField = await page.$('input[type="text"], input[id*="username"], input[id*="user"]')
    const passwordField = await page.$('input[type="password"]')

    if (usernameField && passwordField) {
      await usernameField.fill(username)
      await passwordField.fill(password)
      const submitBtn = await page.$('input[type="submit"], button[type="submit"], .login-button')
      if (submitBtn) {
        await Promise.all([
          submitBtn.click(),
          page.waitForLoadState('networkidle').catch(() => {})
        ])
      }
    }

    const scheduleLink = await page.$('a[href*="schedule"], a[href*="Schedule"], a[href*="courses"]')
    if (scheduleLink) {
      await Promise.all([
        scheduleLink.click(),
        page.waitForLoadState('networkidle').catch(() => {})
      ])
    }

    const rows = await page.$$('table tr, .schedule-row, .course-row')
    for (const row of rows) {
      const text = await row.textContent()
      if (text && text.trim().length > 3) {
        const name = text.trim().split('\n')[0].trim()
        if (name && name.length > 2) {
          subjects.push({
            id: slugify(name),
            name,
            instructor: '',
            source: 'mygju',
            resourceCount: 0,
            assignmentCount: 0
          })
        }
      }
    }
  } catch {
    console.warn('myGJU scraping failed, continuing with Moodle data only')
  }

  return { subjects, resources, assignments }
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
    } catch {
      // Invalid cookies format, ignore
    }
  }

  const page = await context.newPage()

  try {
    const moodle = await scrapeMoodle(page)
    const mygju = await scrapeMyGJU(page)

    const cookies = await context.cookies()
    writeCookies(cookies)

    const merged = mergeScrapedData(moodle, mygju)
    const result: ScrapedData = { ...merged, scrapedAt: new Date().toISOString() }
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
