import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { readCookies } from '@/lib/storage'

async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  if (ext === 'pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text
  }

  if (ext === 'docx' || ext === 'doc') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  return buffer.toString('utf-8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
}

async function fetchResourceText(url: string, name: string, cookieHeader: string): Promise<string> {
  const res = await fetch(url, { headers: { Cookie: cookieHeader } })
  if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  return extractTextFromBuffer(buffer, name)
}

/** Run claude -p via stdin (avoids null-byte arg issues with PDF text) */
function spawnClaudeRaw(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('claude', ['-p'], { stdio: ['pipe', 'pipe', 'pipe'] })
    let out = ''
    let err = ''
    proc.stdout.on('data', (d: Buffer) => { out += d.toString() })
    proc.stderr.on('data', (d: Buffer) => { err += d.toString() })
    proc.on('close', (code: number) => {
      if (code !== 0) reject(new Error(err.trim() || `Claude exited ${code}`))
      else resolve(out.trim())
    })
    proc.stdin.write(prompt.replace(/\0/g, ''), 'utf8')
    proc.stdin.end()
  })
}

async function spawnClaudeOnce(prompt: string, retries = 3, delayMs = 5000): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await spawnClaudeRaw(prompt)
    } catch (err) {
      const isRateLimit = /rate.?limit/i.test(String(err))
      if (isRateLimit && attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)))
        continue
      }
      throw err
    }
  }
  throw new Error('Unreachable')
}

/** Stream claude output — returns a ReadableStream of raw text chunks */
function spawnClaudeStream(prompt: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      const proc = spawn('claude', ['-p'], { stdio: ['pipe', 'pipe', 'pipe'] })
      proc.stdout.on('data', (d: Buffer) => {
        controller.enqueue(encoder.encode(d.toString()))
      })
      proc.stderr.on('data', () => {}) // suppress
      proc.on('close', (code: number) => {
        if (code !== 0) {
          controller.error(new Error(`Claude exited ${code}`))
        } else {
          controller.close()
        }
      })
      proc.stdin.write(prompt.replace(/\0/g, ''), 'utf8')
      proc.stdin.end()
    }
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    resourceUrl?: string
    resourceName?: string
    resources?: { url: string; name: string }[]
    subjectName: string
    mode: 'notes' | 'slides'
    chapterName?: string
  }

  const { subjectName, mode, chapterName } = body

  const cookies = readCookies()
  const cookieHeader = cookies
    ? (cookies as Array<{ name: string; value: string }>).map(c => `${c.name}=${c.value}`).join('; ')
    : ''

  let text = ''

  try {
    if (body.resources && body.resources.length > 0) {
      const parts: string[] = []
      for (const r of body.resources) {
        try {
          const t = await fetchResourceText(r.url, r.name, cookieHeader)
          if (t.trim()) parts.push(`=== ${r.name} ===\n${t}`)
        } catch { /* skip inaccessible resources */ }
      }
      text = parts.join('\n\n')
      if (!text.trim()) {
        return NextResponse.json({ error: 'Could not extract text from any resource in this chapter' }, { status: 400 })
      }
    } else if (body.resourceUrl && body.resourceName) {
      text = await fetchResourceText(body.resourceUrl, body.resourceName, cookieHeader)
    } else {
      return NextResponse.json({ error: 'Provide either resourceUrl or resources array' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: `Could not fetch/extract resource: ${String(err)}` }, { status: 400 })
  }

  const truncated = text.slice(0, 80000)
  const context = chapterName ? `${chapterName} of "${subjectName}"` : `"${subjectName}"`

  const notesPrompt = `You are an expert study assistant. Based on the following course material from ${context}, generate comprehensive, well-structured study notes.\n\nUse clear ## H2 and ### H3 headings for each topic, bullet points for key concepts, **bold** for definitions, and end with a ## Summary section.\n\nMaterial:\n\n${truncated}`

  const slidesPrompt = `Generate a slide deck outline for ${context}. Format each slide as:\n\n## Slide N: [Title]\n- bullet point\n- bullet point\n- bullet point\n\nSeparate each slide with ---\n\nStart with a Title Slide and Agenda, then content slides, then a Conclusion slide.\n\nMaterial:\n\n${truncated}`

  if (mode === 'notes') {
    // Non-streaming: wait for full response, return JSON
    try {
      const content = await spawnClaudeOnce(notesPrompt)
      return NextResponse.json({ content })
    } catch (err) {
      return NextResponse.json({ error: `Claude CLI failed: ${String(err)}` }, { status: 500 })
    }
  } else {
    // Slides: stream output to client as text/plain
    const stream = spawnClaudeStream(slidesPrompt)
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
      }
    })
  }
}
