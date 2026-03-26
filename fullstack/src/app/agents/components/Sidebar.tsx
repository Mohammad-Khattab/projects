'use client'
import { useState } from 'react'

const NAV = [
  { section: 'Main', items: [
    { icon: '⬡', label: 'Dashboard', badge: true },
    { icon: '◈', label: 'Tasks',     badge: false },
    { icon: '◉', label: 'Agents',    badge: false },
  ]},
  { section: 'Insights', items: [
    { icon: '▦', label: 'Analytics', badge: false },
    { icon: '◎', label: 'Activity',  badge: false },
  ]},
  { section: 'System', items: [
    { icon: '⚙', label: 'Settings',  badge: false },
  ]},
]

export function Sidebar({ totalTasks }: { totalTasks: number }) {
  const [active, setActive] = useState('Dashboard')

  return (
    <aside style={{ position:'fixed',left:0,top:0,bottom:0,width:220,background:'var(--sidebar)',borderRight:'1px solid var(--border)',zIndex:10,display:'flex',flexDirection:'column',paddingBottom:24 }}>
      <div style={{ position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#00e5ff,transparent)',opacity:.35 }}/>
      <div style={{ padding:'24px 20px 20px',borderBottom:'1px solid var(--border)',marginBottom:8 }}>
        <div style={{ fontFamily:'var(--mono)',fontSize:8,letterSpacing:'.18em',color:'var(--cyan)',textTransform:'uppercase',marginBottom:4 }}>// agent ops</div>
        <div style={{ fontSize:14,fontWeight:900,letterSpacing:'-.01em',background:'linear-gradient(135deg,#00e5ff,#e040fb)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1.1 }}>Task<br/>Dashboard</div>
        <div style={{ fontFamily:'var(--mono)',fontSize:8,color:'var(--dim)',marginTop:2,letterSpacing:'.04em' }}>supabase realtime</div>
      </div>
      <nav style={{ flex:1,padding:'8px 12px' }}>
        {NAV.map(group=>(
          <div key={group.section}>
            <div style={{ fontFamily:'var(--mono)',fontSize:8,letterSpacing:'.16em',color:'var(--dim)',textTransform:'uppercase',padding:'10px 8px 6px' }}>{group.section}</div>
            {group.items.map(item=>{
              const isActive=active===item.label
              return (
                <div key={item.label} onClick={()=>setActive(item.label)} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:600,letterSpacing:'.02em',marginBottom:2,color:isActive?'var(--cyan)':'var(--muted)',background:isActive?'rgba(0,229,255,0.08)':'transparent',border:isActive?'1px solid rgba(0,229,255,0.15)':'1px solid transparent',transition:'all .15s' }}>
                  <div style={{ width:28,height:28,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,background:isActive?'rgba(0,229,255,0.12)':'rgba(255,255,255,0.04)',flexShrink:0 }}>{item.icon}</div>
                  {item.label}
                  {item.badge&&<span style={{ marginLeft:'auto',fontFamily:'var(--mono)',fontSize:8,padding:'2px 6px',borderRadius:100,background:'rgba(0,229,255,0.1)',color:'var(--cyan)',border:'1px solid rgba(0,229,255,0.2)' }}>{totalTasks}</span>}
                </div>
              )
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding:'12px 16px',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10 }}>
        <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,rgba(0,229,255,0.12),rgba(224,64,251,0.12))',border:'1px solid rgba(0,229,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'var(--cyan)',flexShrink:0 }}>MK</div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:10,fontWeight:700,color:'var(--bright)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>Mohammad</div>
          <div style={{ fontFamily:'var(--mono)',fontSize:8,color:'var(--muted)',letterSpacing:'.04em' }}>Admin · Ops</div>
        </div>
        <div style={{ width:6,height:6,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 6px var(--green)',animation:'pulse 1.8s ease-in-out infinite',flexShrink:0 }}/>
      </div>
    </aside>
  )
}
