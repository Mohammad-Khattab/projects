import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { messages, subjectName, context } = await req.json() as {
    messages: ChatMessage[]
    subjectName: string
    context?: string
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const systemPrompt = `You are a helpful study assistant for a university student studying "${subjectName}". ${
    context ? `Here is relevant course material context:\n\n${context}` : ''
  }\n\nProvide clear, concise answers. When explaining concepts, use examples. Format your responses with markdown.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content }))
  })

  const reply = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ reply })
}
