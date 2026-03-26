import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { TodoStatus, AgentName } from '@/app/agents/types'

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, priority = 'medium', assigned_agent = null } = body
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const { data, error } = await serverClient()
    .from('todos')
    .insert({ title, priority, assigned_agent })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status, assigned_agent }: { id: string; status: TodoStatus; assigned_agent?: AgentName } = body
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

  const update: Record<string, string> = { status }
  if (assigned_agent) update.assigned_agent = assigned_agent

  const { data, error } = await serverClient()
    .from('todos')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
