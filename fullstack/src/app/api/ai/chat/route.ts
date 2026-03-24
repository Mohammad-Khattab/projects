import { NextRequest, NextResponse } from 'next/server'
import { claudeDaemon } from '@/lib/claude-daemon'

/** POST — send a new message to the subject's persistent daemon session */
export async function POST(req: NextRequest) {
  const { subjectId, subjectName, message, context } = await req.json() as {
    subjectId: string
    subjectName: string
    message: string
    context?: string
  }

  if (!subjectId || !message?.trim()) {
    return NextResponse.json({ error: 'subjectId and message are required' }, { status: 400 })
  }

  try {
    const reply = await claudeDaemon.send(subjectId, subjectName, message.trim(), context)
    return NextResponse.json({ reply, historyLength: claudeDaemon.historyLength(subjectId) })
  } catch (err) {
    return NextResponse.json({ error: `Claude daemon failed: ${String(err)}` }, { status: 500 })
  }
}

/** DELETE — clear a subject's daemon conversation history */
export async function DELETE(req: NextRequest) {
  const { subjectId } = await req.json() as { subjectId: string }
  if (subjectId) claudeDaemon.clear(subjectId)
  return NextResponse.json({ ok: true })
}
