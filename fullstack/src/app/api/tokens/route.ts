import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import type { TokenApiResponse } from '@/app/agents/types'

const SESSION_ID = 'dashboard-session-1'

export async function GET() {
  let rateLimit = { limit: null as number | null, remaining: null as number | null, resetAt: null as string | null }

  try {
    const fetchRes = await fetch('https://api.anthropic.com/v1/messages/count_tokens', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        messages: [{ role: 'user', content: 'ping' }]
      })
    })

    const limitHeader     = fetchRes.headers.get('anthropic-ratelimit-tokens-limit')
    const remainingHeader = fetchRes.headers.get('anthropic-ratelimit-tokens-remaining')
    const resetHeader     = fetchRes.headers.get('anthropic-ratelimit-tokens-reset')

    rateLimit = {
      limit:     limitHeader     ? parseInt(limitHeader)     : null,
      remaining: remainingHeader ? parseInt(remainingHeader) : null,
      resetAt:   resetHeader ?? null
    }
  } catch (e) {
    console.error('Token rate limit fetch error:', e)
  }

  let contextUsed  = 0
  let contextLimit = 200000

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await sb
      .from('token_usage')
      .select('context_used, context_limit')
      .eq('session_id', SESSION_ID)
      .single()

    if (data) {
      contextUsed  = data.context_used
      contextLimit = data.context_limit
    }
  } catch (e) {
    console.error('Supabase token_usage fetch error:', e)
  }

  const result: TokenApiResponse = {
    context: {
      used:  contextUsed,
      limit: contextLimit,
      pct:   Math.round((contextUsed / contextLimit) * 100)
    },
    rateLimit: {
      limit:       rateLimit.limit,
      remaining:   rateLimit.remaining,
      resetAt:     rateLimit.resetAt,
      windowLabel: rateLimit.resetAt
        ? `resets ${new Date(rateLimit.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : 'rate window'
    }
  }

  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
}
