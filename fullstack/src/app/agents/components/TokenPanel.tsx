'use client'
import { useTokenUsage } from '../hooks/useTokenUsage'

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, position: 'relative', overflow: 'visible' }}>
      <div style={{
        height: '100%', borderRadius: 100, width: `${pct}%`,
        background: color, boxShadow: `0 0 10px ${color}40`,
        transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute', right: 0, top: '50%',
          transform: 'translate(50%, -50%)',
          width: 12, height: 12, borderRadius: '50%',
          background: '#f4f7fb', border: '2px solid #0d1117',
          boxShadow: `0 0 8px ${color}99`
        }} />
      </div>
    </div>
  )
}

function MiniRow({ label, pct, color, value }: { label: string; pct: number; color: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 100, width: `${pct}%`, background: color, transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)' }} />
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export function TokenPanel() {
  const { data, loading } = useTokenUsage()

  const ctx = data?.context
  const rl  = data?.rateLimit

  const ctxPct  = ctx ? ctx.pct : 0
  const rlPct   = rl?.limit && rl?.remaining != null ? Math.round(((rl.limit - rl.remaining) / rl.limit) * 100) : 0
  const rlRemPct = rl?.limit && rl?.remaining != null ? Math.round((rl.remaining / rl.limit) * 100) : 0

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n)

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '20px 22px 22px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #e040fb, #00e5ff, transparent)', opacity: 0.4 }} />

      {/* Session context */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--cyan)', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 5, padding: '2px 9px' }}>/context</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Session Window</span>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text)' }}>
            {loading ? '—' : `${(ctx?.used ?? 0).toLocaleString()} / ${(ctx?.limit ?? 200000).toLocaleString()}`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Bar pct={ctxPct} color="linear-gradient(90deg, #00e5ff, #e040fb)" />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: 'var(--cyan)', minWidth: 48, textAlign: 'right', letterSpacing: '-0.03em' }}>
            {loading ? '–' : `${ctxPct}%`}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MiniRow label="Used"      pct={ctxPct}       color="rgba(0,229,255,0.5)" value={loading ? '—' : fmt(ctx?.used ?? 0)} />
          <MiniRow label="Remaining" pct={100 - ctxPct} color="rgba(0,230,118,0.4)" value={loading ? '—' : fmt((ctx?.limit ?? 200000) - (ctx?.used ?? 0))} />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', margin: '18px 0' }} />

      {/* Rate limit */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--orange)', background: 'rgba(255,109,0,0.1)', border: '1px solid rgba(255,109,0,0.2)', borderRadius: 5, padding: '2px 9px' }}>/tokens</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Rate Limit Window</span>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>
            {rl?.windowLabel ?? '—'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Bar pct={rlPct} color="linear-gradient(90deg, #ff6d00, #e040fb)" />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: 'var(--orange)', minWidth: 48, textAlign: 'right', letterSpacing: '-0.03em' }}>
            {loading || !rl?.limit ? '–' : `${rlRemPct}%`}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MiniRow label="Used"      pct={rlPct}    color="rgba(255,109,0,0.5)"  value={loading || !rl?.limit ? '—' : fmt((rl.limit ?? 0) - (rl.remaining ?? 0))} />
          <MiniRow label="Remaining" pct={rlRemPct} color="rgba(0,230,118,0.4)"  value={loading || !rl?.remaining ? '—' : fmt(rl.remaining ?? 0)} />
        </div>
      </div>
    </div>
  )
}
