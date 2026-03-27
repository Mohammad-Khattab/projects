import { NextRequest, NextResponse } from 'next/server'
import { parseTranscript } from './parse'

export async function POST(req: NextRequest) {
  const { transcript, today } = await req.json() as { transcript: string; today: string }

  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured in .env.local' }, { status: 503 })
  }

  try {
    const result = await parseTranscript(transcript, today || new Date().toISOString().slice(0, 10))
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: `Parsing failed: ${String(err)}` }, { status: 500 })
  }
}
