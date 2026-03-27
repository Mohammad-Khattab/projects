'use client'
import { calcStreak } from '../../lib/utils'
import { useCountUp } from '../../hooks/useCountUp'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import type { Task, Category, Priority } from '../../types'

interface Props { tasks: Task[] }

const CATEGORIES: Category[] = ['Work', 'Personal', 'Creative', 'Health']
const CAT_COLORS: Record<Category, string> = {
  Work: '#6366f1',
  Personal: '#f59e0b',
  Creative: '#ec4899',
  Health: '#22c55e',
}
const PRIORITIES: Priority[] = ['high', 'medium', 'low', 'none']
const PRIORITY_COLORS: Record<Priority, string> = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e', none: '#64748b' }

function getWeekCompletions(tasks: Task[], weeksAgo: number): number {
  const now = new Date()
  const start = new Date(now); start.setDate(now.getDate() - (weeksAgo + 1) * 7)
  const end = new Date(now); end.setDate(now.getDate() - weeksAgo * 7)
  return tasks.filter(t => {
    if (!t.completedAt) return false
    const d = new Date(t.completedAt)
    return d >= start && d < end
  }).length
}

function PriCountCard({ p, count, color }: { p: string, count: number, color: string }) {
  const animated = useCountUp(count)
  return (
    <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, margin: '0 auto 4px' }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--a-text)' }}>{animated}</div>
      <div style={{ fontSize: 10, color: 'var(--a-muted)', textTransform: 'capitalize' }}>{p}</div>
    </div>
  )
}

export default function AnalyticsView({ tasks }: Props) {
  const streak = calcStreak(tasks)
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const thisWeek = getWeekCompletions(tasks, 0)
  const lastWeek = getWeekCompletions(tasks, 1)

  const animTotal     = useCountUp(total)
  const animCompleted = useCountUp(completed)
  const animPct       = useCountUp(completionPct)
  const animStreak    = useCountUp(streak)

  const statsReveal  = useScrollReveal()
  const weekReveal   = useScrollReveal()
  const gridReveal   = useScrollReveal()
  const catReveal    = useScrollReveal()
  const priReveal    = useScrollReveal()

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    return { dateStr, hasCompletion: tasks.some(t => t.completedAt?.slice(0, 10) === dateStr) }
  })

  const catCounts = CATEGORIES.map(c => ({
    cat: c,
    total: tasks.filter(t => t.category === c).length,
    done: tasks.filter(t => t.category === c && t.completed).length,
  }))
  const maxCat = Math.max(...catCounts.map(c => c.total), 1)

  const priCounts = PRIORITIES.map(p => ({
    p, count: tasks.filter(t => t.priority === p).length,
  }))

  return (
    <div>
      <div className="agents-main-header">
        <div className="agents-greeting">Analytics</div>
        <div className="agents-sub">Your productivity at a glance.</div>
      </div>
      <div className="agents-content">

        {/* Top stats */}
        <div ref={statsReveal.ref} className={`agents-reveal ${statsReveal.isVisible ? 'visible' : ''}`}>
          <div className="agents-stats-row">
            <div className="agents-stat">
              <div className="agents-stat-val">{animTotal}</div>
              <div className="agents-stat-label">Total Created</div>
            </div>
            <div className="agents-stat">
              <div className="agents-stat-val">{animCompleted}</div>
              <div className="agents-stat-label">Completed</div>
            </div>
            <div className="agents-stat">
              <div className="agents-stat-val">{animPct}%</div>
              <div className="agents-stat-label">Rate</div>
            </div>
            <div className="agents-stat">
              <div className="agents-stat-val">{animStreak}🔥</div>
              <div className="agents-stat-label">Streak</div>
            </div>
          </div>
        </div>

        {/* Week comparison */}
        <div ref={weekReveal.ref} className={`agents-reveal ${weekReveal.isVisible ? 'visible' : ''}`}>
          <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-text)', marginBottom: 12 }}>Completion — This vs Last Week</div>
            {[{ label: 'This Week', val: thisWeek }, { label: 'Last Week', val: lastWeek }].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 80, fontSize: 11, color: 'var(--a-muted)' }}>{label}</div>
                <div className="agents-bar-track">
                  <div className="agents-bar-fill" style={{ width: `${Math.min((val / Math.max(thisWeek, lastWeek, 1)) * 100, 100)}%` }} />
                </div>
                <div style={{ width: 24, fontSize: 12, fontWeight: 700, color: 'var(--a-text)', textAlign: 'right' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak grid */}
        <div ref={gridReveal.ref} className={`agents-reveal ${gridReveal.isVisible ? 'visible' : ''}`}>
          <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-text)', marginBottom: 10 }}>Last 14 Days</div>
            <div className="agents-streak-grid">
              {last14.map(({ dateStr, hasCompletion }) => (
                <div key={dateStr} className={`agents-streak-cell ${hasCompletion ? 'has-completion' : ''}`} title={dateStr} />
              ))}
            </div>
          </div>
        </div>

        {/* By category — vertical bar chart */}
        <div ref={catReveal.ref} className={`agents-reveal ${catReveal.isVisible ? 'visible' : ''}`}>
          <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-text)', marginBottom: 16 }}>Tasks by Category</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 120, gap: 12, padding: '0 8px' }}>
              {catCounts.map(({ cat, total: t, done }) => (
                <div key={cat} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: CAT_COLORS[cat as Category] }}>{t > 0 ? `${done}/${t}` : '—'}</div>
                  <div style={{ width: '100%', height: 90, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{
                      width: '60%',
                      height: `${maxCat > 0 ? Math.max((t / maxCat) * 100, t > 0 ? 6 : 0) : 0}%`,
                      borderRadius: '5px 5px 2px 2px',
                      background: `linear-gradient(180deg, ${CAT_COLORS[cat as Category]}99, ${CAT_COLORS[cat as Category]}44)`,
                      position: 'relative',
                      transition: 'height 0.4s ease',
                      minHeight: t > 0 ? 8 : 0,
                    }}>
                      {t > 0 && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          height: `${(done / t) * 100}%`,
                          borderRadius: '5px 5px 2px 2px',
                          background: CAT_COLORS[cat as Category],
                          minHeight: done > 0 ? 4 : 0,
                        }} />
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--a-muted)', textAlign: 'center' }}>{cat}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--a-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: CAT_COLORS[cat] }} />
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority distribution */}
        <div ref={priReveal.ref} className={`agents-reveal ${priReveal.isVisible ? 'visible' : ''}`}>
          <div style={{ background: 'var(--a-white)', border: '1px solid var(--a-border)', borderRadius: 'var(--a-radius)', padding: '16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--a-text)', marginBottom: 12 }}>Priority Distribution</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {priCounts.map(({ p, count }) => (
                <PriCountCard key={p} p={p} count={count} color={PRIORITY_COLORS[p as Priority]} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
