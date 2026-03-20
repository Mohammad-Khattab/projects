import { NextRequest, NextResponse } from 'next/server'
import { readNotes, writeNotes } from '@/lib/storage'

export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get('subjectId')
  if (!subjectId) return NextResponse.json({ error: 'subjectId required' }, { status: 400 })
  const notes = readNotes(subjectId)
  return NextResponse.json({ notes })
}

export async function POST(req: NextRequest) {
  const { subjectId, content } = await req.json() as { subjectId: string; content: string }
  if (!subjectId) return NextResponse.json({ error: 'subjectId required' }, { status: 400 })
  writeNotes(subjectId, content)
  return NextResponse.json({ ok: true })
}
