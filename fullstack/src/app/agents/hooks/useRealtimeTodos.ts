'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Todo, TodoStatus, AgentName } from '../types'

export function useRealtimeTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [flashId, setFlashId] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('todos')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (data) setTodos(data as Todo[])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('todos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos(prev => [payload.new as Todo, ...prev])
            setFlashId((payload.new as Todo).id)
          }
          if (payload.eventType === 'UPDATE') {
            setTodos(prev =>
              prev.map(t => t.id === (payload.new as Todo).id ? payload.new as Todo : t)
            )
            setFlashId((payload.new as Todo).id)
          }
          if (payload.eventType === 'DELETE') {
            setTodos(prev => prev.filter(t => t.id !== (payload.old as Todo).id))
          }
          setTimeout(() => setFlashId(null), 1600)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const updateTodo = useCallback(async (id: string, status: TodoStatus, assigned_agent?: AgentName) => {
    await supabase
      .from('todos')
      .update({ status, ...(assigned_agent ? { assigned_agent } : {}) })
      .eq('id', id)
  }, [])

  return { todos, loading, flashId, updateTodo }
}
