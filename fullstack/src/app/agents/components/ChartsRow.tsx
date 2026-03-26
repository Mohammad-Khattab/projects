'use client'
import { useEffect, useRef } from 'react'
import type { Todo } from '../types'

function ChartCard({ title, sub, tag, children }: { title: string; sub: string; tag: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--bright)' }}>{title}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>
        </div>
        {tag && <div style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 100, color: 'var(--cyan)', background: 'var(--cyan-d)', border: '1px solid rgba(0,229,255,0.2)' }}>{tag}</div>}
      </div>
      {children}
    </div>
  )
}

function AreaChart({ todos }: { todos: Todo[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const parent = canvas.parentElement!
    canvas.width = parent.clientWidth - 36
    canvas.height = 120
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, pad = 28, bw = W - pad * 2, bh = 80
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    const vals = [2, 5, 3, 7, 4, 6, Math.max(1, todos.filter(t => t.status === 'completed').length)]
    const maxV = 10
    const g = ctx.createLinearGradient(0, pad, 0, pad + bh)
    g.addColorStop(0, 'rgba(0,229,255,0.18)'); g.addColorStop(1, 'rgba(0,229,255,0)')
    ctx.beginPath()
    vals.forEach((v, i) => { const x = pad + i * (bw/(days.length-1)), y = pad + bh - (v/maxV*bh); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y) })
    ctx.lineTo(pad+bw,pad+bh); ctx.lineTo(pad,pad+bh); ctx.closePath(); ctx.fillStyle=g; ctx.fill()
    ctx.beginPath()
    vals.forEach((v, i) => { const x = pad + i*(bw/(days.length-1)), y = pad+bh-(v/maxV*bh); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y) })
    ctx.strokeStyle='#00e5ff'; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.stroke()
    vals.forEach((v, i) => {
      const x = pad+i*(bw/(days.length-1)), y = pad+bh-(v/maxV*bh)
      ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fillStyle='#00e5ff'; ctx.fill()
      ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fillStyle='#0d1117'; ctx.fill()
      ctx.fillStyle='#3a4049'; ctx.font='7px Space Mono,monospace'; ctx.textAlign='center'
      ctx.fillText(days[i], x, pad+bh+12)
    })
  }, [todos])
  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: 120 }} />
}

function AgentBarChart({ todos }: { todos: Todo[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const parent = canvas.parentElement!
    canvas.width = parent.clientWidth - 36
    canvas.height = 120
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const agents = ['Researcher','Builder','Planner','Agent-1','Agent-2','Writer']
    const colors = ['rgba(0,229,255,0.7)','rgba(255,109,0,0.7)','rgba(0,230,118,0.7)','rgba(0,229,255,0.5)','rgba(224,64,251,0.7)','rgba(107,118,133,0.5)']
    const counts = agents.map(a => todos.filter(t => t.assigned_agent === a).length)
    const maxV = Math.max(...counts, 1)
    const colW = (W - 40) / agents.length
    agents.forEach((a, i) => {
      const bw = 24, bx = 20 + i*colW + (colW-bw)/2
      const bh = (counts[i]/maxV)*80, by = 24+80-bh
      const g = ctx.createLinearGradient(0,by,0,by+bh)
      g.addColorStop(0, colors[i]); g.addColorStop(1, colors[i].replace(/[\d.]+\)$/,'0.1)'))
      ctx.fillStyle=g; ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(bx,by,bw,bh,4); else ctx.rect(bx,by,bw,bh)
      ctx.fill()
      ctx.fillStyle='#3a4049'; ctx.font='6px Space Mono,monospace'; ctx.textAlign='center'
      ctx.fillText(a.substring(0,3).toUpperCase(), bx+bw/2, 118)
      if (counts[i]>0) { ctx.fillStyle=colors[i].replace(/[\d.]+\)$/,'1)'); ctx.font='bold 9px Space Mono,monospace'; ctx.fillText(String(counts[i]),bx+bw/2,by-4) }
    })
  }, [todos])
  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: 120 }} />
}

function DonutChart({ todos }: { todos: Todo[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const active=todos.filter(t=>t.status==='in_progress').length
    const pending=todos.filter(t=>t.status==='pending').length
    const completed=todos.filter(t=>t.status==='completed').length
    const failed=todos.filter(t=>t.status==='failed').length
    const total=todos.length||1
    const slices=[{v:active,c:'#ff6d00'},{v:pending,c:'#6b7685'},{v:completed,c:'#00e676'},{v:failed,c:'#ff1744'}]
    ctx.clearRect(0,0,130,130)
    let start=-Math.PI/2
    slices.forEach(({v,c})=>{ if(!v)return; const s=(v/total)*Math.PI*2; ctx.beginPath();ctx.moveTo(65,65);ctx.arc(65,65,52,start,start+s);ctx.closePath();ctx.fillStyle=c;ctx.fill();start+=s })
    ctx.beginPath();ctx.arc(65,65,32,0,Math.PI*2);ctx.fillStyle='#0d1117';ctx.fill()
    ctx.fillStyle='#f4f7fb';ctx.font='bold 14px Orbitron,sans-serif';ctx.textAlign='center';ctx.fillText(String(todos.length),65,69)
    ctx.fillStyle='#6b7685';ctx.font='6px Space Mono,monospace';ctx.fillText('TASKS',65,80)
  }, [todos])
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:14,padding:'16px 18px' }}>
      <canvas ref={ref} width={130} height={130} />
      <div style={{ width:'100%',display:'flex',flexDirection:'column',gap:6 }}>
        {[{label:'In Progress',color:'#ff6d00',count:todos.filter(t=>t.status==='in_progress').length},{label:'Pending',color:'#6b7685',count:todos.filter(t=>t.status==='pending').length},{label:'Completed',color:'#00e676',count:todos.filter(t=>t.status==='completed').length},{label:'Failed',color:'#ff1744',count:todos.filter(t=>t.status==='failed').length}].map(r=>(
          <div key={r.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:r.color,flexShrink:0}}/>
            <span style={{fontFamily:'var(--mono)',fontSize:8.5,color:'var(--muted)',flex:1}}>{r.label}</span>
            <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--text)',fontWeight:700}}>{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartsRow({ todos }: { todos: Todo[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 14 }}>
      <ChartCard title="Task Activity" sub="completions · last 7 days" tag="7d">
        <div style={{ padding: '16px 18px' }}><AreaChart todos={todos} /></div>
      </ChartCard>
      <ChartCard title="Agent Workload" sub="tasks per agent · current" tag="Live">
        <div style={{ padding: '16px 18px' }}><AgentBarChart todos={todos} /></div>
      </ChartCard>
      <ChartCard title="Working Status" sub="task breakdown" tag="">
        <DonutChart todos={todos} />
      </ChartCard>
    </div>
  )
}
