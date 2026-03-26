export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'failed'
export type TodoPriority = 'low' | 'medium' | 'high' | 'critical'
export type AgentName = 'Researcher' | 'Builder' | 'Planner' | 'Agent-1' | 'Agent-2' | 'Writer'

export interface Todo {
  id: string
  title: string
  status: TodoStatus
  priority: TodoPriority
  assigned_agent: AgentName | null
  updated_at: string
}

export interface TokenUsage {
  session_id: string
  context_used: number
  context_limit: number
  rate_limit_tokens: number | null
  rate_remaining_tokens: number | null
  rate_reset_at: string | null
  updated_at: string
}

export interface TokenApiResponse {
  context: {
    used: number
    limit: number
    pct: number
  }
  rateLimit: {
    limit: number | null
    remaining: number | null
    resetAt: string | null
    windowLabel: string
  }
}
