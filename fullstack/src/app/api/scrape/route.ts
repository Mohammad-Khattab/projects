import { NextResponse } from 'next/server'
import { readScrapedData } from '@/lib/storage'
import { scrapeAll } from '@/lib/scraper'

export const maxDuration = 300

export async function GET() {
  const cached = readScrapedData()
  if (cached) {
    return NextResponse.json({ data: cached })
  }
  return NextResponse.json({ data: null, message: 'No cached data — click Refresh to scrape' })
}

export async function POST() {
  try {
    const data = await scrapeAll()
    return NextResponse.json({ data })
  } catch (err) {
    const cached = readScrapedData()
    if (cached) {
      return NextResponse.json({ data: { ...cached, stale: true } })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
