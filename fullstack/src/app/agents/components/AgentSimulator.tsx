'use client'
import { useState } from 'react'
import type { Todo, TodoStatus, AgentName } from '../types'

const AGENTS: AgentName[] = ['Researcher','Builder','Planner','Agent-1','Agent-2','Writer']
const STATUSES: TodoStatus[] = ['completed','in_progress','failed','pending']

interface LogEntry { time: string; msg: string; type: 'ok'|'run'|'err'|'info' }

export function AgentSimulator({ todos, onUpdate }: { todos: Todo[]; onUpdate: (id: string, status: TodoStatus, agent?: AgentName) => Promise<void> }) {
  const [agent, setAgent]   = useState<AgentName>('Researcher')
  const [todoId, setTodoId] = useState<string>(todos[0]?.id ?? '')
  const [status, setStatus] = useState<TodoStatus>('completed')
  const [log, setLog]       = useState<LogEntry[]>([{ time:'session start',msg:'Agent simulator ready · connected to Supabase',type:'info' }])

  const addLog=(msg:string,type:LogEntry['type'])=>{
    const time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})
    setLog(prev=>[{time,msg,type},...prev].slice(0,20))
  }

  const dispatch=async()=>{
    if(!todoId)return
    try {
      await onUpdate(todoId,status,agent)
      const todo=todos.find(t=>t.id===todoId)
      addLog(`${agent} → "${todo?.title.substring(0,30)}..." → ${status}`, status==='failed'?'err':status==='in_progress'?'run':'ok')
    } catch(e){ addLog(`Error: ${String(e)}`,'err') }
  }

  const sel={width:'100%',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'8px 10px',fontFamily:'var(--mono)' as const,fontSize:10,color:'var(--text)',outline:'none',cursor:'pointer',appearance:'none' as const}

  return (
    <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden',position:'relative' }}>
      <div style={{ position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#00e5ff,#e040fb,transparent)',opacity:.4 }}/>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderBottom:'1px solid var(--border)',background:'rgba(255,255,255,0.015)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:26,height:26,borderRadius:7,fontSize:11,background:'linear-gradient(135deg,rgba(0,229,255,0.1),rgba(224,64,251,0.1))',border:'1px solid rgba(0,229,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>⚡</div>
          <div>
            <span style={{ fontSize:11,fontWeight:700,color:'var(--bright)' }}>Agent Simulator</span>
            <span style={{ fontFamily:'var(--mono)',fontSize:8,fontWeight:400,color:'var(--muted)',marginLeft:6,letterSpacing:'.06em' }}>DEMO MODE</span>
          </div>
        </div>
        <div style={{ fontFamily:'var(--mono)',fontSize:8,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--orange)',background:'rgba(255,109,0,0.1)',border:'1px solid rgba(255,109,0,0.25)',padding:'3px 9px',borderRadius:100 }}>Writes to Supabase</div>
      </div>
      <div style={{ padding:'16px 18px',display:'flex',flexDirection:'column',gap:12 }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10 }}>
          <div>
            <div style={{ fontFamily:'var(--mono)',fontSize:8,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--muted)',marginBottom:6 }}>Agent</div>
            <select value={agent} onChange={e=>setAgent(e.target.value as AgentName)} style={sel}>
              {AGENTS.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontFamily:'var(--mono)',fontSize:8,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--muted)',marginBottom:6 }}>Task</div>
            <select value={todoId} onChange={e=>setTodoId(e.target.value)} style={sel}>
              {todos.map(t=><option key={t.id} value={t.id}>{t.title.substring(0,28)}...</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontFamily:'var(--mono)',fontSize:8,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--muted)',marginBottom:6 }}>Status</div>
            <select value={status} onChange={e=>setStatus(e.target.value as TodoStatus)} style={sel}>
              {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'flex',gap:8 }}>
          <button onClick={dispatch} style={{ flex:1,fontFamily:'var(--mono)',fontSize:9,letterSpacing:'.1em',textTransform:'uppercase',padding:'10px 16px',borderRadius:7,cursor:'pointer',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:'linear-gradient(135deg,#00c853,#00e676)',border:'none',color:'#001a0d',boxShadow:'0 2px 12px rgba(0,230,118,0.25)' }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Dispatch Update
          </button>
          <button onClick={async()=>{setStatus('failed');await onUpdate(todoId,'failed',agent);addLog(`${agent} → marked failed`,'err')}} style={{ flex:1,fontFamily:'var(--mono)',fontSize:9,letterSpacing:'.1em',textTransform:'uppercase',padding:'10px 16px',borderRadius:7,cursor:'pointer',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:'rgba(255,23,68,0.08)',border:'1px solid rgba(255,23,68,0.35)',color:'#ff6b88' }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Mark Failed
          </button>
        </div>
        <div>
          <div style={{ fontFamily:'var(--mono)',fontSize:8,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--muted)',marginBottom:7 }}>Activity Log</div>
          <div style={{ maxHeight:80,overflowY:'auto' }}>
            {log.map((entry,i)=>(
              <div key={i} style={{ display:'flex',gap:10,padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,0.03)',fontFamily:'var(--mono)',fontSize:9,alignItems:'baseline' }}>
                <span style={{ color:'var(--dim)',flexShrink:0,fontSize:8 }}>{entry.time}</span>
                <span style={{ color:entry.type==='ok'?'var(--green)':entry.type==='run'?'var(--orange)':entry.type==='err'?'var(--red)':'var(--muted)' }}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
