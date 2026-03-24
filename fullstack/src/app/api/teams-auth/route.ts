import { NextResponse } from 'next/server'
import { chromium } from 'playwright'
import { writeTeamsCookies, teamsConnected } from '@/lib/storage'

export async function GET() {
  return NextResponse.json({ connected: teamsConnected() })
}

export async function DELETE() {
  // Disconnect Teams by removing cookies
  const { unlinkSync } = await import('fs')
  const { join } = await import('path')
  try {
    unlinkSync(join(process.cwd(), 'data', 'teams-cookies.json'))
  } catch { /* already gone */ }
  return NextResponse.json({ ok: true })
}

export async function POST() {
  const email = `${process.env.GJU_USERNAME}@gju.edu.jo`
  const password = process.env.GJU_PASSWORD!

  try {
    // Launch a VISIBLE browser so the user can complete MFA
    const browser = await chromium.launch({ headless: false, slowMo: 100 })
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    const page = await context.newPage()

    await page.goto('https://teams.microsoft.com', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)

    // Fill email
    const emailInput = await page.waitForSelector(
      'input[type="email"], input[name="loginfmt"]',
      { timeout: 15000 }
    ).catch(() => null)
    if (emailInput) {
      await emailInput.fill(email)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(3000)
    }

    // Fill password
    const pwInput = await page.waitForSelector(
      'input[type="password"], input[name="passwd"]',
      { timeout: 15000 }
    ).catch(() => null)
    if (pwInput) {
      await pwInput.fill(password)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(3000)
    }

    // Wait for MFA + user to complete login (up to 3 minutes)
    // User sees the browser window and completes MFA manually
    await page.waitForURL(
      url => url.href.includes('teams.microsoft.com') && !url.href.includes('login') && !url.href.includes('microsoftonline'),
      { timeout: 180000 }
    ).catch(() => {})

    await page.waitForTimeout(5000)

    // Save cookies
    const cookies = await context.cookies()
    const teamsCookies = cookies.filter(c =>
      c.domain.includes('teams.microsoft.com') ||
      c.domain.includes('microsoft.com') ||
      c.domain.includes('microsoftonline.com') ||
      c.domain.includes('sharepoint.com')
    )
    writeTeamsCookies(teamsCookies)

    await browser.close()

    return NextResponse.json({
      ok: true,
      cookieCount: teamsCookies.length,
      message: 'Teams connected successfully'
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err)
    }, { status: 500 })
  }
}
