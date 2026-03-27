import Anthropic from '@anthropic-ai/sdk'
import type { ParsedTask } from '@/app/agents/types'

export async function parseTranscript(transcript: string, today: string): Promise<ParsedTask> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const tomorrowDate = new Date(today + 'T00:00:00')
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth()+1).padStart(2,'0')}-${String(tomorrowDate.getDate()).padStart(2,'0')}`

  const prompt = `Today's date is ${today}. Tomorrow is ${tomorrow}.

A user spoke this task aloud: "${transcript}"

Extract the task details and return ONLY valid JSON matching this shape:
{
  "title": "concise task title (no filler like 'I need to' or 'I have to')",
  "dueDate": "YYYY-MM-DD or null (resolve relative dates: tomorrow, next Monday, etc.)",
  "priority": "high | medium | low | none (infer from urgency words)",
  "category": "Work | Personal | Creative | Health (infer: assignment/meeting/project=Work, gym/doctor=Health, art/design/write=Creative, groceries/family=Personal)",
  "confidence": 0.0
}

Rules:
- title must be short and actionable (max 8 words)
- "tomorrow" resolves to ${tomorrow}
- "next [weekday]" → compute the date
- no date mentioned → null
- priority: words like "urgent", "important", "need to" → medium; "critical", "ASAP" → high; else none
- confidence: 0.0-1.0 based on how clear the task was
- Return ONLY the JSON object, no prose, no markdown.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const parsed = JSON.parse(cleaned) as ParsedTask
  return parsed
}
