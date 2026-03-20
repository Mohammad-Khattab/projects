import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { readCookies } from '@/lib/storage'

async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  if (ext === 'pdf') {
    const pdfParse = (await import('pdf-parse')).default
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

export async function POST(req: NextRequest) {
  const { resourceUrl, resourceName, subjectName, mode } = await req.json() as {
    resourceUrl: string
    resourceName: string
    subjectName: string
    mode: 'notes' | 'slides'
  }

  const cookies = readCookies()
  const cookieHeader = cookies
    ? (cookies as Array<{ name: string; value: string }>).map(c => `${c.name}=${c.value}`).join('; ')
    : ''

  let text = ''
  try {
    const res = await fetch(resourceUrl, { headers: { Cookie: cookieHeader } })
    if (!res.ok) throw new Error(`Failed to fetch resource: ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    text = await extractTextFromBuffer(buffer, resourceName)
  } catch (err) {
    return NextResponse.json({ error: `Could not fetch/extract resource: ${String(err)}` }, { status: 400 })
  }

  const truncated = text.slice(0, 80000)
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const prompt = mode === 'notes'
    ? `You are an expert study assistant. Based on the following course material from "${subjectName}", generate comprehensive, well-structured study notes.\n\nUse clear ## H2 and ### H3 headings for each topic, bullet points for key concepts, **bold** for definitions, and end with a ## Summary section.\n\nMaterial:\n\n${truncated}`
    : `Generate a slide deck outline for "${subjectName}". Format each slide as:\n\n## Slide N: [Title]\n- bullet point\n- bullet point\n- bullet point\n\nSeparate each slide with ---\n\nStart with a Title Slide and Agenda, then content slides, then a Conclusion slide.\n\nMaterial:\n\n${truncated}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ content })
}
